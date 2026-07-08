import { useState, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { ArrowRight, Phone, Heart, Share2, Bike, Tag, Zap, Mountain, Wind, Users, HelpCircle, Gauge, ChevronLeft, ChevronRight, BadgeCheck, MapPin, Store } from "lucide-react";
import { useGetBike, useAddFavorite, useRemoveFavorite, getGetFavoritesQueryKey, getListBikesQueryKey, getGetBikeQueryKey } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import { StatusBadge } from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Show } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  mountain: Mountain, road: Wind, electric: Zap, motorcycle: Gauge, bmx: Tag, kids: Users, hybrid: Bike, other: HelpCircle,
};
const categoryLabels: Record<string, string> = {
  mountain: "جبلية", road: "طريق", electric: "كهربائية", motorcycle: "نارية", bmx: "بي إم إكس", kids: "أطفال", hybrid: "هجين", other: "أخرى",
};
const conditionLabels: Record<string, string> = {
  new: "جديدة", used: "مستخدمة", like_new: "شبه جديدة", good: "جيدة", fair: "مقبولة",
};

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const bikeId = parseInt(id || "0");
  const { data: bike, isLoading } = useGetBike(bikeId, { query: { enabled: !!bikeId } } as any);
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const CategoryIcon = bike ? (categoryIcons[bike.category] || Bike) : Bike;
  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const imageCount = bike?.images?.length ?? 0;

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (imageCount < 2) return;
    setActiveImage((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (imageCount < 2) return;
    setActiveImage((prev) => (prev + 1) % imageCount);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const delta = touchDeltaX.current;
    const threshold = 40;
    if (delta > threshold) {
      goToPrev();
    } else if (delta < -threshold) {
      goToNext();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleFavoriteToggle = () => {
    if (!bike) return;
    if (bike.isFavorited) {
      removeFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetBikeQueryKey(bike.id) });
          toast({ title: "تمت إزالتها من المفضلة" });
        },
      });
    } else {
      addFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetBikeQueryKey(bike.id) });
          toast({ title: "تمت إضافتها للمفضلة" });
        },
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "تم نسخ الرابط!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          العودة للإعلانات
        </button>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="w-full aspect-[4/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : !bike ? (
          <div className="text-center py-20">
            <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">الدراجة غير موجودة</h2>
            <Button onClick={() => navigate("/listings")} variant="outline">العودة للإعلانات</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div
                className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] touch-pan-y select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  dir="ltr"
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${(bike.images?.length ?? 1) > 1 ? activeImage * 100 : 0}%)` }}
                >
                  {(bike.images && bike.images.length > 0 ? bike.images : [null]).map((img: string | null, i: number) => (
                    <div key={i} className="w-full h-full flex-shrink-0">
                      {img ? (
                        <img
                          src={img}
                          alt={`${bike.title} ${i + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bike className="w-24 h-24 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {bike.images && bike.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrev}
                      aria-label="الصورة السابقة"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      aria-label="الصورة التالية"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-gray-700 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {bike.images.map((_: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          aria-label={`صورة ${i + 1}`}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            activeImage === i ? "bg-white w-4" : "bg-white/60"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <Show when="signed-in">
                    <button
                      onClick={handleFavoriteToggle}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all",
                        bike.isFavorited ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-red-50"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", bike.isFavorited && "fill-current")} />
                    </button>
                  </Show>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white text-gray-600 flex items-center justify-center shadow-md hover:bg-gray-50"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {bike.images && bike.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {bike.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                        activeImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt={`${bike.title} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-2xl font-black text-foreground">{bike.title}</h1>
                <StatusBadge status={bike.status} />
              </div>

              <div className="text-3xl font-black text-primary mb-4">
                {bike.priceOnRequest
                  ? <span className="text-xl font-bold text-muted-foreground">يرجى طلب السعر</span>
                  : <>{Number(bike.price).toLocaleString()} <span className="text-lg font-bold">د.ع</span></>
                }
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="flex items-center gap-1.5 text-sm bg-muted px-3 py-1.5 rounded-lg font-medium">
                  <CategoryIcon className="w-4 h-4 text-primary" />
                  {categoryLabels[bike.category] || bike.category}
                </span>
                <span className="text-sm bg-muted px-3 py-1.5 rounded-lg font-medium">
                  {conditionLabels[bike.condition] || bike.condition}
                </span>
                {bike.brand && (
                  <span className="text-sm bg-muted px-3 py-1.5 rounded-lg font-medium">{bike.brand}</span>
                )}
                {bike.category === "motorcycle" && bike.mileage != null && (
                  <span className="flex items-center gap-1.5 text-sm bg-muted px-3 py-1.5 rounded-lg font-medium">
                    <Gauge className="w-4 h-4 text-primary" />
                    {Number(bike.mileage).toLocaleString()} كم
                  </span>
                )}
                {bike.category === "motorcycle" && (
                  <span className={cn(
                    "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium",
                    bike.hasDocuments ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                  )}>
                    <Tag className="w-4 h-4" />
                    {bike.hasDocuments ? "مع أوراق رسمية" : "بدون أوراق رسمية"}
                  </span>
                )}
              </div>

              {bike.description && (
                <div className="mb-5">
                  <h3 className="font-semibold text-foreground mb-2">مواصفات الدراجة</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{bike.description}</p>
                </div>
              )}

              {bike.showroom && (
                <div className="mb-5 bg-card border border-border rounded-xl p-4">
                  <Link
                    href={`/showrooms/${bike.showroom.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {bike.showroom.imageUrl ? (
                        <img
                          src={bike.showroom.imageUrl}
                          alt={bike.showroom.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        صالة عرض {bike.showroom.name}
                      </div>
                      {bike.showroom.verified && (
                        <div className="flex items-center gap-1 text-xs text-primary font-semibold mt-0.5">
                          <BadgeCheck className="w-4 h-4" />
                          صالة عرض معتمدة
                        </div>
                      )}
                    </div>
                  </Link>
                  {bike.showroom.googleMapsUrl && (
                    <a
                      href={bike.showroom.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 rounded-lg py-2 hover:bg-primary/5 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      الموقع على كوكل ماب
                    </a>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={`tel:${bike.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  اتصل بالبائع
                </a>
                <a
                  href={`https://wa.me/${bike.phone.replace(/\D/g, "")}?text=مرحباً، أنا مهتم بإعلان دراجتك: ${bike.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  واتساب
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
