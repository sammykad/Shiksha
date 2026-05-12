import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shiksha Cloud',
    short_name: 'Shiksha',
    start_url: '/dashboard',
    description: 'All-in-one school management platform to streamline students, fees, attendance, and reports. Powerful and easy-to-use for schools, colleges, and coaching institutes.',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    dir: 'auto',
    lang: 'en-US',
    icons: [
      {
        src: '/icons/icon512_maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon512_rounded.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
