
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import LocationPickerMap from "../components/LocationPickerMap";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import type { PricingResult, Address } from "../types";

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  deliveryInstructions: string;
  customerNotes: string;
}

interface DeliveryAddressPayload {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
}

const paymentMethods = [
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "Easypaisa" },
  { id: "bank_transfer", label: "Bank Transfer" },
  { id: "card", label: "Card" },
  { id: "cod", label: "Cash on Delivery" },
];

const Checkout = () => {
  const { user } = useAuth();
  const { birdType, lines, specialInstructions, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [method, setMethod] = useState("jazzcash");
  const [submitting, setSubmitting] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | "new" | null
  >(null);

  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [makeDefault, setMakeDefault] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [paymentOption, setPaymentOption] = useState<
    "delivery_advance" | "full_amount"
  >("delivery_advance");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const formCity = watch("city");
  const [locationDetected, setLocationDetected] = useState(false);
  const [locationImprecise, setLocationImprecise] = useState(false);

  const {
    detecting,
    refining,
    coords,
    detectLocation,
    movePin,
    resetLocation,
  } = useCurrentLocation((address) => {
    if (address.street) {
      setValue("street", address.street, { shouldValidate: true });
    }

    if (address.city) {
      setValue("city", address.city, { shouldValidate: true });
    }

    if (address.postalCode) {
      setValue("postalCode", address.postalCode, {
        shouldValidate: true,
      });
    }

    setLocationDetected(true);
    setLocationImprecise(!address.precise);
  });

  useEffect(() => {
    if (!user) return;

    api
      .get("/address")
      .then((res) => {
        const list: Address[] = res.data.addresses;
        setAddresses(list);

        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def._id);
        } else {
          setSelectedAddressId("new");
        }
      })
      .catch(() => showToast("Could not load your saved addresses", "error"))
      .finally(() => setAddressesLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectedSavedAddress = addresses.find(
    (a) => a._id === selectedAddressId,
  );

  const showingNewAddressForm = selectedAddressId === "new";

  const effectiveCity = showingNewAddressForm
    ? formCity
    : selectedSavedAddress?.city;

  useEffect(() => {
    if (lines.length === 0) return;

    api
      .post("/orders/quote", {
        ingredients: lines.map((l) => ({
          productId: l.product._id,
          quantity: l.quantity,
        })),
        city: effectiveCity,
        paymentOption,
      })
      .then((res) => setPricing(res.data.pricing))
      .catch((err: any) => {
        showToast(err.message || "Could not calculate order total", "error");
      });
  }, [lines, effectiveCity, paymentOption]);

  if (!user) {
    return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  }

  if (lines.length === 0 && !orderPlaced) {
    return <Navigate to="/customize" replace />;
  }

  const placeOrder = async (
    deliveryAddress: DeliveryAddressPayload,
    customerNotes?: string,
  ) => {
    try {
      const res = await api.post("/orders", {
        birdType,
        ingredients: lines.map((l) => ({
          product: l.product._id,
          quantity: l.quantity,
        })),
        specialInstructions,
        deliveryAddress,
        paymentMethod: method,
        paymentOption,
        customerNotes,
      });

      setOrderPlaced(true);
      clearCart();

      showToast("Order placed successfully!", "success");
      navigate(`/order-confirmation/${res.data.order._id}`);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitNewAddress = async (data: CheckoutForm) => {
    let deliveryAddress: DeliveryAddressPayload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      street: data.street,
      city: data.city,
      postalCode: data.postalCode,
      deliveryInstructions: data.deliveryInstructions,
    };

    if (saveNewAddress) {
      try {
        const res = await api.post("/address", {
          ...deliveryAddress,
          isDefault: makeDefault,
        });

        deliveryAddress = res.data.address;
        showToast("Address saved to your account", "success");
      } catch (err: any) {
        showToast(err.message, "error");
        setSubmitting(false);
        return;
      }
    }

    await placeOrder(deliveryAddress, data.customerNotes);
  };

  const handlePlaceOrder = () => {
    if (!pricing) {
      showToast("Please wait while your order total is calculated", "error");
      return;
    }

    setSubmitting(true);

    if (!showingNewAddressForm) {
      if (!selectedSavedAddress) {
        showToast("Please select a delivery address", "error");
        setSubmitting(false);
        return;
      }

      const {
        fullName,
        email,
        phone,
        street,
        city,
        postalCode,
        deliveryInstructions,
      } = selectedSavedAddress;

      placeOrder(
        {
          fullName,
          email,
          phone,
          street,
          city,
          postalCode,
          deliveryInstructions,
        },
        getValues("customerNotes"),
      );
    } else {
      handleSubmit(onSubmitNewAddress, () => setSubmitting(false))();
    }
  };

  const startNewAddress = () => {
    setSelectedAddressId("new");
    setLocationDetected(false);
    setLocationImprecise(false);
    resetLocation();

    reset({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      street: "",
      city: "",
      postalCode: "",
      deliveryInstructions: "",
      customerNotes: getValues("customerNotes"),
    });
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;

    try {
      await api.delete(`/address/${id}`);

      const updated = addresses.filter((a) => a._id !== id);
      setAddresses(updated);

      if (selectedAddressId === id) {
        setSelectedAddressId(
          updated.length > 0
            ? (updated.find((a) => a.isDefault) || updated[0])._id
            : "new",
        );
      }

      showToast("Address deleted", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await api.patch(`/address/${id}/default`);

      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a._id === id })),
      );

      showToast("Default address updated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const inputClass =
    "w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-seed)]/40 transition-colors";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="lg:col-span-2 space-y-6"
      >
        <h1 className="text-3xl font-bold text-[var(--color-forest)] dark:text-[var(--color-leaf)]">
          Checkout
        </h1>

        {/* Delivery address */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/10 p-6 space-y-4 shadow-sm dark:shadow-black/20">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            Delivery Address
          </h2>

          {addressesLoading ? (
            <Loading label="Loading your addresses..." />
          ) : (
            <>
              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((a) => {
                    const selected = selectedAddressId === a._id;

                    return (
                      <div
                        key={a._id}
                        onClick={() => setSelectedAddressId(a._id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                          selected
                            ? "border-[var(--color-seed)] bg-[var(--color-seed)]/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${
                                selected
                                  ? "border-[var(--color-seed)] bg-[var(--color-seed)] text-white"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {selected && "✓"}
                            </span>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  {a.label || "Address"}
                                </p>

                                {a.isDefault && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-seed)]/15 text-[var(--color-seed)]">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {a.fullName}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {a.phone}
                              </p>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {a.street}, {a.city} {a.postalCode}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {!a.isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDefaultAddress(a._id);
                                }}
                                className="text-xs text-[var(--color-seed)] hover:underline whitespace-nowrap"
                              >
                                Set as Default
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(a._id);
                              }}
                              className="text-xs text-red-500 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={startNewAddress}
                className={`w-full text-left rounded-xl border-2 border-dashed p-4 text-sm font-medium transition-colors ${
                  showingNewAddressForm
                    ? "border-[var(--color-seed)] text-[var(--color-seed)]"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                + Add New Address
              </button>
            </>
          )}

          {!addressesLoading && showingNewAddressForm && (
            <div className="pt-2 space-y-4 border-t border-black/5 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detecting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--color-seed)] text-[var(--color-seed)] text-sm font-semibold hover:bg-[var(--color-seed)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  📍{" "}
                  {detecting
                    ? "Getting your location..."
                    : "Use My Current Location"}
                </button>

                {locationDetected && !detecting && (
                  <span
                    className={`text-xs font-medium ${
                      locationImprecise
                        ? "text-[var(--color-seed)]"
                        : "text-[var(--color-leaf)]"
                    }`}
                  >
                    {locationImprecise
                      ? "📍 Approximate area found — drag the pin below to your exact door"
                      : "✓ Location detected — please review below"}
                  </span>
                )}
              </div>

              {coords && (
                <div>
                  <LocationPickerMap
                    lat={coords.lat}
                    lng={coords.lng}
                    onMove={movePin}
                  />

                  <p className="text-xs text-gray-400 mt-1.5">
                    {refining
                      ? "Updating address for this spot..."
                      : "Drag the pin or tap the map to fine-tune your exact location."}
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    {...register("fullName", { required: true })}
                    className={inputClass}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      Full name is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    {...register("email", { required: true })}
                    className={inputClass}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      Email is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    {...register("phone", { required: true })}
                    className={inputClass}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                      Phone is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    City
                  </label>
                  <input
                    {...register("city", { required: true })}
                    className={inputClass}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      City is required
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Street Address
                  </label>
                  <input
                    {...register("street", { required: true })}
                    className={inputClass}
                  />
                  {errors.street && (
                    <p className="text-xs text-red-500 mt-1">
                      Street address is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Postal Code
                  </label>
                  <input
                    {...register("postalCode", { required: true })}
                    className={inputClass}
                  />
                  {errors.postalCode && (
                    <p className="text-xs text-red-500 mt-1">
                      Postal code is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Delivery Instructions
                  </label>
                  <input
                    {...register("deliveryInstructions")}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/10">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                  />
                  Save this address for future orders
                </label>

                {saveNewAddress && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 pl-6">
                    <input
                      type="checkbox"
                      checked={makeDefault}
                      onChange={(e) => setMakeDefault(e.target.checked)}
                    />
                    Make this my default address
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Order Notes
            </label>

            <textarea
              {...register("customerNotes")}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        {/* Payment method and payment amount selection */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/10 p-6 shadow-sm dark:shadow-black/20">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Payment Method
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paymentMethods.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                  method === m.id
                    ? "border-[var(--color-seed)] bg-[var(--color-seed)]/10 text-[var(--color-seed)]"
                    : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            This is a demo/test payment flow — no real transaction is processed.
          </p>

          <div className="mt-6 border-t border-black/5 dark:border-white/10 pt-5 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100">
              Payment Amount
            </h2>

            <label
              className={`flex gap-3 items-start rounded-xl border p-4 cursor-pointer transition-colors ${
                paymentOption === "delivery_advance"
                  ? "border-[var(--color-seed)] bg-[var(--color-seed)]/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                checked={paymentOption === "delivery_advance"}
                onChange={() => setPaymentOption("delivery_advance")}
                className="mt-1 accent-[var(--color-seed)]"
              />

              <span>
                <strong className="block text-gray-800 dark:text-gray-100">
                  Pay Delivery Charges Only
                </strong>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {pricing?.advanceRequired ? (
                    <>
                      Pay Rs {pricing.advanceRequired} now. Pay the remaining
                      balance later.
                    </>
                  ) : (
                    <>
                      Nothing to pay now — the full amount is due on delivery.
                    </>
                  )}
                </span>
              </span>
            </label>

            <label
              className={`flex gap-3 items-start rounded-xl border p-4 cursor-pointer transition-colors ${
                paymentOption === "full_amount"
                  ? "border-[var(--color-seed)] bg-[var(--color-seed)]/10"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                checked={paymentOption === "full_amount"}
                onChange={() => setPaymentOption("full_amount")}
                className="mt-1 accent-[var(--color-seed)]"
              />

              <span>
                <strong className="block text-gray-800 dark:text-gray-100">
                  Pay Full Amount
                </strong>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Pay the complete order total of Rs {pricing?.total ?? 0},
                  including delivery, now.
                </span>
              </span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={submitting || addressesLoading || !pricing}
          className="w-full py-3.5 rounded-full bg-[var(--color-seed)] text-white font-semibold hover:bg-[var(--color-seed)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Order summary */}
      <aside className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/10 p-6 h-fit sticky top-24 shadow-sm dark:shadow-black/20">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">
          Order Summary
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Customized Feed — {birdType}
        </p>

        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
          {lines.map((l) => (
            <li key={l.product._id} className="flex justify-between">
              <span>{l.product.name}</span>
              <span>
                {l.quantity} {l.product.unit}
              </span>
            </li>
          ))}
        </ul>

        {pricing && (
          <div className="border-t border-black/5 dark:border-white/10 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Feed Total</span>
              <span>Rs {pricing.subtotal}</span>
            </div>

            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Fee</span>
              <span>Rs {pricing.deliveryFee}</span>
            </div>

            <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 text-base pt-2 border-t border-black/5 dark:border-white/10">
              <span>Grand Total</span>
              <span>Rs {pricing.total}</span>
            </div>

            <div className="mt-3 bg-[var(--color-seed)]/10 text-[var(--color-seed)] rounded-lg p-3 text-xs font-medium">
              {paymentOption === "full_amount" ? (
                <>
                  The full amount of Rs {pricing.total}, including delivery,
                  will be paid in advance.
                </>
              ) : pricing.advanceRequired > 0 ? (
                <>
                  Because your feed is made to order, Rs{" "}
                  {pricing.advanceRequired} of the delivery fee is collected in
                  advance now.
                </>
              ) : (
                <>
                  No advance is required — the full amount is due on delivery.
                </>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Checkout;