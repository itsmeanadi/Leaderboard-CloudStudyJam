"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name or email...",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888591]">
        <Search className="w-4 h-4" />
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm font-medium bg-white text-[#151515] placeholder:text-[#888591] border border-[#E8E5DD] rounded-xl focus:outline-none focus:border-[#171525] transition-colors shadow-2xs"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#888591] hover:text-[#171525] transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
