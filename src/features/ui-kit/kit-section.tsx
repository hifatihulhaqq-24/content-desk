import type { ReactNode } from "react";

interface KitSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function KitSection({ id, title, description, children }: KitSectionProps) {
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function KitRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
