"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Menu, Search, Mic, Lock } from "lucide-react";
import { useState } from "react";

const navTabs = [
  { label: "Personal", href: "/portal", active: true },
  { label: "Business", href: "/portal/business" },
  { label: "Private Banking", href: "/portal/private" },
  { label: "International Banking", href: "/portal/international" },
];

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full">
      {/* Top Navigation Bar */}
      <div className="bg-black">
        <div className="mx-auto flex items-center">
          <nav className="flex">
            {navTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  tab.active
                    ? "bg-[#14B67A] text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#14B67A]">
        <div className="mx-auto flex items-center justify-between px-6 py-4">
          {/* Left Section - Logo and Menu */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/portal" className="flex items-center">
              <Image
                src="/lbglogo.png"
                alt="Lloyds Banking Group"
                width={180}
                height={48}
                priority
              />
            </Link>

            {/* Menu Button */}
            <button className="flex items-center gap-2 text-black hover:opacity-80">
              <Menu className="h-6 w-6" />
              <span className="text-lg font-medium">Menu</span>
            </button>
          </div>

          {/* Right Section - Search and Login */}
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="flex items-center gap-3">
              <span className="text-black font-medium">Search</span>
              <div className="flex items-center bg-white rounded-full px-4 py-2 w-80">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Switch your current account to Lloyds"
                  className="flex-1 bg-transparent px-3 text-sm text-gray-700 placeholder-gray-500 focus:outline-none"
                />
                <button className="text-gray-500 hover:text-gray-700">
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Login/User Button */}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 text-black hover:opacity-80">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Log in</span>
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
