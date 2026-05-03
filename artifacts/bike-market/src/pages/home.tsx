import { Link } from "wouter";
import { Search, Bike, Zap, Mountain, Wind, Tag, Users, ArrowLeft, ShieldCheck, Phone, Star } from "lucide-react";
import { useState } from "react";
import { useGetBikeStats } from "@workspace/api-client-react";
import BikeCard from "@/components/bike-card";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

const categories = [
  { id: "mountain", label: "جبلية", icon: Mountain, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "road", label: "طريق", icon: Wind, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "electric", label: "كهربائية", icon: Zap, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "bmx", label: "بي إم إكس", icon: Tag, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "kids", label: "أطفال", icon: Users, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: "hybrid", label: "هجين", icon: Bike, color: "bg-orange-100 text-orange-700 border-orange-200" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const { data: stats } = useGetBikeStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/listings?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/listings");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="100" cy="400" r="180" fill="white" />
            <circle cx="1100" cy="200" r="220" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-3.5 h-3.5" />
              السوق الأول للدراجات في المملكة العربية السعودية
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4">
              سوق الدراجات
              <br />
              <span className="text-white/80 text-3xl md:text-4xl font-bold">بيع وشراء الدراجات</span>
            </h1>
            <p className="text-lg text-white/85 mb-8 leading-relaxed">
              اعثر على دراجتك المثالية أو بع دراجتك لآلاف المشترين.
              سريع وآمن وسهل — تواصل مباشرة مع البائعين عبر الهاتف.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن دراجة (الماركة، النوع، المدينة...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10 h-12 bg-white text-gray-900 border-0 shadow-lg rounded-lg text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg px-6">
                بحث
              </Button>
            </form>

            {stats && (
              <div className="flex items-center gap-6 mt-8 text-sm text-white/80">
                <span><strong className="text-white">{stats.activeListings}</strong> إعلان نشط</span>
                <span><strong className="text-white">{stats.soldListings}</strong> دراجة مباعة</span>
                <span><strong className="text-white">{stats.totalListings}</strong> إجمالي الإعلانات</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">تصفح حسب الفئة</h2>
          <Link href="/listings" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
            عرض الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/listings?category=${cat.id}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer hover:scale-105 transition-all ${cat.color} font-medium text-sm`}
            >
              <cat.icon className="w-6 h-6" />
              <span>{cat.label}</span>
              {stats?.categoryBreakdown?.find((c: any) => c.category === cat.id) && (
                <span className="text-xs opacity-70">
                  {stats.categoryBreakdown.find((c: any) => c.category === cat.id)?.count} دراجة
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      {stats?.recentListings && stats.recentListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">أحدث الإعلانات</h2>
            <Link href="/listings" className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              عرض الكل <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stats.recentListings.slice(0, 8).map((bike: any) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/listings">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 shadow-md px-8">
                شاهد جميع الإعلانات <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Trust section */}
      <section className="bg-muted/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: "تواصل مباشر", desc: "اتصل أو راسل البائعين عبر واتساب مباشرة — بدون وسطاء أو رسوم." },
              { icon: ShieldCheck, title: "آمن وموثوق", desc: "إعلانات موثوقة تتم مراجعتها من قبل فريق الإدارة لضمان الجودة." },
              { icon: Bike, title: "جميع أنواع الدراجات", desc: "جبلية، طريق، كهربائية، بي إم إكس، أطفال — اعثر على ما تحتاج بالضبط." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl font-black mb-3">جاهز لبيع دراجتك؟</h2>
          <p className="text-white/80 mb-8 text-lg">انشر إعلانك في دقائق وتواصل مع آلاف المشترين.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg px-8">
                انشر دراجتك مجاناً
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 font-semibold px-8">
                تصفح الإعلانات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 font-semibold text-foreground mb-2">
            <Bike className="w-4 h-4 text-primary" />
            سوق الدراجات
          </div>
          <p>السوق الموثوق في المملكة العربية السعودية لبيع وشراء الدراجات.</p>
        </div>
      </footer>
    </div>
  );
}
