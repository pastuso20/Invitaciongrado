import React, { useState } from 'react';
import { X, Check, RotateCcw, Sparkles } from 'lucide-react';
import { InvitationData } from '../types/invitation';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: InvitationData;
  onSave: (newData: InvitationData) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onSave,
}) => {
  const [formData, setFormData] = useState<InvitationData>(currentData);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'Arquitectura & Urbanismo',
      prefix: 'Lic.',
      name: 'Sofía Elena Valenzuela Mendoza',
      degree: 'Licenciatura en Arquitectura y Urbanismo',
      institution: 'Universidad Nacional Autónoma',
      faculty: 'Facultad de Arquitectura & Diseño',
      quote: 'El futuro pertenece a quienes creen en la belleza de sus sueños y construyen sobre ellos.',
      quoteAuthor: 'Eleanor Roosevelt',
    },
    {
      label: 'Doctora en Medicina',
      prefix: 'Dra.',
      name: 'Camila Andrea Restrepo Duarte',
      degree: 'Médico Cirujano con Especialidad en Pediatría',
      institution: 'Facultad de Ciencias Médicas y de la Salud',
      faculty: 'Hospital Universitario San Lucas',
      quote: 'Donde quiera que el arte de la medicina es amado, también hay un amor por la humanidad.',
      quoteAuthor: 'Hipócrates',
    },
    {
      label: 'Licenciatura en Derecho',
      prefix: 'Lic.',
      name: 'Santiago Benjamín Navarro Soto',
      degree: 'Licenciado en Ciencias Jurídicas y Sociales',
      institution: 'Pontificia Universidad',
      faculty: 'Facultad de Derecho y Ciencias Políticas',
      quote: 'La justicia es la constante y perpetua voluntad de dar a cada uno su derecho.',
      quoteAuthor: 'Ulpiano',
    },
    {
      label: 'Ingeniería en Computación',
      prefix: 'Ing.',
      name: 'Mateo Alejandro Ríos Cordero',
      degree: 'Ingeniería de Software e Inteligencia Artificial',
      institution: 'Instituto Tecnológico Superior',
      faculty: 'División de Ciencias Computacionales',
      quote: 'La mejor manera de predecir el futuro es creándolo con perseverancia y honor.',
      quoteAuthor: 'Alan Kay',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setFormData((prev) => ({
      ...prev,
      prefix: p.prefix,
      graduateName: p.name,
      degree: p.degree,
      institution: p.institution,
      faculty: p.faculty,
      quote: p.quote,
      quoteAuthor: p.quoteAuthor,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#182030] to-[#0f1422] border border-amber-500/40 shadow-2xl p-6 text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">
                Personalización en Vivo
              </span>
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-100 mt-0.5">
              Editar Datos de la Invitación
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="my-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Cargar Plantillas Rápidas:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-700 text-stone-300 hover:text-amber-200 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Título / Prefijo</label>
              <input
                type="text"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Nombre del Graduado(a)</label>
              <input
                type="text"
                value={formData.graduateName}
                onChange={(e) => setFormData({ ...formData, graduateName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Título o Grado Académico</label>
            <input
              type="text"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Institución / Universidad</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Facultad / Escuela</label>
              <input
                type="text"
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nombre del Recinto / Salón</label>
              <input
                type="text"
                value={formData.partyVenue.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    partyVenue: { ...formData.partyVenue, name: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Dirección de la Fiesta</label>
              <input
                type="text"
                value={formData.partyVenue.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    partyVenue: { ...formData.partyVenue, address: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Fecha y Hora (ISO / Objetivo)</label>
              <input
                type="datetime-local"
                value={formData.targetDate.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Código de Vestimenta</label>
              <input
                type="text"
                value={formData.dressCode.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dressCode: { ...formData.dressCode, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Frase Conmemorativa</label>
            <textarea
              rows={2}
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-stone-100 outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
