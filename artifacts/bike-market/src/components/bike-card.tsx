import { useLocation } from "wouter";
import { Heart, Tag, Zap, Mountain, Wind, Bike as BikeIcon, Users, HelpCircle, Phone } from "lucide-react";
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
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
      onClick={() => navigate(`/listings/${bike.id}`)}
    >
      {/* Image with overlay badges */}
      <div className="relative overflow-hidden">
        {bike.imageUrl ? (
          <img
            src={bike.imageUrl}
            alt={bike.title}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600";
            }}
          />
        ) : (
          <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
            <BikeIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Price badge — bottom right (RTL = bottom right visually) */}
        <div className="absolute bottom-0 right-0 bg-primary text-white px-3 py-1.5 font-bold text-sm rounded-tl-lg">
          {bike.price.toLocaleString()} ر.س
        </div>

        {/* Seller type badge — bottom left */}
        <div className="absolute bottom-0 left-0 bg-black/65 text-white text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-tr-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          بائع خاص
        </div>

        {/* Favorite button */}
        <Show when="signed-in">
          <button
            onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(e); }}
            className={cn(
              "absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow transition-all",
              bike.isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-400 hover:bg-red-500 hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", bike.isFavorited && "fill-current")} />
          </button>
        </Show>

        {/* Status badge */}
        {showStatus && (
          <div className="absolute top-2.5 right-2.5">
            <StatusBadge status={bike.status} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3.5">
        <h3 className="font-bold text-[#0D1B35] text-sm line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
          {bike.title}
        </h3>

        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CategoryIcon className="w-2.5 h-2.5" />
            {categoryLabels[bike.category] || bike.category}
          </span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{conditionLabels[bike.condition] || bike.condition}</span>
          {bike.brand && (
            <>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{bike.brand}</span>
            </>
          )}
        </div>

        <div
          className="flex items-center justify-between border-t border-gray-100 pt-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Phone className="w-3 h-3" />
            <span dir="ltr" className="text-gray-600 font-medium">{bike.phone}</span>
          </div>
          <a
            href={`tel:${bike.phone}`}
            className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded-md font-semibold transition-colors"
          >
            اتصل
          </a>
        </div>
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
    active: "نشط",
    pending: "قيد المراجعة",
    sold: "مباع",
    rejected: "مرفوض",
  };
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", variants[status] || variants.pending)}>
      {labels[status] || status}
    </span>
  );
}
