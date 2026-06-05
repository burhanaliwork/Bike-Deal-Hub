import { useLocation } from "wouter";
import { Heart, Tag, Zap, Mountain, Wind, Bike as BikeIcon, Users, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddFavorite, useRemoveFavorite } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetFavoritesQueryKey, getListBikesQueryKey } from "@workspace/api-client-react";
import { Show } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";

interface Bike {
  id: number;
  title: string;
  price: number;
  category: string;
  condition: string;
  brand?: string;
  phone: string;
  imageUrl?: string;
  status: string;
  isFavorited?: boolean;
  userName?: string;
  createdAt: string;
}

const categoryIcons: Record<string, any> = {
  mountain: Mountain, road: Wind, electric: Zap, bmx: Tag, kids: Users, hybrid: BikeIcon, other: HelpCircle,
};
const categoryLabels: Record<string, string> = {
  mountain: "جبلية", road: "طريق", electric: "كهربائية", bmx: "بي إم إكس",
  kids: "أطفال", hybrid: "هجين", other: "أخرى",
};
const conditionLabels: Record<string, string> = {
  new: "جديدة", like_new: "شبه جديدة", good: "جيدة", fair: "مقبولة",
};

export default function BikeCard({ bike, showStatus = false }: { bike: Bike; showStatus?: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const CategoryIcon = categoryIcons[bike.category] || BikeIcon;
  const [, navigate] = useLocation();

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
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 flex items-stretch"
      onClick={() => navigate(`/listings/${bike.id}`)}
    >
      {/* Text side (right in RTL = right visually) */}
      <div className="flex-1 p-3.5 flex flex-col gap-1.5 min-w-0">
        {/* Title */}
        <h3 className="font-bold text-[#0D1B35] text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {bike.title}
        </h3>

        {/* Specs chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
            <CategoryIcon className="w-2.5 h-2.5" />
            {categoryLabels[bike.category] || bike.category}
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {conditionLabels[bike.condition] || bike.condition}
          </span>
          {bike.brand && (
            <span className="text-xs text-gray-400">{bike.brand}</span>
          )}
        </div>

        {/* Price */}
        <div className="text-lg font-black text-primary leading-none mt-auto">
          <span className="text-sm font-bold">$</span>{bike.price.toLocaleString()}
        </div>

        {/* Phone row */}
        <div
          className="flex items-center justify-between mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`tel:${bike.phone}`}
            className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded-md font-semibold transition-colors"
          >
            اتصل
          </a>
          <span dir="ltr" className="text-xs text-gray-400 font-medium">{bike.phone}</span>
        </div>
      </div>

      {/* Image side (left in RTL = left visually) */}
      <div className="relative w-28 flex-shrink-0">
        {bike.imageUrl ? (
          <img
            src={bike.imageUrl}
            alt={bike.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center min-h-[110px]">
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
        <Show when="signed-in">
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              "absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all",
              bike.isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-400 hover:bg-red-500 hover:text-white"
            )}
          >
            <Heart className={cn("w-3 h-3", bike.isFavorited && "fill-current")} />
          </button>
        </Show>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    sold: "bg-gray-100 text-gray-500",
    rejected: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    active: "نشط", pending: "قيد المراجعة", sold: "مباع", rejected: "مرفوض",
  };
  return (
    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", variants[status] || variants.pending)}>
      {labels[status] || status}
    </span>
  );
}
