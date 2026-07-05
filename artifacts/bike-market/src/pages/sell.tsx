import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateBike, getListBikesQueryKey, getGetMyBikesQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Bike, Phone, Tag, Coins, Image, FileText } from "lucide-react";

export default function SellPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const createBike = useCreateBike();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    brand: "",
    phone: "",
    imageUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.condition || !form.phone) {
      toast({ title: "الرجاء تعبئة جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createBike.mutate(
      {
        data: {
          title: form.title,
          description: form.description || undefined,
          price: parseFloat(form.price),
          category: form.category,
          condition: form.condition,
          brand: form.brand || undefined,
          phone: form.phone,
          imageUrl: form.imageUrl || undefined,
        },
      },
      {
        onSuccess: (newBike) => {
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
                <Label>الفئة <span className="text-red-500">*</span></Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mountain">جبلية</SelectItem>
                    <SelectItem value="road">طريق</SelectItem>
                    <SelectItem value="electric">كهربائية</SelectItem>
                    <SelectItem value="bmx">بي إم إكس</SelectItem>
                    <SelectItem value="kids">أطفال</SelectItem>
                    <SelectItem value="hybrid">هجين</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>الحالة <span className="text-red-500">*</span></Label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جديدة</SelectItem>
                    <SelectItem value="like_new">شبه جديدة</SelectItem>
                    <SelectItem value="good">جيدة</SelectItem>
                    <SelectItem value="fair">مقبولة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand">الماركة</Label>
                <div className="relative">
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand"
                    placeholder="ترك، جاينت، كانونديل..."
                    className="pr-9"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
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

            <div className="space-y-1.5">
              <Label htmlFor="description">الوصف</Label>
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
              <Label htmlFor="imageUrl">رابط الصورة</Label>
              <div className="relative">
                <Image className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/bike-photo.jpg"
                  className="pr-9"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-muted-foreground">ضع رابطاً مباشراً لصورة دراجتك</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> معلومات التواصل
            </h2>
            <div className="space-y-1.5">
              <Label htmlFor="phone">رقم الجوال <span className="text-red-500">*</span></Label>
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
            disabled={createBike.isPending}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md"
          >
            {createBike.isPending ? "جاري النشر..." : "انشر الإعلان مجاناً"}
          </Button>
        </form>
      </div>
    </div>
  );
}
