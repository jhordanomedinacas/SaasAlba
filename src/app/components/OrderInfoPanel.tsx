import {
  MapPin, CreditCard, Package, Clock, User, Phone,
  Navigation, Maximize2, X, MessageSquare, ShoppingBag,
  Activity, Tag, ChevronRight, Copy, Check,
  RefreshCw, FileText, Search, PlusSquare, XCircle,
  AlertCircle, Gift, Truck, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { OrderInfo } from '../hooks/useCriticalBot';

// ---- Tipos ----
type TabId = 'ticket' | 'ordenes' | 'cliente' | 'actividad';

export type RiderPhase =
  | 'heading_to_local'   // Rider acercándose al local
  | 'at_local'           // Rider en el pick up
  | 'left_local'         // Rider dejó el local
  | 'near_dropoff'       // Rider cerca al dropoff
  | 'arrived'            // Rider llegó a la dirección
  | 'delivered';         // Orden entregada

export interface RiderSimState {
  phase: RiderPhase;
  riderPos: [number, number];
  minutesLeft: number;
  orderLabel: string;
  orderColor: string;
  progress: number; // 0-1 across full journey
}

// Duraciones en segundos de cada fase (acelerado para demo)
const PHASE_DURATIONS: Record<RiderPhase, number> = {
  heading_to_local: 12,
  at_local:         10,
  left_local:       14,
  near_dropoff:     10,
  arrived:          60, // 1 min antes de marcar entregado
  delivered:        0,
};

const PHASE_LABELS: Record<RiderPhase, string> = {
  heading_to_local: 'Rider en camino al local',
  at_local:         'Rider en el pick up',
  left_local:       'Rider dejó el local',
  near_dropoff:     'Rider cerca al dropoff',
  arrived:          'Rider llegó a la dirección',
  delivered:        'Orden entregada',
};

const PHASE_COLORS: Record<RiderPhase, string> = {
  heading_to_local: 'text-blue-600',
  at_local:         'text-orange-600',
  left_local:       'text-purple-600',
  near_dropoff:     'text-amber-600',
  arrived:          'text-green-600',
  delivered:        'text-green-700',
};

const PHASES: RiderPhase[] = [
  'heading_to_local',
  'at_local',
  'left_local',
  'near_dropoff',
  'arrived',
  'delivered',
];

// Interpola linealmente entre dos coords
function lerp(a: [number,number], b: [number,number], t: number): [number,number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Coordenadas reales Lima — rider sale de Miraflores hacia PhoneCorp San Isidro
// y luego entrega en Av. Javier Prado Este 4200, Surco
const RIDER_START: [number,number]  = [-12.1190, -77.0286]; // Miraflores (inicio rider)
const LOCAL_COORDS: [number,number] = [-12.0973, -77.0325]; // San Isidro (PhoneCorp)
const CLIENT_COORDS: [number,number]= [-12.1021, -77.0066]; // Av. Javier Prado Este 4200, Surco
const NEAR_DROPOFF: [number,number] = [-12.1000, -77.0120]; // Cerca al dropoff

function getRiderPos(phase: RiderPhase, t: number): [number,number] {
  switch (phase) {
    case 'heading_to_local': return lerp(RIDER_START, LOCAL_COORDS, t);
    case 'at_local':         return LOCAL_COORDS;
    case 'left_local':       return lerp(LOCAL_COORDS, NEAR_DROPOFF, t);
    case 'near_dropoff':     return lerp(NEAR_DROPOFF, CLIENT_COORDS, t * 0.6);
    case 'arrived':          return CLIENT_COORDS;
    case 'delivered':        return CLIENT_COORDS;
  }
}

// ---- Hook global de simulación ----
export function useRiderSimulation(cancelled = false): RiderSimState {
  const [phaseIdx, setPhaseIdx] = useState(1); // Empieza en 'at_local'
  const [elapsed, setElapsed] = useState(0);

  const phase = PHASES[phaseIdx] as RiderPhase;
  const duration = PHASE_DURATIONS[phase];

  useEffect(() => {
    if (phase === 'delivered') return;
    // Orden cancelada: el rider se queda en el local, no avanza hacia el cliente
    if (cancelled) return;
    const interval = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= duration) {
          setPhaseIdx(idx => Math.min(idx + 1, PHASES.length - 1));
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phaseIdx, duration, phase, cancelled]);

  const t = duration > 0 ? elapsed / duration : 1;
  const riderPos = getRiderPos(phase, t);

  // Tiempo restante total estimado (suma de fases restantes)
  const totalRemainingSeconds = PHASES.slice(phaseIdx).reduce((sum, p, i) => {
    if (i === 0) return sum + (PHASE_DURATIONS[p] - elapsed);
    if (p === 'delivered') return sum;
    return sum + PHASE_DURATIONS[p];
  }, 0);
  const minutesLeft = Math.max(0, Math.ceil(totalRemainingSeconds / 60));

  // Progreso global 0-1
  const totalAll = PHASES.reduce((s, p) => s + PHASE_DURATIONS[p], 0);
  const completedSecs = PHASES.slice(0, phaseIdx).reduce((s, p) => s + PHASE_DURATIONS[p], 0);
  const progress = Math.min(1, (completedSecs + elapsed) / totalAll);

  return {
    phase,
    riderPos,
    minutesLeft,
    orderLabel: PHASE_LABELS[phase],
    orderColor: PHASE_COLORS[phase],
    progress,
  };
}

// Devuelve el punto (lat, lng) en la fracción t (0-1) a lo largo de una polilínea
function getPointAtFraction(coords: [number, number][], t: number): [number, number] {
  if (!coords.length) return [0, 0];
  if (t <= 0) return coords[0];
  if (t >= 1) return coords[coords.length - 1];

  let totalLen = 0;
  const segLens: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    const dlat = coords[i][0] - coords[i - 1][0];
    const dlng = coords[i][1] - coords[i - 1][1];
    const d = Math.sqrt(dlat * dlat + dlng * dlng);
    segLens.push(d);
    totalLen += d;
  }
  if (totalLen === 0) return coords[0];

  const target = t * totalLen;
  let acc = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (acc + segLens[i] >= target) {
      const st = segLens[i] > 0 ? (target - acc) / segLens[i] : 0;
      return [
        coords[i][0] + (coords[i + 1][0] - coords[i][0]) * st,
        coords[i][1] + (coords[i + 1][1] - coords[i][1]) * st,
      ];
    }
    acc += segLens[i];
  }
  return coords[coords.length - 1];
}

