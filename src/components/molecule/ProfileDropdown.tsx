"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useFrame } from "../providers/FrameProvider";
import { navigateToTab } from "~/lib/navigation";

type NavTab = 'favorites' | 'wishlist';

interface ProfileDropdownProps {
  className?: string;
}

export function ProfileDropdown({ className = "" }: ProfileDropdownProps) {
  const { context } = useFrame();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!context) return null;

  const handleNavigation = (action: 'profile' | NavTab) => {
    setIsOpen(false);
    if (action === 'profile') {
      window.location.href = '/profile';
    } else {
      navigateToTab(action);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'PROFILE', key: 'P', action: 'profile' as const },
    { id: 'hunt', label: 'HUNT', key: 'H', action: 'wishlist' as const },
    { id: 'saved', label: 'SAVED', key: 'S', action: 'favorites' as const },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="block hover:opacity-80 transition-opacity"
      >
        <Image 
          src={context.user.pfpUrl ?? `/splash.png`} 
          width={32} 
          height={32} 
          alt="Profile" 
          className="rounded"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-gray-900 border-2 border-green-400 z-50 min-w-[120px] font-mono">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.action)}
              className="block w-full text-left px-3 py-2 text-green-400 hover:bg-gray-800 text-xs transition-colors duration-200 border-b border-gray-700 last:border-b-0"
            >
              [{item.key}] {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}