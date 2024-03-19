"use client";

import { cn } from "@/lib/utils/cn";
import Draggable from "react-draggable";

export function DraggableContainer({
  className,
  children,
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Draggable handle=".draggable">
      <div
        className={cn(
          "flex items-center justify-center rounded-md border-2 border-black bg-white bg-[radial-gradient(#cacbce_1px,transparent_1px)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [background-size:16px_16px]",
          className
        )}
        {...rest}
      >
        <div className="draggable absolute top-0 left-0 w-full h-full -z-10 cursor-grab" />
        <div>{children}</div>
      </div>
    </Draggable>
  );
}
