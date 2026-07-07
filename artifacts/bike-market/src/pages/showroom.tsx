import { useParams, useLocation } from "wouter";
import { ArrowRight, Bike, BadgeCheck, MapPin, Store, Phone } from "lucide-react";
import { useGetShowroom, useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ShowroomPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const showroomId = parseInt(id || "0");

  const { data: showroom, isLoading } = useGetShowroom(showroomId, {
    query: { enabled: !!showroomId },
  } as any);
  const { data: bikes, isLoading: bikesLoading } = useListBikes(
    { showroomId },
    { query: { enabled: !!showroomId } } as any,
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          العودة للإعلانات
        </button>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ) : !showroom ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">صالة العرض غير موجودة</h2>
            <Button onClick={() => navigate("/listings")} variant="outline">
              العودة للإعلانات
            </Button>
          </div>
        ) : (
          <>
            {/* Showroom header */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                  {showroom.imageUrl ? (
                    <img
                      src={showroom.imageUrl}
                      alt={showroom.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-foreground mb-1">
                    صالة عرض {showroom.name}
                  </h1>
                  {showroom.verified && (
                    <div className="flex items-center gap-1.5 text-sm text-primary font-bold mb-2">
                      <BadgeCheck className="w-5 h-5" />
                      صالة عرض معتمدة
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {showroom.bikesCount ?? 0} إعلان نشط
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {showroom.googleMapsUrl && (
                    <a
                      href={showroom.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 rounded-lg py-2 px-4 hover:bg-primary/5 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      الموقع على كوكل ماب
                    </a>
                  )}
                  {showroom.phone && (
                    <a
                      href={`tel:${showroom.phone}`}
                      className="flex items-center justify-center gap-1.5 text-sm font-semibold bg-primary text-white rounded-lg py-2 px-4 hover:bg-primary/90 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      اتصل بصالة العرض
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bikes */}
            <h2 className="text-xl font-bold text-foreground mb-5">منتجات صالة العرض</h2>
            {bikesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : bikes && bikes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {bikes.map((bike: any) => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  لا توجد منتجات حالياً
                </h3>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
