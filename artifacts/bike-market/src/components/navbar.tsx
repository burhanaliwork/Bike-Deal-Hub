import { Link } from "wouter";
import { Search, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FilterDrawer from "@/components/filter-drawer";
import { useAccountAuth } from "@/lib/accountAuth";

export default function Navbar() {
  const [filterOpen, setFilterOpen] = useState(false);
  const account = useAccountAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left side — actions */}
            <div className="flex items-center gap-2">
              {/* Search / filter button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-gray-200 text-gray-700 hover:border-primary hover:text-primary font-semibold transition-all duration-300 ease-out"
                onClick={() => setFilterOpen(true)}
              >
                <Search className="w-4 h-4" />
                فلتر
              </Button>

              {/* Add listing button */}
              <Link href="/sell">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 transition-all duration-300 ease-out">
                  بيع دراجتك
                </Button>
              </Link>

              {/* Dashboard link for logged-in accounts */}
              {account && (
                <Link href={account.role === "admin" ? "/admin" : "/showroom"}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    لوحة التحكم
                  </Button>
                </Link>
              )}
            </div>

            {/* Right side — logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img src="/logo.png" alt="Motorsby" className="h-10 w-auto" />
            </Link>
          </div>
        </div>
      </nav>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} />
    </>
  );
}
