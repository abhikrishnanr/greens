import { FiShoppingCart, FiUser, FiPhone } from "react-icons/fi";
import { FaCut } from "react-icons/fa";

export default function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="sticky top-0 z-50 bg-[#03150d] bg-opacity-98 shadow flex items-center justify-between px-3 py-2">
      <a href="/" className="flex items-center">
        {/* Logo image */}
        <img src="/logo.png" alt="Greens Beauty Salon Logo" className="w-auto h-11" />
      </a>
      <div className="flex items-center gap-3">
        {/* Call button */}
        <a
          href="tel:+918891467678"
          className="flex items-center gap-1 bg-[#052b1e] hover:bg-primary/10 px-3 py-2 rounded-full text-green-100 font-medium shadow transition"
        >
          <FiPhone className="text-lg" /> Call
        </a>
        {/* Cart icon */}
        <a href="/cart" className="relative">
          <FiShoppingCart className="text-2xl text-primary" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-yellow-400 text-black rounded-full px-1 font-bold">
              {cartCount}
            </span>
          )}
        </a>
      </div>
    </header>
  );
}
