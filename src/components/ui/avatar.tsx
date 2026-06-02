import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    "from-primary to-secondary",
    "from-accent to-primary",
    "from-success to-secondary",
    "from-warning to-accent",
    "from-primary-light to-accent",
  ];
  let hash = 0;
  for (const char of name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  const safeName = name?.trim() || "Unknown";

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden ring-2 ring-border flex-shrink-0",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <img src={src} alt={safeName} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        "bg-gradient-to-br",
        getColorFromName(safeName),
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {getInitials(safeName)}
    </div>
  );
}
