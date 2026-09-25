import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, X, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
// import { useTheme } from "../context/ThemeContext";
import siteIcon from "../images/siteIcon.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/customize", label: "Customize Your Feed" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

const CartIcon = () => {
  const { lines } = useCart();
  const count = lines.length;

  return (
    <Link
      to="/cart"
      className="relative flex items-center text-gray-700 dark:text-gray-200 hover:text-[var(--color-forest)] transition-colors"
      aria-label="View cart"
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-seed)] text-white text-[10px] font-bold flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
};

// const ThemeToggle = () => {
//   const { theme, toggleTheme } = useTheme();
//   return (
//     <button
//       onClick={toggleTheme}
//       aria-label="Toggle dark mode"
//       className="flex items-center justify-center w-9 h-9 rounded-full border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
//     >
//       {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
//     </button>
//   );
// };

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-navbar)]/95 backdrop-blur border-b border-[var(--color-forest)]/15 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-[var(--color-forest)]"
        >
          <span>
            <img
              src={siteIcon}
              alt="BirdFeast"
              className="w-5 h-auto object-contain"
            />
          </span>
          BirdFeast
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-200">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-[var(--color-forest)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {/* <ThemeToggle /> */}
            <CartIcon />
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="text-sm font-medium text-[var(--color-forest)] hover:underline"
                >
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : `Hi, ${user.name.split(" ")[0]}`}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-sm font-medium px-4 py-2 rounded-full border border-[var(--color-forest)] text-[var(--color-forest)] hover:bg-[var(--color-forest)] hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[var(--color-forest)]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-full bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)] transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <CartIcon />
          </div>

          <button
            className="md:hidden flex items-center justify-center w-9 h-9 text-[var(--color-forest)]"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--color-forest)]/15 px-4 pb-5 pt-2 flex flex-col gap-3 bg-[var(--color-navbar)] shadow-lg">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="py-1 text-gray-700 dark:text-gray-200"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-[var(--color-forest)]/15">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-forest)] font-medium"
                >
                  {user.role === "admin"
                    ? "Admin Dashboard"
                    : `Hi, ${user.name.split(" ")[0]}`}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-forest)] font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-forest)] font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
