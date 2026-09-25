import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../context/ToastContext";
import type { Order } from "../../types";

const statuses = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data.order);
      setAdminNotes(res.data.order.adminNotes || "");
    });
  };

  useEffect(load, [id]);

  if (!order) return <Loading />;

  const updateStatus = async (status: string) => {
    await api.put(`/admin/orders/${order._id}/status`, { status });
    showToast("Status updated", "success");
    load();
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { adminNotes });
      showToast("Notes saved", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const customerName = typeof order.user === "object" ? order.user.name : "";
  const customerEmail = typeof order.user === "object" ? order.user.email : "";

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/orders"
        className="text-sm text-[var(--color-forest)] hover:underline"
      >
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-mono">
          {order.orderNumber}
        </h1>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.payment.status} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">Customer</h2>
        <p className="text-sm text-gray-600">
          {customerName} · {customerEmail}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          Custom Feed — {order.customFeed.birdType}
        </h2>
        <ul className="divide-y divide-black/5">
          {order.customFeed.ingredients.map((i, idx) => (
            <li
              key={idx}
              className="flex justify-between py-2 text-sm text-gray-600"
            >
              <span>
                {i.name} · {i.quantity} {i.unit}
              </span>
              <span>Rs {i.lineTotal}</span>
            </li>
          ))}
        </ul>
        {order.customFeed.specialInstructions && (
          <p className="text-sm text-gray-500 mt-3 italic">
            "{order.customFeed.specialInstructions}"
          </p>
        )}
        <div className="border-t border-black/5 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rs {order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>Rs {order.deliveryFee}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800">
            <span>Total</span>
            <span>Rs {order.total}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Advance Paid</span>
            <span>Rs {order.advancePaid}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-2">Delivery Address</h2>
        <p className="text-sm text-gray-600">
          {order.deliveryAddress.fullName}
        </p>
        <p className="text-sm text-gray-600">
          {order.deliveryAddress.street}, {order.deliveryAddress.city}{" "}
          {order.deliveryAddress.postalCode}
        </p>
        <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">
          Update Order Status
        </h2>
        <select
          value={order.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold text-gray-800 mb-3">Admin Notes</h2>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          className="mt-3 px-5 py-2.5 rounded-lg bg-[var(--color-forest)] text-white font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Notes"}
        </button>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
