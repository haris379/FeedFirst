import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import type { Order } from "../types";

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data.orders.slice(0, 3)));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-var(--color-forest) mb-1">
        Welcome back, {user?.name.split(" ")[0]}
      </h1>
      <p className="text-gray-500 mb-8">Here's a quick look at your account.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/customize"
          className="bg-white rounded-2xl border border-black/5 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">🧑‍🌾</div>
          <p className="font-semibold text-gray-800">Customize Feed</p>
        </Link>
        <Link
          to="/my-orders"
          className="bg-white rounded-2xl border border-black/5 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">📦</div>
          <p className="font-semibold text-gray-800">My Orders</p>
        </Link>
        <Link
          to="/profile"
          className="bg-white rounded-2xl border border-black/5 p-5 hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-2">👤</div>
          <p className="font-semibold text-gray-800">Edit Profile</p>
        </Link>
      </div>

      <h2 className="font-semibold text-gray-800 mb-3">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/my-orders/${o._id}`}
              className="flex justify-between items-center bg-white rounded-xl border border-black/5 p-4"
            >
              <span className="font-mono text-sm">{o.orderNumber}</span>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
