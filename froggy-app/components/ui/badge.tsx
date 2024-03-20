import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

export function Badge({ children, className, ...rest }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex justify-center items-center w-min rounded-full border-2 border-black bg-[#C4A1FF] px-3 py-1.5 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
