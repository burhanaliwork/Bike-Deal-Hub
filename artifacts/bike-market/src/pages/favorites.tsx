import { Link, Redirect } from "wouter";
import { Show } from "@clerk/react";
import { useGetFavorites } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Bike } from "lucide-react";

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useGetFavorites();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3 mb-1">
            <Heart className="w-7 h-7 text-red-500 fill-current" />
            الدراجات المحفوظة
          </h1>
          <p className="text-muted-foreground">الدراجات التي حفظتها لاحقاً</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد دراجات محفوظة</h3>
            <p className="text-muted-foreground mb-6">تصفح الإعلانات واضغط على القلب لحفظ الدراجات التي تعجبك.</p>
            <Link href="/listings">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Bike className="w-4 h-4" />
                تصفح الإعلانات
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-5">{favorites.length} دراجة محفوظة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favorites.map((bike: any) => (
                <BikeCard key={bike.id} bike={{ ...bike, isFavorited: true }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
