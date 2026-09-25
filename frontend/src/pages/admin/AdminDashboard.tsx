import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";

interface Stats {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  revenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data.stats));
  }, []);

  if (!stats) return <Loading label="Loading dashboard..." />;

  const cards = [
    { label: "Total Customers", value: stats.totalCustomers },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Completed Orders", value: stats.completedOrders },
    { label: "Revenue (Paid)", value: `Rs ${stats.revenue}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-black/5 p-6">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-[var(--color-forest)] mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
