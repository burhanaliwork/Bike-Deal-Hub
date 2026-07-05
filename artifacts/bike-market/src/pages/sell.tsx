import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateBike, getListBikesQueryKey, getGetMyBikesQueryKey } from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bike, Phone, Tag, Coins, FileText, Plus, X, Gauge, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const createBike = useCreateBike();
  const { uploadFile, isUploading } = useUpload({ basePath: "/api/storage" });

  const [mainType, setMainType] = useState<MainType | "">("");
  const [bicycleCategory, setBicycleCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    condition: "",
    brand: "",
    mileage: "",
    phone: "",
  });

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
    if (!form.title || !form.price || !resolvedCategory || !form.condition || !form.phone) {
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

    createBike.mutate(
      {
        data: {
          title: form.title,
          description: form.description || undefined,
          price: parseFloat(form.price),
          category: resolvedCategory,
          condition: form.condition,
          brand: form.brand || undefined,
          phone: form.phone,
          images,
          ...(mainType === "motorcycle" && form.mileage ? { mileage: parseInt(form.mileage) } : {}),
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetMyBikesQueryKey() });
          toast({ title: "تم نشر الإعلان بنجاح!" });
          navigate("/my-listings");
        },
        onError: () => {
          toast({ title: "فشل نشر الإعلان. حاول مرة أخرى.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">بيع دراجتك</h1>
          <p className="text-muted-foreground">انشر دراجتك مجاناً وتواصل مع المشترين مباشرة.</p>
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
                      if (t.value !== "motorcycle") setForm((f) => ({ ...f, mileage: "" }));
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
              <Label htmlFor="title">العنوان <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="مثال: دراجة جبلية ترك 2022 — مقاس 26"
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
                <Label htmlFor="price">السعر (د.ع) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    className="pr-9"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand">شركة الدراجة</Label>
                <div className="relative">
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand"
                    placeholder="ترك، جاينت، هوندا..."
                    className="pr-9"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
              </div>

              {mainType === "motorcycle" && (
                <div className="space-y-1.5">
                  <Label htmlFor="mileage">الممشى (كم)</Label>
                  <div className="relative">
                    <Gauge className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="0"
                      className="pr-9"
                      value={form.mileage}
                      onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">مواصفات الدراجة</Label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="صف الدراجة — المقاس، السنة، الإكسسوارات، سبب البيع..."
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
                  placeholder="07XXXXXXXXX"
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
            disabled={createBike.isPending || isUploading}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
          >
            {createBike.isPending ? "جاري النشر..." : "انشر الإعلان مجاناً"}
          </Button>
        </form>
      </div>
    </div>
  );
}
