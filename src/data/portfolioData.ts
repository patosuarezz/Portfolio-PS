import { ProfileData } from '../types';

export const INITIAL_PROFILE_DATA: ProfileData = {
  name: 'Patricio Suarez',
  role: 'Editor de video y Creador de contenido',
  phrase: 'Aumento el valor percibido de empresas y emprendimientos para obtener más ingresos y mejores clientes.',
  photoUrl: './profile.jpg',
  instagram: {
    handle: '@pato.suarezz',
    url: 'https://instagram.com/pato.suarezz'
  },
  email: {
    address: 'patrisuarez1603@gmail.com',
    mailto: 'mailto:patrisuarez1603@gmail.com?subject=Consulta%20de%20Trabajo%20-%20Patricio%20Suarez'
  },
  whatsapp: {
    number: '+54 11 51781758',
    formattedNumber: '+54 11 51781758',
    waLink: 'https://wa.me/541151781758?text=Hola%20Patricio!%20Me%20contacto%20desde%20tu%20web.'
  },
  sampleVideos: [
    {
      id: 'v1',
      videoUrl: 'https://vimeo.com/1217794909',
      posterUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'v2',
      videoUrl: 'https://vimeo.com/1217795524',
      posterUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'v3',
      videoUrl: 'https://vimeo.com/1217788912',
      posterUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'v4',
      videoUrl: 'https://vimeo.com/1217789024',
      posterUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'v5',
      videoUrl: 'https://vimeo.com/1217497396',
      posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    }
  ]
};
