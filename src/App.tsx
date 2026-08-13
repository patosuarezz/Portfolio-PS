import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { ProfileData, SampleVideo } from './types';
import { INITIAL_PROFILE_DATA } from './data/portfolioData';
import {
  Instagram,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Share2,
  Play,
  X,
  Plus,
  Maximize2,
  Film,
  Volume2,
  VolumeX,
  ChevronDown
} from 'lucide-react';
import profilePhoto from './assets/profile.jpg';

export default function App() {
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem('pato_profile_data_v12');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const isCustomPhoto = parsed.photoUrl && (parsed.photoUrl.startsWith('data:') || parsed.photoUrl.startsWith('http'));
          return {
            name: parsed.name || INITIAL_PROFILE_DATA.name,
            role: parsed.role || INITIAL_PROFILE_DATA.role,
            phrase: parsed.phrase || INITIAL_PROFILE_DATA.phrase,
            photoUrl: isCustomPhoto ? parsed.photoUrl : INITIAL_PROFILE_DATA.photoUrl,
            instagram: {
              handle: parsed.instagram?.handle || INITIAL_PROFILE_DATA.instagram.handle,
              url: parsed.instagram?.url || INITIAL_PROFILE_DATA.instagram.url,
            },
            email: {
              address: parsed.email?.address || INITIAL_PROFILE_DATA.email.address,
              mailto: parsed.email?.mailto || INITIAL_PROFILE_DATA.email.mailto,
            },
            whatsapp: {
              number: parsed.whatsapp?.number || INITIAL_PROFILE_DATA.whatsapp.number,
              formattedNumber: parsed.whatsapp?.formattedNumber || INITIAL_PROFILE_DATA.whatsapp.formattedNumber,
              waLink: parsed.whatsapp?.waLink || INITIAL_PROFILE_DATA.whatsapp.waLink,
            },
            sampleVideos: Array.isArray(parsed.sampleVideos) && parsed.sampleVideos.length > 0
              ? parsed.sampleVideos.map((v: any, idx: number) => {
                  const defaultVideo = INITIAL_PROFILE_DATA.sampleVideos[idx] || INITIAL_PROFILE_DATA.sampleVideos[0];
                  const videoUrl = (typeof v?.videoUrl === 'string' && v.videoUrl && !v.videoUrl.includes('mixkit.co')) 
                    ? v.videoUrl 
                    : defaultVideo.videoUrl;
                  return {
                    id: v?.id || `v${idx + 1}`,
                    videoUrl: videoUrl,
                    posterUrl: typeof v?.posterUrl === 'string' && v.posterUrl ? v.posterUrl : defaultVideo.posterUrl
                  };
                })
              : INITIAL_PROFILE_DATA.sampleVideos
          };
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROFILE_DATA;
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<SampleVideo | null>(null);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  // Edit profile state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>(profile);

  const handleOpenEditModal = () => {
    setEditForm({
      name: profile.name || '',
      role: profile.role || '',
      phrase: profile.phrase || '',
      photoUrl: profile.photoUrl || '',
      instagram: {
        handle: profile.instagram?.handle || '',
        url: profile.instagram?.url || ''
      },
      email: {
        address: profile.email?.address || '',
        mailto: profile.email?.mailto || ''
      },
      whatsapp: {
        number: profile.whatsapp?.number || '',
        formattedNumber: profile.whatsapp?.formattedNumber || '',
        waLink: profile.whatsapp?.waLink || ''
      },
      sampleVideos: profile.sampleVideos || []
    });
    setIsEditModalOpen(true);
  };

  const handleProfileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditForm(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    setIsEditModalOpen(false);
  };

  // Scroll progress bar logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    try {
      localStorage.setItem('pato_profile_data_v12', JSON.stringify(profile));
    } catch {
      // Ignore
    }
  }, [profile]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateVideoUrl = (index: number | null, newUrl?: string) => {
    if (index === null || index === undefined || !newUrl || typeof newUrl !== 'string' || !newUrl.trim()) return;
    const updated = [...profile.sampleVideos];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        videoUrl: newUrl.trim()
      };
      setProfile(prev => ({ ...prev, sampleVideos: updated }));
    }
    setEditingVideoIndex(null);
    setTempVideoUrl('');
  };

  const handleVideoFileUpload = (index: number | null, file: File) => {
    if (index === null || index === undefined) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const updated = [...profile.sampleVideos];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            videoUrl: reader.result as string
          };
          setProfile(prev => ({ ...prev, sampleVideos: updated }));
        }
        setEditingVideoIndex(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const getEmbedInfo = (url?: string) => {
    if (!url || !url.trim()) return { isDirectVideo: true, url: null };
    const cleanUrl = url.trim();
    if (cleanUrl.includes('vimeo.com') || cleanUrl.includes('player.vimeo.com')) {
      // Match numeric video ID from Vimeo URLs like /manage/videos/1217794909, /1217794909, /video/1217794909, etc.
      const match = cleanUrl.match(/(\d{6,12})/);
      if (match && match[1]) {
        return { isDirectVideo: false, url: `https://player.vimeo.com/video/${match[1]}?autoplay=1&title=0&byline=0&portrait=0` };
      }
      return { isDirectVideo: false, url: cleanUrl.replace('vimeo.com', 'player.vimeo.com/video') };
    }
    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const match = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        return { isDirectVideo: false, url: `https://www.youtube.com/embed/${match[1]}?autoplay=1&controls=1` };
      }
    }
    return { isDirectVideo: true, url: cleanUrl };
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans overflow-x-hidden">
      
      {/* Fixed Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="w-full max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
            Patricio Suarez • Portfolio
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Patricio Suarez | Portfolio',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  handleCopy(window.location.href, 'share');
                }
              }}
              className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
              title="Compartir enlace"
            >
              {copiedKey === 'share' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Thin Scroll Reading Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900 origin-left"
          style={{ scaleX }}
        />
      </header>

      {/* Main Multi-Slide Vertical Container */}
      <main className="pt-20">

        {/* SLIDE 1: HERO / PROFILE SECTION */}
        <section className="min-h-[85vh] sm:min-h-[90vh] w-full max-w-2xl mx-auto px-6 flex flex-col justify-center items-center text-center space-y-8 relative py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 w-full"
          >
            {/* Profile Photo */}
            <div className="relative inline-block">
              <img
                src={profile.photoUrl || profilePhoto}
                alt={profile.name || 'Patricio Suarez'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = profilePhoto;
                }}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-zinc-200 shadow-sm mx-auto filter grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Disponible para proyectos" />
            </div>

            {/* Name & Role */}
            <div className="space-y-2">
              <h1 className="font-syne text-4xl sm:text-5xl font-normal tracking-tight text-zinc-900">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-400">
                {profile.role}
              </p>
            </div>

            {/* Quote Phrase */}
            <div className="pt-2 max-w-lg mx-auto">
              <blockquote className="text-sm sm:text-base font-light text-zinc-700 italic border-l-2 border-zinc-900 pl-4 py-1 text-left bg-zinc-50/80 rounded-r-lg">
                "{profile.phrase}"
              </blockquote>
            </div>
          </motion.div>

          {/* Indicator Scroll Down */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ opacity: { delay: 0.8, duration: 0.5 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
            className="pt-8 text-zinc-300"
          >
            <ChevronDown className="w-6 h-6 mx-auto" />
          </motion.div>
        </section>

        {/* SLIDE 2: EDITOR TITLE */}
        <section className="min-h-[60vh] sm:min-h-[70vh] w-full max-w-3xl mx-auto px-6 flex items-center justify-center py-16 border-t border-zinc-100">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-4"
          >
            <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-zinc-400">
              Especialización
            </span>
            <h2 className="font-syne text-6xl sm:text-8xl md:text-9xl font-semibold tracking-tighter uppercase text-zinc-900 select-none">
              EDITOR
            </h2>
            <div className="w-16 h-0.5 bg-zinc-900 mx-auto opacity-80" />
          </motion.div>
        </section>

        {/* SLIDE 3: 5 SAMPLE VIDEOS (NO TEXT) */}
        <section className="min-h-screen w-full max-w-4xl mx-auto px-6 py-16 border-t border-zinc-100 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-2 text-center"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400">
              Muestras Audiovisuales
            </span>
          </motion.div>

          {/* Grid Layout of 5 Video Spaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Main Featured Video Slot 1 (Full width on top) */}
            {profile.sampleVideos.slice(0, 1).map((video, idx) => {
              const embed = getEmbedInfo(video.videoUrl);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="md:col-span-2 group relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm"
                >
                  {embed.isDirectVideo ? (
                    embed.url ? (
                      <video
                        src={embed.url}
                        poster={video.posterUrl || undefined}
                        loop
                        muted={isMuted}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : null
                  ) : (
                    embed.url ? (
                      <iframe
                        src={embed.url}
                        className="w-full h-full pointer-events-none"
                        allow="autoplay; fullscreen"
                      />
                    ) : null
                  )}

                  {/* Clean Controls & Expand Overlay (No Text) */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                    <button
                      onClick={() => setActiveVideoModal(video)}
                      className="p-4 rounded-full bg-white text-zinc-900 shadow-lg hover:scale-110 transition-transform"
                      title="Ver en pantalla completa"
                    >
                      <Play className="w-6 h-6 fill-zinc-900 ml-0.5" />
                    </button>

                    {embed.isDirectVideo && (
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingVideoIndex(0);
                        setTempVideoUrl(video.videoUrl);
                      }}
                      className="p-3.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                      title="Cambiar video"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Remaining 4 Video Slots (Grid 2x2) */}
            {profile.sampleVideos.slice(1, 5).map((video, idx) => {
              const actualIdx = idx + 1;
              const embed = getEmbedInfo(video.videoUrl);
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: actualIdx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm"
                >
                  {embed.isDirectVideo ? (
                    embed.url ? (
                      <video
                        src={embed.url}
                        poster={video.posterUrl || undefined}
                        loop
                        muted={isMuted}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : null
                  ) : (
                    embed.url ? (
                      <iframe
                        src={embed.url}
                        className="w-full h-full pointer-events-none"
                        allow="autoplay; fullscreen"
                      />
                    ) : null
                  )}

                  {/* Clean Controls Overlay (No Text) */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                    <button
                      onClick={() => setActiveVideoModal(video)}
                      className="p-3.5 rounded-full bg-white text-zinc-900 shadow-lg hover:scale-110 transition-transform"
                      title="Ver en pantalla completa"
                    >
                      <Play className="w-5 h-5 fill-zinc-900 ml-0.5" />
                    </button>

                    <button
                      onClick={() => {
                        setEditingVideoIndex(actualIdx);
                        setTempVideoUrl(video.videoUrl);
                      }}
                      className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                      title="Cambiar video"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}

          </div>
        </section>

        {/* SLIDE 4: POST-PRODUCTION MANIFESTO / STATEMENT */}
        <section className="min-h-[70vh] sm:min-h-[80vh] w-full max-w-3xl mx-auto px-6 flex items-center justify-center py-20 border-t border-zinc-100">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-6"
          >
            <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-zinc-400">
              Filosofía de Trabajo
            </span>

            <p className="font-syne text-lg sm:text-2xl md:text-3xl font-light text-zinc-900 leading-relaxed sm:leading-snug tracking-tight max-w-2xl mx-auto">
              "Cada proyecto es desarrollado mediante un proceso de postproducción que integra narrativa visual, corrección y gradación de color, diseño sonoro, efectos y recursos audiovisuales, con especial atención al ritmo, la estética y la identidad de cada contenido"
            </p>

            <div className="w-12 h-0.5 bg-zinc-300 mx-auto" />
          </motion.div>
        </section>

        {/* SLIDE 5: CONTACT & FINAL FOOTER */}
        <section className="min-h-[75vh] w-full max-w-lg mx-auto px-6 py-20 border-t border-zinc-100 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 my-auto"
          >
            <div className="text-center space-y-2">
              <span className="block text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                Diapositiva Final
              </span>
              <h3 className="font-syne text-3xl sm:text-4xl font-normal text-zinc-900">
                Contacto Directo
              </h3>
            </div>

            <div className="space-y-3">
              {/* Instagram */}
              <a
                href={profile.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-white transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-zinc-800 group-hover:text-zinc-900" />
                  <span className="text-sm font-medium text-zinc-900">
                    Instagram
                  </span>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-900 font-mono">
                  {profile.instagram.handle}
                </span>
              </a>

              {/* WhatsApp */}
              <div className="flex items-center gap-2">
                <a
                  href={profile.whatsapp.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-between p-4 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">
                      WhatsApp Directo
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-300">
                    {profile.whatsapp.formattedNumber}
                  </span>
                </a>

                <button
                  onClick={() => handleCopy(profile.whatsapp.formattedNumber, 'wa')}
                  className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  title="Copiar WhatsApp"
                >
                  {copiedKey === 'wa' ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <a
                  href={profile.email.mailto}
                  className="flex-1 flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-white transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-zinc-800 group-hover:text-zinc-900" />
                    <span className="text-sm font-medium text-zinc-900">
                      Correo Electrónico
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-900 font-mono truncate max-w-[150px] sm:max-w-none">
                    {profile.email.address}
                  </span>
                </a>

                <button
                  onClick={() => handleCopy(profile.email.address, 'email')}
                  className="p-4 rounded-xl bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  title="Copiar Correo"
                >
                  {copiedKey === 'email' ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          <footer className="pt-12 text-center text-[11px] font-light text-zinc-400">
            <p>© {new Date().getFullYear()} Patricio Suarez. Todos los derechos reservados.</p>
          </footer>
        </section>

      </main>

      {/* FULLSCREEN VIDEO LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveVideoModal(null)}
          >
            <div
              className="relative w-full max-w-4xl aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideoModal(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {(() => {
                const embed = getEmbedInfo(activeVideoModal.videoUrl);
                if (!embed.url) return null;
                return embed.isDirectVideo ? (
                  <video
                    src={embed.url}
                    poster={activeVideoModal.posterUrl || undefined}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    src={embed.url}
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                  />
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHANGE VIDEO URL / FILE MODAL */}
      <AnimatePresence>
        {editingVideoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-4 text-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h3 className="font-syne text-lg font-normal">
                  Actualizar Video de Muestra {editingVideoIndex + 1}
                </h3>
                <button
                  onClick={() => setEditingVideoIndex(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-500 mb-1">Subir video desde dispositivo</label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 p-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-medium transition-colors">
                    <Film className="w-4 h-4" />
                    <span>Seleccionar archivo MP4</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoFileUpload(editingVideoIndex, file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-500">O pegar enlace (Vimeo, YouTube o MP4)</label>
                  <input
                    type="url"
                    placeholder="https://vimeo.com/... o https://..."
                    value={tempVideoUrl}
                    onChange={(e) => setTempVideoUrl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingVideoIndex(null)}
                    className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleUpdateVideoUrl(editingVideoIndex, tempVideoUrl)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800"
                  >
                    Guardar Video
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE DATA MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-4 text-zinc-900 my-auto max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 sticky top-0 bg-white z-10">
                <h3 className="font-syne text-lg font-normal">
                  Editar Datos del Perfil
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-500 mb-1 font-medium">Nombre Completo</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 font-medium font-mono">Rol / Especialidad</label>
                  <input
                    type="text"
                    value={editForm.role || ''}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 mb-1 font-medium">Frase / Eslogan</label>
                  <textarea
                    rows={2}
                    value={editForm.phrase || ''}
                    onChange={(e) => setEditForm({ ...editForm, phrase: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-medium">Foto de Perfil</label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-800 text-xs font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Subir imagen desde dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="O pega URL de imagen (.jpg, .png)"
                    value={editForm.photoUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-medium">Instagram (@handle)</label>
                    <input
                      type="text"
                      value={editForm.instagram?.handle || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        instagram: { ...(editForm.instagram || {}), handle: e.target.value, url: editForm.instagram?.url || '' }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-500 mb-1 font-medium">Instagram Link</label>
                    <input
                      type="url"
                      value={editForm.instagram?.url || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        instagram: { ...(editForm.instagram || {}), url: e.target.value, handle: editForm.instagram?.handle || '' }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-medium">WhatsApp (Número)</label>
                    <input
                      type="text"
                      value={editForm.whatsapp?.formattedNumber || ''}
                      onChange={(e) => {
                        const num = e.target.value;
                        const cleanNum = num.replace(/[^0-9]/g, '');
                        setEditForm({
                          ...editForm,
                          whatsapp: {
                            ...(editForm.whatsapp || {}),
                            number: num,
                            formattedNumber: num,
                            waLink: `https://wa.me/${cleanNum}?text=Hola%20Patricio!%20Me%20contacto%20desde%20tu%20web.`
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-500 mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={editForm.email?.address || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        email: {
                          ...(editForm.email || {}),
                          address: e.target.value,
                          mailto: `mailto:${e.target.value}?subject=Consulta%20de%20Trabajo`
                        }
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-zinc-900 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-100 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
