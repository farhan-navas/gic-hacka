"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false)

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
              <div className="relative inline-block">
                <button
                  onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
                  className={`px-6 py-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname.startsWith("/portfolio")
                      ? "text-white"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Portfolio
                </button>

                {isPortfolioOpen && (
                  <div
                    className="absolute left-0 top-full bg-white text-black rounded-md shadow-lg w-40 z-50"
                  >
                    <Link
                      href="/portfolio"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsPortfolioOpen(false)}
                    >
                      Overview
                    </Link>
                    <Link
                      href="/portfolio/trade"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsPortfolioOpen(false)}
                    >
                      Trade
                    </Link>
                  </div>
                )}
              </div>

              {/* Reporting */}
              <Link
                href="/reporting"
                className={`relative px-6 py-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === "/reporting"
                    ? "text-white"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                Reporting
              </Link>

              {/* Compliance */}
              <Link
                href="/compliance"
                className={`relative px-6 py-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === "/compliance"
                    ? "text-white"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                Compliance
              </Link>
            </div>
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


