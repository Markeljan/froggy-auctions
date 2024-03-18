import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

type CombinedProps = {
  tabsContentArray: { label: string; content: string }[];
  className?: string;
};

const AccordionTabs = ({ tabsContentArray, className, ...rest }: CombinedProps) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  const [contentHeight, setContentHeight] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (activeTab !== null) {
      const index = tabsContentArray.findIndex((tab) => tab.label === activeTab);
      if (contentRef.current[index]) {
        setContentHeight(`${contentRef.current[index].scrollHeight}px`);
      }
    } else {
      setContentHeight(null);
    }
  }, [activeTab, tabsContentArray]);

  const toggleShowContent = () => {
    if (!activeTab) {
      setActiveTab(tabsContentArray[0].label);
    }
    setShowContent(!showContent);
  };

  return (
    <div
      className={cn("flex flex-col w-[500px] rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}
      {...rest}
    >
      <div className="flex w-full items-center justify-between bg-[#C4A1FF] font-bold rounded-t-md">
        {tabsContentArray.map(({ label }, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveTab(label);
              setShowContent(true);
            }}
            style={{
              backgroundColor: activeTab === label && showContent ? "#a36ec4" : "#C4A1FF",
            }}
            className="cursor-pointer flex-1 border-2 border-black -m-[2px] px-6 py-3 text-center font-bold transition-colors first:rounded-tl-md"
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

      {/* Active Tab Content */}

      {tabsContentArray.map(({ label, content }, index) => (
        <div
          key={index}
          ref={(el) => (contentRef.current[index] = el as HTMLDivElement) || null}
          style={{
            height: activeTab === label && showContent ? `${contentHeight}` : "0",
            border: activeTab === label && showContent ? "solid 2px" : "0px",
            borderTop: 0,
          }}
          className={cn(
            "overflow-hidden border-2 border-t-0 border-black rounded-b-[5px] -ml-[2px] bg-white font-bold transition-[height] ease-in-out",
            {}
          )}
        >
          <div className="py-10 px-20">{content}</div>
        </div>
      ))}
    </div>
  );
};

export default AccordionTabs;
