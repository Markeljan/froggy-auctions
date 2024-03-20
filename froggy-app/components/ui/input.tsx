import { cn } from "@/lib/utils/cn";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ value, onChange, className, ...rest }: Props) {
  return (
    <input
      className={cn(
        "rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none",
        className
      )}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
}
