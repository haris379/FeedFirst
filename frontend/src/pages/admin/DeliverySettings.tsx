import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";

interface CityFee {
  city: string;
  fee: number;
}

const DeliverySettings = () => {
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(0);
  const [weightThresholdKg, setWeightThresholdKg] = useState(3);
  const [freeDeliveryThresholdKg, setFreeDeliveryThresholdKg] = useState<
    number | ""
  >("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState(0);
  const [cityFees, setCityFees] = useState<CityFee[]>([]);
  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get("/delivery/settings")
      .then((res) => {
        const s = res.data.settings;
        setBaseDeliveryFee(s.baseDeliveryFee);
        setWeightThresholdKg(s.weightThresholdKg);
        setFreeDeliveryThresholdKg(s.freeDeliveryThresholdKg ?? "");
        setMinimumOrderAmount(s.minimumOrderAmount || 0);
        setCityFees(s.cityFees || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addCityFee = () => {
    if (!newCity.trim() || newFee === "") return;
    setCityFees((prev) => [...prev, { city: newCity, fee: Number(newFee) }]);
    setNewCity("");
    setNewFee("");
  };

  const removeCityFee = (city: string) => {
    setCityFees((prev) => prev.filter((c) => c.city !== city));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/delivery/settings", {
        baseDeliveryFee,
        weightThresholdKg,
        freeDeliveryThresholdKg:
          freeDeliveryThresholdKg === ""
            ? undefined
            : Number(freeDeliveryThresholdKg),
        minimumOrderAmount,
        cityFees,
      });
      showToast("Delivery settings saved", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Delivery Settings
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Orders under the weight threshold pay the full delivery fee. Orders at
        or above the threshold pay
        <strong> half</strong> the fee, collected as an advance at checkout.
        Changing these settings only affects future orders — past orders keep
        their original totals.
      </p>

      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">
              Base Delivery Fee (Rs)
            </label>
            <input
              type="number"
              value={baseDeliveryFee}
              onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Weight Threshold (kg)
            </label>
            <input
              type="number"
              value={weightThresholdKg}
              onChange={(e) => setWeightThresholdKg(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Free Delivery Threshold (kg, optional)
            </label>
            <input
              type="number"
              value={freeDeliveryThresholdKg}
              onChange={(e) =>
                setFreeDeliveryThresholdKg(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Minimum Order Amount (Rs)
            </label>
            <input
              type="number"
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(Number(e.target.value))}
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          City-Specific Delivery Fees
        </h2>
        <div className="space-y-2 mb-4">
          {cityFees.map((c) => (
            <div
              key={c.city}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {c.city} — Rs {c.fee}
              </span>
              <button
                onClick={() => removeCityFee(c.city)}
                className="text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            placeholder="City"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300"
          />
          <input
            placeholder="Extra fee (Rs)"
            type="number"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            className="w-full sm:w-36 px-4 py-2 rounded-lg border border-gray-300"
          />
          <button
            onClick={addCityFee}
            className="px-4 py-2 rounded-lg border border-var(--color-forest) text-var(--color-forest) font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-var(--color-forest-dark) disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Delivery Settings"}
      </button>
    </div>
  );
};

export default DeliverySettings;
