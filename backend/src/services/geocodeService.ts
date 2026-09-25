// Reverse geocoding — converts GPS coordinates into a street address.
//
// Provider: OpenStreetMap Nominatim (https://nominatim.org). Chosen because
// it needs no API key at all, which keeps local setup and this demo simple.
// It's called from the backend (not the browser) for two reasons:
//   1. Nominatim's usage policy asks for a real identifying User-Agent
//      header, which browsers refuse to let JS override — only a server
//      can set this properly.
//   2. It keeps the provider swappable later (Google/Mapbox/LocationIQ etc.)
//      without ever touching the frontend — only this file would change,
//      and a paid provider's secret key would stay safely server-side in
//      GEOCODING_API_KEY, never shipped to the browser.
export interface ReverseGeocodeResult {
  street?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  precise: boolean; // true only when a specific house number was found
  displayAddress?: string; // full human-readable address, for reference
}

export const reverseGeocode = async (
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult> => {
  const userAgent =
    process.env.GEOCODING_USER_AGENT || "BirdFeast/1.0 (contact@birdfeast.com)";
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding provider responded with ${response.status}`);
  }

  const data: any = await response.json();
  const addr = data?.address || {};

  // Nominatim splits "street" into house_number + road; combine what's
  // actually present rather than assuming both exist.
  const street = [addr.house_number, addr.road]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    street:
      street || addr.road || addr.suburb || addr.neighbourhood || undefined,
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      undefined,
    postalCode: addr.postcode || undefined,
    state: addr.state || undefined,
    country: addr.country || undefined,
    precise: Boolean(addr.house_number),
    displayAddress: data.display_name || undefined,
  };
};
