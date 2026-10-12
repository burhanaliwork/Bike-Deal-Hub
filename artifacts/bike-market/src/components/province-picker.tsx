import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRAQ_PROVINCES } from "@/lib/provinces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [open, setOpen] = useState(false);
  const selectedLabel = value || (includeAll ? "كل المحافظات" : "");

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="button-open-province-picker"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-right text-sm font-semibold text-gray-900 transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className={selectedLabel ? "text-gray-900" : "text-gray-500"}>
          {selectedLabel || "اختر المحافظة"}
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir="rtl"
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl p-4 sm:p-5"
        >
          <DialogHeader className="space-y-1 pr-7 text-right">
            <DialogTitle className="text-base font-bold text-gray-900">
              اختر المحافظة
            </DialogTitle>
          </DialogHeader>

          <div
            role="group"
            aria-label="المحافظة"
            className="grid grid-cols-3 gap-2"
          >
            {includeAll && (
              <button
                type="button"
                data-testid="province-option-all"
                aria-pressed={!value}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={cn(
                  "min-h-11 rounded-lg border px-2 py-2 text-xs font-semibold leading-tight text-gray-900 transition-colors sm:text-sm",
                  !value
                    ? "border-primary bg-primary"
                    : "border-gray-200 bg-white hover:border-primary/60",
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
                  data-testid={`province-option-${province}`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(province);
                    setOpen(false);
                  }}
                  className={cn(
                    "min-h-11 rounded-lg border px-2 py-2 text-xs font-semibold leading-tight text-gray-900 transition-colors sm:text-sm",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-gray-200 bg-white hover:border-primary/60",
                  )}
                >
                  {province}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
