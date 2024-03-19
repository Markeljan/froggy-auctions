import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

type Props = {
  label: string;
  content: string | React.ReactNode;
  className?: string;
};

export function Accordion({ label, content, className, ...rest }: Props) {
  const [showContent, setShowContent] = useState(false);
  const [contentHeight, setContentHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    }
  }, [showContent]);

  return (
    <div
      className={cn("w-[500px] rounded-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}
      {...rest}
    >
      <button
        role="button"
        aria-expanded={showContent}
        style={{ borderBottom: showContent ? "solid 2px" : "0px" }}
        className="flex w-full items-center justify-between rounded-t-[4px] border-black bg-[#C4A1FF] p-5 font-bold"
        onClick={() => {
          setShowContent(!showContent);
        }}
      >
        {label}
        <FiPlus
          style={{ transform: `rotate(${showContent ? "45deg" : "0"})` }}
          className="ml-4 min-h-[24px] min-w-[24px] transition-transform ease-in-out"
        />
      </button>
      <div
        ref={contentRef}
        style={{ height: showContent ? `${contentHeight}` : "0" }}
        className="overflow-hidden rounded-b-[5px] bg-white font-bold transition-[height] ease-in-out"
      >
        <div className="p-5">{content}</div>
      </div>
    </div>
  );
}
