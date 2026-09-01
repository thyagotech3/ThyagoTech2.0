import { BannerItem } from "./types";

export const initialBanners: BannerItem[] = [
  {
    id: "banner-capinhas-peliculas",
    src: "/src/assets/images/capinhas_peliculas_banner_1788199988487.jpg",
    alt: "Proteção Completa - Capinhas e Películas",
    title: "Proteção Completa: Capinhas e Películas",
    linkGroup: "Celular",
    linkFilter: "Capas",
    active: true
  },
  {
    id: "banner-celular",
    src: "/src/assets/images/celular_banner_1788185867079.jpg",
    alt: "Acessórios para o seu Celular - Thyago Tech",
    title: "Acessórios para o seu Celular",
    linkGroup: "Celular",
    linkFilter: "Todos",
    active: true
  },
  {
    id: "banner-thyago-tech-setup",
    src: "/src/assets/images/thyago_tech_banner_1788185051955.jpg",
    alt: "Equipamentos que Elevam seu Setup - Thyago Tech",
    title: "Equipamentos que Elevam seu Setup",
    linkGroup: "Pc",
    linkFilter: "Todos",
    active: true
  }
];
