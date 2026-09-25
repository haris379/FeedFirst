import { Request, Response } from "express";
import Address from "../models/Address";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

// Every query below is scoped to `req.user!.id` (from the JWT via the
// `protect` middleware) — never to an id supplied by the client. That's
// what makes it impossible for a user to read/edit/delete another user's
// address by guessing or changing an address id in the request.

export const getAddresses = asyncHandler(
  async (req: Request, res: Response) => {
    const addresses = await Address.find({ user: req.user!.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json({ success: true, addresses });
  },
);

export const createAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      label,
      fullName,
      email,
      phone,
      street,
      city,
      postalCode,
      deliveryInstructions,
      isDefault,
    } = req.body;
    if (!fullName || !email || !phone || !street || !city || !postalCode) {
      throw new ApiError(
        400,
        "Full name, email, phone, street, city, and postal code are required",
      );
    }

    const existingCount = await Address.countDocuments({ user: req.user!.id });
    const shouldBeDefault = Boolean(isDefault) || existingCount === 0; // a user's first saved address is always their default

    if (shouldBeDefault) {
      await Address.updateMany(
        { user: req.user!.id },
        { $set: { isDefault: false } },
      );
    }

    const address = await Address.create({
      user: req.user!.id,
      label,
      fullName,
      email,
      phone,
      street,
      city,
      postalCode,
      deliveryInstructions,
      isDefault: shouldBeDefault,
    });

    res.status(201).json({ success: true, address });
  },
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!address) throw new ApiError(404, "Address not found");

    const {
      label,
      fullName,
      email,
      phone,
      street,
      city,
      postalCode,
      deliveryInstructions,
      isDefault,
    } = req.body;

    if (isDefault === true) {
      await Address.updateMany(
        { user: req.user!.id },
        { $set: { isDefault: false } },
      );
    }

    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (email !== undefined) address.email = email;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (deliveryInstructions !== undefined)
      address.deliveryInstructions = deliveryInstructions;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();
    res.json({ success: true, address });
  },
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!address) throw new ApiError(404, "Address not found");

    // If the deleted address was the default, promote the most recently
    // added remaining address so the user always has a default once they
    // have at least one saved address.
    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user!.id }).sort({
        createdAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    res.json({ success: true, message: "Address deleted" });
  },
);

export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!address) throw new ApiError(404, "Address not found");

    await Address.updateMany(
      { user: req.user!.id },
      { $set: { isDefault: false } },
    );
    address.isDefault = true;
    await address.save();

    res.json({ success: true, address });
  },
);
