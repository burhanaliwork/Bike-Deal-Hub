import { useState } from "react";
import { Redirect } from "wouter";
import { useUser, Show } from "@clerk/react";
import {
  useGetAdminStats, useAdminListBikes, useAdminListUsers, useAdminUpdateBikeStatus,
  getAdminListBikesQueryKey, getAdminListUsersQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { StatusBadge } from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LayoutDashboard, Bike, Users, TrendingUp, Clock, CheckCircle, XCircle, Ban, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "listings" | "users";

const statusLabels: Record<string, string> = {
  active: "تمت الموافقة",
  rejected: "تم الرفض",
  sold: "تم وضعها مباعة",
  pending: "قيد المراجعة",
};

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const isAdmin = (user?.publicMetadata as any)?.role === "admin";

  if (isLoaded && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShieldAlert className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">الوصول مرفوض</h2>
          <p className="text-muted-foreground">ليست لديك صلاحية لعرض هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
    { id: "listings", label: "جميع الإعلانات", icon: Bike },
    { id: "users", label: "المستخدمون", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-1">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">إدارة السوق</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "listings" && <AdminListings />}
        {activeTab === "users" && <AdminUsers />}
      </div>
    </div>
  );
}

function AdminOverview() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "إجمالي المستخدمين", value: stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "إجمالي الدراجات", value: stats.totalBikes, icon: Bike, color: "text-orange-600 bg-orange-50" },
    { label: "إعلانات نشطة", value: stats.activeBikes, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "قيد المراجعة", value: stats.pendingBikes, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "دراجات مباعة", value: stats.soldBikes, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "مرفوضة", value: stats.rejectedBikes, icon: Ban, color: "text-red-600 bg-red-50" },
    { label: "مستخدمون جدد (الشهر)", value: stats.newUsersThisMonth, icon: Users, color: "text-cyan-600 bg-cyan-50" },
    { label: "دراجات جديدة (الشهر)", value: stats.newBikesThisMonth, icon: Bike, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <div key={card.label} className="bg-card border border-border rounded-xl p-5">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", card.color)}>
            <card.icon className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-foreground mb-1">{card.value}</div>
          <div className="text-sm text-muted-foreground">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

function AdminListings() {
  const { data: bikes, isLoading } = useAdminListBikes();
  const updateStatus = useAdminUpdateBikeStatus();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleStatus = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListBikesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        toast({ title: statusLabels[status] || "تم التحديث" });
      },
      onError: () => toast({ title: "فشل تحديث الحالة", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">{bikes?.length ?? 0} إجمالي الإعلانات</div>
      {bikes?.map((bike: any) => (
        <div key={bike.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {bike.images?.[0] ? (
              <img src={bike.images[0]} alt={bike.title} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Bike className="w-6 h-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-foreground truncate">{bike.title}</span>
              <StatusBadge status={bike.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              {Number(bike.price).toLocaleString()} د.ع · {bike.category} · علي حيدر
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {bike.status !== "active" && (
              <Button size="sm" variant="outline" className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleStatus(bike.id, "active")}>
                <CheckCircle className="w-3.5 h-3.5 ml-1" /> موافقة
              </Button>
            )}
            {bike.status !== "rejected" && (
              <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleStatus(bike.id, "rejected")}>
                <XCircle className="w-3.5 h-3.5 ml-1" /> رفض
              </Button>
            )}
            {bike.status !== "sold" && (
              <Button size="sm" variant="outline" className="h-8 text-gray-600"
                onClick={() => handleStatus(bike.id, "sold")}>
                وضع مباعة
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminUsers() {
  const { data: users, isLoading } = useAdminListUsers();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">{users?.length ?? 0} مستخدم مسجل</div>
      {users?.map((u: any) => (
        <div key={u.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">
              {(u.name || u.email || "?").charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground">{u.name || "مستخدم بدون اسم"}</div>
            <div className="text-sm text-muted-foreground truncate">{u.email}</div>
          </div>
          <div className="text-left flex-shrink-0">
            <div className="text-sm font-semibold text-foreground">{u.listingsCount} إعلان</div>
            <div className="text-xs text-muted-foreground">
              {new Date(u.createdAt).toLocaleDateString("ar-IQ")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
