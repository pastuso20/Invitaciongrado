import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, CheckCircle2, Download, Calendar, Sparkles } from 'lucide-react';
import { RsvpEntry, InvitationData } from '../types/invitation';
import { formatDateSpanish, generateGoogleCalendarUrl } from '../utils/calendar';

interface DigitalPassModalProps {
  entry: RsvpEntry | null;
  invitation: InvitationData;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  entry,
  invitation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !entry) return null;

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1c2436] to-[#0f1422] border-2 border-amber-400/50 shadow-2xl p-6 sm:p-7 text-stone-100 overflow-hidden font-sans"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar pase"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-sans tracking-widest uppercase text-amber-400 font-bold">
              Confirmación Exitosa
            </p>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Pase Digital de Acceso
            </h3>
          </div>

          {/* Golden Ticket Card */}
          <div className="relative rounded-xl p-5 bg-[#faf6ed] text-slate-900 shadow-xl border border-amber-300/60 overflow-hidden font-sans">
            {/* Top gold ornamental bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600" />

            <div className="flex items-center justify-between border-b border-amber-900/15 pb-3 pt-1">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-800">
                  Gala de Graduación
                </span>
                <h4 className="font-cinzel text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {invitation.prefix}: {invitation.graduates && invitation.graduates.length > 1 ? invitation.graduates.join(' & ') : invitation.graduateName}
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 shrink-0 ml-2">
                {entry.ticketCode}
              </span>
            </div>

            {/* Guest info */}
            <div className="my-4 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                  Invitado de Honor:
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {entry.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Pases Asignados:
                  </span>
                  <span className="font-medium text-slate-800">
                    {1 + entry.companions} {1 + entry.companions === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Estado de Entrada:
                  </span>
                  <span className="font-semibold text-emerald-700 truncate block">
                    {entry.attending ? 'Acceso Confirmado' : 'No Asiste'}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-200">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                  Fecha y Lugar:
                </span>
                <span className="font-medium text-slate-800">
                  {formatDateSpanish(invitation.targetDate)} · {invitation.partyVenue.name}
                </span>
              </div>
            </div>

            {/* Simulated QR Code & Barcode */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-amber-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white border border-slate-300 shadow-sm">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-600 leading-tight">
                  <p className="font-bold text-slate-800">Acceso Válido</p>
                  <p>Presenta este código en recepción</p>
                </div>
              </div>

              <Sparkles className="w-5 h-5 text-amber-600/70" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handlePrintPass}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-xs sm:text-sm font-sans shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Guardar / Imprimir Pase</span>
            </button>

            <a
              href={generateGoogleCalendarUrl(invitation)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs sm:text-sm font-sans transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Añadir a Calendario</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
