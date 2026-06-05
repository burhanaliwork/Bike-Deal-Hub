import { Link, useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import { PlusCircle, LayoutDashboard, List, LogIn, UserPlus, LogOut, Menu, X, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();
  const isAdmin = (user?.publicMetadata as any)?.role === "admin";

  const navLinks = [
    { href: "/listings", label: "تصفح الدراجات" },
    { href: "/my-listings", label: "إعلاناتي", authRequired: true },
    { href: "/favorites", label: "المفضلة", authRequired: true },
    { href: "/admin", label: "لوحة التحكم", adminOnly: true },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left side — actions */}
          <div className="hidden md:flex items-center gap-2">
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-primary">
                  <LogIn className="w-4 h-4" />
                  دخول
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-white">
                  <UserPlus className="w-4 h-4" />
                  تسجيل
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden lg:block">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-gray-500 hover:text-primary"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </div>
            </Show>
            <Link href="/sell">
              <Button size="sm" className="gap-1.5 bg-[#0D1B35] hover:bg-[#1a2d55] text-white font-semibold px-4">
                <PlusCircle className="w-4 h-4" />
                بيع دراجتك
              </Button>
            </Link>
          </div>

          {/* Center — nav links */}
          <div className="hidden md:flex items-center gap-0">
            {navLinks.map((link) => {
              if (link.adminOnly && !isAdmin) return null;
              if (link.authRequired) {
                return (
                  <Show key={link.href} when="signed-in">
                    <Link
                      href={link.href}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                        isActive(link.href)
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-600 hover:text-primary hover:border-primary/30"
                      )}
                    >
                      {link.label}
                    </Link>
                  </Show>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                    isActive(link.href)
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 hover:text-primary hover:border-primary/30"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side — logo */}
          <Link href="/" className="flex items-center gap-0 group flex-shrink-0">
            <img src="/logo.svg" alt="Ride iQ" className="h-9 w-auto" />
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/sell" onClick={() => setOpen(false)}>
              <Button className="w-full bg-[#0D1B35] hover:bg-[#1a2d55] text-white gap-2">
                <PlusCircle className="w-4 h-4" />
                بيع دراجتك
              </Button>
            </Link>
            <Show when="signed-out">
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Button
                variant="outline"
                className="w-full gap-2 text-gray-600"
                onClick={() => { signOut(); setOpen(false); }}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </Show>
          </div>
        </div>
      )}
    </nav>
  );
}
