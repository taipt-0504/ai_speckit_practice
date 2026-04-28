'use client';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <input
      id="transaction-search"
      type="text"
      placeholder="Search title or notes"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Search transactions"
    />
  );
}
