import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, children, ...rest }: Props) {
  return (
    <button
      role="button"
      aria-label="Click to perform an action"
      className={cn(
        "flex cursor-pointer items-center rounded-md border-2 border-black bg-purple-300 px-10 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:pointer-events-none disabled:select-none disabled:bg-gray-300",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
