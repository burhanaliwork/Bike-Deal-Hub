import { Link } from "wouter";
import { Bike } from "lucide-react";
import { useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: bikes, isLoading } = useListBikes({ limit: 50 } as any);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Navbar />

      {/* CTA Banner */}
      <section className="bg-[#0D1B35] overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <h2 className="text-white font-black text-xl leading-tight mb-1">
            بيع دراجتك اليوم مجاناً
          </h2>
          <p className="text-blue-200 text-sm mb-3 leading-relaxed">
            انشر إعلانك خلال دقيقتين وتواصل مع المشترين مباشرة.
          </p>
          <Link href="/sell">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-9 transition-all duration-300 ease-out">
              بيع دراجتك الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Listings */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-400">
            {!isLoading && `${bikes?.length ?? 0} إعلان متوفر`}
          </span>
          <h1 className="text-base font-bold text-[#0D1B35]">جميع الدراجات</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 flex overflow-hidden h-[110px]">
                <div className="flex-1 p-3.5 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3 mt-auto" />
                </div>
                <Skeleton className="w-28 h-full rounded-none" />
              </div>
            ))}
          </div>
        ) : bikes && bikes.length > 0 ? (
          <div className="space-y-3">
            {bikes.map((bike: any) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bike className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">لا توجد إعلانات حالياً</p>
            <Link href="/sell">
              <Button className="mt-4 bg-primary text-white" size="sm">انشر أول إعلان</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#060e1e] text-gray-500 py-6 mt-4">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <img src="/logo.svg" alt="Ride IQ" className="h-7 w-auto brightness-0 invert opacity-50" />
          </div>
          <p className="text-xs">© 2025 Ride IQ — منصة الدراجات الأولى في العراق</p>
        </div>
      </footer>
    </div>
  );
}
