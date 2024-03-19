import React from "react";
import { cn } from "@/lib/utils/cn";

export function Container({ className, children, ...rest }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md border-2 border-black bg-white bg-[radial-gradient(#cacbce_1px,transparent_1px)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [background-size:16px_16px]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
