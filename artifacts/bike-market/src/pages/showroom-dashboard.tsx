import { Redirect, Link } from "wouter";
import {
  useShowroomListBikes,
  useShowroomUpdateBike,
  useShowroomDeleteBike,
  getShowroomListBikesQueryKey,
  getListBikesQueryKey,
} from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { StatusBadge } from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAccountAuth, clearStoredAuth } from "@/lib/accountAuth";
import { Bike, Plus, Pencil, Trash2, BadgeCheck, Store, LogOut, ExternalLink } from "lucide-react";

export default function ShowroomDashboardPage() {
  const account = useAccountAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const isShowroom = account?.role === "showroom";
  const { data: bikes, isLoading } = useShowroomListBikes({
    query: { enabled: isShowroom },
  } as any);
  const updateBike = useShowroomUpdateBike();
  const deleteBike = useShowroomDeleteBike();

  if (!account) return <Redirect to="/login" />;
  if (!isShowroom) return <Redirect to="/admin" />;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getShowroomListBikesQueryKey() });
    qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
  };

  const handleMarkSold = (id: number, sold: boolean) => {
    updateBike.mutate(
      { id, data: { status: sold ? "sold" : "active" } },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: sold ? "تم وضع الإعلان كمباع" : "تم إعادة تفعيل الإعلان" });
        },
        onError: () => toast({ title: "فشل التحديث", variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    deleteBike.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "تم حذف الإعلان" });
        },
        onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
      },
    );
  };

  const handleLogout = () => {
    clearStoredAuth();
    qc.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
              {account.showroom?.imageUrl ? (
                <img
                  src={account.showroom.imageUrl}
                  alt={account.showroom?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-7 h-7 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">
                صالة عرض {account.showroom?.name}
              </h1>
              {account.showroom?.verified && (
                <div className="flex items-center gap-1 text-sm text-primary font-semibold">
                  <BadgeCheck className="w-4 h-4" />
                  صالة عرض معتمدة
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {account.showroom && (
              <Link href={`/showrooms/${account.showroom.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  الصفحة العامة
                </Button>
              </Link>
            )}
            <Link href="/sell">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold">
                <Plus className="w-4 h-4" />
                إضافة منتج
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : bikes && bikes.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground mb-4">{bikes.length} منتج</div>
            {bikes.map((bike: any) => (
              <div key={bike.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <Link href={`/listings/${bike.id}`} className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {bike.images?.[0] ? (
                    <img src={bike.images[0]} alt={bike.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bike className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/listings/${bike.id}`} className="font-semibold text-foreground truncate hover:text-primary">
                      {bike.title}
                    </Link>
                    <StatusBadge status={bike.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Number(bike.price).toLocaleString()} د.ع
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/sell?edit=${bike.id}`}>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Pencil className="w-3.5 h-3.5" />
                      تعديل
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => handleMarkSold(bike.id, bike.status !== "sold")}
                  >
                    {bike.status === "sold" ? "إعادة تفعيل" : "وضع مباعة"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(bike.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">لا توجد منتجات بعد</h3>
            <Link href="/sell">
              <Button className="gap-1.5 bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4" />
                أضف أول منتج
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
