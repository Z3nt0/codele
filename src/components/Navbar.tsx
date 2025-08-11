"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthModal } from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="px-4 py-3 border-b flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-extrabold tracking-wide text-primary"
      >
        Codele
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/leaderboard"
          className="hover:text-primary transition-colors"
        >
          Leaderboard
        </Link>
        <AuthModal />
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-0 w-full bg-white dark:bg-gray-900 border-b shadow-md md:hidden z-50"
          >
            <div className="flex flex-col items-center space-y-4 py-4">
              <Link
                href="/leaderboard"
                className="hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <AuthModal />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
