import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X, Bike } from "lucide-react";
import { useListBikes } from "@workspace/api-client-react";
import Navbar from "@/components/navbar";
import BikeCard from "@/components/bike-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  { value: "", label: "جميع الفئات" },
  { value: "mountain", label: "جبلية" },
  { value: "road", label: "طريق" },
  { value: "electric", label: "كهربائية" },
  { value: "bmx", label: "بي إم إكس" },
  { value: "kids", label: "أطفال" },
  { value: "hybrid", label: "هجين" },
  { value: "other", label: "أخرى" },
];

const conditions = [
  { value: "", label: "أي حالة" },
  { value: "new", label: "جديدة" },
  { value: "like_new", label: "شبه جديدة" },
  { value: "good", label: "جيدة" },
  { value: "fair", label: "مقبولة" },
];

export default function ListingsPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: bikes, isLoading } = useListBikes({
    ...(search && { search }),
    ...(category && { category }),
    ...(condition && { condition }),
    ...(minPrice && { minPrice: parseFloat(minPrice) }),
    ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategory("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = search || category || condition || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + filter bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن دراجة..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9 h-11"
              />
            </div>
            <Button type="submit" className="h-11 bg-primary hover:bg-primary/90 px-5">
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلترة
              {hasFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
            </Button>
          </form>

          {showFilters && (
            <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value || "_all"} value={c.value || "_all"}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c.value || "_all"} value={c.value || "_all"}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="أقل سعر (ر.س)"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />
              <Input
                placeholder="أعلى سعر (ر.س)"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> مسح كل الفلاتر
            </button>
          )}
        </div>

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
            <p className="text-sm text-muted-foreground">جرب تعديل الفلاتر أو كلمات البحث.</p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                مسح الفلاتر
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
