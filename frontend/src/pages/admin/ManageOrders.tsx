import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
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

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    api
      .get("/admin/orders", { params })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      showToast("Order status updated", "success");
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5">
          {orders.map((o) => (
            <div
              key={o._id}
              className="p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <Link
                  to={`/admin/orders/${o._id}`}
                  className="font-mono font-semibold text-gray-800 hover:underline"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-sm text-gray-500">
                  {o.user && typeof o.user === "object" ? o.user.name : ""} ·{" "}
                  {new Date(o.createdAt).toLocaleDateString()} · Rs {o.total}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.payment.status} />
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                  disabled={
                    o.payment.status !== "paid" && o.status === "pending_payment"
                  }
                  title={
                    o.payment.status !== "paid" && o.status === "pending_payment"
                      ? "Advance payment not received yet"
                      : undefined
                  }
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
