import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import type { Order } from "../types";

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading your orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[var(--color-forest)] mb-6">
        My Orders
      </h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          subtitle="Place your first custom feed order."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/my-orders/${o._id}`}
              className="block bg-white rounded-2xl border border-black/5 p-5 hover:shadow-md transition-shadow"
            >
              {" "}
              <div className="flex justify-between mt-3 text-sm text-gray-600">
                <span>
                  {o.customFeed.birdType} · {o.customFeed.totalWeightKg} kg
                </span>
                <span className="font-semibold text-gray-800">
                  Rs {o.total}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-semibold text-gray-800">
                    {o.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <StatusBadge status={o.payment.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
