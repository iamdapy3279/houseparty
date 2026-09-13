"use client";
import React from 'react';

interface HeaderNavProps {
  roomCode: string;
  activeTab: 'EXPERIENCES' | 'INVITE' | 'SETTINGS' | 'STATS';
  onSelectTab: (tab: 'EXPERIENCES' | 'INVITE' | 'SETTINGS' | 'STATS') => void;
  hostName?: string;
  tierLabel?: string;
  onOpenEntitlements?: () => void;
  onLeaveRoom?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  roomCode,
  activeTab,
  onSelectTab,
  hostName = 'COMMANDER',
  tierLabel = 'ELITE TIER',
  onOpenEntitlements,
  onLeaveRoom,
}) => {
  return (
    <header className="w-full bg-[#141313]/95 backdrop-blur-md border-b border-white/5 px-6 py-3.5 flex items-center justify-between z-30 shrink-0">
      {/* Left: Lobby Code & Tier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tracking-wider font-semibold text-[#e5e2e1]">
            LOBBY_{roomCode || '04'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#2b2a2a] text-[#8C734B] border border-[#8C734B]/30">
            {tierLabel}
          </span>
        </div>
        
        {onLeaveRoom && (
          <button
            onClick={onLeaveRoom}
            title="Leave Lobby"
            className="text-[#8e9192] hover:text-[#e5e2e1] text-xs transition-colors px-1 py-0.5"
          >
            <span className="material-symbols-outlined text-base align-middle">logout</span>
          </button>
        )}
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-8">
        {(['EXPERIENCES', 'INVITE', 'SETTINGS', 'STATS'] as const).map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`text-xs uppercase tracking-widest font-medium py-1 relative transition-colors ${
                isActive ? 'text-[#e5e2e1]' : 'text-[#8e9192] hover:text-[#c4c7c7]'
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#e5e2e1]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Host Account Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenEntitlements}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#201f1f] hover:bg-[#2b2a2a] border border-white/10 transition-colors text-left"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-xs font-medium text-[#e5e2e1]">{hostName}</span>
          <span className="text-[10px] text-[#8e9192] uppercase font-mono hidden sm:inline">Online</span>
        </button>
      </div>
    </header>
  );
};
