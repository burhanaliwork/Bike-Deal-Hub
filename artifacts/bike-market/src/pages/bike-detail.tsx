import { useParams, useLocation } from "wouter";
import { ArrowLeft, Phone, Heart, Share2, Bike, Calendar, Tag, Zap, Mountain, Wind, Users, HelpCircle } from "lucide-react";
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
  mountain: Mountain, road: Wind, electric: Zap, bmx: Tag, kids: Users, hybrid: Bike, other: HelpCircle,
};
const categoryLabels: Record<string, string> = {
  mountain: "Mountain", road: "Road", electric: "Electric", bmx: "BMX", kids: "Kids", hybrid: "Hybrid", other: "Other",
};
const conditionLabels: Record<string, string> = {
  new: "New", like_new: "Like New", good: "Good", fair: "Fair",
};

export default function BikeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const bikeId = parseInt(id || "0");
  const { data: bike, isLoading } = useGetBike(bikeId, { query: { enabled: !!bikeId } });
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();

  const CategoryIcon = bike ? (categoryIcons[bike.category] || Bike) : Bike;

  const handleFavoriteToggle = () => {
    if (!bike) return;
    if (bike.isFavorited) {
      removeFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetBikeQueryKey(bike.id) });
          toast({ title: "Removed from favorites" });
        },
      });
    } else {
      addFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetBikeQueryKey(bike.id) });
          toast({ title: "Added to favorites" });
        },
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to listings
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
            <h2 className="text-xl font-bold mb-2">Bike not found</h2>
            <Button onClick={() => navigate("/listings")} variant="outline">Back to listings</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3]">
              {bike.imageUrl ? (
                <img
                  src={bike.imageUrl}
                  alt={bike.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bike className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
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

            {/* Details */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-2xl font-black text-foreground">{bike.title}</h1>
                <StatusBadge status={bike.status} />
              </div>

              <div className="text-3xl font-black text-primary mb-4">
                SAR {Number(bike.price).toLocaleString()}
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
              </div>

              {bike.description && (
                <div className="mb-5">
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{bike.description}</p>
                </div>
              )}

              <div className="border border-border rounded-xl p-4 mb-5 space-y-3">
                <h3 className="font-semibold text-foreground">Seller Information</h3>
                {bike.userName && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{bike.userName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground text-lg">{bike.phone}</span>
                </div>
                {bike.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Listed {new Date(bike.createdAt).toLocaleDateString("en-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${bike.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call Seller
                </a>
                <a
                  href={`https://wa.me/${bike.phone.replace(/\D/g, "")}?text=Hi, I'm interested in your bike listing: ${bike.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
