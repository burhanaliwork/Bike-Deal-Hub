import { Link } from "wouter";
import { Bike, Skeleton as SkeletonIcon } from "lucide-react";
import { useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function BikeCTAIllustration() {
  return (
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Back wheel */}
      <circle cx="58" cy="92" r="32" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5"/>
      <circle cx="58" cy="92" r="5" fill="rgba(99,179,255,0.8)"/>
      <line x1="58" y1="60" x2="58" y2="124" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="26" y1="92" x2="90" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="35" y1="69" x2="81" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="81" y1="69" x2="35" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Front wheel */}
      <circle cx="162" cy="92" r="32" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5"/>
      <circle cx="162" cy="92" r="5" fill="rgba(99,179,255,0.8)"/>
      <line x1="162" y1="60" x2="162" y2="124" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="130" y1="92" x2="194" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="139" y1="69" x2="185" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="185" y1="69" x2="139" y2="115" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Frame */}
      <path d="M58 92 L100 48 L140 58 L162 92" stroke="rgba(99,179,255,0.9)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M100 48 L110 92" stroke="rgba(99,179,255,0.9)" strokeWidth="4" strokeLinecap="round"/>
      {/* Seat post */}
      <path d="M100 48 L95 35" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M88 35 L104 35" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      {/* Fork & handlebar */}
      <path d="M140 58 L148 38" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M141 38 L158 34" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round"/>
      {/* Rider silhouette */}
      <circle cx="110" cy="22" r="9" fill="rgba(255,255,255,0.75)"/>
      <path d="M110 31 L104 50 L118 60 L128 46 L120 34 Z" fill="rgba(255,255,255,0.65)"/>
      <path d="M104 50 L90 58" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M90 58 L94 66" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M118 60 L114 76" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M118 60 L126 72" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round"/>
      {/* Speed lines */}
      <line x1="2" y1="55" x2="28" y2="55" stroke="rgba(99,179,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="66" x2="24" y2="66" stroke="rgba(99,179,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="4" y1="77" x2="20" y2="77" stroke="rgba(99,179,255,0.2)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export default function HomePage() {
  const { data: bikes, isLoading } = useListBikes({ limit: 50 } as any);

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <Navbar />

      {/* CTA Banner */}
      <section className="bg-[#0D1B35] overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 flex items-center gap-4">
          {/* Text — right side (RTL) */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-xl leading-tight mb-1">
              بيع دراجتك اليوم مجاناً
            </h2>
            <p className="text-blue-200 text-sm mb-3 leading-relaxed">
              انشر إعلانك خلال دقيقتين وتواصل مع المشترين مباشرة.
            </p>
            <Link href="/sell">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-9">
                أضف إعلانك الآن
              </Button>
            </Link>
          </div>

          {/* Illustration — left side */}
          <div className="w-36 h-24 flex-shrink-0 opacity-90">
            <BikeCTAIllustration />
          </div>
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
