import { useState } from "react";
import { Search, Bike } from "lucide-react";
import { useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingsPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const category = params.get("category") || "";
  const condition = params.get("condition") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const minMileage = params.get("minMileage") || "";
  const maxMileage = params.get("maxMileage") || "";

  const { data: bikes, isLoading } = useListBikes({
    ...(search && { search }),
    ...(category && { category }),
    ...(condition && { condition }),
    ...(minPrice && { minPrice: parseFloat(minPrice) }),
    ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
    ...(minMileage && { minMileage: parseFloat(minMileage) }),
    ...(maxMileage && { maxMileage: parseFloat(maxMileage) }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن دراجة..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-9 h-11"
          />
        </form>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-foreground">
            {isLoading ? "جاري التحميل..." : `${bikes?.length ?? 0} دراجة متوفرة`}
          </h1>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : bikes && bikes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {bikes.map((bike: any) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bike className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">لا توجد دراجات</h3>
            <p className="text-sm text-muted-foreground">جرب تعديل كلمات البحث.</p>
          </div>
        )}
      </div>
    </div>
  );
}
