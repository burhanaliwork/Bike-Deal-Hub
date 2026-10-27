import { useLocation } from "wouter";
import { Heart, Bike as BikeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetFavoritesQueryKey, getListBikesQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface Bike {
  id: number;
  title: string;
  price: number | null;
  priceOnRequest?: boolean;
  category: string;
  condition: string;
  brand?: string;
  phone: string;
  images?: string[];
  description?: string | null;
  province?: string | null;
  hasDelivery?: boolean;
  hasDocuments?: boolean;
  mileage?: number | null;
  engineCapacity?: number | null;
  status: string;
  isFavorited?: boolean;
  userName?: string;
  createdAt: string;
}

const conditionLabels: Record<string, string> = {
  new: "جديدة",
  used: "مستخدمة",
  like_new: "شبه جديدة",
  good: "جيدة",
  fair: "مقبولة",
};

export default function BikeCard({ bike, showStatus = false }: { bike: Bike; showStatus?: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const [, navigate] = useLocation();
  const displayTitle = bike.title;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bike.isFavorited) {
      removeFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
          toast({ title: "تمت إزالتها من المفضلة" });
        },
      });
    } else {
      addFav.mutate({ bikeId: bike.id }, {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
          qc.invalidateQueries({ queryKey: getListBikesQueryKey() });
          toast({ title: "تمت إضافتها للمفضلة" });
        },
      });
    }
  };

  return (
    <div
      data-testid={`card-bike-${bike.id}`}
      className="group min-h-[136px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 flex items-stretch"
      onClick={() => navigate(`/listings/${bike.id}`)}
    >
      {/* Text side (right in RTL = right visually) */}
      <div className="flex-1 p-3.5 flex flex-col gap-1.5 min-w-0">
        {/* Title */}
        <h3
          data-testid={`text-bike-title-${bike.id}`}
          className="font-bold text-gray-900 text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2"
        >
          {displayTitle}
        </h3>

        {bike.brand && !bike.title.includes(bike.brand) && (
          <p className="text-xs text-gray-500">{bike.brand}</p>
        )}

        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-gray-900">
          <span
            data-testid={`bike-province-${bike.id}`}
            className="rounded-full bg-gray-100 px-2 py-1"
          >
            المحافظة: {bike.province || "غير محددة"}
          </span>
          <span
            data-testid={`bike-condition-${bike.id}`}
            className="rounded-full bg-gray-100 px-2 py-1"
          >
            الحالة: {conditionLabels[bike.condition] || bike.condition}
          </span>
        </div>

        {/* Price */}
        <div className="text-lg font-black text-gray-900 leading-none mt-auto">
          {bike.priceOnRequest
            ? <span className="text-sm font-bold text-muted-foreground">يرجى طلب السعر</span>
            : <>{(bike.price ?? 0).toLocaleString()} <span className="text-sm font-bold">د.ع</span></>
          }
        </div>

      </div>

      {/* Image side (left in RTL = left visually) */}
      <div className="relative w-32 flex-shrink-0">
        {bike.images?.[0] ? (
          <img
            src={bike.images[0]}
            alt={displayTitle}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <BikeIcon className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Seller type badge */}
        <div className="absolute bottom-0 right-0 left-0 bg-black/60 text-white text-[10px] px-1.5 py-1 text-center flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block flex-shrink-0" />
          بائع خاص
        </div>

        {/* Status badge */}
        {showStatus && (
          <div className="absolute top-1.5 right-1.5">
            <StatusBadge status={bike.status} />
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={handleFavoriteToggle}
          data-testid={`button-favorite-bike-${bike.id}`}
          className={cn(
            "absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all",
            bike.isFavorited
              ? "bg-red-500 text-gray-900"
              : "bg-white/90 text-gray-900 hover:bg-red-500 hover:text-gray-900"
          )}
        >
          <Heart className={cn("w-3 h-3", bike.isFavorited && "fill-current")} />
        </button>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "active") return null;

  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    sold: "bg-gray-100 text-gray-500",
    rejected: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    pending: "قيد المراجعة", sold: "مباع", rejected: "مرفوض",
  };
  return (
    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", variants[status] || variants.pending)}>
      {labels[status] || status}
    </span>
  );
}
