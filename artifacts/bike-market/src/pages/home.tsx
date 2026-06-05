import { Link, useLocation } from "wouter";
import { Search, Bike, Zap, Mountain, Wind, Tag, Users, ChevronLeft, ChevronRight, Phone, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetBikeStats, useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = [
  { id: "mountain", label: "جبلية", icon: Mountain, color: "#16a34a" },
  { id: "road", label: "طريق", icon: Wind, color: "#2563eb" },
  { id: "electric", label: "كهربائية", icon: Zap, color: "#ca8a04" },
  { id: "bmx", label: "بي إم إكس", icon: Tag, color: "#9333ea" },
  { id: "kids", label: "أطفال", icon: Users, color: "#db2777" },
  { id: "hybrid", label: "هجين", icon: Bike, color: "#0891b2" },
];

const bikeTypes = [
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop", label: "جبلية" },
  { src: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=80&h=80&fit=crop", label: "طريق" },
  { src: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=80&h=80&fit=crop", label: "كهربائية" },
  { src: "https://images.unsplash.com/photo-1576435728678-68d0fbf94946?w=80&h=80&fit=crop", label: "BMX" },
  { src: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=80&h=80&fit=crop", label: "أطفال" },
  { src: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=80&h=80&fit=crop", label: "هجين" },
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchCategory, setSearchCategory] = useState("");
  const [searchCondition, setSearchCondition] = useState("");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data: stats } = useGetBikeStats();
  const { data: featuredBikes } = useListBikes({ limit: 8 } as any);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const cat = selectedType || searchCategory;
    if (cat) params.set("category", cat);
    if (searchCondition) params.set("condition", searchCondition);
    if (searchMinPrice) params.set("minPrice", searchMinPrice);
    if (searchMaxPrice) params.set("maxPrice", searchMaxPrice);
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0D1B35] pb-0 pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Stats bar */}
          <div className="flex items-center gap-6 mb-6 text-sm text-blue-200">
            {stats && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <strong className="text-white">{stats.activeListings}</strong> إعلان نشط
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <strong className="text-white">{stats.soldListings}</strong> دراجة مباعة
                </span>
              </>
            )}
          </div>

          {/* Search card */}
          <div className="bg-white rounded-t-2xl shadow-xl overflow-hidden">
            {/* Bike type selector */}
            <div className="border-b border-gray-100 px-6 py-4">
              <p className="text-xs text-gray-400 mb-3 font-medium">اختر نوع الدراجة</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {bikeTypes.map((type, i) => {
                  const cat = categories[i];
                  const isSelected = selectedType === cat?.id;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedType(isSelected ? null : cat?.id || null)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all min-w-[72px] ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={type.src}
                          alt={type.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement;
                            t.style.display = "none";
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-gray-600"}`}>
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter row */}
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">النوع</label>
                  <Select value={searchCategory} onValueChange={setSearchCategory}>
                    <SelectTrigger className="h-11 border-gray-200 text-sm">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">الكل</SelectItem>
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
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">الحالة</label>
                  <Select value={searchCondition} onValueChange={setSearchCondition}>
                    <SelectTrigger className="h-11 border-gray-200 text-sm">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_all">الكل</SelectItem>
                      <SelectItem value="new">جديدة</SelectItem>
                      <SelectItem value="like_new">شبه جديدة</SelectItem>
                      <SelectItem value="good">جيدة</SelectItem>
                      <SelectItem value="fair">مقبولة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">أقل سعر (ر.س)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={searchMinPrice}
                    onChange={(e) => setSearchMinPrice(e.target.value)}
                    className="h-11 border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1.5">أعلى سعر (ر.س)</label>
                  <Input
                    type="number"
                    placeholder="أي سعر"
                    value={searchMaxPrice}
                    onChange={(e) => setSearchMaxPrice(e.target.value)}
                    className="h-11 border-gray-200 text-sm"
                  />
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full h-12 bg-[#0D1B35] hover:bg-[#1a2d55] text-white font-bold text-base rounded-xl"
              >
                <Search className="w-5 h-5 ml-2" />
                عرض {stats?.activeListings ?? ""} الدراجات
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category quick links */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/listings?category=${cat.id}`}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-primary hover:text-primary text-sm font-medium text-gray-600 transition-all"
              >
                <cat.icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                {cat.label}
                {stats?.categoryBreakdown?.find((c: any) => c.category === cat.id) && (
                  <span className="text-xs text-gray-400">
                    ({stats.categoryBreakdown.find((c: any) => c.category === cat.id)?.count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      {stats?.recentListings && stats.recentListings.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-[#0D1B35]">الدراجات المميزة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.recentListings.slice(0, 8).map((bike: any) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/listings">
              <Button variant="outline" size="lg" className="border-[#0D1B35] text-[#0D1B35] hover:bg-[#0D1B35] hover:text-white font-semibold px-10">
                عرض جميع الإعلانات
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Trust section */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[#0D1B35] text-center mb-8">لماذا Ride iQ؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: "تواصل مباشر", desc: "اتصل أو راسل البائعين مباشرة — بدون وسطاء أو عمولات." },
              { icon: ShieldCheck, title: "إعلانات موثوقة", desc: "جميع الإعلانات تخضع للمراجعة من فريق الإدارة لضمان الجودة." },
              { icon: Star, title: "أكبر تشكيلة", desc: "جبلية، طريق، كهربائية، BMX، أطفال، هجين — كل ما تحتاج." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0D1B35] mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#0D1B35] text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-black mb-3">بيع دراجتك اليوم مجاناً</h2>
          <p className="text-blue-200 mb-8 text-lg">انشر إعلانك خلال دقيقتين وتواصل مع المشترين مباشرة.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-10">
                انشر إعلانك الآن
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-10">
                تصفح الإعلانات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060e1e] text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <img src="/logo.svg" alt="Ride iQ" className="h-8 w-auto brightness-0 invert opacity-60" />
          </div>
          <p className="text-sm">© 2025 Ride iQ — منصة الدراجات الأولى في المملكة العربية السعودية</p>
        </div>
      </footer>
    </div>
  );
}
