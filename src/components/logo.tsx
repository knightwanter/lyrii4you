import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Lyrii"
      width={size}
      height={size}
      className={cn("rounded-lg", className)}
      priority
    />
  );
}

export function LogoFull({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon size={size} />
      <span className="text-xl font-bold gradient-text">Lyrii</span>
    </div>
  );
}
