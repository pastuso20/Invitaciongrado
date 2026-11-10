import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle, Heart, Music, Users, Utensils, Sparkles, Ticket } from 'lucide-react';
import { InvitationData, RsvpEntry } from '../types/invitation';
import { sound } from '../utils/soundEffects';
import { sendRsvpDirectlyToGoogleSheets } from '../services/googleSheets';

interface RsvpSectionProps {
  invitation: InvitationData;
  onOpenPass: (entry: RsvpEntry) => void;
  onOpenHostDashboard: () => void;
}

const STORAGE_KEY = 'graduation_invitation_rsvps_v1';
const USER_RSVP_KEY = 'graduation_invitation_my_rsvp_v1';

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  invitation,
  onOpenPass,
  onOpenHostDashboard,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    attending: true,
    companions: 0,
    dietary: 'Menú tradicional de gala',
    songRequest: '',
    message: '',
  });

  const [existingRsvp, setExistingRsvp] = useState<RsvpEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Load existing RSVP if user previously answered
  useEffect(() => {
    try {
      const savedUserRsvp = localStorage.getItem(USER_RSVP_KEY);
      if (savedUserRsvp) {
        setExistingRsvp(JSON.parse(savedUserRsvp));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const ticketCode = `GRAD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEntry: RsvpEntry = {
      id: `rsvp_${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      attending: formData.attending,
      companions: formData.attending ? formData.companions : 0,
      dietary: formData.dietary,
      songRequest: formData.songRequest.trim(),
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
      ticketCode,
    };

    // Save to all RSVPs array
    try {
      const existingAllStr = localStorage.getItem(STORAGE_KEY);
      const allEntries: RsvpEntry[] = existingAllStr ? JSON.parse(existingAllStr) : [];
      allEntries.unshift(newEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allEntries));

      // Save user's own RSVP
      localStorage.setItem(USER_RSVP_KEY, JSON.stringify(newEntry));
    } catch {
      // ignore storage error
    }

    // Send directly and automatically to Google Sheets
    sendRsvpDirectlyToGoogleSheets(newEntry).catch((err) => {
      console.warn('Direct Google Sheets dispatch from RsvpSection:', err);
    });

    // Sound and celebration
    sound.playFanfare();

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#ffffff', '#e11d48', '#2563eb'],
    });

    setExistingRsvp(newEntry);
    setJustSubmitted(true);
    setIsSubmitting(false);
  };

  const handleEditRsvp = () => {
    if (existingRsvp) {
      setFormData({
        name: existingRsvp.name,
        phone: existingRsvp.phone,
        email: existingRsvp.email,
        attending: existingRsvp.attending,
        companions: existingRsvp.companions,
        dietary: existingRsvp.dietary,
        songRequest: existingRsvp.songRequest || '',
        message: existingRsvp.message || '',
      });
      setJustSubmitted(false);
      setExistingRsvp(null);
    }
  };

  return (
    <section id="rsvp-section" aria-labelledby="rsvp-heading" className="w-full my-12">
      <div className="relative rounded-2xl bg-gradient-to-b from-[#182030] to-[#0f1422] border-2 border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        {/* Subtle Ornamental Top Accent */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400" />
          <span className="text-amber-400 font-cinzel text-sm">❖</span>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-amber-400/90 font-medium mb-1">
            Confirmación de Asistencia
          </p>
          <h2 id="rsvp-heading" className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            Reserva Tu Lugar de Honor
          </h2>
          <p className="text-sm text-stone-300 font-cormorant italic mt-1 max-w-lg mx-auto">
            Por favor confirma tu asistencia antes del 1 de Diciembre para garantizar la asignación de tu mesa y banquete.
          </p>
        </div>

        {/* Existing RSVP Banner (if already registered) */}
        {existingRsvp && !justSubmitted && (
          <div className="mb-8 p-6 rounded-xl bg-amber-500/10 border border-amber-400/40 text-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel font-bold text-base sm:text-lg text-amber-200">
              {existingRsvp.attending
                ? '¡Te Esperamos con Mucha Alegría!'
                : '¡Muchas Gracias por Avisarnos!'}
            </h3>
            <p className="text-sm font-cormorant italic text-stone-300 max-w-md mx-auto leading-relaxed">
              {existingRsvp.attending
                ? `¡Muchas gracias, ${existingRsvp.name}! Tu lugar de honor está reservado. Será un gran placer contar con tu grata compañía para celebrar juntos nuestra graduación.`
                : `Agradecemos mucho tus buenos deseos, ${existingRsvp.name}. ¡Sabemos que nos acompañarás de corazón en este día!`
              }
            </p>
            {existingRsvp.attending && existingRsvp.companions > 0 && (
              <p className="text-xs text-amber-300 font-sans font-semibold">
                👥 Asistencia confirmada para {1 + existingRsvp.companions} personas
              </p>
            )}
            <div className="pt-2">
              <button
                onClick={handleEditRsvp}
                className="text-xs text-stone-400 hover:text-amber-300 underline font-sans transition-colors cursor-pointer"
              >
                ¿Deseas modificar tu respuesta?
              </button>
            </div>
          </div>
        )}

        {/* RSVP FORM */}
        {(!existingRsvp || justSubmitted) && (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5 font-sans">
            {/* Attendance Choice Buttons */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-amber-300/90 font-medium mb-2">
                ¿Nos acompañarás en esta gran noche? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: true })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    formData.attending
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-700 text-stone-400 hover:border-slate-600'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>¡Sí, asistiré con alegría!</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, attending: false })}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    !formData.attending
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-md'
                      : 'bg-slate-900/60 border-slate-700 text-stone-400 hover:border-slate-600'
                  }`}
                >
                  <span>No podré asistir</span>
                </button>
              </div>
            </div>

            {/* Guest Name & WhatsApp Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="guest-name" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  placeholder="Ej. Dr. Carlos Santillán"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 placeholder-slate-500 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="guest-phone" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5">
                  WhatsApp / Teléfono *
                </label>
                <input
                  id="guest-phone"
                  type="tel"
                  required
                  placeholder="+52 55 1234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 placeholder-slate-500 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Conditional fields if attending */}
            {formData.attending && (
              <>
                {/* Companions and Dietary Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companions-select" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acompañantes Adicionales</span>
                    </label>
                    <select
                      id="companions-select"
                      value={formData.companions}
                      onChange={(e) => setFormData({ ...formData, companions: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 text-sm outline-none transition-colors"
                    >
                      <option value={0}>Sólo yo (1 Pase)</option>
                      <option value={1}>+1 Acompañante (2 Pases en total)</option>
                      <option value={2}>+2 Acompañantes (3 Pases en total)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dietary-select" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preferencia Dietaria</span>
                    </label>
                    <select
                      id="dietary-select"
                      value={formData.dietary}
                      onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 text-sm outline-none transition-colors"
                    >
                      <option value="Menú tradicional de gala">Menú tradicional de gala</option>
                      <option value="Menú Vegetariano">Menú Vegetariano</option>
                      <option value="Menú Vegano">Menú Vegano</option>
                      <option value="Sin Gluten / Celíaco">Sin Gluten / Celíaco</option>
                      <option value="Alergias o sin mariscos">Sin mariscos / Alergias específicas</option>
                    </select>
                  </div>
                </div>

                {/* Song request for DJ */}
                <div>
                  <label htmlFor="song-request" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-amber-400" />
                    <span>Canción imperdible para bailar (Sugerencia para el DJ)</span>
                  </label>
                  <input
                    id="song-request"
                    type="text"
                    placeholder="Ej. Frank Sinatra - Fly Me to the Moon / Earth Wind & Fire - September"
                    value={formData.songRequest}
                    onChange={(e) => setFormData({ ...formData, songRequest: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 placeholder-slate-500 text-sm outline-none transition-colors"
                  />
                </div>
              </>
            )}

            {/* Dedication message / Guestbook */}
            <div>
              <label htmlFor="dedication-msg" className="block text-xs uppercase tracking-wider text-stone-300 font-medium mb-1.5 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-amber-400" />
                <span>Mensaje de felicitación para {invitation.prefix} {invitation.graduateName}</span>
              </label>
              <textarea
                id="dedication-msg"
                rows={3}
                placeholder="Escribe unas palabras de afecto, orgullo o bendiciones para esta nueva etapa..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-stone-100 placeholder-slate-500 text-sm outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-cinzel tracking-wider text-sm sm:text-base shadow-xl hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{formData.attending ? 'Confirmar Asistencia y Generar Pase' : 'Enviar Mis Felicitaciones'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Host / Organizer link footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onOpenHostDashboard}
            className="text-xs text-slate-400 hover:text-amber-300 font-sans transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>¿Eres el anfitrión? Acceder al Panel de Control de Invitados</span>
          </button>
        </div>
      </div>
    </section>
  );
};
