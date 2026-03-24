import React from "react";
import { FiMenu, FiSearch, FiUser } from "react-icons/fi";

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur border-b border-neutral-800 flex items-center h-16 px-4 md:px-8">
      <button
        className="md:hidden p-2 rounded hover:bg-neutral-800"
        onClick={onMenuClick}
      >
        <FiMenu size={22} />
      </button>
      <div className="flex-1 flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <input
            className="w-full bg-neutral-900 text-neutral-100 rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            placeholder="Search..."
          />
          <FiSearch
            className="absolute left-3 top-2.5 text-neutral-400"
            size={18}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-neutral-800">
          <FiUser size={22} />
        </button>
      </div>
    </header>
  );
}
