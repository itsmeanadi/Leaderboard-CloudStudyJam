"use client";

import React from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search by name or email..." }: SearchBarProps) {
    return (
        <div className="relative w-full">
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono bg-background text-foreground border border-[#E0E0E0] dark:border-[#333333] focus:outline-none focus:border-foreground"
            />
            {value && (
                <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold hover:text-red-500">
                    X
                </button>
            )}
        </div>
    );
}