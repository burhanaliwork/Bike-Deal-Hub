import { Link, useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import { Bike, Heart, PlusCircle, LayoutDashboard, List, LogIn, UserPlus, LogOut, Menu, X } from "lucide-react";
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
    { href: "/listings", label: "تصفح الدراجات", icon: Bike },
    { href: "/sell", label: "بيع دراجة", icon: PlusCircle, authRequired: true },
    { href: "/my-listings", label: "إعلاناتي", icon: List, authRequired: true },
    { href: "/favorites", label: "المفضلة", icon: Heart, authRequired: true },
    { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, adminOnly: true },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Bike className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">
              سوق الدراجات
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.adminOnly) {
                return isAdmin ? (
                  <Show key={link.href} when="signed-in">
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </Show>
                ) : null;
              }
              if (link.authRequired) {
                return (
                  <Show key={link.href} when="signed-in">
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <link.icon className="w-4 h-4" />
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
                    "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4" />
                  حساب جديد
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </Button>
              </div>
            </Show>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Show when="signed-out">
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full gap-1.5">
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setOpen(false)}>
                <Button className="w-full gap-1.5 bg-primary hover:bg-primary/90">
                  <UserPlus className="w-4 h-4" />
                  حساب جديد
                </Button>
              </Link>
            </Show>
            <Show when="signed-in">
              <Button
                variant="outline"
                className="w-full gap-1.5"
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
