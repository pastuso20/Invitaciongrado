import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Sparkles,
  Award,
  Calendar,
  Clock,
  MapPin,
  Shirt,
  Gift,
  Send,
  CheckCircle,
  Ticket,
  Volume2,
  VolumeX,
  Music,
  RotateCcw,
  Navigation,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import L from 'leaflet';
import { InvitationData, RsvpEntry } from '../types/invitation';
import { sound } from '../utils/soundEffects';
import { formatDateSpanish, generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface UnifiedParchmentScrollProps {
  invitation: InvitationData;
  onOpenPass: (entry: RsvpEntry) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

const STORAGE_KEY = 'graduation_invitation_rsvps_v1';
const USER_RSVP_KEY = 'graduation_invitation_my_rsvp_v1';

// Initial semi-open height (displays Crest, University, and Faculty of Architecture & Design)
const SEMI_OPEN_HEIGHT = 280;

/* =========================================================================
   REALISTIC PAPER SCROLL ASSETS & REFERENCE IMAGE SUB-COMPONENTS
   ========================================================================= */

/** 1. 3D Realistic Graduation Mortarboard / Birrete with Red Tassel (Reference Image) */
const ReferenceGraduationCap: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative select-none pointer-events-none drop-shadow-[0_12px_22px_rgba(0,0,0,0.9)] ${className}`}>
    <svg
      viewBox="0 0 160 120"
      className="w-28 sm:w-36 h-auto overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="capTopGrad" x1="20" y1="15" x2="140" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="25%" stopColor="#27272a" />
          <stop offset="70%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        <linearGradient id="skullBandGrad" x1="45" y1="45" x2="115" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#27272a" />
          <stop offset="50%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        <linearGradient id="tasselSilkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="85%" stopColor="#b91c1c" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        <linearGradient id="goldButtonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* Skull Cap Base */}
      <path
        d="M 46 45 C 46 45 42 70 80 72 C 118 70 114 45 114 45 C 114 45 106 62 80 62 C 54 62 46 45 46 45 Z"
        fill="url(#skullBandGrad)"
        stroke="#3f3f46"
        strokeWidth="0.75"
      />

      <path
        d="M 52 48 C 62 58 98 58 108 48 C 98 55 62 55 52 48 Z"
        fill="#09090b"
        opacity="0.8"
      />

      {/* Mortarboard Diamond Flat Top */}
      <polygon
        points="80,12 144,38 80,64 16,38"
        fill="url(#capTopGrad)"
        stroke="#52525b"
        strokeWidth="1.2"
      />

      <line x1="80" y1="64" x2="144" y2="38" stroke="#71717a" strokeWidth="1" opacity="0.6" />
      <line x1="16" y1="38" x2="80" y2="64" stroke="#a1a1aa" strokeWidth="1" opacity="0.8" />

      {/* Center Gold Button on Mortarboard */}
      <ellipse cx="80" cy="38" rx="4.5" ry="3.5" fill="url(#goldButtonGrad)" stroke="#78350f" strokeWidth="0.75" />

      {/* Red Tassel Ribbon Cord */}
      <path
        d="M 80 38 Q 98 42 108 55 Q 114 65 110 82"
        fill="none"
        stroke="url(#tasselSilkGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <ellipse cx="110" cy="83" rx="3" ry="1.8" fill="url(#goldButtonGrad)" stroke="#78350f" strokeWidth="0.5" />

      {/* Silk Tassel Brush */}
      <path
        d="M 108 84 Q 106 98 107 106 C 109 108 113 108 115 106 Q 114 98 112 84 Z"
        fill="url(#tasselSilkGrad)"
      />
      <path d="M 110 85 L 110 106" stroke="#fca5a5" strokeWidth="0.75" opacity="0.7" />
    </svg>
  </div>
);

/** 2. Turned Polished Brass/Gold Urn Finial */
const ReferenceGoldFinial: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const isLeft = side === 'left';
  return (
    <div
      className={`flex flex-row items-center shrink-0 ${
        isLeft ? '-mr-1.5' : '-ml-1.5 flex-row-reverse'
      } pointer-events-none select-none z-20`}
    >
      <div className="w-2.5 h-10 sm:h-12 bg-gradient-to-b from-amber-500 via-amber-200 to-amber-600 rounded-sm border-y border-amber-700 shadow-md" />
      <div
        className={`w-3.5 sm:w-4 h-7 sm:h-8 ${
          isLeft ? 'rounded-l-md border-l' : 'rounded-r-md border-r'
        } finial-gold-reference border-y border-amber-950/80 shadow-lg relative flex items-center justify-center`}
      >
        <div className="w-1 h-4 rounded-full bg-gradient-to-r from-amber-200/80 to-transparent" />
      </div>
      <div className="w-1.5 sm:w-2 h-3.5 bg-gradient-to-b from-amber-400 via-amber-100 to-amber-500 border-y border-amber-700 shadow-sm" />
      <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full finial-gold-reference border border-amber-900 shadow-md flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 shadow-inner" />
      </div>
    </div>
  );
};

/** 3. Authentic Curled Parchment Paper Roll with Spiral Ends and Red Cord (Reference Image Design) */
const RealisticParchmentRoll: React.FC<{ progress: number; onFullUnroll: () => void }> = ({
  progress,
  onFullUnroll,
}) => {
  const isFullyOpen = progress >= 0.96;
  const isSemiOpen = progress < 0.05;

  return (
    <div className="relative w-full select-none pt-0.5">
      {/* Upper shadow where the unrolled sheet enters the roll */}
      <div className="h-2 w-full bg-gradient-to-b from-transparent to-black/30 pointer-events-none" />

      {/* The 3D Rolled Paper Apparatus */}
      <div className="relative flex items-center justify-between w-[104%] -mx-[2%]">
        {/* Left Spindle Finial & Curled Paper Spiral End */}
        <div className="flex items-center shrink-0 z-20 pointer-events-none">
          <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full finial-gold-reference border border-amber-900 shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 shadow-inner" />
          </div>
          <div className="w-1.5 h-3.5 bg-gradient-to-b from-amber-400 via-amber-100 to-amber-500 border-y border-amber-700 shadow-sm" />
          <div className="w-2.5 sm:w-3 h-6 rounded-l-sm finial-gold-reference border-y border-l border-amber-950 shadow-md" />

          {/* LEFT CURLED PAPER SPIRAL END */}
          <div className="w-4 sm:w-5 h-11 sm:h-13 -ml-0.5 rounded-l-full bg-gradient-to-r from-[#cfbe9f] via-[#ede5d6] to-[#fcf9f2] border-y-2 border-l-2 border-[#b8a789] shadow-inner relative flex items-center justify-center overflow-hidden">
            <div className="w-2.5 sm:w-3 h-8 sm:h-9 rounded-l-full border-l-2 border-[#a89779] bg-gradient-to-r from-[#dfd5c4] to-[#f4eee3]" />
            <div className="w-1.5 h-4 rounded-l-full bg-[#4a351f] absolute left-0.5" />
          </div>
        </div>

        {/* MAIN CYLINDRICAL PARCHMENT ROLL BODY */}
        <div className="relative flex-1 h-11 sm:h-13 parchment-roll-reference border-y-2 border-[#b8a789] shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-x-0 top-1 h-2 bg-gradient-to-b from-white/95 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-1 h-2.5 bg-gradient-to-t from-[#8c7b60]/45 to-transparent pointer-events-none" />

          {/* Watermarked Latin Graduation Motto on the roll surface */}
          <div className="absolute inset-x-4 flex justify-between opacity-35 text-[8.5px] sm:text-[9.5px] font-cormorant italic text-[#78350f] font-bold pointer-events-none select-none">
            <span>Ad augusta per angusta</span>
            <span>Universitas Honorem</span>
          </div>

          {/* Red Silk Ribbon Cord wrapped around the roll (matching reference image) */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-11 sm:h-13 bg-gradient-to-r from-[#7f1d1d] via-[#dc2626] to-[#991b1b] shadow-md border-x border-amber-300/60" />
              <div className="w-1.5 h-11 sm:h-13 bg-gradient-to-r from-[#7f1d1d] via-[#ef4444] to-[#991b1b] shadow-md border-x border-amber-300/60" />
            </div>

            {/* Tied red silk knot with hanging tassel tails */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#991b1b] via-[#ef4444] to-[#7f1d1d] border border-amber-300 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
              </div>
              <div className="flex gap-1 mt-0.5">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#dc2626] to-[#7f1d1d] rounded-b-sm border-x border-amber-300 shadow-md rotate-[-12deg] origin-top" />
                <div className="w-1.5 h-7 bg-gradient-to-b from-[#ef4444] to-[#991b1b] rounded-b-sm border-x border-amber-300 shadow-md rotate-[14deg] origin-top" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Spindle Finial & Curled Paper Spiral End */}
        <div className="flex items-center shrink-0 z-20 pointer-events-none flex-row-reverse">
          <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full finial-gold-reference border border-amber-900 shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 shadow-inner" />
          </div>
          <div className="w-1.5 h-3.5 bg-gradient-to-b from-amber-400 via-amber-100 to-amber-500 border-y border-amber-700 shadow-sm" />
          <div className="w-2.5 sm:w-3 h-6 rounded-r-sm finial-gold-reference border-y border-r border-amber-950 shadow-md" />

          {/* RIGHT CURLED PAPER SPIRAL END */}
          <div className="w-4 sm:w-5 h-11 sm:h-13 -mr-0.5 rounded-r-full bg-gradient-to-l from-[#cfbe9f] via-[#ede5d6] to-[#fcf9f2] border-y-2 border-r-2 border-[#b8a789] shadow-inner relative flex items-center justify-center overflow-hidden">
            <div className="w-2.5 sm:w-3 h-8 sm:h-9 rounded-r-full border-r-2 border-[#a89779] bg-gradient-to-l from-[#dfd5c4] to-[#f4eee3]" />
            <div className="w-1.5 h-4 rounded-r-full bg-[#4a351f] absolute right-0.5" />
          </div>
        </div>
      </div>

      {/* Hanging Golden Tassel beneath the roll */}
      <div className="flex flex-col items-center mt-[-2px] pointer-events-none">
        <div className="w-0.5 h-4 bg-gradient-to-b from-amber-400 to-amber-600 shadow" />
        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-sm" />
        <div className="w-5 h-7 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 rounded-b-md shadow" />
      </div>

      {/* Floating Action Hint Button */}
      <div
        className={`flex flex-col items-center justify-center mt-2.5 text-center transition-opacity duration-300 ${
          isFullyOpen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={onFullUnroll}
          className="px-4 py-1.5 rounded-full glass-panel-translucent text-amber-200 hover:text-white text-xs font-sans font-semibold shadow-lg flex items-center gap-1.5 cursor-pointer hover:border-white/30 transition-all active:scale-95"
        >
          <ChevronDown className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>
            {isSemiOpen
              ? 'Desliza hacia abajo para desenrollar el diploma'
              : `Desenrollando (${Math.round(progress * 100)}%) · Toca para abrir`}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
        </button>
      </div>
    </div>
  );
};

/** 4. Academic Red Stole Ribbon Emblem (Reference Image) */
const ReferenceAcademicStole: React.FC<{ honorText: string }> = ({ honorText }) => (
  <div className="my-3 px-3 py-1.5 rounded-lg academic-stole-reference border border-amber-300/80 text-white shadow-md flex items-center justify-center gap-2 max-w-xs mx-auto">
    <span className="text-amber-200 text-xs">❦</span>
    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-100 drop-shadow-sm text-center">
      {honorText}
    </span>
    <span className="text-amber-200 text-xs">❦</span>
  </div>
);

/** 5. Golden Feather Quill Pen Icon (Reference Image bottom Quill) */
const GoldenQuillEmblem: React.FC = () => (
  <svg
    viewBox="0 0 120 40"
    className="w-24 h-8 inline-block overflow-visible"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="quillGoldGrad" x1="0" y1="20" x2="120" y2="10" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#78350f" />
        <stop offset="25%" stopColor="#d97706" />
        <stop offset="60%" stopColor="#fbbf24" />
        <stop offset="85%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M 10 32 Q 45 26 115 8" stroke="#92400e" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M 30 28 C 45 20 70 12 115 8 C 95 16 65 24 30 28 Z"
      fill="url(#quillGoldGrad)"
      opacity="0.9"
    />
    <path
      d="M 32 29 C 50 32 75 26 115 8 C 90 22 65 33 32 29 Z"
      fill="url(#quillGoldGrad)"
      opacity="0.85"
    />
    <polygon points="10,32 4,36 12,35" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
  </svg>
);

/**
 * Lanza una lluvia de birretes (mortarboards) animados en lugar de confeti convencional
 */
const triggerBirretesShower = (originY = 0.4, count = 45) => {
  try {
    if (typeof confetti.shapeFromText === 'function') {
      const birreteShape = confetti.shapeFromText({ text: '🎓', scalar: 2.2 });

      // Disparo central de birretes
      confetti({
        particleCount: count,
        spread: 100,
        origin: { y: originY, x: 0.5 },
        shapes: [birreteShape],
        scalar: 2.7,
        ticks: 240,
        gravity: 0.7,
        drift: 0.05,
      });

      // Disparos festivos laterales para crear el efecto de lanzamiento de birretes
      setTimeout(() => {
        confetti({
          particleCount: Math.round(count * 0.65),
          angle: 60,
          spread: 65,
          origin: { x: 0.15, y: originY + 0.08 },
          shapes: [birreteShape],
          scalar: 2.4,
          ticks: 220,
          gravity: 0.75,
        });
        confetti({
          particleCount: Math.round(count * 0.65),
          angle: 120,
          spread: 65,
          origin: { x: 0.85, y: originY + 0.08 },
          shapes: [birreteShape],
          scalar: 2.4,
          ticks: 220,
          gravity: 0.75,
        });
      }, 200);
      return;
    }
  } catch (err) {
    console.warn('Lluvia de birretes con shapeFromText:', err);
  }

  // Fallback si el navegador no soporta shapeFromText
  confetti({
    particleCount: count,
    spread: 90,
    origin: { y: originY },
    colors: ['#f59e0b', '#fbbf24', '#ffffff', '#1e293b'],
  });
};

/* =========================================================================
   MAIN COMPONENT: SCROLL MECHANIC FROM START TO END OF PAGE (GLITCH-FREE)
   ========================================================================= */

export const UnifiedParchmentScroll: React.FC<UnifiedParchmentScrollProps> = ({
  invitation,
  onOpenPass,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
}) => {
  // Real-time window scroll position
  const [scrollY, setScrollY] = useState(0);

  // Measure full parchment content height dynamically
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const [fullContentHeight, setFullContentHeight] = useState(1800);

  // Sound triggers to prevent audio spam during scrolling
  const hasPlayedUnrollSound = useRef(false);
  const hasPlayedFanfare = useRef(false);

  // Countdown state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // RSVP Form state (simplified without phone or dietary preference)
  const [formData, setFormData] = useState({
    name: '',
    attending: true,
    companions: 0,
    songRequest: '',
    message: '',
  });
  const [existingRsvp, setExistingRsvp] = useState<RsvpEntry | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Map state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Section ref
  const rsvpRef = useRef<HTMLDivElement>(null);

  // Measure full content height accurately using ResizeObserver
  useEffect(() => {
    if (!contentMeasureRef.current) return;

    const updateHeight = () => {
      if (contentMeasureRef.current) {
        const measured = contentMeasureRef.current.scrollHeight;
        if (measured > 500) {
          setFullContentHeight(measured);
        }
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(contentMeasureRef.current);

    return () => ro.disconnect();
  }, []);

  // FIXED SCROLL RUNWAY DISTANCE (STABLE & CONSTANT THROUGHOUT SCROLLING)
  // Matched strictly to content height so scrolling finishes right as the diploma opens,
  // putting clean bounds on the page and eliminating empty space at the end!
  const scrollRunway = Math.max(600, Math.round(fullContentHeight - SEMI_OPEN_HEIGHT));

  // Passive window scroll tracking
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setScrollY(window.scrollY);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // SCROLL PROGRESS: Smoothly and stably ranges from 0.0 (top of page) to 1.0 (bottom of page)
  const progress = Math.min(1, Math.max(0, scrollY / Math.max(1, scrollRunway)));

  // Audio & birretes feedback driven by scroll progress
  useEffect(() => {
    if (scrollY > 35 && !hasPlayedUnrollSound.current) {
      hasPlayedUnrollSound.current = true;
      sound.playUnrollSound();
    } else if (scrollY <= 15) {
      // Reset triggers when user scrolls back to the top
      hasPlayedUnrollSound.current = false;
      hasPlayedFanfare.current = false;
    }

    if (progress >= 0.98 && !hasPlayedFanfare.current) {
      hasPlayedFanfare.current = true;
      sound.playFanfare();
      triggerBirretesShower(0.35, 45);
    }
  }, [scrollY, progress]);

  // Countdown timer logic
  useEffect(() => {
    const updateCountdown = () => {
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

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [invitation.targetDate]);

  // Load user RSVP
  useEffect(() => {
    try {
      const saved = localStorage.getItem(USER_RSVP_KEY);
      if (saved) {
        setExistingRsvp(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize Leaflet Map safely without re-rendering on every scroll frame
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const container = mapContainerRef.current as HTMLElement & { _leaflet_id?: number };
      if (container._leaflet_id) return;

      const { lat, lng, name, address, city } = invitation.partyVenue;

      const map = L.map(container, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-gold-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; background: radial-gradient(circle, #d97706, #92400e); border: 2.5px solid #fbbf24; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(0,0,0,0.5);"></div>
            <div style="position: relative; z-index: 2; color: #ffffff; font-size: 16px; margin-top: -6px;">🎓</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 38],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="text-align:center; font-family:sans-serif; padding:4px;">
          <p style="font-weight:bold; margin:0; font-size:13px; color:#0f172a;">${name}</p>
          <p style="margin:2px 0 0 0; font-size:11px; color:#475569;">${address}, ${city}</p>
          <p style="margin:4px 0 0 0; font-size:10px; font-weight:bold; color:#d97706;">Lugar de la Recepción</p>
        </div>
      `);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 350);
    } catch (err) {
      console.warn('Map initialization deferred or unavailable:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [invitation.partyVenue]);

  // Handle auto-unroll smoothly to the bottom of the page
  const handleFullUnroll = () => {
    window.scrollTo({
      top: scrollRunway,
      behavior: 'smooth',
    });
  };

  // Handle rolling back smoothly up to the top of the page
  const handleRollBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const ticketCode = `GRAD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: RsvpEntry = {
      id: `rsvp_${Date.now()}`,
      name: formData.name.trim(),
      phone: '',
      email: '',
      attending: formData.attending,
      companions: formData.attending ? formData.companions : 0,
      dietary: 'Confirmada',
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
    triggerBirretesShower(0.65, 55);

    setExistingRsvp(newEntry);
    setJustSubmitted(true);

    if (newEntry.attending) {
      setTimeout(() => {
        onOpenPass(newEntry);
      }, 450);
    }
  };

  const handleCopyAddress = () => {
    const text = `${invitation.partyVenue.name}, ${invitation.partyVenue.address}, ${invitation.partyVenue.city}`;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // PURE PIXEL HEIGHT (STABLE, SMOOTH & CONTINUOUS IN BOTH DIRECTIONS)
  // Interpolates cleanly from SEMI_OPEN_HEIGHT (280px) to fullContentHeight with ZERO 'auto' flips!
  const currentHeightPx = Math.round(
    SEMI_OPEN_HEIGHT + progress * (fullContentHeight - SEMI_OPEN_HEIGHT)
  );

  return (
    <div
      style={{ minHeight: `${fullContentHeight + 120}px` }}
      className="relative w-full flex flex-col items-center justify-start pt-3 sm:pt-6 pb-20 bg-radial from-[#0f172a] via-[#070b14] to-[#02050b] px-3 sm:px-4 overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Background radiant depth auras */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[600px] h-[380px] sm:h-[600px] bg-amber-500/15 rounded-full blur-[110px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-red-600/10 rounded-full blur-[100px]" />
      </div>

      {/* TOP HEADER: INVITACIÓN DE HONOR / GALA DE GRADUACIÓN */}
      <div className="w-full max-w-md mx-auto text-center mb-2.5 sm:mb-3 px-2">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <span className="w-6 h-[1.5px] bg-amber-400" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] font-sans text-amber-300 font-bold">
            Invitación de Honor
          </span>
          <span className="w-6 h-[1.5px] bg-amber-400" />
        </div>

        <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Gala de Graduación
        </h1>
        <p className="font-cormorant italic text-sm sm:text-base text-amber-200 font-semibold mt-0.5">
          {invitation.prefix}: {invitation.graduates && invitation.graduates.length > 1 ? invitation.graduates.join(' & ') : invitation.graduateName}
        </p>
      </div>

      {/* =========================================================================
          THE DIPLOMA SCROLL (REFERENCE IMAGE DESIGN WITH PERCHED BIRRETE & BRASS FINIALS)
          ========================================================================= */}
      <div className="w-full max-w-md mx-auto relative flex flex-col items-center">
        {/* ICONIC 3D GRADUATION CAP (PERCHED ON TOP OF THE SCROLL, AS IN REFERENCE IMAGE) */}
        <div className="absolute -top-7 sm:-top-9 right-3 sm:right-6 z-40 pointer-events-none">
          <ReferenceGraduationCap />
        </div>

        {/* TOP SPINDLE ROD (Turned Brass/Gold Finials matching Reference Image) */}
        <div className="w-[104%] -mx-[2%] z-30 sticky top-2 block">
          <div className="relative flex items-center justify-between h-9 sm:h-10">
            {/* Left reference finial */}
            <ReferenceGoldFinial side="left" />

            {/* Main horizontal gold spindle bar */}
            <div className="flex-1 h-6 sm:h-7 gold-rod-vibrant rounded-sm border-y border-amber-950/60 shadow-md relative overflow-hidden">
              <div className="absolute inset-x-0 top-1 h-[1.5px] bg-white/80" />
              <div className="absolute inset-x-0 bottom-1 h-[1.5px] bg-black/50" />
            </div>

            {/* Right reference finial */}
            <ReferenceGoldFinial side="right" />
          </div>
        </div>

        {/* CLIPPED PARCHMENT SHEET THAT EXPANDS & CONTRACTS WITH ABSOLUTE SMOOTHNESS */}
        <div
          className="w-full bg-parchment-luminous text-slate-900 rounded-b-xl border-x-2 border-b-2 border-amber-500/60 parchment-shadow-luminous relative overflow-hidden"
          style={{
            height: `${currentHeightPx}px`,
          }}
        >
          {/* Crisp 24k Gold Inset Borders */}
          <div className="absolute inset-2 sm:inset-3 border border-amber-500/40 rounded-lg pointer-events-none z-10" />
          <div className="absolute inset-3 sm:inset-4 border border-amber-400/20 rounded-md pointer-events-none z-10" />

          {/* INNER CONTENT CONTAINER (MEASURED DYNAMICALLY) */}
          <div ref={contentMeasureRef} className="w-full p-4 sm:p-6 pb-6">
            {/* 1. ACADEMIC CREST & SCHOOL (VISIBLE IN SEMI-OPEN STATE UP TO INSTITUTION) */}
            <div className="text-center pt-1 pb-3">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-600 p-0.5 shadow-md mb-2">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-amber-700">
                  <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
              </div>

              <p className="font-cinzel text-xs sm:text-sm font-extrabold uppercase tracking-[0.26em] text-amber-900">
                {invitation.institution}
              </p>
              <p className="text-[11px] text-slate-700 uppercase tracking-widest font-sans font-bold mt-0.5">
                {invitation.faculty}
              </p>

              {/* Gold divider */}
              <div className="flex items-center justify-center gap-2 my-2">
                <div className="h-[1.5px] w-14 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                <span className="text-amber-700 text-xs font-cinzel">✦</span>
                <div className="h-[1.5px] w-14 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              </div>

              <p className="font-cormorant italic text-sm sm:text-base text-slate-700 max-w-xs mx-auto leading-relaxed">
                Tienen el gran honor de invitarle a usted y a su apreciable familia a la fiesta y celebración de grado de los bachilleres:
              </p>
            </div>

            {/* 2. GRADUATES' NAMES & ACADEMIC RED STOLE (FROM REFERENCE IMAGE) */}
            <div className="text-center my-2 pb-3 border-b border-amber-200">
              <span className="block font-cormorant italic text-base sm:text-lg text-amber-800 font-semibold mb-1">
                {invitation.prefix}
              </span>

              {invitation.graduates && invitation.graduates.length > 1 ? (
                <div className="my-1.5 space-y-1">
                  {invitation.graduates.map((name, idx) => (
                    <React.Fragment key={name}>
                      {idx > 0 && (
                        <div className="flex items-center justify-center gap-2 py-0.5">
                          <span className="h-[1px] w-10 bg-amber-400/80" />
                          <span className="font-cinzel text-amber-800 text-xs font-bold">&</span>
                          <span className="h-[1px] w-10 bg-amber-400/80" />
                        </div>
                      )}
                      <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-tight text-slate-950 leading-tight">
                        {name}
                      </h2>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 leading-tight mt-0.5">
                  {invitation.graduateName}
                </h2>
              )}

              <p className="font-cinzel text-xs sm:text-sm uppercase tracking-wider text-amber-900 font-bold mt-1.5">
                {invitation.degree}
              </p>

              {/* Red Academic Stole from Reference Image */}
              {invitation.honor && (
                <ReferenceAcademicStole honorText={invitation.honor} />
              )}
            </div>

            {/* 2.5 INVITAN: FAMILIAS Y ANFITRIONES */}
            {invitation.hosts && invitation.hosts.length > 0 && (
              <div className="my-3.5 p-3.5 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50/70 border border-amber-300 shadow-sm text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-amber-900">
                    Invitan con Especial Afecto Sus Familias
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-cinzel text-xs sm:text-sm font-bold text-slate-900">
                  {invitation.hosts.map((host, idx) => (
                    <React.Fragment key={host}>
                      {idx > 0 && <span className="text-amber-500 font-normal">·</span>}
                      <span>{host}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* 3. INSPIRING QUOTE & ACADEMIC EMBLEM */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-amber-200/80 flex items-center gap-3.5 shadow-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-amber-300 p-1">
                  <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400" />
                  <span className="text-[9px] font-cinzel font-bold text-amber-200 uppercase tracking-wider mt-0.5">2026</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-cormorant italic text-sm text-slate-800 leading-snug">
                  "{invitation.quote}"
                </p>
                <p className="font-sans text-[11px] font-bold text-amber-800 uppercase tracking-wider mt-1.5">
                  — {invitation.quoteAuthor}
                </p>
              </div>
            </div>

            {/* 4. INTEGRATED COUNTDOWN TIMER (HIGH CONTRAST) */}
            <div className="my-5 p-4 rounded-xl bg-slate-900 text-white border border-amber-500/40 shadow-xl">
              <div className="text-center mb-2.5">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-amber-400 block">
                  Cuenta Regresiva de Gala
                </span>
                <p className="font-cinzel text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                  {formatDateSpanish(invitation.targetDate)}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                {[
                  { label: 'Días', val: countdown.days },
                  { label: 'Horas', val: countdown.hours },
                  { label: 'Min', val: countdown.minutes },
                  { label: 'Seg', val: countdown.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/90 border border-amber-500/30 shadow-inner"
                  >
                    <span className="font-cinzel text-xl sm:text-2xl font-black tabular-nums text-amber-300">
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-semibold mt-0.5">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar shortcuts */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800">
                <a
                  href={generateGoogleCalendarUrl(invitation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-sans font-bold transition-colors shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Google Calendar</span>
                </a>
                <button
                  onClick={() => downloadIcsFile(invitation)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <span>Descargar .ics</span>
                </button>
              </div>
            </div>

            {/* 5. CEREMONY & RECEPTION ITINERARY */}
            <div className="my-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 font-cinzel">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Fiesta de Graduación & Brindis de Honor</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                    {invitation.partyVenue.time}
                  </span>
                </div>
                <p className="font-sans font-bold text-sm text-slate-900 mt-1.5">
                  {invitation.partyVenue.name}
                </p>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  {invitation.partyVenue.address}, {invitation.partyVenue.city}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 font-cinzel">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Institución Educativa</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                    {invitation.ceremonyVenue.time}
                  </span>
                </div>
                <p className="font-sans font-bold text-sm text-slate-900 mt-1.5">
                  {invitation.institution}
                </p>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  {invitation.ceremonyVenue.address}
                </p>
              </div>
            </div>

            {/* 6. DRESS CODE & GIFT DETAILS */}
            <div className="my-5 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-sans space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Shirt className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950 block text-xs">
                    Código de Vestimenta: {invitation.dressCode.title}
                  </span>
                  <p className="text-slate-700 leading-snug mt-0.5">
                    {invitation.dressCode.description}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-amber-200/80">
                <Gift className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-950 block text-xs">
                    {invitation.giftInfo.type}
                  </span>
                  <p className="text-slate-700 leading-snug mt-0.5">
                    {invitation.giftInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 7. INTERACTIVE LOCATION MAP (CRISP & CLEAN) */}
            <div className="my-5">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5 text-xs font-cinzel font-bold text-slate-950">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>Ubicación Interactiva del Evento</span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="text-xs text-slate-700 hover:text-amber-800 font-sans font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAddress ? 'Copiada' : 'Copiar'}</span>
                </button>
              </div>

              {/* Leaflet Map Box */}
              <div className="w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-100 relative">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>

              {/* Navigation Buttons with High Contrast */}
              <div className="grid grid-cols-2 gap-2 mt-2.5">
                <a
                  href={invitation.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${invitation.partyVenue.name} ${invitation.partyVenue.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-sans font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Abrir Google Maps</span>
                </a>

                <a
                  href={`https://waze.com/ul?ll=${invitation.partyVenue.lat},${invitation.partyVenue.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Navegar con Waze</span>
                </a>
              </div>
            </div>

            {/* 8. CONFIRMACIÓN DE ASISTENCIA: LIBRO DE FIRMAS & PLUMA DE ORO */}
            <div ref={rsvpRef} className="my-6 pt-5 border-t-2 border-amber-300">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GoldenQuillEmblem />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-amber-800 block">
                  Libro de Honor & Confirmación
                </span>
                <h3 className="font-cinzel text-xl font-bold text-slate-950 mt-0.5">
                  Firma Tu Lugar de Asistencia
                </h3>
              </div>

              {existingRsvp && !justSubmitted ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs font-sans text-center shadow-sm">
                  <CheckCircle className="w-6 h-6 text-emerald-700 mx-auto mb-1.5" />
                  <p className="font-bold text-sm text-slate-950">
                    ¡Confirmación registrada para {existingRsvp.name}!
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {existingRsvp.attending
                      ? `Pase Oficial ${existingRsvp.ticketCode} (${1 + existingRsvp.companions} personas)`
                      : 'Registrado como no asistente'}
                  </p>
                  {existingRsvp.attending && (
                    <button
                      onClick={() => onOpenPass(existingRsvp)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md hover:from-amber-500 hover:to-amber-400 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Ver Mi Pase Digital</span>
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-3.5 font-sans text-xs">
                  {/* Attending toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: true })}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        formData.attending
                          ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      ¡Sí, asistiré!
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: false })}
                      className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        !formData.attending
                          ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      No podré asistir
                    </button>
                  </div>

                  {/* Name input */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-800 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 text-sm font-medium"
                    />
                  </div>

                  {formData.attending && (
                    <>
                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-800 mb-1">
                          Número de Pases / Acompañantes
                        </label>
                        <select
                          value={formData.companions}
                          onChange={(e) => setFormData({ ...formData, companions: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 outline-none focus:border-amber-600 text-sm font-medium"
                        >
                          <option value={0}>Sólo yo (1 pase personal)</option>
                          <option value={1}>1 acompañante (2 pases en total)</option>
                          <option value={2}>2 acompañantes (3 pases en total)</option>
                          <option value={3}>3 acompañantes (4 pases en total)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase font-bold text-slate-800 mb-1">
                          Canción sugerida para la fiesta (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Una canción especial para bailar o celebrar..."
                          value={formData.songRequest}
                          onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-amber-600 text-sm font-medium"
                        />
                      </div>
                    </>
                  )}

                  {/* Message / Dedication */}
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-slate-800 mb-1">
                      Mensaje de felicitación (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Escribe unas palabras de felicitación para los bachilleres..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-amber-600 resize-none text-sm font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-sm tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar Asistencia y Obtener Pase</span>
                  </button>
                </form>
              )}
            </div>

            {/* Parchment closing motto */}
            <div className="text-center pt-3 pb-1 border-t border-amber-200">
              <span className="font-cormorant italic text-sm text-slate-600 block">
                Ad Augusta Per Angusta · Hacia lo alto por caminos difíciles
              </span>
              <span className="font-cinzel text-[11px] uppercase tracking-widest text-amber-800 font-extrabold mt-0.5 block">
                Generación 2026
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ROLLED PARCHMENT APPARATUS (CONTINUOUS & UNIFIED WITH ZERO FLICKER)
            ========================================================================= */}
        <div className="w-full relative z-30">
          <RealisticParchmentRoll progress={progress} onFullUnroll={handleFullUnroll} />
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR (TRANSPARENT GLASSMORPHISM ALLOWING FULL VIEW OF PARCHMENT) */}
      {progress > 0.08 && (
        <aside
          aria-label="Acciones de la invitación"
          className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:w-[350px] mx-auto z-40 glass-panel-translucent rounded-2xl p-1.5 sm:p-2 flex items-center justify-between gap-2 transition-all hover:border-white/30 shadow-2xl"
        >
          <button
            onClick={() => {
              if (rsvpRef.current) {
                rsvpRef.current.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleFullUnroll();
              }
            }}
            className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl glass-btn-amber text-amber-200 hover:text-white font-cinzel font-bold text-xs sm:text-sm tracking-wider transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 select-none drop-shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Confirmar Asistencia</span>
          </button>

          <button
            onClick={onToggleMusic}
            title={
              isMusicPlaying
                ? 'Pausar: Young, Wild & Free'
                : 'Reproducir: Young, Wild & Free (Wiz Khalifa & Snoop Dogg)'
            }
            className={`px-3 py-2.5 rounded-xl glass-btn-icon text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isMusicPlaying
                ? 'bg-amber-400/25 border-amber-300/70 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'text-amber-200/80 hover:text-amber-100'
            }`}
          >
            <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-bounce text-amber-300' : ''}`} />
            <span className="text-[11px] font-sans font-semibold tracking-wide">
              {isMusicPlaying ? 'Pausar' : 'Música'}
            </span>
          </button>
        </aside>
      )}
    </div>
  );
};
