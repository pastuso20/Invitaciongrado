import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { GraduationCap, Sparkles, Volume2, VolumeX, Music, Award } from 'lucide-react';
import { InvitationData } from '../types/invitation';
import { sound } from '../utils/soundEffects';

interface DiplomaRolledProps {
  invitation: InvitationData;
  onUnroll: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const DiplomaRolled: React.FC<DiplomaRolledProps> = ({
  invitation,
  onUnroll,
  isMuted,
  onToggleMute,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [sealCracked, setSealCracked] = useState(false);

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Play sound effects
    sound.playSealBreak();

    // Trigger golden sparkles confetti from the seal center
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.52, x: 0.5 },
      colors: ['#D4AF37', '#F3E5AB', '#996515', '#ffffff'],
      ticks: 200,
      gravity: 0.8,
      scalar: 1.1,
    });

    setSealCracked(true);

    // Play unroll swoosh
    setTimeout(() => {
      sound.playUnrollSound();
      sound.playFanfare();
    }, 400);

    // Complete opening after cinematic sequence
    setTimeout(() => {
      onUnroll();
    }, 1100);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden bg-radial from-[#1e293b] via-[#0f172a] to-[#080d1a]">
      {/* Background ambient gold aura & stars */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating audio control on top right */}
      <header className="absolute top-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className="p-3 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-slate-800 transition-all shadow-lg backdrop-blur-md cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {/* Subdued Academic Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10 mb-8 max-w-xl px-4"
      >
        <div className="inline-flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-xs uppercase tracking-[0.28em] font-sans text-amber-300/80 font-medium">
            Invitación de Honor
          </span>
          <Award className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-100 mb-2">
          Gala de Graduación
        </h1>

        <p className="font-cormorant text-lg sm:text-xl italic text-amber-200/90 tracking-wide">
          {invitation.prefix} {invitation.graduateName}
        </p>

        <p className="text-xs sm:text-sm text-slate-400 font-sans tracking-wider uppercase mt-1">
          {invitation.institution}
        </p>
      </motion.div>

      {/* ROLLED DIPLOMA SCROLL 3D PRESENTATION */}
      <div className="relative z-20 my-4 flex flex-col items-center justify-center">
        <motion.div
          animate={
            isOpening
              ? {
                  scale: [1, 1.08, 1.4],
                  rotateX: [0, 8, 0],
                  opacity: [1, 1, 0],
                  filter: ['blur(0px)', 'blur(0px)', 'blur(4px)'],
                }
              : {
                  y: [0, -8, 0],
                }
          }
          transition={
            isOpening
              ? { duration: 1.1, ease: 'easeInOut' }
              : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className="relative group cursor-pointer select-none"
          onClick={handleOpenClick}
        >
          {/* Scroll Glow / Shadow Bed */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-10 bg-black/60 rounded-full blur-xl transform transition-transform group-hover:scale-110" />

          {/* ROLLED PARCHMENT CYLINDER */}
          <div className="relative w-80 sm:w-[460px] md:w-[540px] h-28 sm:h-36 rounded-2xl flex items-center justify-center">
            {/* Scroll End Left Cap (rolled edge curl) */}
            <div className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 w-8 sm:w-11 h-[110%] rounded-l-full bg-gradient-to-r from-[#d3be92] via-[#e5d4aa] to-[#cbb281] shadow-xl border-y border-l border-[#b59963]/60 flex flex-col justify-center items-center overflow-hidden">
              <div className="w-3 sm:w-4 h-16 sm:h-20 rounded-full border-r-2 border-[#8b6f3a]/40 bg-[#745722]/30 blur-[0.5px]" />
            </div>

            {/* Scroll Body: Multi-layered Parchment texture with cylinder lighting gradient */}
            <div
              className="w-full h-full rounded-lg overflow-hidden relative shadow-2xl border-y border-[#b59963]/50"
              style={{
                background:
                  'linear-gradient(180deg, #f5ebd3 0%, #faefe0 18%, #fcf7ec 42%, #e5d4aa 78%, #be9e65 100%)',
                boxShadow:
                  'inset 0 6px 12px rgba(255, 255, 255, 0.7), inset 0 -8px 14px rgba(110, 80, 25, 0.45), 0 15px 35px -5px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Fine parchment paper grain lines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#8a6828_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Gold Filigree Line Accents on Top and Bottom edge */}
              <div className="absolute top-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#b3882f] to-transparent opacity-60" />
              <div className="absolute bottom-2 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#b3882f] to-transparent opacity-60" />

            </div>

            {/* Scroll End Right Cap (rolled edge curl) */}
            <div className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 w-8 sm:w-11 h-[110%] rounded-r-full bg-gradient-to-l from-[#d3be92] via-[#e5d4aa] to-[#cbb281] shadow-xl border-y border-r border-[#b59963]/60 flex flex-col justify-center items-center overflow-hidden">
              <div className="w-3 sm:w-4 h-16 sm:h-20 rounded-full border-l-2 border-[#8b6f3a]/40 bg-[#745722]/30 blur-[0.5px]" />
            </div>

            {/* CRIMSON & GOLD SILK RIBBON WRAPPED VERTICALLY */}
            <AnimatePresence>
              {!sealCracked && (
                <motion.div
                  exit={{ opacity: 0, scaleY: 0.2 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-y-0 w-14 sm:w-16 bg-gradient-to-r from-[#831818] via-[#a82424] to-[#701010] shadow-md flex items-center justify-center border-x border-amber-300/40 z-10"
                >
                  {/* Gold metallic stitch stripes inside ribbon */}
                  <div className="absolute inset-y-0 left-2 w-[1.5px] bg-amber-300/80" />
                  <div className="absolute inset-y-0 right-2 w-[1.5px] bg-amber-300/80" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* GOLDEN TASSEL / CORDELLÓN */}
            <AnimatePresence>
              {!sealCracked && (
                <motion.div
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
                >
                  <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 shadow-sm" />
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-md" />
                  <div className="w-6 h-8 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 rounded-b-lg shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* WAX SEAL STAMP BUTTON (Interactive focal point) */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div
                className="relative w-20 sm:w-24 h-20 sm:h-24 rounded-full flex items-center justify-center wax-seal transition-transform"
                style={{
                  filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))',
                }}
              >
                {/* Irregular wax edge ripples */}
                <div className="absolute inset-[-4px] rounded-full border-2 border-red-900/40 opacity-70" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-red-600/20 to-red-950/60 -z-10 blur-[1px]" />

                {/* Inner Beveled Ring */}
                <div className="w-16 sm:w-19 h-16 sm:h-19 rounded-full border border-amber-300/40 bg-radial from-[#991b1b] to-[#5a0f0f] flex flex-col items-center justify-center p-2 text-center shadow-inner">
                  <GraduationCap className="w-7 h-7 sm:w-9 sm:h-9 text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="text-[9px] font-cinzel font-bold tracking-widest text-amber-200/90 uppercase mt-0.5">
                    {sealCracked ? 'Abriendo' : 'Abrir'}
                  </span>
                </div>

                {/* Pulsing ring prompt */}
                {!isOpening && (
                  <span className="absolute -inset-2 rounded-full border border-amber-400/50 animate-ping pointer-events-none opacity-40" />
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Prompt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={handleOpenClick}
            disabled={isOpening}
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-600/30 hover:from-amber-600/50 hover:to-amber-500/50 border border-amber-400/40 text-amber-200 hover:text-white transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer text-sm sm:text-base font-cinzel tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform" />
            <span>Toca el sello para desenrollar el diploma</span>
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:-rotate-45 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Footer reassurance */}
      <footer className="mt-8 text-center z-10 text-xs text-slate-500 font-sans tracking-wide">
        Celebración de Grado Académico · {invitation.degree}
      </footer>
    </div>
  );
};
