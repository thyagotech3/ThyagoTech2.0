import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerItem } from "../types";
import { initialBanners } from "../initialBanners";

interface BannerProps {
  banners?: BannerItem[];
  onBannerClick?: (banner: BannerItem) => void;
  aspectRatio?: string;
  className?: string;
  mobileRounded?: boolean;
  mobileRoundedClasses?: string;
}

// Single carousel unit used for mobile and desktop side-by-side slots
function SingleCarousel({
  banners,
  aspectRatio = "aspect-[3/1]",
  onBannerClick,
  intervalMs = 5000,
  rounded = false,
  roundedClasses = "rounded-2xl"
}: {
  banners: BannerItem[];
  aspectRatio?: string;
  onBannerClick?: (banner: BannerItem) => void;
  intervalMs?: number;
  rounded?: boolean;
  roundedClasses?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length]);

  const startTimer = () => {
    stopTimer();
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, intervalMs);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [currentIndex, banners.length]);

  const handleNext = () => {
    if (banners.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    if (banners.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0
    })
  };

  const currentBanner = banners[currentIndex] || banners[0];
  if (!currentBanner) return null;

  return (
    <div
      className={`relative overflow-hidden bg-[#04080e] ${aspectRatio} w-full group cursor-pointer ${
        rounded ? `${roundedClasses} border border-emerald-500/25 shadow-lg` : ""
      }`}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onClick={() => onBannerClick && onBannerClick(currentBanner)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentBanner.id || currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {/* Ambient blurred backdrop */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center blur-md opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${currentBanner.src})` }}
          />
          {/* Main image */}
          <img
            src={currentBanner.src}
            alt={currentBanner.alt || currentBanner.title || "Banner Thyago Tech"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover relative z-10 select-none scale-[1.02]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex"
            aria-label="Próximo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {/* Subtle bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#03060a]/40 via-transparent to-transparent pointer-events-none z-15" />

      {/* Indicators */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-emerald-950/40"
          onClick={(e) => e.stopPropagation()}
        >
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                index === currentIndex ? "bg-emerald-400 w-3" : "bg-gray-500/60 hover:bg-emerald-400/50"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Banner({
  banners,
  onBannerClick,
  aspectRatio = "aspect-[3/1]",
  className = "w-full pt-1.5 pb-0",
  mobileRounded,
  mobileRoundedClasses
}: BannerProps) {
  const activeBanners = (banners && banners.length > 0 ? banners : initialBanners).filter(
    (b) => b.active !== false
  );

  const displayBanners = activeBanners.length > 0 ? activeBanners : initialBanners;

  // Split logic for dual desktop carousels without repetition:
  // - 1 Banner: single slot (left = [0], right = empty)
  // - 2 Banners: left = [0], right = [1] (both static)
  // - 3 Banners: left = [0] (static), right = [1, 2] (rotating)
  // - 4+ Banners: left = [0, 1, ...], right = [2, 3, ...] (alternating split)
  let leftBanners: BannerItem[] = [];
  let rightBanners: BannerItem[] = [];

  if (displayBanners.length <= 1) {
    leftBanners = displayBanners;
    rightBanners = [];
  } else if (displayBanners.length === 2) {
    leftBanners = [displayBanners[0]];
    rightBanners = [displayBanners[1]];
  } else if (displayBanners.length === 3) {
    leftBanners = [displayBanners[0]];
    rightBanners = [displayBanners[1], displayBanners[2]];
  } else {
    // 4 or more: Split cleanly between left and right so they never share the same items
    const half = Math.ceil(displayBanners.length / 2);
    leftBanners = displayBanners.slice(0, half);
    rightBanners = displayBanners.slice(half);
  }

  return (
    <div className={className}>
      {/* 
        1. MOBILE VIEW (< md):
        Single original full-width carousel matching mobile design 100%
      */}
      <div className="md:hidden w-full">
        <SingleCarousel
          banners={displayBanners}
          aspectRatio={aspectRatio}
          onBannerClick={onBannerClick}
          intervalMs={5000}
          rounded={mobileRounded}
          roundedClasses={mobileRoundedClasses || "rounded-xl"}
        />
      </div>

      {/* 
        2. DESKTOP VIEW (>= md):
        Dual side-by-side carousels with 2px tight gap and asymmetric rounded corners
      */}
      <div className="hidden md:block w-full px-4">
        {rightBanners.length === 0 ? (
          // Single banner case on desktop
          <div className="w-full max-w-4xl mx-auto">
            <SingleCarousel
              banners={leftBanners}
              aspectRatio="aspect-[4/1] lg:aspect-[5/1]"
              onBannerClick={onBannerClick}
              intervalMs={5000}
              rounded={true}
              roundedClasses="rounded-2xl"
            />
          </div>
        ) : (
          // 2 Banners side-by-side grid with 2px gap (gap-[2px]) and custom corner rounding
          <div className="grid grid-cols-2 gap-[2px] items-stretch">
            {/* Left Banner: rounded only on left corners (top-left & bottom-left) */}
            <div className="w-full">
              <SingleCarousel
                banners={leftBanners}
                aspectRatio="aspect-[2.5/1] lg:aspect-[3/1]"
                onBannerClick={onBannerClick}
                intervalMs={5000}
                rounded={true}
                roundedClasses="rounded-l-2xl rounded-r-none border-r-0"
              />
            </div>

            {/* Right Banner: rounded only on right corners (top-right & bottom-right) */}
            <div className="w-full">
              <SingleCarousel
                banners={rightBanners}
                aspectRatio="aspect-[2.5/1] lg:aspect-[3/1]"
                onBannerClick={onBannerClick}
                intervalMs={5500}
                rounded={true}
                roundedClasses="rounded-r-2xl rounded-l-none border-l-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

