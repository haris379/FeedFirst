import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: { city?: string };
  createdAt: string;
}

const ManageCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/users").then((res) => setCustomers(res.data.customers)).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Customers</h1>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers..."
        className="w-full sm:w-80 mb-4 px-4 py-2.5 rounded-lg border border-gray-300"
      />
      {filtered.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.address?.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
