import React from "react";
import { cn } from "@/lib/utils";

export const DotBackground = ({
  className,
  children,
  dotColor = "#d4d4cf",
  dotSize = "20px_20px",
  fade = true,
}) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          `[background-size:${dotSize}]`,
          `[background-image:radial-gradient(${dotColor}_1.2px,transparent_1.2px)]`
        )}
      />
      {fade && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)] bg-[#fbfbfa]/50" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};