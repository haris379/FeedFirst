import { Link } from "react-router-dom";
import siteIcon from "../images/siteIcon.png";

const Footer = () => (
  <footer className="bg-[var(--color-forest-dark)] text-white/90 mt-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div className="col-span-2 sm:col-span-1">
        <div className="text-xl font-bold mb-2 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-white/70"
          >
            <img
              src={siteIcon}
              alt="BirdFeast"
              className="w-5 h-auto object-contain"
            />
            BirdFeast
          </Link>
        </div>
        <p className="text-sm text-white/70 text-center">Custom Feed. Happier Birds.</p>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Explore</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <Link to="/shop" className="hover:text-white">
              Shop
            </Link>
          </li>
          <li>
            <Link to="/customize" className="hover:text-white">
              Customize Your Feed
            </Link>
          </li>
          <li>
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Company</h4>
        <ul className="space-y-2 text-sm text-white/70">
          <li>
            <Link to="/about" className="hover:text-white">
              About Us
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-white">
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
      © {new Date().getFullYear()} BirdFeast. All rights reserved.
    </div>
  </footer>
);

export default Footer;
