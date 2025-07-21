import * as React from "react";

export function Separator({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={`my-4 h-px w-full bg-gray-200 ${className}`}
      {...props}
    />
  );
}
