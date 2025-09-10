"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import useDebounce from "~/hooks/useDebounce";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

interface UserSuggestion {
  username: string;
  flashCount?: number;
}

export default function SearchBar({ 
  value, 
  onChange, 
  onFocus, 
  onBlur, 
  autoFocus = false 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user suggestions when typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedValue || debouncedValue.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const api = new FlashesApi();
        const players = await api.getAllPlayers(debouncedValue);
        setSuggestions(
          players.slice(0, 5).map(username => ({ username }))
        );
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused) {
      fetchSuggestions();
    }
  }, [debouncedValue, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay blur to allow for suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
      setSuggestions([]);
      onBlur?.();
    }, 200);
  };

  const handleSuggestionClick = (username: string) => {
    onChange({ target: { value: username } } as React.ChangeEvent<HTMLInputElement>);
    setIsFocused(false);
    setSuggestions([]);
    router.push(`/?search=${encodeURIComponent(username)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      setIsFocused(false);
      setSuggestions([]);
      router.push(`/?search=${encodeURIComponent(value.trim())}`);
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="SEARCH USERNAME... (CTRL+K)"
          className="w-full bg-gray-900 border border-green-400 text-green-400 px-3 py-2 font-mono text-sm tracking-wide outline-none placeholder-gray-500 focus:border-green-300 focus:bg-black transition-colors duration-200"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
        />
        
        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-xs">
          {isLoading ? '[...]' : '[🔍]'}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-gray-900 border border-green-400 border-t-0 z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.username}
              className="px-3 py-2 text-green-400 hover:bg-gray-800 cursor-pointer text-sm font-mono transition-colors duration-200"
              onClick={() => handleSuggestionClick(suggestion.username)}
            >
              <div className="flex items-center justify-between">
                <span>@ {suggestion.username}</span>
                <span className="text-gray-500 text-xs">[ENTER]</span>
              </div>
            </div>
          ))}
          
          {/* Search hint */}
          <div className="px-3 py-2 text-gray-500 text-xs border-t border-gray-700">
            PRESS ENTER TO SEARCH • ESC TO CLOSE
          </div>
        </div>
      )}
    </div>
  );
}
