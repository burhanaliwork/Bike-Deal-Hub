import { Link } from "wouter";
import { Bike } from "lucide-react";
import { useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function BikeCTAIllustration() {
  return (
    <svg viewBox="0 0 370 118" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">

      {/* ===== BICYCLE (left) ===== */}
      <circle cx="40" cy="90" r="23" stroke="rgba(255,255,255,0.22)" strokeWidth="3"/>
      <circle cx="40" cy="90" r="5" fill="rgba(99,179,255,0.7)"/>
      <line x1="40" y1="67" x2="40" y2="113" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <line x1="17" y1="90" x2="63" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <circle cx="108" cy="90" r="23" stroke="rgba(255,255,255,0.22)" strokeWidth="3"/>
      <circle cx="108" cy="90" r="5" fill="rgba(99,179,255,0.7)"/>
      <line x1="108" y1="67" x2="108" y2="113" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <line x1="85" y1="90" x2="131" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      {/* frame */}
      <path d="M40 90 L66 52 L96 60 L108 90" stroke="rgba(99,179,255,0.85)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M66 52 L74 90" stroke="rgba(99,179,255,0.75)" strokeWidth="3" strokeLinecap="round"/>
      {/* seat */}
      <path d="M61 52 L74 52" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M67 52 L67 44" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
      {/* handlebar */}
      <path d="M96 60 L100 48 L109 46 L111 50" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* label */}
      <text x="74" y="113" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="Cairo,sans-serif">هوائية</text>

      {/* ===== ELECTRIC BIKE (center) ===== */}
      <circle cx="163" cy="90" r="23" stroke="rgba(255,255,255,0.22)" strokeWidth="3"/>
      <circle cx="163" cy="90" r="5" fill="rgba(99,179,255,0.7)"/>
      <line x1="163" y1="67" x2="163" y2="113" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <line x1="140" y1="90" x2="186" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <circle cx="231" cy="90" r="23" stroke="rgba(255,255,255,0.22)" strokeWidth="3"/>
      <circle cx="231" cy="90" r="5" fill="rgba(99,179,255,0.7)"/>
      <line x1="231" y1="67" x2="231" y2="113" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <line x1="208" y1="90" x2="254" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      {/* frame */}
      <path d="M163 90 L189 52 L219 60 L231 90" stroke="rgba(99,179,255,0.85)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M189 52 L197 90" stroke="rgba(99,179,255,0.75)" strokeWidth="3" strokeLinecap="round"/>
      {/* seat */}
      <path d="M184 52 L197 52" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M190 52 L190 44" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>
      {/* handlebar */}
      <path d="M219 60 L223 48 L232 46 L234 50" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* battery pack on down tube */}
      <rect x="177" y="66" width="18" height="8" rx="2" fill="rgba(99,179,255,0.5)" stroke="rgba(99,179,255,0.85)" strokeWidth="1.2"/>
      <rect x="195" y="68" width="3" height="4" rx="1" fill="rgba(99,179,255,0.85)"/>
      {/* lightning bolt */}
      <path d="M205 36 L199 48 L204 46 L198 60" stroke="rgba(255,220,50,0.95)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* label */}
      <text x="197" y="113" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="Cairo,sans-serif">كهربائية</text>

      {/* ===== MOTORCYCLE (right) ===== */}
      <circle cx="292" cy="90" r="26" stroke="rgba(255,255,255,0.28)" strokeWidth="5"/>
      <circle cx="292" cy="90" r="6" fill="rgba(99,179,255,0.8)"/>
      <line x1="292" y1="64" x2="292" y2="116" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      <line x1="266" y1="90" x2="318" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      <circle cx="354" cy="90" r="26" stroke="rgba(255,255,255,0.28)" strokeWidth="5"/>
      <circle cx="354" cy="90" r="6" fill="rgba(99,179,255,0.8)"/>
      <line x1="354" y1="64" x2="354" y2="116" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      <line x1="328" y1="90" x2="380" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
      {/* engine block */}
      <rect x="302" y="68" width="28" height="18" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8"/>
      {/* frame */}
      <path d="M292 90 L304 62 L326 58 L330 68 L354 90" stroke="rgba(99,179,255,0.9)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M304 62 L304 86" stroke="rgba(99,179,255,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* seat */}
      <path d="M304 62 L324 58" stroke="rgba(255,255,255,0.85)" strokeWidth="4" strokeLinecap="round"/>
      {/* handlebar (high) */}
      <path d="M326 58 L330 45 L340 43 M330 45 L323 43" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* exhaust pipe */}
      <path d="M330 80 L346 83 L356 80" stroke="rgba(255,180,80,0.55)" strokeWidth="2" strokeLinecap="round"/>
      {/* label */}
      <text x="323" y="113" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="Cairo,sans-serif">نارية</text>

      {/* speed lines (far left) */}
      <line x1="2" y1="62" x2="22" y2="62" stroke="rgba(99,179,255,0.35)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="6" y1="72" x2="20" y2="72" stroke="rgba(99,179,255,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
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
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold px-5 h-9 transition-all duration-300 ease-out">
                بيع دراجتك الآن
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
