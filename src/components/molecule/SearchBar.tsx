interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="SEARCH..."
      className="w-full bg-black border border-white text-white px-4 py-2 font-invader text-lg tracking-widest outline-none placeholder-white"
      value={value}
      onChange={onChange}
    />
  );
}
