import React from 'react';
import { Clock, GlassWater, Award, Music, Sparkles, Shirt, Gift } from 'lucide-react';
import { InvitationData } from '../types/invitation';

interface EventTimelineProps {
  invitation: InvitationData;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ invitation }) => {
  const schedule = [
    {
      time: '17:00 hrs',
      title: 'Ceremonia Solemne de Graduación',
      place: invitation.ceremonyVenue.name,
      address: invitation.ceremonyVenue.address,
      icon: Award,
      desc: 'Entrega de diplomas, imposición de medallas y togas de honor.',
    },
    {
      time: '19:00 hrs',
      title: 'Cóctel & Brindis de Bienvenida',
      place: 'Terraza Los Rosales',
      address: invitation.partyVenue.name,
      icon: GlassWater,
      desc: 'Recepción de invitados, sesión fotográfica con la graduada y brindis de champaña.',
    },
    {
      time: '20:30 hrs',
      title: 'Banquete de Gala en 3 Tiempos',
      place: 'Salón Principal',
      address: invitation.partyVenue.name,
      icon: Clock,
      desc: 'Cena de honor, palabras de agradecimiento y proyección de video conmemorativo.',
    },
    {
      time: '22:30 hrs',
      title: 'Vals de Honor & Fiesta Bailable',
      place: 'Pista Imperial',
      address: invitation.partyVenue.name,
      icon: Music,
      desc: 'Vals tradicional de graduación con familiares, DJ en vivo y barra libre de autor.',
    },
  ];

  return (
    <section aria-labelledby="schedule-heading" className="w-full my-10">
      <div className="rounded-2xl bg-gradient-to-b from-[#182030] to-[#101726] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-amber-400/90 font-medium mb-1">
            Itinerario de Celebración
          </p>
          <h2 id="schedule-heading" className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Programa de la Velada
          </h2>
          <p className="text-sm text-stone-300 font-cormorant italic mt-1">
            Momentos diseñados para conmemorar este triunfo académico inolvidable
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical central hairline line */}
          <div className="absolute top-4 bottom-4 left-6 sm:left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-amber-400/20 via-amber-400/60 to-amber-400/20" />

          <div className="space-y-6 sm:space-y-8">
            {schedule.map((item, idx) => {
              const Icon = item.icon;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.title}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                    isEven ? 'sm:flex-row-reverse text-left sm:text-right' : 'text-left'
                  }`}
                >
                  {/* Content Box */}
                  <div className="ml-14 sm:ml-0 flex-1 p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-md">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold mb-1">
                      {item.time}
                    </div>
                    <h3 className="font-cinzel text-base font-bold text-stone-100">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-amber-200/90 font-sans mt-0.5">
                      {item.place}
                    </p>
                    <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#182030] border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg z-10">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Spacer for symmetry on desktop */}
                  <div className="hidden sm:block flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* DRESS CODE & GIFT DETAILS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 pt-8 border-t border-amber-500/20">
          {/* Dress Code Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shirt className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-sans uppercase tracking-widest text-amber-300 font-semibold">
                  Código de Vestimenta
                </span>
              </div>
              <h4 className="font-cinzel text-lg font-bold text-stone-100 mb-2">
                {invitation.dressCode.title}
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3">
                {invitation.dressCode.description}
              </p>
              <div className="space-y-1.5 text-xs text-slate-400 font-sans border-t border-slate-800/80 pt-2">
                <p>
                  <strong className="text-stone-300">Damas:</strong> {invitation.dressCode.ladies}
                </p>
                <p>
                  <strong className="text-stone-300">Caballeros:</strong> {invitation.dressCode.gentlemen}
                </p>
              </div>
            </div>
          </div>

          {/* Gift / Lluvia de Sobres Card */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-sans uppercase tracking-widest text-amber-300 font-semibold">
                  Mesa de Regalos & Agradecimiento
                </span>
              </div>
              <h4 className="font-cinzel text-lg font-bold text-stone-100 mb-2">
                {invitation.giftInfo.type}
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {invitation.giftInfo.description}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300/80 font-cormorant italic">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tu presencia y cariño son nuestro mejor homenaje.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
