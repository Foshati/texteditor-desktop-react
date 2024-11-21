import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader, LoaderCircle, Sparkle } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-2 w-2",
      lg: "h-6 w-6",
      icon: "h-10 w-10",
    },
    type: {
      loader: "text-blue-500", // استایل‌های مرتبط با Loader
      loaderCircle: "text-green-500", // استایل‌های مرتبط با LoaderCircle
      sparkle: "text-[#FF7002]  fill-current ", // استایل‌های مرتبط با Sparkle
    },
  },
  defaultVariants: {
    size: "default",
    type: "loaderCircle",
  },
});

const icons = {
  loader: Loader,
  loaderCircle: LoaderCircle,
  sparkle: Sparkle,
};

export const Spinner = ({ size, type, className }) => {
  const IconComponent = icons[type || "loaderCircle"]; // انتخاب آیکون بر اساس نوع
  return (
    <IconComponent className={cn(spinnerVariants({ size, type }), className)} />
  );
};
