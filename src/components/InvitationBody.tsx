import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Share2,
  RotateCcw,
  Sliders,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { InvitationData, RsvpEntry } from '../types/invitation';
import { CountdownTimer } from './CountdownTimer';
import { EventTimeline } from './EventTimeline';
import { LocationMap } from './LocationMap';
import { RsvpSection } from './RsvpSection';
import { GuestbookWall } from './GuestbookWall';
import { formatDateSpanish } from '../utils/calendar';

interface InvitationBodyProps {
  invitation: InvitationData;
  onRollBack: () => void;
  onOpenPass: (entry: RsvpEntry) => void;
  onOpenHostDashboard: () => void;
  onOpenCustomize: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const InvitationBody: React.FC<InvitationBodyProps> = ({
  invitation,
  onRollBack,
  onOpenPass,
  onOpenHostDashboard,
  onOpenCustomize,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const scrollToRsvp = () => {
    const el = document.getElementById('rsvp-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Gala de Graduación: ${invitation.graduateName}`,
        text: `Acompáñame a celebrar mi graduación como ${invitation.degree}. ¡Estás cordialmente invitado!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace de la invitación copiado al portapapeles');
    }
  };

  return (
    <div className="relative min-h-screen text-stone-100 pb-20 selection:bg-amber-600/30">
      {/* TOP NAVIGATION BAR (Zone 1: Brand title, Zone 2: Nav links, Zone 3: Primary CTA) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0f172a]/90 border-b border-amber-500/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-cinzel text-base sm:text-lg font-bold tracking-tight text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0"
          >
            Gala de Graduación
          </a>

          {/* Zone 2: 4 clean single-line text links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-sans font-medium text-slate-300">
            <a href="#ceremony" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
              Ceremonia
            </a>
            <a href="#itinerary" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
              Programa
            </a>
            <a href="#location" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
              Ubicación
            </a>
            <a href="#rsvp-section" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
              Confirmar Asistencia
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleMusic}
              title={isMusicPlaying ? 'Pausar música clásica ambiental' : 'Reproducir música clásica ambiental'}
              className={`p-2 rounded-lg border text-xs font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                isMusicPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-stone-200'
              }`}
            >
              <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'animate-bounce text-amber-300' : ''}`} />
              <span className="hidden sm:inline">{isMusicPlaying ? 'Música Activa' : 'Música'}</span>
            </button>

            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenCustomize}
              title="Personalizar datos de la invitación"
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToRsvp}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              Confirmar Asistencia
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Roll Back Up quick pill action */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onRollBack}
            className="inline-flex items-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 font-sans transition-colors cursor-pointer group"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
            <span>Volver a enrollar diploma</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-stone-200 font-sans transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir Invitación</span>
          </button>
        </div>

        {/* UNROLLED MASTER CEREMONIAL CERTIFICATE (PARCHMENT CARD) */}
        <motion.article
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative rounded-2xl sm:rounded-3xl bg-[#fdfaf3] text-slate-900 parchment-shadow border-[3px] border-[#cbb37a] p-6 sm:p-12 overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(#d8c499 0.75px, transparent 0.75px),
              linear-gradient(180deg, #fefcf7 0%, #faf3e3 50%, #fbf5e6 100%)
            `,
            backgroundSize: '24px 24px, 100% 100%',
          }}
        >
          {/* Classical Double Filigree Inset Border */}
          <div className="absolute inset-3 sm:inset-5 border border-[#b89754]/50 pointer-events-none rounded-xl" />
          <div className="absolute inset-4 sm:inset-6 border border-[#b89754]/25 pointer-events-none rounded-lg" />

          {/* Classical Corner Flourishes */}
          <div className="absolute top-5 left-5 text-[#9a762c] text-sm pointer-events-none select-none">❧</div>
          <div className="absolute top-5 right-5 text-[#9a762c] text-sm pointer-events-none select-none">❧</div>
          <div className="absolute bottom-5 left-5 text-[#9a762c] text-sm pointer-events-none select-none">❧</div>
          <div className="absolute bottom-5 right-5 text-[#9a762c] text-sm pointer-events-none select-none">❧</div>

          {/* Academic Crest / Insignia Header */}
          <div className="text-center relative z-10 pt-2">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#967228] via-[#e2c57a] to-[#7c5819] p-0.5 shadow-md mb-3">
              <div className="w-full h-full rounded-full bg-[#fdfaf3] flex items-center justify-center text-[#8e6a24]">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <p className="font-cinzel text-xs sm:text-sm uppercase tracking-[0.28em] text-[#856322] font-semibold">
              {invitation.institution}
            </p>

            <p className="font-sans text-[11px] sm:text-xs text-stone-500 uppercase tracking-widest mt-0.5">
              {invitation.faculty}
            </p>

            {/* Classical Divider */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#b59551] to-transparent" />
              <span className="text-[#856322] text-xs font-cinzel">✦</span>
              <div className="h-[1px] w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#b59551] to-transparent" />
            </div>

            {/* Formal Invitation Deck */}
            <p className="font-cormorant italic text-base sm:text-lg text-stone-700 max-w-lg mx-auto leading-relaxed">
              Tiene el honor de invitarle a usted y a su apreciable familia a la solemne celebración con motivo de la culminación de estudios de:
            </p>

            {/* GRADUATE CALLIGRAPHIC / MONUMENTAL NAME */}
            <div className="my-5 sm:my-6">
              <span className="block font-cormorant italic text-lg sm:text-xl text-[#856322] font-medium mb-1">
                {invitation.prefix}
              </span>
              <h1 className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#1c1917] leading-tight">
                {invitation.graduateName}
              </h1>
              <p className="font-cinzel text-xs sm:text-sm uppercase tracking-widest text-[#a17c2f] font-semibold mt-2">
                {invitation.degree}
              </p>
              {invitation.honor && (
                <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#f3ebd7] border border-[#d3bc89] text-[11px] font-sans font-medium text-[#7a5818]">
                  {invitation.honor}
                </div>
              )}
            </div>

            {/* GRADUATE PORTRAIT & MOTTO SPLIT */}
            <div className="max-w-xl mx-auto my-6 p-4 rounded-2xl bg-[#f7efe0]/70 border border-[#ddcaa1] flex flex-col sm:flex-row items-center gap-5 text-left">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border-2 border-[#b59551] shadow-md">
                <img
                  src="/src/assets/images/graduate_portrait_1794069007940.jpg"
                  alt={`Retrato oficial de ${invitation.graduateName}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="font-cormorant italic text-sm sm:text-base text-stone-800 leading-relaxed">
                  "{invitation.quote}"
                </p>
                <p className="font-sans text-[11px] uppercase tracking-wider text-[#8b6923] font-semibold mt-2">
                  — {invitation.quoteAuthor}
                </p>
              </div>
            </div>

            {/* CEREMONY & RECEPTION SUMMARY CARDS */}
            <div id="ceremony" className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 text-left max-w-2xl mx-auto">
              {/* Card 1: Acto Académico */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#e2d2b0] shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[#856322]">
                  <Award className="w-4 h-4" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider">
                    Acto Académico
                  </span>
                </div>
                <h4 className="font-sans font-bold text-sm text-stone-900">
                  {invitation.ceremonyVenue.name}
                </h4>
                <p className="font-sans text-xs text-stone-600 mt-0.5">
                  {invitation.ceremonyVenue.address}
                </p>
                <div className="mt-2 text-xs font-semibold text-[#856322] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{invitation.ceremonyVenue.time}</span>
                </div>
              </div>

              {/* Card 2: Recepción & Fiesta */}
              <div className="p-4 rounded-xl bg-white/70 border border-[#e2d2b0] shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-[#856322]">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider">
                    Recepción de Gala
                  </span>
                </div>
                <h4 className="font-sans font-bold text-sm text-stone-900">
                  {invitation.partyVenue.name}
                </h4>
                <p className="font-sans text-xs text-stone-600 mt-0.5">
                  {invitation.partyVenue.address}, {invitation.partyVenue.city}
                </p>
                <div className="mt-2 text-xs font-semibold text-[#856322] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{invitation.partyVenue.time}</span>
                </div>
              </div>
            </div>

            {/* Classical Wax Seal Accent / Closing signature */}
            <div className="pt-4 border-t border-[#d8c399]/60 flex flex-col items-center justify-center">
              <span className="font-cormorant italic text-sm text-stone-600">
                Agradecemos a Dios, a nuestros padres y a todos quienes hicieron posible este triunfo.
              </span>
              <span className="font-cinzel text-xs tracking-widest text-[#856322] uppercase mt-1">
                Generación 2026 · {invitation.institution}
              </span>
            </div>
          </div>
        </motion.article>

        {/* SECTION 1: COUNTDOWN TIMER */}
        <CountdownTimer invitation={invitation} />

        {/* SECTION 2: EVENT TIMELINE & DRESS CODE */}
        <div id="itinerary">
          <EventTimeline invitation={invitation} />
        </div>

        {/* SECTION 3: INTERACTIVE LOCATION MAP */}
        <div id="location">
          <LocationMap invitation={invitation} />
        </div>

        {/* SECTION 4: RSVP CONFIRMATION FORM */}
        <RsvpSection
          invitation={invitation}
          onOpenPass={onOpenPass}
          onOpenHostDashboard={onOpenHostDashboard}
        />

        {/* SECTION 5: GUESTBOOK & DEDICATIONS */}
        <GuestbookWall graduateName={invitation.graduateName} />

        {/* FOOTER */}
        <footer className="mt-14 text-center text-xs text-slate-500 font-sans tracking-wide space-y-2">
          <p>
            Tarjeta de Invitación Digital · Gala de Graduación {invitation.graduateName}
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <button
              onClick={onRollBack}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Cerrar Diploma
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenCustomize}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Personalizar
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenHostDashboard}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Panel Anfitrión
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};
