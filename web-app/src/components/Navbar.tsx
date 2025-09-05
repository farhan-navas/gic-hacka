"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-900 shadow-lg border-b border-blue-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-800 font-bold text-lg">R</span>
              </div>
              <span className="text-white font-semibold text-xl">
                Risk Analytics
              </span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-8">
              {/* Portfolio Dropdown */}
              <div className="relative inline-block group">
                <button
                  className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 cursor-pointer border-none bg-transparent ${
                    pathname.startsWith("/portfolio")
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:content-['']"
                      : "text-blue-100 hover:text-white hover:bg-white/10 hover:rounded-lg"
                  }`}
                >
                  Portfolio
                </button>

                <div
                  className="absolute left-0 top-full mt-1 bg-white/95 backdrop-blur-sm text-gray-800 rounded-lg shadow-xl border border-white/20 w-36 z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                >
                  <Link
                    href="/portfolio"
                    className="block px-4 py-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                  >
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/portfolio/trade"
                    className="block px-4 py-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                  >
                    <span>Trade</span>
                  </Link>
                </div>
              </div>

              {/* Reporting */}
              <Link
                href="/reporting"
                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 cursor-pointer border-none bg-transparent ${
                  pathname === "/reporting"
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:content-['']"
                    : "text-blue-100 hover:text-white hover:bg-white/10 hover:rounded-lg"
                }`}
              >
                Reporting
              </Link>

              {/* Compliance */}
              <Link
                href="/compliance"
                className={`relative px-6 py-4 text-sm font-medium transition-all duration-200 cursor-pointer border-none bg-transparent ${
                  pathname === "/compliance"
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:content-['']"
                    : "text-blue-100 hover:text-white hover:bg-white/10 hover:rounded-lg"
                }`}
              >
                Compliance
              </Link>
            </div>
          </div>

          {/* Right Section - Actions/User */}
          <div className="flex items-center justify-end flex-1">
            {/* This container can hold user actions, settings, notifications, etc. */}
          </div>
        </div>

        {/* Mobile Navigation (simple list, no dropdown for now) */}
        <div className="md:hidden border-t border-blue-700">
          <Link
            href="/portfolio"
            className={`block px-3 py-2 text-base font-medium ${
              pathname.startsWith("/portfolio")
                ? "text-white bg-white/10"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            Portfolio
          </Link>
          <Link
            href="/portfolio/trade"
            className={`block px-6 py-2 text-sm ${
              pathname === "/portfolio/trade"
                ? "text-white bg-white/10"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            ↳ Trade
          </Link>
          <Link
            href="/reporting"
            className={`block px-3 py-2 text-base font-medium ${
              pathname === "/reporting"
                ? "text-white bg-white/10"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            Reporting
          </Link>
          <Link
            href="/compliance"
            className={`block px-3 py-2 text-base font-medium ${
              pathname === "/compliance"
                ? "text-white bg-white/10"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            Compliance
          </Link>
        </div>
      </div>
    </nav>
  )
}


