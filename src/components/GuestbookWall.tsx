import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Quote, Sparkles } from 'lucide-react';
import { RsvpEntry } from '../types/invitation';

interface GuestbookWallProps {
  graduateName: string;
}

const STORAGE_KEY = 'graduation_invitation_rsvps_v1';

export const GuestbookWall: React.FC<GuestbookWallProps> = ({ graduateName }) => {
  const [messages, setMessages] = useState<Array<{ name: string; message: string; date: string }>>([]);

  const defaultMessages = [
    {
      name: 'Familia Mendoza Valenzuela',
      message: '¡Hija amada, no cabemos en orgullo! Verte culminar esta meta con tanta dedicación y excelencia es el regalo más hermoso. ¡Felicidades, arquitecta de tus propios triunfos!',
      date: 'Hace 2 días',
    },
    {
      name: 'Arq. Mateo Arismendi & Sofía',
      message: 'Compañera entrañable de desvelos y maquetas, ¡lo logramos con honores! Brindaremos en alto por todos los proyectos que el destino tiene para ti.',
      date: 'Hace 1 día',
    },
    {
      name: 'Dra. Elena Ruiz (Madrina)',
      message: 'Que tu talento e integridad brillen siempre tan alto como hoy. Cuenta siempre con nuestro cariño incondicional en esta nueva y brillante etapa profesional.',
      date: 'Hace unas horas',
    },
  ];

  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      if (savedStr) {
        const saved: RsvpEntry[] = JSON.parse(savedStr);
        const userMsgs = saved
          .filter((item) => item.message && item.message.trim().length > 0)
          .map((item) => ({
            name: item.name,
            message: item.message || '',
            date: 'Confirmación reciente',
          }));

        setMessages([...userMsgs, ...defaultMessages]);
      } else {
        setMessages(defaultMessages);
      }
    } catch {
      setMessages(defaultMessages);
    }
  }, []);

  return (
    <section aria-labelledby="guestbook-heading" className="w-full my-10">
      <div className="rounded-2xl bg-gradient-to-b from-[#182030] to-[#101726] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <Heart className="w-4 h-4 fill-amber-400/20" />
            <span className="text-xs uppercase tracking-[0.25em] font-sans font-medium">
              Muro de Afectos & Bendiciones
            </span>
          </div>
          <h2 id="guestbook-heading" className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Dedicatorias de Honor
          </h2>
          <p className="text-sm text-stone-300 font-cormorant italic mt-1">
            Palabras de cariño de quienes forman parte de esta travesía
          </p>
        </div>

        {/* Message Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {messages.slice(0, 6).map((item, idx) => (
            <div
              key={idx}
              className="relative p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/30 transition-colors flex flex-col justify-between"
            >
              <Quote className="w-6 h-6 text-amber-400/30 mb-2" />
              <p className="text-xs sm:text-sm text-stone-200 font-cormorant italic leading-relaxed mb-4">
                "{item.message}"
              </p>
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-sans">
                <span className="font-semibold text-amber-300 truncate">{item.name}</span>
                <span className="text-slate-500 shrink-0">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
