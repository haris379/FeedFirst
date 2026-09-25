import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
const PublicLayout = () => {
  const { user } = useAuth();

  // Once logged in as admin, the customer-facing storefront (Home, Shop,
  // Customize, Cart, etc.) is off-limits — always land back on the admin
  // panel, whether they navigate here, refresh, or open a brand new tab.
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
