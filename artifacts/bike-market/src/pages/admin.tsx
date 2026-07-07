import { useState } from "react";
import { Redirect } from "wouter";
import {
  useGetAdminStats, useAdminListBikes, useAdminListUsers, useAdminUpdateBikeStatus,
  useAdminListShowrooms, useAdminCreateShowroom, useAdminDeleteShowroom,
  getAdminListBikesQueryKey, getAdminListShowroomsQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import Navbar from "@/components/navbar";
import { StatusBadge } from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAccountAuth, clearStoredAuth } from "@/lib/accountAuth";
import { LayoutDashboard, Bike, Users, TrendingUp, Clock, CheckCircle, XCircle, Ban, ShieldAlert, Store, Plus, Trash2, LogOut, Loader2, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "listings" | "showrooms" | "users";

const statusLabels: Record<string, string> = {
  active: "تمت الموافقة",
  rejected: "تم الرفض",
  sold: "تم وضعها مباعة",
  pending: "قيد المراجعة",
};

export default function AdminPage() {
  const account = useAccountAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!account) return <Redirect to="/login" />;

  if (account.role !== "admin") {
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
    { id: "showrooms", label: "صالات العرض", icon: Store },
    { id: "users", label: "المستخدمون", icon: Users },
  ];

  const handleLogout = () => {
    clearStoredAuth();
    qc.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-1">لوحة تحكم الإدارة</h1>
            <p className="text-muted-foreground">إدارة السوق</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
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
        {activeTab === "showrooms" && <AdminShowrooms />}
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

function AdminShowrooms() {
  const { data: showrooms, isLoading } = useAdminListShowrooms();
  const createShowroom = useAdminCreateShowroom();
  const deleteShowroom = useAdminDeleteShowroom();
  const { uploadFile, isUploading } = useUpload({ basePath: "/api/storage" });
  const qc = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    imageUrl: "",
    googleMapsUrl: "",
    phone: "",
    username: "",
    password: "",
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getAdminListShowroomsQueryKey() });
  };

  const handleImageSelected = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const result = await uploadFile(file);
    if (result?.objectPath) {
      setForm((f) => ({ ...f, imageUrl: `/api/storage${result.objectPath}` }));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) {
      toast({ title: "الرجاء تعبئة الاسم واسم المستخدم وكلمة المرور", variant: "destructive" });
      return;
    }
    createShowroom.mutate(
      {
        data: {
          name: form.name,
          username: form.username.trim(),
          password: form.password,
          ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
          ...(form.googleMapsUrl ? { googleMapsUrl: form.googleMapsUrl } : {}),
          ...(form.phone ? { phone: form.phone } : {}),
        },
      },
      {
        onSuccess: () => {
          invalidate();
          setForm({ name: "", imageUrl: "", googleMapsUrl: "", phone: "", username: "", password: "" });
          setShowForm(false);
          toast({ title: "تم إنشاء صالة العرض بنجاح" });
        },
        onError: (err: any) => {
          const status = err?.response?.status ?? err?.status;
          toast({
            title: status === 409 ? "اسم المستخدم موجود مسبقاً" : "فشل إنشاء صالة العرض",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`سيتم حذف صالة عرض "${name}" وحسابها وجميع منتجاتها. متابعة؟`)) return;
    deleteShowroom.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: "تم حذف صالة العرض" });
        },
        onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{showrooms?.length ?? 0} صالة عرض</div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowForm((s) => !s)}>
          <Plus className="w-4 h-4" />
          إضافة صالة عرض
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-foreground">صالة عرض جديدة</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sr-name">اسم صالة العرض <span className="text-red-500">*</span></Label>
              <Input id="sr-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-phone">رقم الهاتف</Label>
              <Input id="sr-phone" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="sr-maps">رابط كوكل ماب</Label>
              <Input id="sr-maps" dir="ltr" placeholder="https://maps.google.com/..." value={form.googleMapsUrl} onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-username">اسم المستخدم <span className="text-red-500">*</span></Label>
              <Input id="sr-username" dir="ltr" autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sr-password">كلمة المرور <span className="text-red-500">*</span></Label>
              <Input id="sr-password" dir="ltr" type="text" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>صورة صالة العرض</Label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={form.imageUrl} alt="صورة صالة العرض" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors",
                  isUploading && "opacity-60 pointer-events-none"
                )}>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  اختر صورة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e.target.files)} />
                </label>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createShowroom.isPending || isUploading}>
              {createShowroom.isPending ? "جاري الإنشاء..." : "إنشاء صالة العرض"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {showrooms?.map((sr: any) => (
          <div key={sr.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
              {sr.imageUrl ? (
                <img src={sr.imageUrl} alt={sr.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-foreground truncate">صالة عرض {sr.name}</span>
                {sr.verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
              </div>
              <div className="text-sm text-muted-foreground" dir="ltr">
                @{sr.username} · {sr.bikesCount ?? 0} منتج
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
              onClick={() => handleDelete(sr.id, sr.name)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
        {(!showrooms || showrooms.length === 0) && !showForm && (
          <div className="text-center py-12 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            لا توجد صالات عرض بعد
          </div>
        )}
      </div>
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
