/**
 * SearchBar — controlled search input with clear button.
 */
import React from 'react';
import useStore from '../../store/useStore';

export default function SearchBar() {
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-2 px-4 mx-4 mb-3 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:shadow-[0_4px_12px_rgba(79,70,229,0.08)]">
      <span className="text-[13px] text-slate-400 shrink-0">🔍</span>
      <input
        type="text"
        placeholder="Search furniture..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-slate-900 text-xs font-medium placeholder-slate-400"
      />
      {searchQuery && (
        <button
          className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-[10px] w-5 h-5 flex items-center justify-center rounded-full transition-colors"
          onClick={() => setSearchQuery('')}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
