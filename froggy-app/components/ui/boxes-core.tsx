"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { memo } from "react";
import { copyToClipboard } from "@/lib/utils/misc";

type BoxGridData = {
  id: number;
  inscriptionId: number;
  inscriptionHash: string;
  fileUrl: string;
  imageUrl: string;
  color: string;
};

export const BoxesCore = ({
  className,
  boxGridData,
  ...rest
}: {
  boxGridData: BoxGridData[][];
  className?: string;
}) => {
  return (
    <div
      style={{
        transform: `skewX(-48deg) skewY(14deg) scaleX(2.2) translateX(-30%) translateY(-25%)`,
      }}
      className={cn("absolute lg:top-1/2 lg:left-1/2 flex w-full h-full -z-10", className)}
      {...rest}
    >
      {boxGridData.map((row, i) => (
        <motion.div key={`row` + i} className="w-16 h-16">
          {row.map(({ inscriptionId, imageUrl, color }, j) => (
            <motion.div
              key={`col` + j}
              onClick={() => copyToClipboard(inscriptionId?.toString())}
              className={cn(
                "w-16 h-16 border-r border-t border-white relative cursor-cell active:cursor-none select-none"
              )}
            >
              <img
                src={imageUrl}
                alt={`Froggy #${inscriptionId}`}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                  userSelect: "none",
                  imageRendering: "pixelated",
                }}
              />

              <motion.span
                whileTap={{
                  opacity: 1,
                  backgroundColor: `${color}99`,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                whileHover={{
                  opacity: 1,
                  boxShadow: "0 0 0 2px var(--white)",
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                initial={{ opacity: 0 }}
                className="absolute w-full h-full flex items-center justify-center text-white text-sm leading-tight text-center select-none"
              >
                #{inscriptionId}
              </motion.span>
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="9.5"
                  stroke="white"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700 stroke-[1px] pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = memo(BoxesCore);
