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
            {/* Search Icon (Now in Primary Blue/Accent when active) */}
            <div 
                className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-200 ${
                    value ? "text-primary" : "text-muted-foreground"
                }`}
            >
                <Search className="h-5 w-5" />
            </div>
            
            {/* Input Field (Larger, more rounded, and focus effect) */}
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    pl-12 w-full h-14 rounded-full text-base font-medium
                    shadow-lg border-2 border-border transition-all duration-300
                    focus-visible:ring-4 focus-visible:ring-primary/30 focus-visible:border-primary
                `}
                // Note: h-14 makes it bigger, rounded-full makes it a pill shape, 
                // and the focus classes add the vibrant blue glow and border.
            />

            {/* Clear Button (Optional but great UX) */}
            {value && (
                <button
                    onClick={() => onChange("")}
                    aria-label="Clear Search"
                    className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-primary/80 hover:text-primary transition-colors duration-200 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center"
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