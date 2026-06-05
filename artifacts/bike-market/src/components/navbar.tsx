import { Link, useLocation } from "wouter";
import { Show, useUser, useClerk } from "@clerk/react";
import { PlusCircle, SlidersHorizontal, Bike, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FilterDrawer from "@/components/filter-drawer";

export default function Navbar() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left side — actions */}
            <div className="flex items-center gap-2">
              {/* Filter button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-700 hover:border-primary hover:text-primary font-semibold"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                فرز
              </Button>

              {/* Browse bikes button */}
              <Link href="/listings">
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <Bike className="w-4 h-4" />
                  عرض الدراجة
                </Button>
              </Link>

              {/* Divider */}
              <span className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

              {/* Auth */}
              <Show when="signed-out">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500 hover:text-primary hidden sm:flex">
                    <LogIn className="w-4 h-4" />
                    دخول
                  </Button>
                </Link>
              </Show>
              <Show when="signed-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-400 hover:text-red-500 hidden sm:flex"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">خروج</span>
                </Button>
              </Show>

              {/* Sell button */}
              <Link href="/sell">
                <Button size="sm" className="gap-1.5 bg-[#0D1B35] hover:bg-[#1a2d55] text-white font-semibold px-3 sm:px-4">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">بيع دراجتك</span>
                </Button>
              </Link>
            </div>

            {/* Right side — logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img src="/logo.svg" alt="Ride IQ" className="h-9 w-auto" />
            </Link>
          </div>
        </div>
      </nav>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
}
