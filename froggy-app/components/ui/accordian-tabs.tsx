"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils/cn";

type CombinedProps = {
  tabsContentArray: { label: string; content: string | JSX.Element }[];
  initialTab?: string;
  className?: string;
};

export const AccordionTabs = ({ tabsContentArray, initialTab, className, ...rest }: CombinedProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(initialTab || null);
  const [showContent, setShowContent] = useState(initialTab ? true : false);
  const [shouldTransition, setShouldTransition] = useState(false);

  const toggleShowContent = () => {
    setShouldTransition(true);
    if (!activeTab) {
      setActiveTab(tabsContentArray[0].label);
    }
    setShowContent(!showContent);
  };

  return (
    <div
      className={cn("flex flex-col w-full h-full", className, {
        "rounded-md": activeTab,
        "rounded-t-md": !showContent,
        " shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]": activeTab && showContent,
      })}
      {...rest}
    >
      <div className="flex w-full items-center justify-between bg-[#C4A1FF] font-bold rounded-t-md">
        {tabsContentArray.map(({ label }, index) => (
          <button
            key={index}
            onClick={() => {
              showContent ? setShouldTransition(false) : setShouldTransition(true);
              setActiveTab(label);
              !showContent && setShowContent(true);
            }}
            style={{
              backgroundColor: activeTab === label && showContent ? "#a36ec4" : "#C4A1FF",
            }}
            className="flex items-center justify-center cursor-pointer flex-1 border-2 border-black -m-[2px] max-sm:px-2 px-6 py-3 text-center font-bold transition-colors first:rounded-tl-md"
          >
            {label}
          </button>
        ))}
        <button
          role="button"
          className="py-3 border-2 border-black rounded-tr-md"
          aria-expanded={showContent}
          onClick={() => {
            toggleShowContent();
          }}
        >
          <FiPlus
            style={{ transform: `rotate(${showContent ? "45deg" : "0"})` }}
            className="mx-4 min-h-[24px] min-w-[24px] transition-transform ease-in-out"
          />
        </button>
      </div>

      {tabsContentArray.map(({ label, content }, index) => (
        <div
          key={index}
          className={cn(
            "overflow-y-auto no-scrollbar border-2 border-t-0 border-black rounded-b-[5px] -ml-[2px] bg-white font-bold",
            {
              "transition-[height] ease-in-out": shouldTransition,
              "max-sm:h-[390px] sm:h-[600px] border-2 border-black": activeTab === label && showContent,
              "h-0 border-none": activeTab !== label || !showContent,
            }
          )}
        >
          <div
            className={cn("py-8 px-6", {
              "max-sm:h-[390px] sm:h-[590px]": activeTab === label && showContent,
            })}
          >
            {content}
          </div>
        </div>
      ))}
    </div>
  );
};
