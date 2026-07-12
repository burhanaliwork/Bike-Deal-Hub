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
import { useImageKitUpload } from "@/hooks/use-imagekit-upload";
import { useAccountAuth } from "@/lib/accountAuth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Phone, Tag, Coins, FileText, Plus, X, Gauge, Loader2,
  MapPin, Truck, Cog, ArrowRight, Check, Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IRAQ_PROVINCES } from "@/lib/provinces";

type MainType = "electric" | "motorcycle" | "bicycle";

const mainTypes: { value: MainType; label: string; emoji: string }[] = [
  { value: "bicycle", label: "هوائية", emoji: "🚲" },
  { value: "electric", label: "كهربائية", emoji: "⚡" },
  { value: "motorcycle", label: "نارية", emoji: "🏍️" },
];

const bicycleCategories = [
  { value: "mountain", label: "جبلي" },
  { value: "road", label: "رود" },
  { value: "hybrid", label: "هجين" },
  { value: "kids", label: "الأطفال" },
];

const MIN_IMAGES = 2;
const MAX_IMAGES = 7;
const TOTAL_STEPS = 4;

const stepTitles = ["معلومات التواصل", "تفاصيل الدراجة", "الموقع والسعر", "وصف الدراجة"];

export default function SellPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const account = useAccountAuth();
  const isShowroom = account?.role === "showroom";
  const createBike = useCreateBike();
  const showroomCreateBike = useShowroomCreateBike();
  const showroomUpdateBike = useShowroomUpdateBike();
  const { uploadFiles, isUploading } = useImageKitUpload();

  const editId = (() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const raw = params.get("edit");
    const parsed = raw ? parseInt(raw) : NaN;
    return !isNaN(parsed) && isShowroom ? parsed : null;
  })();
  const isEdit = editId !== null;
  const { data: editBike } = useGetBike(editId ?? 0, { query: { enabled: isEdit } } as any);
  const [prefilled, setPrefilled] = useState(false);

  const [step, setStep] = useState(1);
  const [mainType, setMainType] = useState<MainType | "">("");
  const [bicycleCategory, setBicycleCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    phone: "",
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
  });

  useEffect(() => {
    if (!isEdit || !editBike || prefilled) return;
    const cat = editBike.category;
    if (cat === "electric") setMainType("electric");
    else if (cat === "motorcycle") setMainType("motorcycle");
    else { setMainType("bicycle"); setBicycleCategory(cat); }
    setImages(editBike.images ?? []);
    setForm({
      phone: editBike.phone ?? "",
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
    });
    setPrefilled(true);
  }, [isEdit, editBike, prefilled]);

  const resolvedCategory =
    mainType === "bicycle" ? bicycleCategory
    : mainType === "electric" ? "electric"
    : mainType === "motorcycle" ? "motorcycle"
    : "";

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast({ title: `الحد الأقصى ${MAX_IMAGES} صور`, variant: "destructive" });
      return;
    }
    const files = Array.from(fileList).slice(0, remaining);
    try {
      const urls = await uploadFiles(files);
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast({ title: "فشل رفع الصور. حاول مرة أخرى.", variant: "destructive" });
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const canProceedStep1 = form.phone.trim().length >= 10;
  const canProceedStep2 = !!mainType && !!form.title && !!form.condition &&
    images.length >= MIN_IMAGES &&
    (mainType !== "bicycle" || !!bicycleCategory);
  const canProceedStep3 = !!form.province && (form.priceOnRequest || !!form.price);

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      toast({ title: "أدخل رقم هاتف صحيح (10 أرقام على الأقل)", variant: "destructive" }); return;
    }
    if (step === 2) {
      if (!mainType) { toast({ title: "اختر نوع الدراجة", variant: "destructive" }); return; }
      if (mainType === "bicycle" && !bicycleCategory) { toast({ title: "اختر فئة الدراجة الهوائية", variant: "destructive" }); return; }
      if (!form.title) { toast({ title: "أدخل اسم الدراجة", variant: "destructive" }); return; }
      if (!form.condition) { toast({ title: "اختر حالة الدراجة", variant: "destructive" }); return; }
      if (images.length < MIN_IMAGES) { toast({ title: `أضف ${MIN_IMAGES} صور على الأقل`, variant: "destructive" }); return; }
    }
    if (step === 3 && !canProceedStep3) {
      toast({ title: "اختر المحافظة وأدخل السعر أو اختر 'يرجى طلب السعر'", variant: "destructive" }); return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
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
      showroomUpdateBike.mutate({ id: editId, data }, {
        onSuccess: () => {
          invalidateAll();
          qc.invalidateQueries({ queryKey: getGetBikeQueryKey(editId) });
          toast({ title: "تم تحديث الإعلان بنجاح!" });
          navigate("/showroom");
        },
        onError: () => toast({ title: "فشل تحديث الإعلان. حاول مرة أخرى.", variant: "destructive" }),
      });
      return;
    }

    if (isShowroom) {
      showroomCreateBike.mutate({ data }, {
        onSuccess: () => { invalidateAll(); toast({ title: "تم نشر الإعلان بنجاح!" }); navigate("/showroom"); },
        onError: () => toast({ title: "فشل نشر الإعلان.", variant: "destructive" }),
      });
      return;
    }

    createBike.mutate({ data }, {
      onSuccess: () => { invalidateAll(); toast({ title: "تم نشر الإعلان بنجاح!" }); navigate("/my-listings"); },
      onError: () => toast({ title: "فشل نشر الإعلان.", variant: "destructive" }),
    });
  };

  const isPending = createBike.isPending || showroomCreateBike.isPending || showroomUpdateBike.isPending;

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => step > 1 ? setStep(s => s - 1) : window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          {step > 1 ? "رجوع" : "العودة"}
        </button>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all",
                  s < step ? "bg-primary text-white" :
                  s === step ? "bg-primary text-white ring-4 ring-primary/20" :
                  "bg-gray-200 text-gray-400"
                )}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < TOTAL_STEPS && (
                  <div className={cn("h-1 flex-1 mx-1.5 rounded-full transition-all", s < step ? "bg-primary" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">الخطوة {step} من {TOTAL_STEPS}</p>
            <h2 className="text-xl font-black text-[#0D1B35] mt-0.5">{stepTitles[step - 1]}</h2>
          </div>
        </div>

        {/* Step 1: Contact */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm text-blue-800 font-medium">سيتواصل المشترون معك مباشرة على هذا الرقم</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-bold">رقم الهاتف <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                className="h-12 text-lg font-medium text-center tracking-widest"
                placeholder="07XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                dir="ltr"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground text-center">سيستخدم المشترون هذا الرقم للتواصل معك.</p>
            </div>
            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-2"
              disabled={!canProceedStep1}
            >
              التالي
            </Button>
          </div>
        )}

        {/* Step 2: Bike Details */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* Bike type */}
            <div className="space-y-2">
              <Label className="text-base font-bold">نوع الدراجة <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-3 gap-3">
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
                      "py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1",
                      mainType === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-gray-500 hover:border-primary/40"
                    )}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bicycle subcategory */}
            {mainType === "bicycle" && (
              <div className="space-y-2">
                <Label className="text-base font-bold">فئة الدراجة <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-4 gap-2">
                  {bicycleCategories.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setBicycleCategory(c.value)}
                      className={cn(
                        "py-2 px-1 rounded-xl border-2 text-xs font-bold transition-all",
                        bicycleCategory === c.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bike name */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-bold">اسم الدراجة <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                className="h-11"
                placeholder="مثال: هوندا سي بي 150"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base font-bold">شركة الدراجة</Label>
              <div className="relative">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brand"
                  className="pr-9 h-11"
                  placeholder="مثال: Honda"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label className="text-base font-bold">حالة الدراجة <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "new", label: "جديدة ✨" }, { value: "used", label: "مستعملة 🔧" }].map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setForm({ ...form, condition: c.value })}
                    className={cn(
                      "py-3 rounded-xl border-2 text-sm font-bold transition-all",
                      form.condition === c.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Motorcycle extras */}
            {mainType === "motorcycle" && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-bold text-gray-700">معلومات إضافية للدراجة النارية</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="mileage" className="text-sm font-semibold">الممشى (كم)</Label>
                    <div className="relative">
                      <Gauge className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="mileage" type="number" className="pr-9 h-10" value={form.mileage}
                        onChange={(e) => setForm({ ...form, mileage: e.target.value })} min="0" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="engineCapacity" className="text-sm font-semibold">سعة المحرك (سي سي)</Label>
                    <div className="relative">
                      <Cog className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="engineCapacity" type="number" className="pr-9 h-10" value={form.engineCapacity}
                        onChange={(e) => setForm({ ...form, engineCapacity: e.target.value })} min="0" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">الأوراق الرسمية</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: true, label: "مع أوراق رسمية" }, { value: false, label: "بدون أوراق" }].map((d) => (
                      <button type="button" key={String(d.value)}
                        onClick={() => setForm({ ...form, hasDocuments: d.value })}
                        className={cn("py-2 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1",
                          form.hasDocuments === d.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                        )}>
                        <FileText className="w-3.5 h-3.5" /> {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">الصور <span className="text-red-500">*</span></Label>
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                  images.length < MIN_IMAGES ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                )}>
                  {images.length}/{MAX_IMAGES}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group">
                    <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className={cn(
                    "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 gap-1",
                    isUploading ? "border-primary/50 opacity-60 pointer-events-none" : "border-gray-300 hover:border-primary hover:text-primary"
                  )}>
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : <Plus className="w-6 h-6" />}
                    {!isUploading && <span className="text-[10px] font-semibold">أضف صورة</span>}
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={(e) => handleFilesSelected(e.target.files)} disabled={isUploading} />
                  </label>
                )}
              </div>
              <p className={cn("text-xs font-medium", images.length < MIN_IMAGES ? "text-amber-600" : "text-green-600")}>
                {images.length < MIN_IMAGES
                  ? `يرجى إضافة ${MIN_IMAGES - images.length} صور ${images.length > 0 ? "على الأقل" : ""} (الحد الأدنى ${MIN_IMAGES} صور)`
                  : `✓ تم إضافة الصور`}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
              disabled={!canProceedStep2 || isUploading}
            >
              {isUploading ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />جاري رفع الصور...</> : "التالي"}
            </Button>
          </div>
        )}

        {/* Step 3: Location & Price */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* Province */}
            <div className="space-y-2">
              <Label className="text-base font-bold">المحافظة <span className="text-red-500">*</span></Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Select value={form.province} onValueChange={(v) => setForm({ ...form, province: v })}>
                  <SelectTrigger className="pr-9 h-11">
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {IRAQ_PROVINCES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delivery */}
            <div className="space-y-2">
              <Label className="text-base font-bold">هل يتوفر توصيل؟</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: true, label: "نعم ✓" }, { value: false, label: "لا ✗" }].map((d) => (
                  <button type="button" key={String(d.value)}
                    onClick={() => setForm({ ...form, hasDelivery: d.value })}
                    className={cn("py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                      form.hasDelivery === d.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                    )}>
                    <Truck className="w-4 h-4" /> {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
              <Label className="text-base font-bold">السعر <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button"
                  onClick={() => setForm({ ...form, priceOnRequest: false })}
                  className={cn("py-3 rounded-xl border-2 text-sm font-bold transition-all",
                    !form.priceOnRequest ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                  )}>
                  💰 سعر محدد
                </button>
                <button type="button"
                  onClick={() => setForm({ ...form, priceOnRequest: true, price: "" })}
                  className={cn("py-3 rounded-xl border-2 text-sm font-bold transition-all",
                    form.priceOnRequest ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                  )}>
                  📞 يرجى طلب السعر
                </button>
              </div>

              {!form.priceOnRequest && (
                <div className="relative">
                  <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pr-9 h-11 text-lg font-bold"
                    placeholder="السعر بالدينار العراقي"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">د.ع</span>
                </div>
              )}
              {form.priceOnRequest && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 px-3 py-2.5 rounded-xl">
                  <Coins className="w-4 h-4 text-primary flex-shrink-0" />
                  سيظهر "يرجى طلب السعر" على إعلانك
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
              disabled={!canProceedStep3}
            >
              التالي
            </Button>
          </div>
        )}

        {/* Step 4: Description + Submit */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-bold">وصف الدراجة</Label>
              <Textarea
                id="description"
                className="min-h-[180px] text-sm leading-relaxed"
                placeholder="اكتب وصفاً تفصيلياً للدراجة: الحالة، المواصفات، سبب البيع..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">الوصف التفصيلي يزيد فرص البيع. يمكنك تركه فارغاً.</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
              <p className="text-sm font-bold text-gray-700 mb-3">ملخص الإعلان</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">الهاتف:</span>
                <span className="font-semibold" dir="ltr">{form.phone}</span>
                <span className="text-muted-foreground">الاسم:</span>
                <span className="font-semibold truncate">{form.title}</span>
                <span className="text-muted-foreground">النوع:</span>
                <span className="font-semibold">{mainTypes.find(t => t.value === mainType)?.label ?? mainType}</span>
                <span className="text-muted-foreground">الحالة:</span>
                <span className="font-semibold">{form.condition === "new" ? "جديدة" : "مستعملة"}</span>
                <span className="text-muted-foreground">المحافظة:</span>
                <span className="font-semibold">{form.province}</span>
                <span className="text-muted-foreground">السعر:</span>
                <span className="font-semibold text-primary">
                  {form.priceOnRequest ? "يرجى طلب السعر" : `${Number(form.price).toLocaleString()} د.ع`}
                </span>
                <span className="text-muted-foreground">الصور:</span>
                <span className="font-semibold">{images.length} صور</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || isUploading}
              className="w-full h-14 text-base font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              {isPending
                ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />{isEdit ? "جاري الحفظ..." : "جاري النشر..."}</>
                : isEdit ? "حفظ التغييرات"
                : <><Bike className="w-5 h-5 ml-2" />نشر الإعلان</>
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
