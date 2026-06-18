"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
    value, 
    onChange, 
    placeholder = "Search by name or email..." 
}) => {
    return (
        <div className="relative w-full">
            <div 
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    value ? "text-foreground" : "text-muted-foreground"
                }`}
            >
                <Search className="h-5 w-5" />
            </div>
            
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    pl-9 pr-9 w-full h-10 rounded-none text-sm font-mono bg-background text-foreground
                    shadow-none border border-[#E0E0E0] dark:border-[#333333]
                    focus-visible:ring-0 focus-visible:border-foreground
                `}
            />

            {value && (
                <button
                    onClick={() => onChange("")}
                    aria-label="Clear Search"
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground hover:bg-muted rounded-none flex items-center justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SearchBar;