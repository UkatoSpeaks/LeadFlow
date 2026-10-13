interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full md:max-w-xs">
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      >
        <circle cx="9" cy="9" r="5.5" />
        <path d="m13.5 13.5 4 4" strokeLinecap="square" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search leads by name"
        aria-label="Search leads by name"
        className="w-full border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-forest focus:outline-2 focus:outline-offset-0 focus:outline-forest/25"
      />
    </div>
  );
}