// ---- Leaflet map con marcadores SVG y ruta OSRM ----
interface InteractiveMapProps {
  expanded?: boolean;
  deliveryAddress?: string;
  pickupAddress?: string;
  clienteName?: string;
  localName?: string;
  localCoords?: [number, number];
  riderCoords?: [number, number];
  clientCoords?: [number, number];
  // Simulación live
  liveRiderPos?: [number, number];
  riderPhase?: RiderPhase;
  minutesLeft?: number;
  cancelledOrder?: boolean;
  progress?: number; // 0-1 a lo largo de la ruta real
}

// SVG strings para los iconos de cada marcador
const ICON_LOCAL_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`;

const ICON_RIDER_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6h-4l-3 7h10l-2-5"/>
    <path d="M15 6l2 4"/>
    <circle cx="15" cy="4" r="2"/>
  </svg>`;

const ICON_CLIENT_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`;

function makePinHTML(bgColor: string, iconSvg: string, pulse = false) {
  return `
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      ${pulse ? `<div style="
        position:absolute;top:-6px;left:-6px;
        width:52px;height:52px;border-radius:50%;
        background:${bgColor};opacity:0.18;
        animation:pvPulse 2s infinite;">
      </div>` : ''}
      <div style="
        width:40px;height:40px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${bgColor};
        border:2px solid rgba(255,255,255,0.35);
        box-shadow:0 4px 16px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;">
        <div style="transform:rotate(45deg)">${iconSvg}</div>
      </div>
      <div style="
        width:6px;height:6px;border-radius:50%;
        background:${bgColor};margin-top:1px;
        box-shadow:0 2px 4px rgba(0,0,0,0.3);">
      </div>
    </div>`;
}

function InteractiveMap({
  expanded = false,
  deliveryAddress = 'Av. Javier Prado Este 4200, Surco, Lima, Perú',
  pickupAddress = 'PhoneCorp – Av. Innovación Tecnológica 123, San Isidro, Lima, Perú',
  clienteName = 'Verónica Sosa',
  localName = 'PhoneCorp San Isidro',
  localCoords  = LOCAL_COORDS,
  clientCoords = CLIENT_COORDS,
  liveRiderPos,
  riderPhase = 'at_local',
  minutesLeft = 8,
  cancelledOrder = false,
  progress = 0,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeControlRef = useRef<any>(null);
  const routeCoordsRef = useRef<[number, number][]>([]);
  const progressRef = useRef(progress);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Solicitar geolocalización del usuario (cliente)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // Si falla, usar CLIENT_COORDS como fallback
        setUserLocation(clientCoords);
      }
    );
  }, []);

  // Mantiene progressRef sincronizado
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Redibujar rutas si cambia la ubicación del usuario GPS
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    // Aquí se puede agregar lógica para redibujar rutas si es necesario
  }, [userLocation]);

  // Mueve al rider a lo largo de la ruta real según el progreso de la simulación
  useEffect(() => {
    if (!riderMarkerRef.current || !routeCoordsRef.current.length) return;
    const pos = getPointAtFraction(routeCoordsRef.current, progress);
    riderMarkerRef.current.setLatLng(pos);
  }, [progress]);

  // Actualiza solo el popup cuando cambia la fase o el tiempo restante
  useEffect(() => {
    if (!riderMarkerRef.current) return;
    const label = cancelledOrder ? 'Rider en el local' : (PHASE_LABELS[riderPhase] ?? 'Rider en ruta');
    const detail = cancelledOrder
      ? 'Orden cancelada — no va al cliente'
      : (minutesLeft > 0 ? `~${minutesLeft} min al destino` : 'Llegó al destino');
    riderMarkerRef.current.setPopupContent(
      `<b style="font-size:.88rem">${label}</b><br><span style="font-size:.78rem;color:${cancelledOrder ? '#ef4444' : '#6b7280'}">${detail}</span>`
    );
  }, [riderPhase, minutesLeft, cancelledOrder]);

  useEffect(() => {
    // Inyectar animación de pulso
    if (!document.getElementById('pv-pulse-style')) {
      const s = document.createElement('style');
      s.id = 'pv-pulse-style';
      s.textContent = `@keyframes pvPulse{0%,100%{transform:scale(1);opacity:.18}50%{transform:scale(1.7);opacity:0}}`;
      document.head.appendChild(s);
    }
    // Inyectar estilos popup claros
    if (!document.getElementById('pv-leaflet-popup-style')) {
      const s = document.createElement('style');
      s.id = 'pv-leaflet-popup-style';
      s.textContent = `
        .pv-lp .leaflet-popup-content-wrapper{background:#fff;color:#1f2937;border:1px solid rgba(0,0,0,0.08);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.15);}
        .pv-lp .leaflet-popup-tip{background:#fff;}
        .pv-lp .leaflet-popup-close-button{color:#9ca3af!important;}
        .leaflet-control-zoom a{background:#fff!important;color:#374151!important;border-color:#d1d5db!important;}
        .leaflet-control-zoom a:hover{background:#f3f4f6!important;color:#111827!important;}
        .leaflet-control-attribution{background:rgba(255,255,255,0.75)!important;color:#9ca3af!important;font-size:9px!important;}
      `;
      document.head.appendChild(s);
    }

    const container = containerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      riderMarkerRef.current = null;
    }

    const loadAndInit = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // Leaflet y LRM ya cargados desde index.html — solo esperamos que estén listos
      await new Promise<void>((resolve) => {
        if ((window as any).L) { resolve(); return; }
        // Fallback: esperar hasta 3s por si el script del index.html aún no terminó
        let attempts = 0;
        const check = setInterval(() => {
          attempts++;
          if ((window as any).L || attempts > 30) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

      const Lf = (window as any).L;
      // Orden cancelada: rider fijo en el local (no va al cliente)
      const initialRider = cancelledOrder ? LOCAL_COORDS : (liveRiderPos ?? LOCAL_COORDS);
      const effectiveClientCoords = userLocation || clientCoords;

      const centerLat = cancelledOrder
        ? (RIDER_START[0] + localCoords[0]) / 2
        : (localCoords[0] + effectiveClientCoords[0]) / 2;
      const centerLng = cancelledOrder
        ? (RIDER_START[1] + localCoords[1]) / 2
        : (localCoords[1] + effectiveClientCoords[1]) / 2;

      const map = Lf.map(container, {
        center: [centerLat, centerLng],
        zoom: expanded ? 14 : 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapInstanceRef.current = map;

      Lf.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map);

      const makeIcon = (bg: string, svg: string, pulse: boolean) =>
        Lf.divIcon({
          html: makePinHTML(bg, svg, pulse),
          className: '',
          iconSize: [40, 50],
          iconAnchor: [20, 50],
          popupAnchor: [0, -50],
        });

      const popupOpts = { maxWidth: 230, className: 'pv-lp' };

      Lf.marker(localCoords, { icon: makeIcon('#e11d48', ICON_LOCAL_SVG, false) })
        .addTo(map)
        .bindPopup(`<b style="font-size:.88rem">${localName}</b><br><span style="font-size:.78rem;color:#6b7280">${pickupAddress.split(',').slice(0,2).join(',')}</span>`, popupOpts);

      // Rider: sin pulso cuando está cancelado (ya está en el local)
      const riderPopupText = cancelledOrder
        ? `<b style="font-size:.88rem">Rider en el local</b><br><span style="font-size:.78rem;color:#ef4444">Orden cancelada — no va al cliente</span>`
        : `<b style="font-size:.88rem">Rider en ruta</b><br><span style="font-size:.78rem;color:#6b7280">~${minutesLeft} min al destino</span>`;
      const riderMarker = Lf.marker(initialRider, {
        icon: makeIcon(cancelledOrder ? '#6b7280' : '#0F2C32', ICON_RIDER_SVG, !cancelledOrder),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(riderPopupText, popupOpts);
      riderMarkerRef.current = riderMarker;

      let finalClientCoords = userLocation || clientCoords;
      // Si no tenemos GPS, intentar resolver con Nominatim, pero priorizar GPS
      if (!userLocation && !cancelledOrder) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(deliveryAddress + ', Lima, Perú')}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'es' } }
          );
          const geo = await res.json();
          if (geo?.[0]) {
            finalClientCoords = [parseFloat(geo[0].lat), parseFloat(geo[0].lon)];
          }
        } catch (_) {}
      }

      // Marcador cliente: gris con "Entrega cancelada" si la orden está cancelada
      Lf.marker(finalClientCoords, {
        icon: makeIcon(cancelledOrder ? '#9ca3af' : '#3b82f6', ICON_CLIENT_SVG, !cancelledOrder),
        opacity: cancelledOrder ? 0.55 : 1,
      })
        .addTo(map)
        .bindPopup(
          cancelledOrder
            ? `<b style="font-size:.88rem;color:#ef4444">Entrega cancelada</b><br><span style="font-size:.78rem;color:#6b7280">${clienteName} — ${deliveryAddress.split(',')[0]}</span>`
            : `<b style="font-size:.88rem">${clienteName}</b><br><span style="font-size:.78rem;color:#6b7280">Ubicación GPS actual</span>`,
          popupOpts
        );

      // Marcador de ubicación GPS del usuario actual (pequeño punto)
      if (userLocation) {
        const userIcon = Lf.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid rgba(255,255,255,0.35);box-shadow:0 0 0 7px rgba(255,255,255,0.1),0 2px 10px rgba(0,0,0,0.5);"></div>`,
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        userMarkerRef.current = Lf.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('<span style="font-family:\'DM Sans\',sans-serif;font-size:0.85rem;">Tu ubicación (GPS)</span>', popupOpts);
      }

      // ── Helpers de dibujo ─────────────────────────────────────────
      const drawRoute = (coords: [number,number][], color: string, w = 5) => {
        if (!mapInstanceRef.current) return;
        Lf.polyline(coords, { color: '#000',    weight: w + 5, opacity: 0.15, lineJoin: 'round', lineCap: 'round' }).addTo(map);
        Lf.polyline(coords, { color: '#ffffff', weight: w + 1, opacity: 0.5,  lineJoin: 'round', lineCap: 'round' }).addTo(map);
        Lf.polyline(coords, { color,            weight: w,     opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map);
      };

      const updateRiderOnRoute = (ll: [number,number][]) => {
        routeCoordsRef.current = ll;
        if (riderMarkerRef.current && mapInstanceRef.current) {
          riderMarkerRef.current.setLatLng(getPointAtFraction(ll, progressRef.current));
        }
      };

      // ── Dibujar rutas directas (sin OSRM, todo local) ──────────────
      const routeSegment = (
        from: [number,number],
        to:   [number,number],
        color: string,
        w = 5
      ): Promise<[number,number][]> =>
        new Promise((resolve) => {
          // Línea recta simple (más confiable que OSRM)
          drawRoute([from, to], color, w);
          resolve([from, to]);
        });

      // ── Dibujar rutas ───────────────────────────────────────────────
      setStatus('ready');
      setTimeout(() => map.invalidateSize(), 150);

      if (cancelledOrder) {
        map.fitBounds(Lf.latLngBounds([RIDER_START, localCoords]).pad(0.3));
        routeSegment(RIDER_START, localCoords, '#9ca3af', 4).then(coords => {
          if (!mapInstanceRef.current) return;
          updateRiderOnRoute(coords);
        });
      } else {
        map.fitBounds(Lf.latLngBounds([RIDER_START, localCoords, finalClientCoords]).pad(0.2));
        routeSegment(RIDER_START, localCoords, '#e11d48', 5).then(seg1 => {
          if (!mapInstanceRef.current) return;
          routeSegment(localCoords, finalClientCoords, '#3b82f6', 5).then(seg2 => {
            if (!mapInstanceRef.current) return;
            updateRiderOnRoute([...seg1, ...seg2]);
          });
        });
      }
      setStatus('ready');
      setTimeout(() => map.invalidateSize(), 150);
    };

    loadAndInit().catch(() => setStatus('error'));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        riderMarkerRef.current = null;
        routeCoordsRef.current = [];
      }
    };
  }, [deliveryAddress, cancelledOrder]);

  return (
    <div className="relative w-full h-full bg-gray-100">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 z-10 text-xs text-gray-400 bg-gray-100">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#aaa" strokeWidth="2.5" strokeDasharray="31.4" strokeLinecap="round" />
          </svg>
          Cargando mapa…
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 bg-gray-100 z-10">
          No se pudo cargar el mapa
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}



// ---- Modal mapa expandido ----
function MapModal({
  onClose,
  deliveryAddress,
  pickupAddress,
}: {
  onClose: () => void;
  deliveryAddress?: string;
  pickupAddress?: string;
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 bg-[#0F2C32] text-white">
          <div className="flex items-center gap-2">
            <Navigation size={18} />
            <span className="font-semibold text-sm">Ubicación en tiempo real</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="relative w-full" style={{ height: '480px' }}>
          <InteractiveMap expanded deliveryAddress={deliveryAddress} pickupAddress={pickupAddress} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-[#0F2C32] animate-pulse inline-block" />
              Rider en ruta
            </span>
            <span className="text-gray-500">PhoneCorp San Isidro → {deliveryAddress?.split(',')[0] ?? 'Destino'}</span>
          </div>
          <span className="font-semibold text-[#0F2C32] flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="inline-block">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            8 min restantes
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Componente: copiar al portapapeles ----
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

// ---- TAB: Ticket ----
function TabTicket({ onMapExpand, isCancelled, info }: { onMapExpand: () => void; isCancelled: boolean; info: OrderInfo }) {
  return (
    <div className="space-y-3 p-4">
      {/* Estado de la orden */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Package size={14} className="text-[#0F2C32]" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Estado de la Orden</span>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Número de orden</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-gray-800">#1584426315</p>
              <CopyButton text="1584426315" />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Ticket</p>
            <p className="text-sm font-medium text-gray-700">#8365</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Estado</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Orden cancelada
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Sub-estado</p>
            <p className="text-xs text-gray-500">Orden nunca entregada</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Hora de orden</p>
            <p className="text-sm text-gray-700">11:48 PM</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Vertical</p>
            <p className="text-sm text-gray-700">Restaurants</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Tag size={14} className="text-[#0F2C32]" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tags</span>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-1.5">
          {['Android', 'Delivery', 'Cancelado', 'Reembolso'].map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Rider status (sin mapa — el mapa está en Órdenes > Entregas) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={14} className={isCancelled ? 'text-gray-400' : 'text-[#0F2C32]'} />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ubicación del Rider</span>
          </div>
          {isCancelled ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              En el local
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              En vivo
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">{info.partnerName}</p>
            {isCancelled ? (
              <p className="text-xs text-red-500 mt-0.5 font-medium">Rider retornó al local — entrega cancelada</p>
            ) : (
              <p className="text-xs text-gray-500 mt-0.5">Android · En ruta · 2.5 km</p>
            )}
          </div>
          {isCancelled ? (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-lg">
              En local
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#0F2C32] bg-[#0F2C32]/8 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="inline-block flex-shrink-0">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              8 min
            </span>
          )}
        </div>
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Navigation size={10} className="text-gray-300" />
            Ver mapa en la pestaña <span className="font-semibold text-[#0F2C32] ml-0.5">Órdenes → Entregas</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Modal: Cambiar Dirección ----
function ModalCambiarDireccion({ onClose, onConfirm }: { onClose: () => void; onConfirm: (addr: string) => void }) {
  const [address, setAddress] = useState('');
  const [selected, setSelected] = useState('');

  const suggestions = [
    'Av. Javier Prado Este 4200, Piso 3, Surco, Lima, Perú',
    'Av. La Molina 1234, La Molina, Lima, Perú',
    'Av. Angamos Oeste 530, Miraflores, Lima, Perú',
    'Av. Benavides 1944, Miraflores, Lima, Perú',
  ].filter(s => s.toLowerCase().includes(address.toLowerCase()) && address.length > 1);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#0F2C32]" />
            <span className="text-sm font-semibold text-gray-900">Cambiar dirección de entrega</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Input */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-xl focus-within:border-[#0F2C32] focus-within:ring-2 focus-within:ring-[#0F2C32]/10 transition-all bg-white">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Escribe la nueva dirección..."
                value={address}
                onChange={e => { setAddress(e.target.value); setSelected(''); }}
                className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
              />
              {address && (
                <button onClick={() => { setAddress(''); setSelected(''); }} className="text-gray-300 hover:text-gray-500">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sugerencias */}
            {suggestions.length > 0 && !selected && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setAddress(s); setSelected(s); }}
                    className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0"
                  >
                    <MapPin size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-700 leading-relaxed">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mapa Google embed */}
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 200 }}>
            <iframe
              title="Mapa de ubicación"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(selected || address || 'Lima, Perú')}&output=embed&z=15`}
            />
          </div>
          {(selected || address) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin size={12} className="text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-700 font-medium">{selected || address}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(selected || address); onClose(); }}
            disabled={!address}
            className="flex-1 py-2 text-xs font-semibold text-white bg-[#0F2C32] hover:bg-[#1a4a54] rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <Check size={13} />
            Confirmar nueva dirección
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Modal: Rechazar Orden ----
function ModalRechazarOrden({ onClose }: { onClose: () => void }) {
  const [motivo, setMotivo] = useState('');

  const motivos = [
    'Cliente no encontrado',
    'Dirección incorrecta o incompleta',
    'Cliente rechazó el pedido',
    'Producto dañado',
    'Tiempo de espera excesivo',
    'Problema con el pago',
    'Fuerza mayor / causa externa',
    'Otro motivo',
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-gray-900">Rechazar orden</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Esta acción cancelará la orden <span className="font-semibold text-gray-800">#1832150046</span>. Por favor selecciona el motivo del rechazo.
          </p>

          {/* Desplegable de motivos */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Motivo de rechazo</label>
            <div className="relative">
              <select
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-9 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#0F2C32] focus:ring-2 focus:ring-[#0F2C32]/10 bg-white text-gray-800 transition-all cursor-pointer"
              >
                <option value="">— Selecciona un motivo —</option>
                {motivos.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {motivo && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 rounded-lg border border-red-100">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">Se registrará el motivo: <span className="font-semibold">{motivo}</span></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            disabled={!motivo}
            className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <XCircle size={13} />
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- TAB: Órdenes ----
function TabOrdenes({ isCancelled, info }: { isCancelled: boolean; info: OrderInfo }) {
  const [deliveryExpanded, setDeliveryExpanded] = useState(true);
  const [pickupExpanded, setPickupExpanded] = useState(false);
  const [showCambiarDireccion, setShowCambiarDireccion] = useState(false);
  const [showRechazarOrden, setShowRechazarOrden] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Av. Javier Prado Este 4200, Piso 3, Surco, Lima, Perú');
  const rider = useRiderSimulation(isCancelled);

  const pickupAddress = 'PhoneCorp – Av. Innovación Tecnológica N.º 123, San Isidro, Lima, Perú';

  // Color/bg del badge de estado dinámico
  const badgeStyle: Record<string, string> = {
    'text-blue-600':   'bg-blue-50 border-blue-100 text-blue-600',
    'text-orange-600': 'bg-orange-50 border-orange-100 text-orange-600',
    'text-purple-600': 'bg-purple-50 border-purple-100 text-purple-600',
    'text-amber-600':  'bg-amber-50 border-amber-100 text-amber-600',
    'text-green-600':  'bg-green-50 border-green-100 text-green-600',
    'text-green-700':  'bg-green-50 border-green-200 text-green-700',
  };
  const dotStyle: Record<string, string> = {
    'text-blue-600':   'bg-blue-500',
    'text-orange-600': 'bg-orange-500',
    'text-purple-600': 'bg-purple-500',
    'text-amber-600':  'bg-amber-500',
    'text-green-600':  'bg-green-500',
    'text-green-700':  'bg-green-600',
  };
  const badge = badgeStyle[rider.orderColor] ?? 'bg-gray-50 border-gray-100 text-gray-600';
  const dot   = dotStyle[rider.orderColor]   ?? 'bg-gray-400';

  return (
    <>
      {showCambiarDireccion && (
        <ModalCambiarDireccion
          onClose={() => setShowCambiarDireccion(false)}
          onConfirm={(addr) => setDeliveryAddress(addr)}
        />
      )}
      {showRechazarOrden && <ModalRechazarOrden onClose={() => setShowRechazarOrden(false)} />}
      {showMapModal && (
        <MapModal
          onClose={() => setShowMapModal(false)}
          deliveryAddress={deliveryAddress}
          pickupAddress={pickupAddress}
        />
      )}

    <div className="space-y-0">
      {/* Botón Ver órdenes pasadas */}
      <div className="flex justify-end px-4 pt-3 pb-1">
        <button className="text-xs text-blue-600 hover:bg-blue-50 font-medium transition-colors border border-blue-300 rounded-lg px-3 py-1.5">
          Ver órdenes pasadas
        </button>
      </div>

      {/* Card principal de la orden */}
      <div className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Encabezado orden */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Orden</p>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-gray-900">{info.orderNumber}</span>
              <CopyButton text={info.orderNumber} />
            </div>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        </div>

        {/* Grid de datos — 3 columnas como en la imagen */}
        <div className="px-4 py-3 grid grid-cols-3 gap-x-3 gap-y-3">
          {/* Monto */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Monto de la orden</p>
            <p className="text-xs font-semibold text-gray-800">{info.orderAmount}</p>
          </div>
          {/* Chat Rider - Cliente */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Chat Rider - Cliente</p>
            <p className="text-xs text-gray-500">No disponible</p>
          </div>
          {/* País */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">País</p>
            <div className="flex items-center gap-1">
              <span className="text-sm">🇵🇪</span>
              <span className="text-xs font-medium text-gray-800">Perú</span>
            </div>
          </div>
          {/* Hora de creación */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Hora de creación</p>
            <p className="text-xs font-medium text-gray-800">20.12.2025, 3:42 PM</p>
          </div>
          {/* Image proof */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Image proof</p>
            <p className="text-xs text-gray-500">Pending delivery</p>
          </div>
          {/* Tipo de delivery */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tipo de delivery</p>
            <p className="text-xs font-medium text-gray-800">Platform delivery</p>
          </div>
          {/* Estado de la orden */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Estado de la orden</p>
            <div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${rider.phase !== 'delivered' ? 'animate-pulse' : ''} ${dot}`} />
                {rider.orderLabel}
              </span>
              {rider.phase !== 'delivered' && rider.minutesLeft > 0 && (
                <p className="text-xs text-gray-400 mt-0.5 ml-0.5">~{rider.minutesLeft} min restantes</p>
              )}
            </div>
          </div>
          {/* Forma de pago */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Forma de pago</p>
            <div className="flex items-center gap-1">
              <CreditCard size={11} className="text-gray-500" />
              <p className="text-xs font-medium text-gray-800">Spreedly pa, visa - debit</p>
            </div>
          </div>
          {/* PIN de prueba */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">PIN de prueba de entrega</p>
            <p className="text-xs font-semibold text-gray-800">{info.deliveryPin}</p>
          </div>
          {/* Tags */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Tags de la orden</p>
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">los</span>
          </div>
          {/* Nombre del partner */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Nombre del partner</p>
            <p className="text-xs font-medium text-gray-800">{info.partnerName} – Lima</p>
          </div>
          {/* Vertical */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Vertical</p>
            <p className="text-xs font-medium text-gray-800">Darkstores</p>
          </div>
        </div>

        {/* Botones Rechazar Orden / Compensaciones */}
        <div className="px-4 pb-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <div className="relative group">
            <button
              onClick={() => !isCancelled && setShowRechazarOrden(true)}
              disabled={isCancelled}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isCancelled
                  ? 'text-gray-300 bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
              }`}
            >
              <XCircle size={13} />
              Rechazar Orden
            </button>
            {isCancelled && (
              <div className="absolute bottom-full left-0 mb-1.5 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                La orden ya está cancelada
              </div>
            )}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <Gift size={13} />
            Compensaciones
          </button>
        </div>
      </div>

      {/* Sección Entregas */}
      <div className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header entregas */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#0F2C32]" />
            <span className="text-sm font-semibold text-gray-800">Entregas (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
              <RefreshCw size={11} />
              Actualizar
            </button>
            <button
              onClick={() => setDeliveryExpanded(v => !v)}
              className="p-0.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            >
              {deliveryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {deliveryExpanded && (
          <>
            {/* Banner de orden cancelada */}
            {isCancelled && (
              <div className="px-4 py-2.5 flex items-center gap-2 bg-red-50 border-b border-red-100">
                <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600 font-medium">
                  Orden cancelada — el rider permanece en el local y no realizará la entrega al cliente.
                </p>
              </div>
            )}

            {/* Botones cambiar dirección / horario */}
            <div className="px-4 py-2.5 flex items-center gap-2 bg-gray-50 border-b border-gray-100">
              <button
                onClick={() => !isCancelled && setShowCambiarDireccion(true)}
                disabled={isCancelled}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isCancelled
                    ? 'text-gray-300 bg-white border-gray-200 cursor-not-allowed opacity-60'
                    : 'text-[#0F2C32] bg-white hover:bg-gray-100 border-gray-200'
                }`}
              >
                <MapPin size={11} />
                Cambiar dirección
              </button>
              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-white rounded-lg border border-gray-200 cursor-not-allowed opacity-60">
                <Clock size={11} />
                Cambiar Horario de Entrega
              </button>
            </div>

            {/* Dirección pick up → entrega */}
            <div className="px-4 py-3 grid grid-cols-2 gap-0 divide-x divide-gray-100">
              {/* Pick up */}
              <div className="pr-3">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={11} className="text-[#0F2C32]" />
                  <p className="text-xs font-semibold text-gray-700">Dirección de pick up</p>
                  <ArrowRight size={10} className="text-gray-300 ml-auto" />
                </div>
                <button
                  onClick={() => setPickupExpanded(v => !v)}
                  className="text-xs text-gray-600 text-left leading-relaxed"
                >
                  - PhoneCorp – Av. Innovación Tecnológica N.º 123, San Isidro, Lima, Perú
                  <span className="text-blue-500 ml-1">{pickupExpanded ? '▲' : '▼'}</span>
                </button>
              </div>
              {/* Entrega */}
              <div className="pl-3">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin size={11} className="text-blue-500" />
                  <p className="text-xs font-semibold text-gray-700">Dirección de entrega</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {deliveryAddress}
                </p>
              </div>
            </div>

            {/* Mapa interactivo debajo de direcciones */}
            <div className="px-4 pb-4">
              <div
                key={deliveryAddress + pickupAddress}
                className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                style={{ height: 220 }}
              >
                <InteractiveMap
                  deliveryAddress={deliveryAddress}
                  pickupAddress={pickupAddress}
                  clienteName="Verónica Sosa"
                  localName="PhoneCorp San Isidro"
                  riderPhase={rider.phase}
                  minutesLeft={rider.minutesLeft}
                  cancelledOrder={isCancelled}
                  progress={isCancelled ? 1 : rider.progress}
                />
                {/* Botón fullscreen */}
                <button
                  onClick={() => setShowMapModal(true)}
                  title="Ver mapa en pantalla completa"
                  className="absolute top-2 right-2 z-[500] flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white/90 hover:bg-white rounded-lg border border-gray-200 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
                >
                  <Maximize2 size={12} />
                  Pantalla completa
                </button>
                {/* Badge de estado sobre el mapa */}
                <div className="absolute bottom-2 left-2 z-[500]">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full shadow-md border ${badge} bg-white/95 backdrop-blur-sm`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} ${rider.phase !== 'delivered' ? 'animate-pulse' : ''}`} />
                    {rider.orderLabel}
                    {rider.phase !== 'delivered' && rider.minutesLeft > 0 && (
                      <span className="text-gray-400 font-normal ml-0.5">· {rider.minutesLeft} min</span>
                    )}
                  </span>
                </div>
                {/* Overlay entregado */}
                {rider.phase === 'delivered' && (
                  <div className="absolute inset-0 z-[600] flex items-center justify-center bg-green-500/15 backdrop-blur-[1px]">
                    <div className="bg-white rounded-2xl shadow-xl px-6 py-4 flex flex-col items-center gap-2 border border-green-200">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check size={22} className="text-green-600" />
                      </div>
                      <p className="text-sm font-bold text-green-700">¡Orden Entregada!</p>
                      <p className="text-xs text-gray-500">Entrega confirmada</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Barra de progreso */}
              <div className="mt-2 mb-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.round(rider.progress * 100)}%`,
                      background: rider.phase === 'delivered' ? '#16a34a' : 'linear-gradient(90deg,#e11d48,#3b82f6)',
                    }}
                  />
                </div>
              </div>
              <div className="mt-1.5 flex items-start gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#0F2C32] flex-shrink-0" />
                  <span className="truncate">{pickupAddress.split(',')[0]}</span>
                </div>
                <ArrowRight size={10} className="flex-shrink-0 mt-0.5" />
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="truncate">{deliveryAddress.split(',')[0]}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

// ---- TAB: Cliente ----
function TabCliente({ info }: { info: OrderInfo }) {
  const initials = info.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="space-y-3 p-4">
      {/* Perfil cliente */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{info.customerName}</p>
            <p className="text-xs text-gray-500">Cliente desde Mar 2023</p>
          </div>
          <div className="ml-auto">
            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">Activo</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { label: 'Teléfono', value: info.phone, copy: true },
            { label: 'Email', value: info.email, copy: true },
            { label: 'Ciudad', value: 'Lima, Perú' },
            { label: 'Plataforma', value: 'Android' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">{item.label}</span>
              <div className="flex items-center gap-1 flex-1 justify-end">
                <span className="text-xs font-medium text-gray-800">{item.value}</span>
                {item.copy && <CopyButton text={item.value} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Clock size={14} className="text-[#0F2C32]" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Historial (últimos 90 días)</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Órdenes', value: '12' },
            { label: 'Completadas', value: '10' },
            { label: 'Canceladas', value: '2' },
          ].map(stat => (
            <div key={stat.label} className="px-3 py-3 text-center">
              <p className="text-lg font-bold text-[#0F2C32]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets recientes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-[#0F2C32]" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Tickets Recientes</span>
          </div>
          <span className="text-xs text-gray-400">Ver todos</span>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { id: '#8365', motivo: 'Orden cancelada', date: 'Hoy, 11:48 PM', status: 'Abierto', statusColor: 'orange' },
            { id: '#8201', motivo: 'Consulta de envío', date: '15 Jul, 3:20 PM', status: 'Cerrado', statusColor: 'green' },
            { id: '#7988', motivo: 'Producto dañado', date: '2 Jul, 9:10 AM', status: 'Cerrado', statusColor: 'green' },
          ].map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 transition-colors group cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-gray-800">{ticket.id} · <span className="font-normal text-gray-600">{ticket.motivo}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">{ticket.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  ticket.statusColor === 'orange'
                    ? 'bg-orange-50 text-orange-600 border border-orange-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                }`}>
                  {ticket.status}
                </span>
                <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- TAB: Actividad ----
type ActivityItem = {
  id: string;
  user: string;
  userInitials: string;
  userColor: string;
  time: string;
  type: 'comment' | 'action' | 'system';
  icon?: React.ReactNode;
  title: string;
  description?: string;
};

const activityItems: ActivityItem[] = [
  {
    id: '1',
    user: 'Jhordan Medina_apx Ext',
    userInitials: 'JM',
    userColor: 'bg-blue-500',
    time: '1:45 AM',
    type: 'comment',
    title: 'Comentario',
    description: '"CS/ Rider no contactable"',
  },
  {
    id: '2',
    user: 'Jhordan Medina_apx Ext',
    userInitials: 'JM',
    userColor: 'bg-blue-500',
    time: '1:45 AM',
    type: 'action',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"/>
      </svg>
    ),
    title: 'Rechazar Orden',
    description: 'Canceló la orden debido a pedido no entregado',
  },
  {
    id: '3',
    user: 'Autocomp',
    userInitials: 'AC',
    userColor: 'bg-purple-500',
    time: '1:45 AM',
    type: 'system',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
    title: 'Compensation',
    description: 'Issued compensation ARS 3300 with voucher',
  },
  {
    id: '4',
    user: 'Sistema',
    userInitials: 'SY',
    userColor: 'bg-gray-400',
    time: '1:44 AM',
    type: 'system',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    ),
    title: 'Estado actualizado',
    description: 'Orden marcada como "nunca entregada"',
  },
  {
    id: '5',
    user: 'Jhordan Medina_apx Ext',
    userInitials: 'JM',
    userColor: 'bg-blue-500',
    time: '1:40 AM',
    type: 'comment',
    title: 'Ticket asignado',
    description: 'Caso #8365 asignado a Customer Service',
  },
];

function TabActividad() {
  const [filter, setFilter] = useState<'todos' | 'esta-orden' | 'cliente'>('todos');

  return (
    <div className="p-4">
      {/* Filtros */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'esta-orden', label: 'Esta orden' },
          { key: 'cliente', label: 'Cliente' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${
              filter === f.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-4">
          {activityItems.map((item) => (
            <div key={item.id} className="flex gap-3 relative">
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full ${item.userColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 z-10 border-2 border-white shadow-sm`}>
                {item.icon ?? item.userInitials}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-gray-800">{item.user}</span>
                    <span className="text-xs text-gray-400 ml-1">· Customer Service</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                </div>

                <div className={`mt-1.5 rounded-lg px-3 py-2 text-xs ${
                  item.type === 'comment'
                    ? 'bg-blue-50 border border-blue-100 text-gray-700'
                    : item.type === 'action'
                    ? 'bg-amber-50 border border-amber-100 text-gray-700'
                    : 'bg-gray-50 border border-gray-100 text-gray-600'
                }`}>
                  <p className="font-semibold text-gray-800 mb-0.5">{item.title}</p>
                  {item.description && <p>{item.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Indicador "hace 90 días" */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 whitespace-nowrap">Últimos 90 días</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ---- Panel principal ----
export function OrderInfoPanel({ orderCancelled = false, orderInfo }: { orderCancelled?: boolean; orderInfo?: OrderInfo }) {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('ticket');
  const isCancelled = orderCancelled;
  const rider = useRiderSimulation(isCancelled);

  // Fallback para sesiones sin bot (historial antiguo)
  const info: OrderInfo = orderInfo ?? {
    customerName: 'Verónica Sosa',
    orderNumber: '1832150046',
    partnerName: 'PhoneCorp',
    vertical: 'Darkstores',
    deliveryType: 'Platform delivery',
    paymentMethod: 'Spreedly pa, visa - debit',
    orderAmount: 'S/ 45.90',
    tags: ['los'],
    phone: '+51 987 654 321',
    email: 'v.sosa@email.com',
    deliveryPin: '4821',
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'ticket', label: 'Ticket', icon: <MessageSquare size={13} /> },
    { id: 'ordenes', label: 'Órdenes', icon: <ShoppingBag size={13} /> },
    { id: 'cliente', label: 'Cliente', icon: <User size={13} /> },
    { id: 'actividad', label: 'Actividad', icon: <Activity size={13} /> },
  ];

  return (
    <>
      {mapExpanded && (
        <MapModal
          onClose={() => setMapExpanded(false)}
          deliveryAddress="Av. Javier Prado Este 4200, Piso 3, Surco, Lima, Perú"
          pickupAddress="PhoneCorp – Av. Innovación Tecnológica N.º 123, San Isidro, Lima, Perú"
        />
      )}

      <div className="w-full bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden max-h-screen">

        {/* Header cliente */}
        <div className="bg-white border-b border-gray-200 px-4 pt-4 pb-0 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {info.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{info.customerName}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500">{info.phone}</span>
                <CopyButton text={info.phone} />
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              {/* Avatares de agentes activos (decorativo) */}
              <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">J</div>
              <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-white -ml-2 flex items-center justify-center text-white text-xs font-bold">M</div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <button
              title="Recargar"
              className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
            >
              <RefreshCw size={12} />
            </button>
            <button
              title="Ver documentos"
              className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
            >
              <FileText size={12} />
            </button>
            <button
              title="Buscar orden"
              className="flex items-center justify-center px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
            >
              <Search size={12} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors">
              <PlusSquare size={12} />
              Nuevo comentario
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F2C32] hover:bg-[#1a4a54] rounded-lg transition-colors ml-auto">
              <Check size={12} />
              Cerrar ticket
            </button>
          </div>

          {/* Resumen info orden */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 mb-3 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
            <div>
              <p className="text-xs text-gray-400">Orden</p>
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-gray-800">{info.orderNumber}</p>
                <CopyButton text={info.orderNumber} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Forma de pago</p>
              <p className="text-xs font-medium text-gray-700">{info.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado de la orden</p>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${rider.orderColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${rider.phase !== 'delivered' ? 'animate-pulse' : ''}`}
                  style={{backgroundColor:
                    rider.phase === 'delivered' ? '#16a34a' :
                    rider.phase === 'arrived' ? '#22c55e' :
                    rider.phase === 'near_dropoff' ? '#f59e0b' :
                    rider.phase === 'left_local' ? '#a855f7' :
                    rider.phase === 'at_local' ? '#f97316' :
                    '#3b82f6'
                  }}
                />
                {rider.orderLabel}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Vertical</p>
              <p className="text-xs font-medium text-gray-700">{info.vertical}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tipo de delivery</p>
              <p className="text-xs font-medium text-gray-700">{info.deliveryType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tags de la orden</p>
              <div className="flex flex-wrap gap-1">
                {info.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0 bg-gray-200 text-gray-600 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 -mx-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#0F2C32]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F2C32] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'ticket' && <TabTicket onMapExpand={() => setMapExpanded(true)} isCancelled={isCancelled} info={info} />}
          {activeTab === 'ordenes' && <TabOrdenes isCancelled={isCancelled} info={info} />}
          {activeTab === 'cliente' && <TabCliente info={info} />}
          {activeTab === 'actividad' && <TabActividad />}
        </div>

      </div>
    </>
  );
}