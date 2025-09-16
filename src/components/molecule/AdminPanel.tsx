"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import SearchBar from "./SearchBar";

interface SearchUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
}

interface SearchResponse {
  success: boolean;
  users: SearchUser[];
  query: string;
  error?: string;
}

interface AdminPanelProps {
  adminFid: number;
}

export function AdminPanel({ adminFid }: AdminPanelProps) {
  const [experimentalUsers, setExperimentalUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExperimentalUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/experimental-users?adminFid=${adminFid}`);
      const data = await response.json();

      if (data.success) {
        setExperimentalUsers(data.users);
        setError(null);
      } else {
        setError(data.error || 'Failed to load experimental users');
      }
    } catch (err) {
      console.error('Error loading experimental users:', err);
      setError('Failed to load experimental users');
    } finally {
      setLoading(false);
    }
  }, [adminFid]);

  // Load experimental users on mount
  useEffect(() => {
    loadExperimentalUsers();
  }, [loadExperimentalUsers]);

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(`/api/admin/search-users?q=${encodeURIComponent(searchQuery.trim())}&adminFid=${adminFid}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setSearchResults(data.users);
      } else {
        console.error('Search error:', data.error);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addExperimentalUser = async (userFid: number) => {
    try {
      const response = await fetch('/api/admin/experimental-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminFid,
          userFid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExperimentalUsers(prev => [...prev, userFid]);
        // Remove from search results to avoid confusion
        setSearchResults(prev => prev.filter(user => user.fid !== userFid));
        setError(null);
      } else {
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user');
    }
  };

  const removeExperimentalUser = async (userFid: number) => {
    try {
      const response = await fetch('/api/admin/experimental-users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminFid,
          userFid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setExperimentalUsers(prev => prev.filter(fid => fid !== userFid));
        setError(null);
      } else {
        setError(data.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
        <div className="text-center py-12">
          <div className="text-green-400 text-lg">LOADING ADMIN PANEL...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-6">
        <pre className="text-green-400 text-xs leading-none mb-2">
{`
 █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
`}
        </pre>
        <div className="text-gray-400 text-xs">EXPERIMENTAL USERS CONTROL PANEL</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-400 text-red-400 text-sm">
          [!] {error}
        </div>
      )}

      {/* User Search */}
      <div className="bg-gray-900 border border-green-400 p-4 mb-6">
        <div className="text-green-400 text-sm font-bold mb-3">SEARCH USERS</div>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={searchUsers}
            disabled={searchLoading || searchQuery.trim().length < 2}
            className="px-4 py-2 text-xs border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? 'SEARCHING...' : '[S] SEARCH'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-gray-400 text-xs mb-2">SEARCH RESULTS:</div>
            {searchResults.map((user) => (
              <div
                key={user.fid}
                className="flex items-center gap-3 p-3 bg-black border border-gray-600 hover:border-green-400 transition-colors"
              >
                <Image
                  src={user.pfpUrl}
                  alt={`${user.username} avatar`}
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-600"
                />
                <div className="flex-1">
                  <div className="text-white font-bold text-sm">@{user.username}</div>
                  <div className="text-gray-400 text-xs">{user.displayName}</div>
                  <div className="text-gray-500 text-xs">
                    FID: {user.fid} • {user.followerCount} followers
                  </div>
                </div>
                <button
                  onClick={() => addExperimentalUser(user.fid)}
                  disabled={experimentalUsers.includes(user.fid)}
                  className="px-3 py-1 text-xs border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {experimentalUsers.includes(user.fid) ? '[✓] ADDED' : '[+] ADD'}
                </button>
              </div>
            ))}
          </div>
        )}

        {searchQuery.trim().length >= 2 && searchResults.length === 0 && !searchLoading && (
          <div className="text-gray-500 text-xs mt-2">
            No users found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Current Experimental Users */}
      <div className="bg-gray-900 border border-green-400 p-4">
        <div className="text-green-400 text-sm font-bold mb-3">
          EXPERIMENTAL USERS ({experimentalUsers.length})
        </div>
        
        {experimentalUsers.length === 0 ? (
          <div className="text-gray-500 text-xs">
            No experimental users added yet. Search and add users above.
          </div>
        ) : (
          <div className="space-y-2">
            {experimentalUsers.map((userFid) => (
              <div
                key={userFid}
                className="flex items-center justify-between p-3 bg-black border border-gray-600"
              >
                <div>
                  <div className="text-white font-bold text-sm">FID: {userFid}</div>
                  <div className="text-gray-400 text-xs">Has access to experimental features</div>
                </div>
                <button
                  onClick={() => removeExperimentalUser(userFid)}
                  className="px-3 py-1 text-xs border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-all duration-200"
                >
                  [X] REMOVE
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <div>EXPERIMENTAL USERS GET ACCESS TO MAP AND OTHER BETA FEATURES</div>
        <div className="mt-1">ADMIN FID: {adminFid}</div>
      </div>
    </div>
  );
}