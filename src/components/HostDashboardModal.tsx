import React, { useState, useEffect } from 'react';
import { X, Users, Utensils, Music, Download, Trash2, CheckCircle, UserPlus } from 'lucide-react';
import { RsvpEntry } from '../types/invitation';

interface HostDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'graduation_invitation_rsvps_v1';

export const HostDashboardModal: React.FC<HostDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [entries, setEntries] = useState<RsvpEntry[]>([]);

  const loadData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        // Sample entries if empty
        const sample: RsvpEntry[] = [
          {
            id: 'sample_1',
            name: 'Familia Valenzuela Méndez',
            phone: '+52 55 9876 5432',
            email: 'valenzuela@gmail.com',
            attending: true,
            companions: 2,
            dietary: 'Menú tradicional de gala',
            songRequest: 'Vivir Mi Vida - Marc Anthony',
            message: '¡Felicitaciones inmensas, querida prima!',
            createdAt: new Date().toISOString(),
            ticketCode: 'GRAD-1042',
          },
          {
            id: 'sample_2',
            name: 'Lic. Andrés Morales',
            phone: '+52 55 4433 2211',
            email: 'andres.morales@estudio.com',
            attending: true,
            companions: 1,
            dietary: 'Menú Vegetariano',
            songRequest: 'Don\'t Stop Me Now - Queen',
            message: 'Un placer acompañarte en esta noche de gala.',
            createdAt: new Date().toISOString(),
            ticketCode: 'GRAD-2098',
          },
        ];
        setEntries(sample);
      }
    } catch {
      setEntries([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const attendingEntries = entries.filter((e) => e.attending);
  const totalGuests = attendingEntries.reduce((sum, e) => sum + 1 + e.companions, 0);

  // Group dietary count
  const dietaryCounts: Record<string, number> = {};
  attendingEntries.forEach((e) => {
    dietaryCounts[e.dietary] = (dietaryCounts[e.dietary] || 0) + (1 + e.companions);
  });

  const exportCsv = () => {
    const headers = ['Nombre', 'Asistencia', 'Pases Totales', 'Telefono', 'Email', 'Dieta', 'Cancion', 'Mensaje', 'Codigo Pase'];
    const rows = entries.map((e) => [
      `"${e.name}"`,
      e.attending ? 'Confirmado' : 'No Asiste',
      e.attending ? 1 + e.companions : 0,
      `"${e.phone || ''}"`,
      `"${e.email || ''}"`,
      `"${e.dietary}"`,
      `"${(e.songRequest || '').replace(/"/g, '""')}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`,
      `"${e.ticketCode}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invitados-graduacion-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = () => {
    if (window.confirm('¿Deseas reiniciar los registros de prueba?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('graduation_invitation_my_rsvp_v1');
      setEntries([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#182030] to-[#0f1422] border border-amber-500/40 shadow-2xl p-6 text-stone-100 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Control de Anfitrión
              </span>
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-stone-100 mt-0.5">
              Gestión de Invitados & Asistencia
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar panel"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metric Cards Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Pases Confirmados</span>
            <div className="font-cinzel text-2xl font-bold text-amber-300 mt-1">
              {totalGuests}
            </div>
            <span className="text-[11px] text-slate-500">{attendingEntries.length} invitaciones aceptadas</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Respuestas</span>
            <div className="font-cinzel text-2xl font-bold text-stone-200 mt-1">
              {entries.length}
            </div>
            <span className="text-[11px] text-slate-500">invitados han respondido</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2">
            <span className="text-xs text-slate-400 block mb-1">Preferencia de Menú / Catering</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(dietaryCounts).map(([diet, count]) => (
                <span
                  key={diet}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-200"
                >
                  {diet}: <strong>{count}</strong>
                </span>
              ))}
              {Object.keys(dietaryCounts).length === 0 && (
                <span className="text-slate-500 text-xs">Sin confirmaciones aún</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Lista Detallada de Asistencia
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Excel / CSV</span>
            </button>

            <button
              onClick={clearAllData}
              title="Limpiar datos de prueba"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Guest Table */}
        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/50">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invitado</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3">Pases</th>
                <th className="py-2.5 px-3">Teléfono</th>
                <th className="py-2.5 px-3">Menú</th>
                <th className="py-2.5 px-3">Canción DJ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-medium text-stone-200">
                    <div>{entry.name}</div>
                    <span className="text-[10px] text-slate-500">{entry.ticketCode}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    {entry.attending ? (
                      <span className="text-emerald-400 font-semibold">Confirmado</span>
                    ) : (
                      <span className="text-rose-400">No asiste</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-stone-200">
                    {entry.attending ? 1 + entry.companions : 0}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{entry.phone || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-300">{entry.dietary}</td>
                  <td className="py-2.5 px-3 text-slate-400 italic max-w-xs truncate">
                    {entry.songRequest || '-'}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Aún no hay invitados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
