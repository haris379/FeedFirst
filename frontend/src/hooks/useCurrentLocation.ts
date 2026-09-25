import { useRef, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

export interface DetectedAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  precise?: boolean;
  displayAddress?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Wraps the browser Geolocation API + the backend reverse-geocode endpoint,
 * and also exposes a way to re-geocode an arbitrary point (used when the
 * customer drags the map pin to correct an imprecise GPS/geocoding result).
 * Deliberately returns only data + trigger functions — it never touches any
 * form state itself, so callers (Checkout.tsx) wire the result into their
 * existing react-hook-form via setValue().
 */
export const useCurrentLocation = (onDetected: (address: DetectedAddress) => void) => {
  const [detecting, setDetecting] = useState(false); // initial GPS fix + geocode
  const [refining, setRefining] = useState(false); // pin-drag re-geocode
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const { showToast } = useToast();
  const inFlight = useRef(false); // belt-and-braces guard against double-clicks

  const geocodeAndFill = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    try {
      const res = await api.get("/geocode/reverse", { params: { lat, lon: lng } });
      const address: DetectedAddress = res.data.address || {};

      if (!address.street && !address.city && !address.postalCode) {
        showToast("No address details found for this exact spot — try dragging the pin slightly.", "error");
        return;
      }

      onDetected(address);
      showToast(
        address.precise
          ? "📍 Location detected — please review below"
          : "📍 Approximate area found — drag the pin on the map to your exact door",
        "success"
      );
    } catch (err: any) {
      showToast(err.message || "Could not look up this location. Please try again.", "error");
    }
  };

  const detectLocation = () => {
    if (inFlight.current) return;

    if (!("geolocation" in navigator)) {
      showToast("Location detection is not supported by this browser. Please enter your address manually.", "error");
      return;
    }

    inFlight.current = true;
    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await geocodeAndFill(position.coords.latitude, position.coords.longitude);
        inFlight.current = false;
        setDetecting(false);
      },
      (error) => {
        inFlight.current = false;
        setDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          showToast("We couldn't access your location. Please allow location access or enter your address manually.", "error");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          showToast("Your location could not be detected. Please try again or enter your address manually.", "error");
        } else if (error.code === error.TIMEOUT) {
          showToast("Location detection took too long. Please try again or enter your address manually.", "error");
        } else {
          showToast("Could not detect your location. Please enter your address manually.", "error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Called when the customer drags the pin or clicks a new spot on the map.
  const movePin = async (lat: number, lng: number) => {
    setRefining(true);
    await geocodeAndFill(lat, lng);
    setRefining(false);
  };

  const resetLocation = () => setCoords(null);

  return { detecting, refining, coords, detectLocation, movePin, resetLocation };
};