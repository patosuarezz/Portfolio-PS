export interface SampleVideo {
  id: string;
  videoUrl: string; // Direct mp4, Vimeo embed URL, YouTube embed URL, or fallback video
  posterUrl?: string; // Optional thumbnail poster image
}

export interface ProfileData {
  name: string;
  role: string;
  phrase: string;
  photoUrl: string;
  instagram: {
    handle: string;
    url: string;
  };
  email: {
    address: string;
    mailto: string;
  };
  whatsapp: {
    number: string;
    formattedNumber: string;
    waLink: string;
  };
  sampleVideos: SampleVideo[];
}
