import { Link, useLocation } from "wouter";
import { Heart, Phone, Tag, Zap, Mountain, Wind, Bike as BikeIcon, Users, HelpCircle } from "lucide-react";
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
  mountain: Mountain,
  road: Wind,
  electric: Zap,
  bmx: Tag,
  kids: Users,
  hybrid: BikeIcon,
  other: HelpCircle,
};

const categoryLabels: Record<string, string> = {
  mountain: "جبلية",
  road: "طريق",
  electric: "كهربائية",
  bmx: "بي إم إكس",
  kids: "أطفال",
  hybrid: "هجين",
  other: "أخرى",
};

const conditionColors: Record<string, string> = {
  new: "bg-emerald-100 text-emerald-700 border-emerald-200",
  like_new: "bg-blue-100 text-blue-700 border-blue-200",
  good: "bg-yellow-100 text-yellow-700 border-yellow-200",
  fair: "bg-orange-100 text-orange-700 border-orange-200",
};

const conditionLabels: Record<string, string> = {
  new: "جديدة",
  like_new: "شبه جديدة",
  good: "جيدة",
  fair: "مقبولة",
};

export default function BikeCard({ bike, showStatus = false }: { bike: Bike; showStatus?: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const CategoryIcon = categoryIcons[bike.category] || BikeIcon;

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

  const [, navigate] = useLocation();

  return (
    <div
      className="group bg-card rounded-xl border border-card-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      onClick={() => navigate(`/listings/${bike.id}`)}
    >
      <div className="relative">
        {bike.imageUrl ? (
          <img
            src={bike.imageUrl}
            alt={bike.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600";
            }}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <BikeIcon className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Category chip */}
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            <CategoryIcon className="w-3 h-3" />
            {categoryLabels[bike.category] || bike.category}
          </span>
        </div>

        {/* Favorite button */}
        <Show when="signed-in">
          <button
            onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(e); }}
            className={cn(
              "absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
              bike.isFavorited
                ? "bg-red-500 text-white shadow-md"
                : "bg-black/50 backdrop-blur-sm text-white hover:bg-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", bike.isFavorited && "fill-current")} />
          </button>
        </Show>

        {showStatus && (
          <div className="absolute bottom-3 right-3">
            <StatusBadge status={bike.status} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {bike.title}
          </h3>
          <span className="font-bold text-primary whitespace-nowrap">
            {bike.price.toLocaleString()} ر.س
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", conditionColors[bike.condition] || conditionColors.fair)}>
            {conditionLabels[bike.condition] || bike.condition}
          </span>
          {bike.brand && (
            <span className="text-xs text-muted-foreground">{bike.brand}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground" dir="ltr">{bike.phone}</span>
          </div>
          <a
            href={`tel:${bike.phone}`}
            className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1 rounded-md font-medium transition-colors"
          >
            اتصل بالبائع
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    sold: "bg-gray-100 text-gray-500 border border-gray-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
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
