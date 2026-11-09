/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { InvitationData, RsvpEntry } from './types/invitation';
import { UnifiedParchmentScroll } from './components/UnifiedParchmentScroll';
import { DigitalPassModal } from './components/DigitalPassModal';
import { sound } from './utils/soundEffects';

const INITIAL_INVITATION_DATA: InvitationData = {
  graduateName: 'Joseph Samuel Bolaños Trejo & Julian Stiven Trejo Medina',
  graduates: [
    'Joseph Samuel Bolaños Trejo',
    'Julian Stiven Trejo Medina',
  ],
  prefix: 'Bachilleres',
  degree: 'Grado de Bachiller Académico',
  institution: 'I.E.M. Chambú',
  faculty: 'Institución Educativa Municipal Chambú',
  honor: 'Bachilleres · Promoción 2026',
  hosts: [
    'Omar Trejo',
    'Sandra Medina',
    'Carmen Trejo',
    'Linder Bolaños',
  ],
  quote: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día. Hoy culminamos con honor nuestra etapa de bachillerato y abrimos las puertas a un futuro lleno de grandes metas.',
  quoteAuthor: 'Bachilleres 2026',
  targetDate: '2026-12-12T19:00:00',
  ceremonyVenue: {
    name: 'I.E.M. Chambú',
    address: 'Institución Educativa Municipal Chambú, Pasto',
    time: 'Ceremonia de Grado',
  },
  partyVenue: {
    name: 'Altos de Chapalito',
    address: 'Calle 12A # 7E - 225, Altos de Chapalito',
    time: '7:00 PM (19:00 hrs)',
    city: 'Pasto, Nariño',
    lat: 1.1858367,
    lng: -77.2728914,
    parkingInfo: 'Facilidad de acceso y estacionamiento en el sector.',
  },
  mapsUrl: 'https://maps.app.goo.gl/hM3tvDia7nqKqzhj8',
  dressCode: {
    title: 'Semi Elegante',
    description: 'Agradecemos a nuestros familiares y amigos acompañarnos con un atuendo semi elegante o semi formal para compartir esta inolvidable velada.',
    ladies: 'Vestido cóctel, conjunto formal o blusa elegante con pantalón de vestir.',
    gentlemen: 'Camisa formal, pantalón de vestir o blazer (corbata opcional).',
  },
  giftInfo: {
    type: 'Lluvia de Sobres',
    description: 'Su presencia, cariño y buenos deseos son nuestro mayor obsequio. Para quienes deseen tener una atención, dispondremos de un cofre especial para lluvia de sobres durante la recepción.',
  },
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('Caught in ErrorBoundary:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-amber-200 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl mb-4">
            🎓
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-white mb-2">
            Gala de Graduación
          </h1>
          <p className="text-sm text-slate-300 mb-6 max-w-sm">
            Bachilleres Joseph Samuel Bolaños Trejo &amp; Julian Stiven Trejo Medina
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            Abrir Invitación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [invitationData] = useState<InvitationData>(INITIAL_INVITATION_DATA);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Digital Pass Modal
  const [activePassEntry, setActivePassEntry] = useState<RsvpEntry | null>(null);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
    if (nextMuted && isMusicPlaying) {
      setIsMusicPlaying(false);
    }
  };

  const handleToggleMusic = () => {
    sound.toggleAmbientMusic((playing) => {
      setIsMusicPlaying(playing);
      if (playing && isMuted) {
        setIsMuted(false);
        sound.setMuted(false);
      }
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-[100dvh] w-full bg-[#070b14] text-stone-100 font-sans flex flex-col">
        <UnifiedParchmentScroll
          invitation={invitationData}
          onOpenPass={(entry) => setActivePassEntry(entry)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
        />

        {/* PASS MODAL */}
        <DigitalPassModal
          entry={activePassEntry}
          invitation={invitationData}
          isOpen={!!activePassEntry}
          onClose={() => setActivePassEntry(null)}
        />
      </div>
    </ErrorBoundary>
  );
}
