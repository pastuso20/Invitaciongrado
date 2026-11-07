import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Copy, Check, Car, ShieldCheck, Compass } from 'lucide-react';
import { InvitationData } from '../types/invitation';

interface LocationMapProps {
  invitation: InvitationData;
}

export const LocationMap: React.FC<LocationMapProps> = ({ invitation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState<'streets' | 'voyager'>('voyager');

  const { lat, lng, name, address, city, parkingInfo } = invitation.partyVenue;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up if already exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: false, // Don't hijack page scroll
    });

    mapInstanceRef.current = map;

    // Tile layer - Clean CartoDB Voyager or OSM
    const tileUrl =
      mapType === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    });
    tiles.addTo(map);

    // Custom Luxury Gold Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-gold-marker',
      html: `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 36px;
            height: 36px;
            background: radial-gradient(circle, #b45309, #78350f);
            border: 2px solid #fbbf24;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 6px 16px rgba(0,0,0,0.4);
          "></div>
          <div style="
            position: relative;
            z-index: 2;
            color: #ffffff;
            font-size: 16px;
            margin-top: -6px;
          ">🎓</div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 40],
      popupAnchor: [0, -36],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    marker.bindPopup(`
      <div style="text-align: center; font-family: sans-serif; padding: 4px;">
        <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #1e293b; font-size: 14px;">${name}</h4>
        <p style="margin: 0; color: #475569; font-size: 12px;">${address}, ${city}</p>
        <div style="margin-top: 6px; font-size: 11px; color: #d97706; font-weight: 600;">Lugar de la Recepción</div>
      </div>
    `);

    // Invalidate size on load to avoid grey squares
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, name, address, city, mapType]);

  const handleCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const handleCopyAddress = () => {
    const fullText = `${name}, ${address}, ${city}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address} ${city}`)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(`${name} ${address}`)}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}`;

  return (
    <section aria-labelledby="location-heading" className="w-full my-10">
      <div className="rounded-2xl bg-gradient-to-b from-[#182030] to-[#101726] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Section Heading */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.25em] font-sans text-amber-400/90 font-medium mb-1">
            Ubicación del Evento
          </p>
          <h2 id="location-heading" className="font-cinzel text-2xl sm:text-3xl font-bold text-stone-100">
            {name}
          </h2>
          <p className="text-sm text-slate-300 font-sans mt-1">
            {address} · {city}
          </p>
        </div>

        {/* Map Container & Overlay Controls */}
        <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden border border-amber-500/20 shadow-inner bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick interactive map overlay tools */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <button
              onClick={handleCenter}
              title="Centrar en el recinto"
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapType(mapType === 'voyager' ? 'streets' : 'voyager')}
              title="Cambiar vista de mapa"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-stone-200 text-xs font-sans border border-slate-700 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
              {mapType === 'voyager' ? 'Detallado' : 'Estándar'}
            </button>
          </div>
        </div>

        {/* Venue Information Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <Car className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider font-sans">
                Estacionamiento & Valet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {parkingInfo || 'Servicio de Valet Parking y estacionamiento privado vigilado disponible sin costo.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-stone-200 uppercase tracking-wider font-sans">
                Acceso & Seguridad
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Recepción con registro de invitados en puerta. Presenta tu pase digital o código QR.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-5 border-t border-amber-500/20">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-amber-300" />
            <span>Abrir en Google Maps</span>
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-stone-200 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Navegar con Waze</span>
          </a>

          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-stone-200 text-xs sm:text-sm font-sans font-medium transition-colors cursor-pointer"
          >
            <span>Apple Maps</span>
          </a>

          <button
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-stone-300 text-xs sm:text-sm font-sans transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">¡Dirección Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copiar Dirección</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
