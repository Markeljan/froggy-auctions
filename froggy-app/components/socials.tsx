import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

export const Socials = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center space-x-4", className)}>
      <Link className="w-full" href="https://discord.gg/4xeQNnGQgb" target="_blank">
        <Badge className="w-full">Discord</Badge>
      </Link>
      <Link className="w-full" href="https://twitter.com/FroggysOrd" target="_blank">
        <Badge className="w-full">Twitter</Badge>
      </Link>
      <Link className="w-full" href="https://sordinals.com/inscription/2793" target="_blank">
        <Badge className="w-full">sOrdinals</Badge>
      </Link>
    </div>
  );
};
