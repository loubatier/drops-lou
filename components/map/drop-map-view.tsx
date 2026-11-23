"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { isInZone, ZONE_CENTER, ZONE_RADIUS_M, type LatLng } from "@/lib/map";
import { cn } from "@/lib/utils";

export type MapPin = { id: number; lat: number; lng: number; title: string };

export type DropMapProps = {
  label: string;
  pins?: MapPin[];
  highlightedId?: number | null;
  onPinHover?: (id: number | null) => void;
  onPinClick?: (id: number) => void;
  selectable?: boolean;
  value?: LatLng | null;
  onSelect?: (position: LatLng) => void;
  onOutOfZone?: () => void;
  scrollWheelZoom?: boolean;
  className?: string;
};

const PIN_SVG =
  '<svg viewBox="0 0 24 32" width="28" height="38" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.5"/></svg>';

const ACTIVE_CLASS = "drop-pin--active";

function createPinIcon(active: boolean) {
  return L.divIcon({
    className: cn("drop-pin", active && ACTIVE_CLASS),
    html: `<div class="drop-pin-inner">${PIN_SVG}</div>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    tooltipAnchor: [0, -34],
  });
}

function tooltipContent(title: string) {
  const el = document.createElement("span");
  el.textContent = title;
  return el;
}

export function DropMapView({
  label,
  pins = [],
  highlightedId = null,
  onPinHover,
  onPinClick,
  selectable = false,
  value = null,
  onSelect,
  onOutOfZone,
  scrollWheelZoom = true,
  className,
}: DropMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef(new Map<number, L.Marker>());
  const pickedRef = useRef<L.Marker | null>(null);
  const fittedKeyRef = useRef<string | null>(null);
  const centeredOnValueRef = useRef(false);
  const valueRef = useRef(value);
  const highlightedRef = useRef(highlightedId);
  const handlersRef = useRef({
    onPinHover,
    onPinClick,
    onSelect,
    onOutOfZone,
    selectable,
    scrollWheelZoom,
  });

  useEffect(() => {
    handlersRef.current = {
      onPinHover,
      onPinClick,
      onSelect,
      onOutOfZone,
      selectable,
      scrollWheelZoom,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const { selectable: pick, scrollWheelZoom: wheel } = handlersRef.current;

    const map = L.map(container, {
      center: [ZONE_CENTER.lat, ZONE_CENTER.lng],
      zoom: 14,
      scrollWheelZoom: wheel,
      minZoom: 12,
    });
    container.focus = (options?: FocusOptions) =>
      HTMLElement.prototype.focus.call(container, {
        ...options,
        preventScroll: true,
      });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    if (pick) {
      const zone = L.circle([ZONE_CENTER.lat, ZONE_CENTER.lng], {
        radius: ZONE_RADIUS_M,
        color: "#2563eb",
        weight: 2,
        dashArray: "6 6",
        fillOpacity: 0.05,
        interactive: false,
      }).addTo(map);
      map.setMaxBounds(zone.getBounds().pad(0.3));
      map.on("click", (event: L.LeafletMouseEvent) => {
        const position = { lat: event.latlng.lat, lng: event.latlng.lng };
        if (isInZone(position)) handlersRef.current.onSelect?.(position);
        else handlersRef.current.onOutOfZone?.();
      });
      container.classList.add("drop-map--selectable");
    }

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    mapRef.current = map;
    const markers = markersRef.current;

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markers.clear();
      pickedRef.current = null;
      fittedKeyRef.current = null;
      centeredOnValueRef.current = false;
    };
  }, []);

  useEffect(() => {
    highlightedRef.current = highlightedId;
    markersRef.current.forEach((marker, id) => {
      const active = id === highlightedId;
      marker.getElement()?.classList.toggle(ACTIVE_CLASS, active);
      marker.setZIndexOffset(active ? 1000 : 0);
    });
  }, [highlightedId, pins]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    markers.forEach((marker) => marker.remove());
    markers.clear();

    for (const pin of pins) {
      const active = pin.id === highlightedRef.current;
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createPinIcon(active),
        alt: pin.title,
        zIndexOffset: active ? 1000 : 0,
      })
        .bindTooltip(tooltipContent(pin.title), { direction: "top" })
        .on("mouseover", () => handlersRef.current.onPinHover?.(pin.id))
        .on("mouseout", () => handlersRef.current.onPinHover?.(null))
        .on("click", () => handlersRef.current.onPinClick?.(pin.id))
        .addTo(map);
      markers.set(pin.id, marker);
    }

    if (handlersRef.current.selectable || pins.length === 0) return;
    const key = pins.map((pin) => `${pin.id}:${pin.lat}:${pin.lng}`).join("|");
    if (key === fittedKeyRef.current) return;
    fittedKeyRef.current = key;
    map.fitBounds(
      L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng] as [number, number])),
      { padding: [48, 48], maxZoom: 16, animate: false },
    );
  }, [pins]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      valueRef.current = null;
      pickedRef.current?.remove();
      pickedRef.current = null;
      return;
    }
    valueRef.current = value;
    const latlng: L.LatLngTuple = [value.lat, value.lng];
    if (pickedRef.current) {
      pickedRef.current.setLatLng(latlng);
    } else {
      const picked = L.marker(latlng, {
        icon: createPinIcon(true),
        draggable: handlersRef.current.selectable,
        interactive: handlersRef.current.selectable,
        keyboard: false,
      }).addTo(map);
      picked.on("dragend", () => {
        const { lat, lng } = picked.getLatLng();
        const position = { lat, lng };
        if (isInZone(position)) {
          valueRef.current = position;
          handlersRef.current.onSelect?.(position);
        } else {
          const previous = valueRef.current;
          if (previous) picked.setLatLng([previous.lat, previous.lng]);
          handlersRef.current.onOutOfZone?.();
        }
      });
      pickedRef.current = picked;
    }
    if (!centeredOnValueRef.current) {
      centeredOnValueRef.current = true;
      map.setView(latlng, Math.max(map.getZoom(), 16), { animate: false });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label={label}
      className={cn("relative isolate z-0 size-full", className)}
    />
  );
}
