import { useState } from "react";
import { useLocation } from "wouter";
import { X, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
}

type BikeMainType = "bicycle" | "electric" | "motorcycle";
type Condition = "all" | "new" | "used";
type Documents = "all" | "with" | "without";

const mainTypes: { value: BikeMainType; label: string }[] = [
  { value: "bicycle", label: "دراجات هوائية" },
  { value: "electric", label: "دراجات كهربائية" },
  { value: "motorcycle", label: "دراجات نارية" },
];

export default function FilterDrawer({ open, onClose }: FilterDrawerProps) {
  const [, navigate] = useLocation();
  const [mainType, setMainType] = useState<BikeMainType | "">("");
  const [condition, setCondition] = useState<Condition>("all");
  const [documents, setDocuments] = useState<Documents>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minOdo, setMinOdo] = useState("");
  const [maxOdo, setMaxOdo] = useState("");

  const showOdometer = mainType === "electric" || mainType === "motorcycle";
  const showDocuments = mainType === "motorcycle";

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (mainType === "bicycle") params.set("mainType", "bicycle");
    else if (mainType === "electric") params.set("category", "electric");
    else if (mainType === "motorcycle") params.set("category", "motorcycle");

    if (condition === "new") params.set("condition", "new");
    else if (condition === "used") params.set("condition", "used");

    if (showDocuments) {
      if (documents === "with") params.set("documents", "with");
      else if (documents === "without") params.set("documents", "without");
    }

    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    if (showOdometer) {
      if (minOdo) params.set("minOdo", minOdo);
      if (maxOdo) params.set("maxOdo", maxOdo);
    }

    onClose();
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleClear = () => {
    setMainType("");
    setCondition("all");
    setDocuments("all");
    setMinPrice("");
    setMaxPrice("");
    setMinOdo("");
    setMaxOdo("");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-[#0D1B35] text-lg flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            بحث عن دراجة
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* نوع الدراجة */}
          <div>
            <h3 className="font-bold text-[#0D1B35] mb-3 text-sm">نوع الدراجة</h3>
            <div className="grid grid-cols-1 gap-2">
              {mainTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setMainType(t.value)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all text-right",
                    mainType === t.value
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* الحالة */}
          <div>
            <h3 className="font-bold text-[#0D1B35] mb-3 text-sm">الحالة</h3>
            <div className="flex gap-2">
              {[
                { value: "all" as Condition, label: "الكل" },
                { value: "new" as Condition, label: "جديد" },
                { value: "used" as Condition, label: "مستخدم" },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCondition(c.value)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                    condition === c.value
                      ? "border-primary bg-primary text-white"
                      : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* الأوراق الرسمية — فقط للدراجات النارية */}
          {showDocuments && (
            <div>
              <h3 className="font-bold text-[#0D1B35] mb-3 text-sm">الأوراق الرسمية</h3>
              <div className="flex gap-2">
                {[
                  { value: "all" as Documents, label: "الكل" },
                  { value: "with" as Documents, label: "مع أوراق" },
                  { value: "without" as Documents, label: "بدون أوراق" },
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDocuments(d.value)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      documents === d.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* السعر */}
          <div>
            <h3 className="font-bold text-[#0D1B35] mb-3 text-sm">نطاق السعر ($)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">أقل سعر</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-10 border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">أعلى سعر</label>
                <Input
                  type="number"
                  placeholder="غير محدد"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-10 border-gray-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* عداد المسافة — فقط للكهربائية والنارية */}
          {showOdometer && (
            <div>
              <h3 className="font-bold text-[#0D1B35] mb-3 text-sm">
                عداد المسافة (كم)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">أقل عداد</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minOdo}
                    onChange={(e) => setMinOdo(e.target.value)}
                    className="h-10 border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">أقصى عداد</label>
                  <Input
                    type="number"
                    placeholder="غير محدد"
                    value={maxOdo}
                    onChange={(e) => setMaxOdo(e.target.value)}
                    className="h-10 border-gray-200 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 border-gray-200 text-gray-500 hover:border-gray-300"
            onClick={handleClear}
          >
            مسح الكل
          </Button>
          <Button
            className="flex-1 h-11 bg-[#0D1B35] hover:bg-[#1a2d55] text-white font-bold gap-2"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
            عرض النتائج
          </Button>
        </div>
      </div>
    </>
  );
}
