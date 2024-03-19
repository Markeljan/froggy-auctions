import { cn } from "@/lib/utils/cn";
import { ReactNode } from "react";

type Props = {
  tabsArray: { label: string; content: ReactNode }[];
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
};

export function Tabs({ tabsArray, activeTab, setActiveTab, className, ...rest }: Props) {
  return (
    <div className={cn("flex flex-col w-[500px] rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)} {...rest}>
      {/* Tabs Row */}
      <div className="flex border-b-2 border-black mx-[2px]">
        {tabsArray.map(({ label }, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(label)}
            style={{
              backgroundColor: activeTab === label ? "#a36ec4" : "#C4A1FF",
            }}
            className="cursor-pointer flex-1 border-2 border-black -m-[2px] px-6 py-3 text-center font-bold transition-colors first:rounded-tl-md last:rounded-tr-md"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="flex-1 max-w-full border-2 border-t-0 border-black bg-white p-5 font-bold">
        {tabsArray.map(({ label, content }, index) => (
          <div key={index} style={{ display: activeTab === label ? "block" : "none" }}>
            {content}
          </div>
        ))}
      </div>
    </div>
  );
}
