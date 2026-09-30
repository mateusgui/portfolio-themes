interface ChipsProps {
  items: readonly string[];
  label?: string;
}

/** Lista de tecnologias como chips. */
export function Chips({ items, label }: ChipsProps) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-theme border border-border bg-surface-alt px-2.5 py-1 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
