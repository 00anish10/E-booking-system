import { Link, useLocation } from "react-router";
import {
  BookOpen,
  Search,
  User,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import SearchModal from "./search_modal";

const FrontendHeader = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // cart context
  const { items } = useCart();
  const cartCount = items?.length ?? 0;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/catalog", label: "Catalog" },
    { path: "/library", label: "My Library" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className="
          sticky top-0 z-50 
          bg-[hsl(40,20%,97%)]/80 
          backdrop-blur-lg 
          border-b border-[hsl(40,15%,85%)]
        "
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="
                  p-3 rounded-xl 
                  bg-[hsl(230,45%,25%)] 
                  transition-all duration-300
                  group-hover:shadow-[0_0_25px_hsl(35,90%,65%,0.35)]
                "
              >
                <BookOpen className="h-6 w-6 text-[hsl(40,20%,97%)]" />
              </div>
              <span className="font-extrabold text-2xl text-[hsl(230,25%,15%)]">
                ReadVerse
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <div key={link.path} className="relative">
                  <Link
                    to={link.path}
                    className={`
                      text-sm font-semibold tracking-wide transition-all
                      ${
                        isActive(link.path)
                          ? "text-[hsl(230,45%,25%)]"
                          : "text-[hsl(230,15%,45%)] hover:text-[hsl(230,25%,15%)]"
                      }
                    `}
                  >
                    {link.label}
                  </Link>

                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeLink"
                      className="
                        absolute -bottom-2 left-0 right-0 
                        h-[3px] rounded-full 
                        bg-[hsl(230,45%,25%)]
                      "
                    />
                  )}
                </div>
              ))}
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-5">

              {/* SEARCH */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-3 rounded-xl hover:bg-[hsl(40,15%,90%)] transition"
              >
                <Search className="h-5 w-5 text-[hsl(230,15%,45%)]" />
              </button>

              {/* CART */}
              <Link
                to="/cart"
                className="relative p-3 rounded-xl hover:bg-[hsl(40,15%,90%)] transition"
              >
                <ShoppingCart className="h-5 w-5 text-[hsl(230,15%,45%)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* PROFILE */}
              <Link
                to="/profile"
                className="p-3 rounded-xl hover:bg-[hsl(40,15%,90%)] transition"
              >
                <User className="h-5 w-5 text-[hsl(230,15%,45%)]" />
              </Link>

              {/* SIGN IN */}
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-[hsl(230,45%,25%)] text-white font-semibold hover:opacity-90"
              >
                Sign In
              </Link>
            </div>

            {/* MOBILE MENU TOGGLE */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[hsl(40,15%,90%)]"
            >
              {mobileMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[hsl(40,20%,97%)] border-t"
            >
              <div className="px-6 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold hover:bg-[hsl(40,15%,90%)]"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[hsl(40,15%,90%)]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cartCount})
                </Link>

                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl bg-[hsl(230,45%,25%)] text-white text-center font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default FrontendHeader;
