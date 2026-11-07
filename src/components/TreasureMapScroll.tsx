import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Compass,
  Anchor,
  MapPin,
  Calendar,
  Clock,
  Shirt,
  Gift,
  Send,
  CheckCircle,
  Ticket,
  Music,
  Sliders,
  RotateCcw,
  Navigation,
  Copy,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
  Users,
} from 'lucide-react';
import L from 'leaflet';
import { InvitationData, RsvpEntry } from '../types/invitation';
import { sound } from '../utils/soundEffects';
import { formatDateSpanish, generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface TreasureMapScrollProps {
  invitation: InvitationData;
  onOpenPass: (entry: RsvpEntry) => void;
  onOpenHostDashboard: () => void;
  onOpenCustomize: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

const STORAGE_KEY = 'graduation_invitation_rsvps_v1';
const USER_RSVP_KEY = 'graduation_invitation_my_rsvp_v1';

export const TreasureMapScroll: React.FC<TreasureMapScrollProps> = ({
  invitation,
  onOpenPass,
  onOpenHostDashboard,
  onOpenCustomize,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
}) => {
  // Scroll tracking for realistic unrolling physics
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDistance, setScrollDistance] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Countdown timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP Form
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    attending: true,
    companions: 0,
    dietary: 'Banquete Imperial Tradicional',
    songRequest: '',
    message: '',
  });
  const [existingRsvp, setExistingRsvp] = useState<RsvpEntry | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Countdown calculation
  useEffect(() => {
    const update = () => {
      const target = new Date(invitation.targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [invitation.targetDate]);

  // Load existing RSVP
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_RSVP_KEY);
      if (saved) setExistingRsvp(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Window scroll listener to physically roll and unroll the scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.min(1, Math.max(0, currentY / maxScroll));
      setScrollProgress(progress);
      setScrollDistance(currentY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Sepia Vintage Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng, name, address, city } = invitation.partyVenue;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // CartoDB Voyager tiles with vintage sepia CSS filter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Antique "X MARCA EL LUGAR" pirate treasure pin
    const pirateXIcon = L.divIcon({
      className: 'custom-pirate-x-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="
            font-family: serif;
            font-size: 34px;
            font-weight: 900;
            color: #991b1b;
            text-shadow: 0 0 4px #000, 2px 2px 0 #450a0a;
            transform: scale(1.1);
          ">✕</div>
          <div style="
            position: absolute;
            bottom: -8px;
            white-space: nowrap;
            background: #2b180d;
            border: 1px solid #c9933b;
            color: #f7eedb;
            font-size: 10px;
            font-family: 'IM Fell English', serif;
            padding: 1px 5px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.7);
          ">X Marca el Lugar</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lng], { icon: pirateXIcon }).addTo(map);
    marker.bindPopup(`
      <div style="font-family:'IM Fell English', serif; text-align:center; padding:3px; color:#2c1507;">
        <h4 style="font-size:14px; margin:0 0 2px 0; font-weight:bold;">${name}</h4>
        <p style="font-size:11px; margin:0; color:#5c3515;">${address}, ${city}</p>
        <p style="font-size:10px; margin:4px 0 0 0; color:#991b1b; font-weight:bold;">¡Destino de la Celebración!</p>
      </div>
    `);

    setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [invitation.partyVenue]);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const ticketCode = `TESORO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: RsvpEntry = {
      id: `rsvp_${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: '',
      attending: formData.attending,
      companions: formData.attending ? formData.companions : 0,
      dietary: formData.dietary,
      songRequest: formData.songRequest.trim(),
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
      ticketCode,
    };

    try {
      const existingAllStr = localStorage.getItem(STORAGE_KEY);
      const allEntries: RsvpEntry[] = existingAllStr ? JSON.parse(existingAllStr) : [];
      allEntries.unshift(newEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));
      localStorage.setItem(USER_RSVP_KEY, JSON.stringify(newEntry));
    } catch {
      // ignore
    }

    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#c4923e', '#7c2d12', '#fef08a', '#1e293b'],
    });

    setExistingRsvp(newEntry);
    setJustSubmitted(true);

    if (newEntry.attending) {
      setTimeout(() => {
        onOpenPass(newEntry);
      }, 500);
    }
  };

  const handleCopyAddress = () => {
    const text = `${invitation.partyVenue.name}, ${invitation.partyVenue.address}, ${invitation.partyVenue.city}`;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleAutoUnroll = () => {
    sound.playUnrollSound();
    window.scrollTo({
      top: document.documentElement.scrollHeight * 0.35,
      behavior: 'smooth',
    });
  };

  const handleRollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Cylinder roll rotation degree tied to scroll distance
  const rollRotationDeg = (scrollDistance * 0.4) % 360;

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen w-full bg-[#120a05] text-[#2c1708] overflow-x-hidden selection:bg-amber-800/40 selection:text-amber-100 font-fell"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(90, 48, 15, 0.4) 0%, transparent 70%),
          repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.35) 0px, transparent 1px, transparent 4px, rgba(0, 0, 0, 0.35) 5px),
          linear-gradient(180deg, #180d07 0%, #0d0603 50%, #080302 100%)
        `,
      }}
    >
      {/* RUSTIC WOOD PLANK BACKGROUND ACCENTS */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10 bg-[radial-gradient(#4d280e_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* TOP ANCHORED WOODEN SPINDLE (The top rod where the paper unrolls from) */}
      <div className="sticky top-0 z-40 w-full max-w-lg mx-auto px-2 pt-2">
        <div className="relative flex items-center justify-between h-9 sm:h-11">
          {/* Left turned wooden finial with brass rings */}
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full antique-spindle-cylinder border-2 border-[#824c1e] flex items-center justify-center shadow-2xl -mr-1 z-10">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#996515] to-[#fde047] border border-[#522d0d]" />
          </div>

          {/* Main top spindle cylinder with antique brass bindings */}
          <div className="flex-1 h-6 sm:h-7 antique-spindle-cylinder rounded-sm border-y border-[#80491d] relative shadow-2xl flex items-center justify-between px-6 overflow-hidden">
            <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
            <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
            <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
          </div>

          {/* Right turned wooden finial */}
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full antique-spindle-cylinder border-2 border-[#824c1e] flex items-center justify-center shadow-2xl -ml-1 z-10">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#996515] to-[#fde047] border border-[#522d0d]" />
          </div>
        </div>

        {/* Paper top curl edge where parchment emerges */}
        <div className="h-2 w-[94%] mx-auto bg-gradient-to-b from-[#4a260d] to-transparent opacity-80" />
      </div>

      {/* HINT BANNER AT VERY TOP */}
      {scrollProgress < 0.05 && (
        <div className="w-full max-w-md mx-auto text-center pt-3 pb-1 px-4 animate-bounce">
          <button
            onClick={handleAutoUnroll}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3a1d0d]/90 border border-[#b87d2a]/60 text-[#fcedc7] text-xs font-sans tracking-wide shadow-lg cursor-pointer hover:bg-[#4d2812]"
          >
            <span>Desplaza hacia abajo para desenrollar el mapa</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#eab308]" />
          </button>
        </div>
      )}

      {/* =========================================================================
          THE ANCIENT TREASURE MAP PARCHMENT (WITH TORN EDGES & BURN MARKS)
          ========================================================================= */}
      <main className="w-full max-w-md mx-auto px-2 sm:px-3 pt-2 pb-24 relative">
        <article
          className="relative rounded-sm shadow-2xl overflow-hidden treasure-paper-shadow border-x-2 border-b-2 border-[#7a461b]"
          style={{
            backgroundColor: '#e5caa0',
            backgroundImage: `
              radial-gradient(#ab8045 1px, transparent 1px),
              linear-gradient(180deg, #f0dcbe 0%, #e2c499 25%, #dfbe8f 50%, #d8b482 75%, #cca36e 100%)
            `,
            backgroundSize: '24px 24px, 100% 100%',
          }}
        >
          {/* RAGGED TORN EDGES (Rasgaduras en los laterales con sombras de papel quemado) */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-[#4d270c]/50 to-transparent pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-l from-[#4d270c]/50 to-transparent pointer-events-none" />

          {/* Irregular burnt edge tear lines */}
          <div className="absolute top-0 bottom-0 left-1 w-[1px] border-l-2 border-dashed border-[#572d0d]/40 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-1 w-[1px] border-r-2 border-dashed border-[#572d0d]/40 pointer-events-none" />

          {/* TEA STAINS & WATERMARKS */}
          <div className="absolute top-24 -right-10 w-44 h-44 rounded-full bg-[#8c5825]/15 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 -left-12 w-48 h-48 rounded-full bg-[#754419]/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-40 right-2 w-36 h-36 rounded-full bg-[#613612]/20 blur-xl pointer-events-none" />

          {/* INNER ENGRAVED CARTOGRAPHIC FRAME */}
          <div className="p-4 sm:p-6 relative z-10">
            {/* Outer double distressed border */}
            <div className="border-2 border-[#663814] p-3 sm:p-4 rounded-sm relative">
              <div className="border border-[#8f5826]/60 p-3 rounded-sm relative">
                {/* Vintage Corner Fleur-de-lis / Nautical Anchors */}
                <span className="absolute -top-2.5 -left-2.5 text-[#5e3211] font-bold text-sm select-none">⚓</span>
                <span className="absolute -top-2.5 -right-2.5 text-[#5e3211] font-bold text-sm select-none">⚓</span>
                <span className="absolute -bottom-2.5 -left-2.5 text-[#5e3211] font-bold text-sm select-none">⚓</span>
                <span className="absolute -bottom-2.5 -right-2.5 text-[#5e3211] font-bold text-sm select-none">⚓</span>

                {/* 1. MAP HEADER & COMPASS ROSE */}
                <div className="text-center pt-2 pb-4">
                  <div className="inline-flex items-center justify-center gap-2 text-[#783e16] text-[11px] font-fell uppercase tracking-[0.22em] font-bold mb-1">
                    <span>✦ Carta de Navegación ✦</span>
                  </div>

                  <h1 className="font-cinzel text-xl sm:text-2xl font-black tracking-tight text-[#2d1607] uppercase">
                    Bitácora de Graduación
                  </h1>

                  <p className="font-fell italic text-xs sm:text-sm text-[#542f13] mt-0.5">
                    Rumbo trazado hacia la culminación de estudios de:
                  </p>

                  {/* ROTATING ANTIQUE COMPASS ROSE ILLUSTRATION */}
                  <div className="my-4 relative w-24 h-24 mx-auto flex items-center justify-center">
                    <img
                      src="/src/assets/images/vintage_compass_rose_1794070775364.jpg"
                      alt="Rosa de los vientos náutica antigua"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full shadow-md border-2 border-[#754418] transition-transform duration-300"
                      style={{
                        transform: `rotate(${rollRotationDeg * 0.5}deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full border border-[#f0dcbe]/40 pointer-events-none" />
                  </div>

                  {/* University & Faculty in 17th Century Inscription */}
                  <p className="font-cinzel font-bold text-xs uppercase tracking-widest text-[#663814]">
                    {invitation.institution}
                  </p>
                  <p className="font-fell italic text-xs text-[#5c3516]">
                    {invitation.faculty}
                  </p>
                </div>

                {/* 2. GRADUATE'S NAME & TITLE (MEDALLION STYLE) */}
                <div className="text-center my-4 py-3 border-y-2 border-dashed border-[#78431b]">
                  <span className="font-fell italic text-base text-[#6b3913] font-bold block">
                    {invitation.prefix}
                  </span>
                  <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#1f0d04] tracking-tight leading-tight mt-0.5">
                    {invitation.graduateName}
                  </h2>
                  <p className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#854518] mt-1">
                    {invitation.degree}
                  </p>
                  {invitation.honor && (
                    <span className="inline-block mt-2 px-3 py-0.5 bg-[#d4af78] border border-[#7a491e] text-[10px] font-sans font-bold text-[#3d1f08] uppercase tracking-wider shadow-sm">
                      {invitation.honor}
                    </span>
                  )}
                </div>

                {/* 3. GRADUATE PORTRAIT WITH BURNT RAGGED FRAME */}
                <div className="my-5 p-3 bg-[#d9b787]/80 border border-[#8f5827] rounded shadow-sm flex items-center gap-3 relative overflow-hidden">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded border-2 border-[#572b0c] shadow overflow-hidden relative">
                    <img
                      src="/src/assets/images/graduate_portrait_1794069007940.jpg"
                      alt={`Retrato oficial de ${invitation.graduateName}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter sepia-[0.35] contrast-[1.05]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-fell italic text-xs sm:text-sm text-[#2d1607] leading-snug">
                      "{invitation.quote}"
                    </p>
                    <p className="font-cinzel font-bold text-[10px] text-[#6b3913] uppercase tracking-wider mt-1.5">
                      — {invitation.quoteAuthor}
                    </p>
                  </div>
                </div>

                {/* 4. NAUTICAL CHRONOMETER (COUNTDOWN TIMER) */}
                <div className="my-5 p-3.5 bg-[#d8b584] border-2 border-[#693a15] rounded shadow-inner">
                  <div className="text-center mb-2">
                    <div className="flex items-center justify-center gap-1.5 text-[#5e3211] font-bold text-[10px] uppercase tracking-widest font-sans">
                      <Clock className="w-3.5 h-3.5 text-[#733f17]" />
                      <span>Cronómetro Náutico de la Travesía</span>
                    </div>
                    <p className="font-fell text-xs text-[#3d1f08] font-bold mt-0.5">
                      Fecha fijada: {formatDateSpanish(invitation.targetDate)}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto">
                    {[
                      { label: 'Días', val: countdown.days },
                      { label: 'Horas', val: countdown.hours },
                      { label: 'Min', val: countdown.minutes },
                      { label: 'Seg', val: countdown.seconds },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col items-center justify-center p-2 rounded bg-[#f2e0c4] border border-[#7a461b] shadow-inner"
                      >
                        <span className="font-cinzel text-lg sm:text-xl font-black text-[#2e1507] tabular-nums">
                          {String(item.val).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-[#5c3314]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-[#8f5a28]/60 font-sans">
                    <a
                      href={generateGoogleCalendarUrl(invitation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#cba470] hover:bg-[#b8915e] text-[#241104] text-[10px] font-bold border border-[#6b3c16] transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Agendar en Google</span>
                    </a>
                    <button
                      onClick={() => downloadIcsFile(invitation)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#cba470] hover:bg-[#b8915e] text-[#241104] text-[10px] font-bold border border-[#6b3c16] transition-colors cursor-pointer"
                    >
                      <span>Descargar .ics</span>
                    </button>
                  </div>
                </div>

                {/* 5. THE EXPEDITION TRAIL (ITINERARIO NÁUTICO) */}
                <div className="my-5 space-y-3">
                  <div className="text-center mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#693914]">
                      Ruta del Viaje
                    </span>
                    <h3 className="font-cinzel text-base font-extrabold text-[#241105]">
                      Etapas de la Celebración
                    </h3>
                  </div>

                  {/* Stage 1: Ceremonia */}
                  <div className="p-3 bg-[#e0c49b] border border-[#75441b] rounded relative">
                    <div className="flex items-center justify-between text-xs font-bold text-[#542a0b] font-cinzel">
                      <div className="flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-[#6e3913]" />
                        <span>1. Acto Solemne de Grado</span>
                      </div>
                      <span className="font-mono text-[11px]">{invitation.ceremonyVenue.time}</span>
                    </div>
                    <p className="font-fell font-bold text-xs text-[#2c1507] mt-1">
                      {invitation.ceremonyVenue.name}
                    </p>
                    <p className="font-fell text-[11px] text-[#522f13]">
                      {invitation.ceremonyVenue.address}
                    </p>
                  </div>

                  {/* Dotted path connecting the trail */}
                  <div className="flex justify-center my-0.5">
                    <div className="h-4 border-l-2 border-dashed border-[#7a461b]" />
                  </div>

                  {/* Stage 2: Recepción & Fiesta */}
                  <div className="p-3 bg-[#e0c49b] border-2 border-[#801919] rounded relative">
                    <div className="flex items-center justify-between text-xs font-bold text-[#7a1414] font-cinzel">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base">✕</span>
                        <span>2. Recepción & Fiesta de Gala</span>
                      </div>
                      <span className="font-mono text-[11px]">{invitation.partyVenue.time}</span>
                    </div>
                    <p className="font-fell font-bold text-xs text-[#2c1507] mt-1">
                      {invitation.partyVenue.name}
                    </p>
                    <p className="font-fell text-[11px] text-[#522f13]">
                      {invitation.partyVenue.address}, {invitation.partyVenue.city}
                    </p>
                  </div>
                </div>

                {/* 6. DRESS CODE & BOUNTY (VESTIMENTA & LLUVIA DE SOBRES) */}
                <div className="my-5 p-3 bg-[#d9b787]/90 border border-[#804c20] rounded space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Shirt className="w-4 h-4 text-[#613310] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-cinzel font-bold text-[#2e1507] block">
                        Código de Vestimenta: {invitation.dressCode.title}
                      </span>
                      <p className="font-fell text-[11px] text-[#4d2a10] leading-snug">
                        {invitation.dressCode.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-[#8f5827]/50">
                    <Gift className="w-4 h-4 text-[#613310] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-cinzel font-bold text-[#2e1507] block">
                        {invitation.giftInfo.type}
                      </span>
                      <p className="font-fell text-[11px] text-[#4d2a10] leading-snug">
                        {invitation.giftInfo.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. INTERACTIVE LOCATION MAP (X MARCA EL LUGAR) */}
                <div className="my-5">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-[#693914]">
                      <Compass className="w-4 h-4 text-[#754117]" />
                      <span>Coordenadas del Encuentro (X Marca el Lugar)</span>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="text-[10px] text-[#522d10] hover:text-[#241104] font-sans font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-800" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAddress ? '¡Copiada!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Leaflet map with antique border frame */}
                  <div className="w-full h-52 sm:h-60 rounded border-2 border-[#542d0e] shadow-inner bg-[#bda179] overflow-hidden relative">
                    <div ref={mapContainerRef} className="w-full h-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 font-sans">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${invitation.partyVenue.name} ${invitation.partyVenue.address}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-[#cb9f67] hover:bg-[#ba8d54] text-[#1c0d03] text-[11px] font-bold border border-[#59300e] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Abrir Google Maps</span>
                    </a>

                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(
                        `${invitation.partyVenue.name} ${invitation.partyVenue.address}`
                      )}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-[#cb9f67] hover:bg-[#ba8d54] text-[#1c0d03] text-[11px] font-bold border border-[#59300e] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Navegar con Waze</span>
                    </a>
                  </div>
                </div>

                {/* 8. EL LIBRO DE ABORDAJE (RSVP FORM) */}
                <div className="my-5 pt-4 border-t-2 border-dashed border-[#703b14]">
                  <div className="text-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#693914] block">
                      Libro de Abordaje & Confirmación
                    </span>
                    <h3 className="font-cinzel text-lg font-black text-[#210e04]">
                      Asegura Tu Asiento en el Festejo
                    </h3>
                  </div>

                  {existingRsvp && !justSubmitted ? (
                    <div className="p-3.5 bg-[#d4b07d] border-2 border-[#6e3c15] rounded text-xs text-center">
                      <CheckCircle className="w-5 h-5 text-emerald-800 mx-auto mb-1" />
                      <p className="font-cinzel font-bold text-[#1f0d04]">
                        ¡Asistencia Registrada, {existingRsvp.name}!
                      </p>
                      <p className="font-fell text-[11px] text-[#422209] mt-0.5">
                        {existingRsvp.attending
                          ? `Pase Oficial ${existingRsvp.ticketCode} (${1 + existingRsvp.companions} personas)`
                          : 'Registrado como no asistente'}
                      </p>
                      {existingRsvp.attending && (
                        <button
                          onClick={() => onOpenPass(existingRsvp)}
                          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[#946221] to-[#ba8436] text-white font-cinzel font-bold text-xs shadow-md border border-[#4d2a0b] cursor-pointer"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Ver Salvoconducto / Pase</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleRsvpSubmit} className="space-y-3 font-sans text-xs">
                      {/* Attendance choice */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, attending: true })}
                          className={`p-2 rounded border font-bold transition-all cursor-pointer ${
                            formData.attending
                              ? 'bg-[#5c2e0b] text-[#f7eedb] border-[#361a05] shadow'
                              : 'bg-[#ddbf94] text-[#4d2b10] border-[#8a5525]'
                          }`}
                        >
                          ¡Sí, asistiré al festejo!
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, attending: false })}
                          className={`p-2 rounded border font-bold transition-all cursor-pointer ${
                            !formData.attending
                              ? 'bg-rose-950 text-white border-rose-900 shadow'
                              : 'bg-[#ddbf94] text-[#4d2b10] border-[#8a5525]'
                          }`}
                        >
                          No podré acompañarles
                        </button>
                      </div>

                      {/* Name input */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                          Nombre Completo del Invitado *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Capitán Mateo Arismendi"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] placeholder-[#7d5635] outline-none font-fell text-sm"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                          WhatsApp / Teléfono *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+52 55 1234 5678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] placeholder-[#7d5635] outline-none font-fell text-sm"
                        />
                      </div>

                      {formData.attending && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                                Acompañantes
                              </label>
                              <select
                                value={formData.companions}
                                onChange={(e) => setFormData({ ...formData, companions: Number(e.target.value) })}
                                className="w-full px-2 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] outline-none font-sans"
                              >
                                <option value={0}>Sólo yo (1 pase)</option>
                                <option value={1}>+1 (2 pases)</option>
                                <option value={2}>+2 (3 pases)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                                Menú del Banquete
                              </label>
                              <select
                                value={formData.dietary}
                                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                                className="w-full px-2 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] outline-none font-sans"
                              >
                                <option value="Banquete Imperial Tradicional">Tradicional</option>
                                <option value="Menú Vegetariano">Vegetariano</option>
                                <option value="Menú Vegano">Vegano</option>
                                <option value="Sin Gluten / Celíaco">Sin Gluten</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                              Canción para la fiesta (Sugerencia al DJ)
                            </label>
                            <input
                              type="text"
                              placeholder="Ej. He's a Pirate / Don't Stop Believin'"
                              value={formData.songRequest}
                              onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                              className="w-full px-3 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] placeholder-[#7d5635] outline-none font-fell text-sm"
                            />
                          </div>
                        </>
                      )}

                      {/* Dedication */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#381d08] mb-1 font-sans">
                          Dedicatoria en la Bitácora
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Escribe unas palabras de orgullo y afecto..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-3 py-2 rounded bg-[#f2e2cb] border border-[#75441b] text-[#1c0d04] placeholder-[#7d5635] outline-none resize-none font-fell text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-[#6e360f] via-[#8c4819] to-[#6e360f] hover:from-[#592a0a] hover:to-[#592a0a] text-[#f7eedb] font-cinzel font-black text-xs tracking-wider shadow-lg border border-[#3b1c06] flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Firmar Bitácora y Obtener Salvoconducto</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* CLOSING LATIN MOTTO & WAX IMPRINT */}
                <div className="text-center pt-3 pb-1 border-t border-[#8f5827]/70 font-fell">
                  <span className="italic text-xs text-[#47260c] block">
                    Finis Coronat Opus · El final corona la obra
                  </span>
                  <span className="font-cinzel text-[10px] uppercase tracking-widest text-[#693914] font-black mt-0.5 block">
                    Generación 2026 · Mapa Oficial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* =========================================================================
            BOTTOM MOVING SPINDLE ROLL (Follows the scroll front dynamically!)
            ========================================================================= */}
        <div className="w-[104%] -mx-[2%] pt-1 pb-4">
          <div
            className="relative flex items-center justify-between h-9 sm:h-11 transition-transform"
            style={{
              transform: `rotateX(${rollRotationDeg}deg)`,
            }}
          >
            {/* Left wooden finial */}
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full antique-spindle-cylinder border-2 border-[#824c1e] flex items-center justify-center shadow-2xl -mr-1 z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#996515] to-[#fde047] border border-[#522d0d]" />
            </div>

            {/* Bottom wooden cylinder */}
            <div className="flex-1 h-6 sm:h-7 antique-spindle-cylinder rounded-sm border-y border-[#80491d] relative shadow-2xl flex items-center justify-between px-6 overflow-hidden">
              <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
              <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
              <div className="w-2 h-full bg-gradient-to-r from-[#eab308] to-[#996515] opacity-80" />
            </div>

            {/* Right wooden finial */}
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full antique-spindle-cylinder border-2 border-[#824c1e] flex items-center justify-center shadow-2xl -ml-1 z-10">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#996515] to-[#fde047] border border-[#522d0d]" />
            </div>
          </div>

          {/* Hanging nautical cord / tassel */}
          <div className="flex flex-col items-center mt-[-2px]">
            <div className="w-0.5 h-5 bg-gradient-to-b from-[#b45309] to-[#78350f] shadow" />
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#b45309] via-[#fde047] to-[#78350f] shadow-sm" />
            <div className="w-5 h-8 bg-gradient-to-b from-[#d97706] to-[#451a03] rounded-b-md shadow" />
          </div>
        </div>
      </main>

      {/* DISCRETE MOBILE STICKY FLOATING ACTION BAR */}
      <aside
        aria-label="Controles del mapa"
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:w-[420px] mx-auto z-40 bg-[#1f0f06]/95 backdrop-blur-md border border-[#b47a28]/50 rounded-2xl p-2 flex items-center justify-between gap-1.5 shadow-2xl font-sans"
      >
        <button
          onClick={() => {
            const form = document.querySelector('form');
            if (form) form.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#b45309] hover:from-[#92400e] hover:to-[#92400e] text-[#fffbeb] font-cinzel font-black text-xs tracking-wider transition-all shadow-md text-center cursor-pointer"
        >
          Confirmar Asistencia
        </button>

        <button
          onClick={onToggleMusic}
          title={isMusicPlaying ? 'Pausar música clásica' : 'Música'}
          className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
            isMusicPlaying
              ? 'bg-[#b45309]/30 border-[#fde047] text-[#fde047]'
              : 'bg-[#2b170c] hover:bg-[#3d2112] border-[#5e3417] text-[#d6b085]'
          }`}
        >
          <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
        </button>

        <button
          onClick={onOpenCustomize}
          title="Personalizar invitación"
          className="p-2 rounded-xl bg-[#2b170c] hover:bg-[#3d2112] text-[#e0b77b] border border-[#5e3417] transition-colors cursor-pointer"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenHostDashboard}
          title="Panel de anfitrión"
          className="p-2 rounded-xl bg-[#2b170c] hover:bg-[#3d2112] text-[#e0b77b] border border-[#5e3417] transition-colors cursor-pointer"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={handleRollToTop}
          title="Volver a enrollar hacia arriba"
          className="p-2 rounded-xl bg-[#2b170c] hover:bg-[#3d2112] text-[#e0b77b] border border-[#5e3417] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </aside>
    </div>
  );
};
