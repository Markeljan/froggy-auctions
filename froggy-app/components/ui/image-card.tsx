import { cn } from "@/lib/utils/cn";

type Props = {
  imageUrl: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export function ImageCard({ imageUrl, children, className, ...rest }: Props) {
  return (
    <figure
      className={cn(
        "w-[250px] overflow-hidden rounded-md border-2 border-black bg-[#C4A1FF] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all hover:translate-x-[3px] hover:translate-y-[3px]",
        className
      )}
      {...rest}
    >
      <img
        className="w-full"
        src={imageUrl}
        alt="image"
        style={{
          imageRendering: "pixelated",
        }}
      />
      <figcaption className="border-t-2 border-black p-4">#{children}</figcaption>
    </figure>
  );
}
