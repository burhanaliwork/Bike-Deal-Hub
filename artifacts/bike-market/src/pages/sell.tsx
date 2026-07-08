import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  useCreateBike,
  useShowroomCreateBike,
  useShowroomUpdateBike,
  useGetBike,
  getListBikesQueryKey,
  getGetMyBikesQueryKey,
  getShowroomListBikesQueryKey,
  getGetBikeQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useAccountAuth } from "@/lib/accountAuth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bike, Phone, Tag, Coins, FileText, Plus, X, Gauge, Loader2, MapPin, Truck, Cog, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRAQ_PROVINCES } from "@/lib/provinces";

type MainType = "electric" | "motorcycle" | "bicycle";

const mainTypes: { value: MainType; label: string }[] = [
  { value: "electric", label: "كهربائية" },
  { value: "motorcycle", label: "نارية" },
  { value: "bicycle", label: "هوائية" },
];

const bicycleCategories: { value: string; label: string }[] = [
  { value: "mountain", label: "جبلي" },
  { value: "road", label: "رود" },
  { value: "hybrid", label: "هجين" },
  { value: "kids", label: "الأطفال" },
];

const MIN_IMAGES = 2;

export default function SellPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const account = useAccountAuth();
  const isShowroom = account?.role === "showroom";
  const createBike = useCreateBike();
  const showroomCreateBike = useShowroomCreateBike();
  const showroomUpdateBike = useShowroomUpdateBike();
  const { uploadFile, isUploading } = useUpload({ basePath: "/api/storage" });

  const editId = (() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const raw = params.get("edit");
    const parsed = raw ? parseInt(raw) : NaN;
    return !isNaN(parsed) && isShowroom ? parsed : null;
  })();
  const isEdit = editId !== null;
  const { data: editBike } = useGetBike(editId ?? 0, { query: { enabled: isEdit } } as any);
  const [prefilled, setPrefilled] = useState(false);

  const [mainType, setMainType] = useState<MainType | "">("");
  const [bicycleCategory, setBicycleCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    priceOnRequest: false,
    condition: "",
    brand: "",
    mileage: "",
    engineCapacity: "",
    province: "",
    hasDelivery: false,
    hasDocuments: false,
    phone: "",
  });

  useEffect(() => {
    if (!isEdit || !editBike || prefilled) return;
    const cat = editBike.category;
    if (cat === "electric") setMainType("electric");
    else if (cat === "motorcycle") setMainType("motorcycle");
    else {
      setMainType("bicycle");
      setBicycleCategory(cat);
    }
    setImages(editBike.images ?? []);
    setForm({
      title: editBike.title ?? "",
      description: editBike.description ?? "",
      price: editBike.priceOnRequest ? "" : String(editBike.price ?? ""),
      priceOnRequest: !!editBike.priceOnRequest,
      condition: editBike.condition ?? "",
      brand: editBike.brand ?? "",
      mileage: editBike.mileage != null ? String(editBike.mileage) : "",
      engineCapacity: editBike.engineCapacity != null ? String(editBike.engineCapacity) : "",
      province: editBike.province ?? "",
      hasDelivery: !!editBike.hasDelivery,
      hasDocuments: !!editBike.hasDocuments,
      phone: editBike.phone ?? "",
    });
    setPrefilled(true);
  }, [isEdit, editBike, prefilled]);

  const resolvedCategory =
    mainType === "bicycle" ? bicycleCategory : mainType === "electric" ? "electric" : mainType === "motorcycle" ? "motorcycle" : "";

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    for (const file of files) {
      const result = await uploadFile(file);
      if (result?.objectPath) {
        setImages((prev) => [...prev, `/api/storage${result.objectPath}`]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || (!form.price && !form.priceOnRequest) || !resolvedCategory || !form.condition || !form.province || !form.phone) {
      toast({ title: "الرجاء تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (mainType === "bicycle" && !bicycleCategory) {
      toast({ title: "الرجاء اختيار فئة الدراجة الهوائية", variant: "destructive" });
      return;
    }
    if (images.length < MIN_IMAGES) {
      toast({ title: `يرجى إضافة صورتين أو أكثر`, variant: "destructive" });
      return;
    }

    const data = {
      title: form.title,
      description: form.description || undefined,
      ...(form.priceOnRequest ? { priceOnRequest: true } : { price: parseFloat(form.price) }),
      category: resolvedCategory,
      condition: form.condition,
      brand: form.brand || undefined,
      phone: form.phone,
      images,
      province: form.province,
      hasDelivery: form.hasDelivery,
      ...(mainType === "motorcycle" && form.mileage ? { mileage: parseInt(form.mileage) } : {}),
      ...(mainType === "motorcycle" && form.engineCapacity ? { engineCapacity: parseInt(form.engineCapacity) } : {}),
      ...(mainType === "motorcycle" ? { hasDocuments: form.hasDocuments } : {}),
    };

    const invalidateAll = () => {
      qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
      qc.invalidateQueries({ queryKey: getGetMyBikesQueryKey() });
      if (isShowroom) qc.invalidateQueries({ queryKey: getShowroomListBikesQueryKey() });
    };

    if (isEdit && editId) {
      showroomUpdateBike.mutate(
        { id: editId, data },
        {
          onSuccess: () => {
            invalidateAll();
            qc.invalidateQueries({ queryKey: getGetBikeQueryKey(editId) });
            toast({ title: "تم تحديث الإعلان بنجاح!" });
            navigate("/showroom");
          },
          onError: () => {
            toast({ title: "فشل تحديث الإعلان. حاول مرة أخرى.", variant: "destructive" });
          },
        },
      );
      return;
    }

    if (isShowroom) {
      showroomCreateBike.mutate(
        { data },
        {
          onSuccess: () => {
            invalidateAll();
            toast({ title: "تم نشر الإعلان بنجاح!" });
            navigate("/showroom");
          },
          onError: () => {
            toast({ title: "فشل نشر الإعلان. حاول مرة أخرى.", variant: "destructive" });
          },
        },
      );
      return;
    }

    createBike.mutate(
      { data },
      {
        onSuccess: () => {
          invalidateAll();
          toast({ title: "تم نشر الإعلان بنجاح!" });
          navigate("/my-listings");
        },
        onError: () => {
          toast({ title: "فشل نشر الإعلان. حاول مرة أخرى.", variant: "destructive" });
        },
      }
    );
  };

  const isPending = createBike.isPending || showroomCreateBike.isPending || showroomUpdateBike.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            رجوع
          </button>
          <h1 className="text-3xl font-black text-foreground mb-2">
            {isEdit ? "تعديل الإعلان" : isShowroom ? "إضافة منتج جديد" : "بيع دراجتك"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "عدّل تفاصيل الإعلان ثم احفظ التغييرات."
              : isShowroom
                ? `إضافة منتج جديد إلى صالة عرض ${account?.showroom?.name ?? ""}`
                : "انشر دراجتك مجاناً وتواصل مع المشترين مباشرة."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Bike className="w-5 h-5 text-primary" /> تفاصيل الدراجة
            </h2>

            <div className="space-y-1.5">
              <Label>نوع الدراجة <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-2">
                {mainTypes.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => {
                      setMainType(t.value);
                      if (t.value !== "bicycle") setBicycleCategory("");
                      if (t.value !== "motorcycle") setForm((f) => ({ ...f, mileage: "", engineCapacity: "" }));
                    }}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all",
                      mainType === t.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {mainType === "bicycle" && (
              <div className="space-y-1.5">
                <Label>فئة الدراجة الهوائية <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-4 gap-2">
                  {bicycleCategories.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setBicycleCategory(c.value)}
                      className={cn(
                        "py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all",
                        bicycleCategory === c.value
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="title">اسم الدراجة <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>الحالة <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                  {[
                    { value: "new", label: "جديد" },
                    { value: "used", label: "مستخدم" },
                  ].map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setForm({ ...form, condition: c.value })}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                        form.condition === c.value
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>السعر <span className="text-red-500">*</span></Label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, priceOnRequest: false })}
                    className={cn(
                      "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                      !form.priceOnRequest
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/50"
                    )}
                  >
                    سعر محدد
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, priceOnRequest: true, price: "" })}
                    className={cn(
                      "flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all",
                      form.priceOnRequest
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/50"
                    )}
                  >
                    يرجى طلب السعر
                  </button>
                </div>
                {!form.priceOnRequest && (
                  <div className="relative">
                    <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      className="pr-9"
                      placeholder="السعر بالدينار العراقي"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      min="0"
                    />
                  </div>
                )}
                {form.priceOnRequest && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                    <Coins className="w-4 h-4 text-primary" />
                    سيظهر "يرجى طلب السعر" على إعلانك
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand">اسم شركة الدراجة</Label>
                <div className="relative">
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand"
                    className="pr-9"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>العنوان <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
                    <SelectTrigger className="pr-9">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {IRAQ_PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {mainType === "motorcycle" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mileage">الممشى (كم)</Label>
                    <div className="relative">
                      <Gauge className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="mileage"
                        type="number"
                        className="pr-9"
                        value={form.mileage}
                        onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="engineCapacity">سعة المحرك (سي سي)</Label>
                    <div className="relative">
                      <Cog className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="engineCapacity"
                        type="number"
                        className="pr-9"
                        value={form.engineCapacity}
                        onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>الأوراق الرسمية <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    {[
                      { value: true, label: "مع أوراق رسمية" },
                      { value: false, label: "بدون أوراق رسمية" },
                    ].map((d) => (
                      <button
                        type="button"
                        key={String(d.value)}
                        onClick={() => setForm({ ...form, hasDocuments: d.value })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                          form.hasDocuments === d.value
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                        )}
                      >
                        <FileText className="w-4 h-4" />
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label>هل يتوفر توصيل؟</Label>
              <div className="flex gap-2">
                {[
                  { value: true, label: "متوفر" },
                  { value: false, label: "غير متوفر" },
                ].map((d) => (
                  <button
                    type="button"
                    key={String(d.value)}
                    onClick={() => setForm({ ...form, hasDelivery: d.value })}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
                      form.hasDelivery === d.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    <Truck className="w-4 h-4" />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">مواصفات الدراجة</Label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  className="pr-9 min-h-[100px]"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>الصور <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label
                  className={cn(
                    "aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary hover:text-primary text-gray-400 transition-colors",
                    isUploading && "opacity-60 pointer-events-none"
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Plus className="w-7 h-7" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                </label>
              </div>
              <p className={cn("text-xs", images.length < MIN_IMAGES ? "text-amber-600" : "text-muted-foreground")}>
                يرجى إضافة صورتين أو أكثر
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> معلومات التواصل
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="phone">رقم التليفون <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pr-9 text-lg font-medium"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-muted-foreground">سيتواصل المشترون معك على هذا الرقم</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
          >
            {isPending
              ? isEdit
                ? "جاري الحفظ..."
                : "جاري النشر..."
              : isEdit
                ? "حفظ التغييرات"
                : "انشر الإعلان مجاناً"}
          </Button>
        </form>
      </div>
    </div>
  );
}
