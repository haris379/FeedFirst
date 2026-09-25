import { Request, Response } from "express";
import { reverseGeocode } from "../services/geocodeService";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

export const reverseGeocodeHandler = asyncHandler(async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new ApiError(400, "Valid lat and lon query parameters are required");
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new ApiError(400, "Coordinates out of range");
  }

  try {
    const address = await reverseGeocode(lat, lon);
    res.json({ success: true, address });
  } catch (err) {
    // Never leak the raw provider error to the client — log it server-side
    // and surface a friendly, generic message instead.
    console.error("Reverse geocoding failed:", err);
    throw new ApiError(502, "Could not determine an address for this location. Please enter it manually.");
  }
});