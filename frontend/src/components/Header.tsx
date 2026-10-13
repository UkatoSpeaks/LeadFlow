export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-7 place-items-center bg-forest">
            <span className="size-2.5 bg-lime" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-ink">LeadFlow</span>
          <span className="label hidden border-l border-line-strong pl-3 text-muted sm:inline">Lead management</span>
        </div>
        {children}
      </div>
    </header>
  );
}
