"use client";
import React, { useState } from 'react';
import { RoomRecord, GameMetadata, HostView } from '../core/types';
import { HeaderNav } from './HeaderNav';
import { LeaderboardPanel } from './LeaderboardPanel';
import { ExperienceCard } from './ExperienceCard';
import { HostViewRenderer } from './HostViewRenderer';

interface HostDashboardProps {
  room: RoomRecord;
  catalog: GameMetadata[];
  selectedGameId: string;
  onSelectGame: (gameId: string) => void;
  onStartSession: (gameId: string) => void;
  onAdvanceRound: () => void;
  onOpenInvite: () => void;
  onOpenEntitlements: () => void;
  onLeaveRoom: () => void;
  activeHostView?: HostView;
  hostName?: string;
  tierLabel?: string;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  room,
  catalog,
  selectedGameId,
  onSelectGame,
  onStartSession,
  onAdvanceRound,
  onOpenInvite,
  onOpenEntitlements,
  onLeaveRoom,
  activeHostView,
  hostName = 'COMMANDER',
  tierLabel = 'ELITE TIER',
}) => {
  const [activeTab, setActiveTab] = useState<'EXPERIENCES' | 'INVITE' | 'SETTINGS' | 'STATS'>('EXPERIENCES');

  const selectedGame = catalog.find(g => g.id === selectedGameId) || catalog[0];
  const playersList = Object.values(room.players || {});
  const isSessionActive = !!room.currentSessionId && room.status === 'ACTIVE' && !!activeHostView;

  const handleTabClick = (tab: 'EXPERIENCES' | 'INVITE' | 'SETTINGS' | 'STATS') => {
    setActiveTab(tab);
    if (tab === 'INVITE') {
      onOpenInvite();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-[#e5e2e1] flex flex-col overflow-hidden select-none">
      {/* Top Bar (Image 2) */}
      <HeaderNav
        roomCode={room.roomCode}
        activeTab={activeTab}
        onSelectTab={handleTabClick}
        hostName={hostName}
        tierLabel={tierLabel}
        onOpenEntitlements={onOpenEntitlements}
        onLeaveRoom={onLeaveRoom}
      />

      {/* Main Split: 80% Game Experience / 20% Leaderboard */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left 80% Area */}
        <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide bg-[#0D0D0D]">
          {isSessionActive && activeHostView ? (
            /* Active Game Session Host View */
            <div className="flex-1 flex flex-col">
              <HostViewRenderer
                view={activeHostView}
                onAdvanceRound={onAdvanceRound}
              />
            </div>
          ) : (
            /* Game Catalog Experience Grid (Image 2) */
            <div className="p-6 lg:p-8 flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C734B] font-semibold block">
                      CURATED ARCHIVE
                    </span>
                    <h1 className="font-noto-serif text-2xl lg:text-3xl font-light text-[#e5e2e1]">
                      Select Experience
                    </h1>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-[#8e9192] font-mono">
                      {catalog.length} PLUG-IN EXPERIENCES
                    </span>
                  </div>
                </div>

                {/* Grid of Experiences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {catalog.map(item => (
                    <ExperienceCard
                      key={item.id}
                      metadata={item}
                      isSelected={selectedGameId === item.id}
                      onSelect={() => onSelectGame(item.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar (Image 2) */}
              {selectedGame && (
                <div className="mt-8 p-6 rounded-2xl bg-[#141313]/90 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C734B] font-bold">
                        {selectedGame.category}
                      </span>
                      <span className="text-white/20 text-xs">•</span>
                      <span className="text-xs text-[#8e9192]">
                        {selectedGame.minPlayers}-{selectedGame.maxPlayers} Patrons
                      </span>
                      <span className="text-white/20 text-xs">•</span>
                      <span className="text-xs text-[#8e9192] capitalize">
                        Controller: {selectedGame.supportedControllerTypes.join(', ').replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-noto-serif text-xl font-normal text-[#e5e2e1]">
                      {selectedGame.name}
                    </h3>
                    <p className="text-xs text-[#8e9192] line-clamp-1 max-w-xl font-light mt-0.5">
                      {selectedGame.description}
                    </p>
                  </div>

                  <button
                    onClick={() => onStartSession(selectedGame.id)}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#e5e2e1] hover:bg-white text-[#141313] font-semibold text-xs tracking-widest uppercase transition-all shadow-xl active-press flex items-center justify-center gap-2 shrink-0"
                  >
                    INITIALIZE CHAMBER SESSION
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right 20% Leaderboard Sidebar (Image 2) */}
        <LeaderboardPanel
          players={playersList}
          maxPlayers={20}
        />
      </div>
    </div>
  );
};
