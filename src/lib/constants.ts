export const SITE = {
  name: 'Catálogo Ensenada',
  tagline: 'El directorio de servicios de Ensenada, Baja California',
  description:
    'Descubrí los mejores oficios y servicios locales: plomería, electricidad, carpintería, pintura, albañilería, herrería, refrigeración y aire acondicionado, reparación de electrodomésticos, jardinería, limpieza, instalación de pisos, impermeabilización, cerrajería, mecánica automotriz, servicios profesionales y servicios generales en Ensenada y sus alrededores.',
  url: 'https://catalogoensenada.com',
  locale: 'es-MX',
  contact: {
    email: 'contacto@catalogoensenada.com',
    phone: '+52 646 123 4567',
  },
  social: {
    facebook: 'https://facebook.com/catalogoensenada',
    instagram: 'https://instagram.com/catalogoensenada',
  },
} as const;

export const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Zonas', href: '/zona/ensenada-centro' },
  { label: 'Buscar', href: '/buscar' },
] as const;

export const BANNER_SLOTS = [
  'sidebar-left',
  'sidebar-right',
  'profile',
] as const;

export type BannerSlot = (typeof BANNER_SLOTS)[number];
