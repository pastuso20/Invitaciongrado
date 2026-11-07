import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, ExternalLink } from 'lucide-react';
import { InvitationData } from '../types/invitation';
import { formatDateSpanish, generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface CountdownTimerProps {
  invitation: InvitationData;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ invitation }) => {
  const [time, setTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(invitation.targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [invitation.targetDate]);

  const timeUnits = [
    { label: 'Días', value: time.days },
    { label: 'Horas', value: time.hours },
    { label: 'Minutos', value: time.minutes },
    { label: 'Segundos', value: time.seconds },
  ];

  return (
    <section aria-labelledby="countdown-heading" className="w-full my-8">
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#182030] to-[#101726] border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Subtle decorative gold corner flourishes */}
        <div className="absolute top-2 left-2 text-amber-400/40 font-cinzel text-xs pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-amber-400/40 font-cinzel text-xs pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-amber-400/40 font-cinzel text-xs pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-amber-400/40 font-cinzel text-xs pointer-events-none">❖</div>

        {/* Header with classical typography */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-amber-400/90 font-medium mb-1">
            Cuenta Regresiva
          </p>
          <h2 id="countdown-heading" className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Faltan para la Celebración
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-stone-300 font-cormorant italic">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{formatDateSpanish(invitation.targetDate)}</span>
            <span aria-hidden="true">·</span>
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{invitation.partyVenue.time}</span>
          </div>
        </div>

        {/* 4-Column Classical Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-amber-500/20 backdrop-blur-sm shadow-inner group hover:border-amber-400/50 transition-colors"
            >
              <div className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tabular-nums text-gold-gradient tracking-tight">
                {String(unit.value).padStart(2, '0')}
              </div>
              <span className="text-[11px] sm:text-xs font-sans uppercase tracking-widest text-slate-400 mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Integration Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-5 border-t border-amber-500/20">
          <a
            href={generateGoogleCalendarUrl(invitation)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Agendar en Google Calendar</span>
          </a>

          <button
            onClick={() => downloadIcsFile(invitation)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-stone-200 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar archivo iCal (.ics)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
