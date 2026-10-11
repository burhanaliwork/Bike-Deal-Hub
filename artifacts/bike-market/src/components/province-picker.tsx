import { cn } from "@/lib/utils";
import { IRAQ_PROVINCES } from "@/lib/provinces";

interface ProvincePickerProps {
  value: string;
  onChange: (province: string) => void;
  includeAll?: boolean;
}

export default function ProvincePicker({
  value,
  onChange,
  includeAll = false,
}: ProvincePickerProps) {
  return (
    <div
      role="group"
      aria-label="المحافظة"
      className="grid grid-cols-2 gap-2"
    >
      {includeAll && (
        <button
          type="button"
          aria-pressed={!value}
          onClick={() => onChange("")}
          className={cn(
            "min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
            !value
              ? "border-primary bg-primary text-gray-900"
              : "border-gray-200 bg-white text-gray-900 hover:border-primary/60",
          )}
        >
          كل المحافظات
        </button>
      )}
      {IRAQ_PROVINCES.map((province) => {
        const isSelected = value === province;
        return (
          <button
            type="button"
            key={province}
            aria-pressed={isSelected}
            onClick={() => onChange(province)}
            className={cn(
              "min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
              isSelected
                ? "border-primary bg-primary text-gray-900"
                : "border-gray-200 bg-white text-gray-900 hover:border-primary/60",
            )}
          >
            {province}
          </button>
        );
      })}
    </div>
  );
}
