import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/delivery", label: "Delivery Settings" },
  { to: "/admin/profile", label: "Profile" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[var(--color-forest-dark)] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 text-lg font-bold border-b border-white/10">🌾 BirdFeast Admin</div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-sm">
          <p className="text-white/60 mb-2 truncate">{user?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-red-300 hover:text-red-200 font-medium"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <main className="p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
