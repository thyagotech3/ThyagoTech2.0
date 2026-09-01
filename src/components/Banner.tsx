import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerItem } from "../types";
import { initialBanners } from "../initialBanners";

interface BannerProps {
  banners?: BannerItem[];
  onBannerClick?: (banner: BannerItem) => void;
}

export default function Banner({ banners, onBannerClick }: BannerProps) {
  const activeBanners = (banners && banners.length > 0 ? banners : initialBanners).filter(
    (b) => b.active !== false
  );

  const displayBanners = activeBanners.length > 0 ? activeBanners : initialBanners;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset index if banners change and currentIndex is out of bounds
  useEffect(() => {
    if (currentIndex >= displayBanners.length) {
      setCurrentIndex(0);
    }
  }, [displayBanners.length]);

  const startTimer = () => {
    stopTimer();
    if (displayBanners.length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [currentIndex, displayBanners.length]);

  const handleNext = () => {
    if (displayBanners.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  const handlePrev = () => {
    if (displayBanners.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
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

  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  return (
    <div className="w-full pt-1.5 pb-0">
      {/* 
        Container configured with no border, no padding, and no border-radius
        to extend fully edge-to-edge.
      */}
      <div 
        className="relative overflow-hidden bg-[#04080e] aspect-[3/1] w-full group cursor-pointer"
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
            {/* Blurred ambient background behind the image for high-end look */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center blur-md opacity-25 scale-105 pointer-events-none"
              style={{ backgroundImage: `url(${currentBanner.src})` }}
            />

            {/* Main fully visible banner image (object-cover fills the exact 3:1 aspect ratio perfectly) */}
            <img
              src={currentBanner.src}
              alt={currentBanner.alt || currentBanner.title || "Banner Thyago Tech"}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover relative z-10 select-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {displayBanners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 hidden xs:flex"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 hidden xs:flex"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Subtle radial overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060a]/40 via-transparent to-transparent pointer-events-none z-15" />

        {/* Indicators (Dots) */}
        {displayBanners.length > 1 && (
          <div 
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/45 px-2.5 py-1 rounded-full border border-emerald-950/40"
            onClick={(e) => e.stopPropagation()}
          >
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  index === currentIndex 
                    ? "bg-emerald-400 w-3.5" 
                    : "bg-gray-500/60 hover:bg-emerald-400/50"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
