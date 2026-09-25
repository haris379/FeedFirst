import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onMove: (lat: number, lng: number) => void;
}

// A simple inline pin avoids Leaflet's default marker image paths, which
// don't resolve correctly under Vite's bundler without extra asset config.
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:32px;line-height:1;transform:translate(-50%,-100%);filter:drop-shadow(0 2px 2px rgba(0,0,0,0.35))">📍</div>`,
  iconSize: [0, 0],
});

// react-leaflet's MapContainer only applies `center` on first mount — this
// re-centers the map whenever the coordinates change afterwards (e.g. the
// customer clicks "Use My Current Location" again after already dragging).
const RecenterOnChange = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 16));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
};

const ClickToPlace = ({
  onMove,
}: {
  onMove: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * A small draggable-pin map for fine-tuning a delivery location without
 * typing an address. Drag the pin, or tap anywhere on the map, and the
 * caller's onMove(lat, lng) is called so it can re-run reverse geocoding.
 */
const LocationPickerMap = ({ lat, lng, onMove }: LocationPickerMapProps) => {
  const markerRef = useRef<L.Marker>(null);

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ height: 260 }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const marker = markerRef.current;
              if (marker) {
                const pos = marker.getLatLng();
                onMove(pos.lat, pos.lng);
              }
            },
          }}
        />
        <ClickToPlace onMove={onMove} />
        <RecenterOnChange lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
