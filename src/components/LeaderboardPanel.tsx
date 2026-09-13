"use client";
import React from 'react';
import { RoomPlayer } from '../core/types';

interface LeaderboardPanelProps {
  players: RoomPlayer[];
  onRefresh?: () => void;
  maxPlayers?: number;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  players,
  onRefresh,
  maxPlayers = 20,
}) => {
  // Sort players by cumulative roomScore descending, then session score
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.roomScore !== a.roomScore) return b.roomScore - a.roomScore;
    return b.score - a.score;
  });

  const connectedCount = players.filter(p => Object.keys(p.connections || {}).length > 0).length;

  return (
    <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#141313]/90 backdrop-blur-xl flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-noto-serif text-xl tracking-tight text-[#e5e2e1]">Leaderboard</h2>
          <span className="text-[10px] uppercase tracking-widest text-[#8C734B] font-semibold">
            LIVE STANDINGS
          </span>
        </div>
        <p className="text-xs text-[#8e9192]">Cumulative salon standings across chambers</p>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {sortedPlayers.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <span className="material-symbols-outlined text-3xl text-white/20 mb-2">person_pin</span>
            <p className="text-xs text-[#8e9192]">No patrons in chamber yet</p>
            <p className="text-[11px] text-white/30 mt-1">Guests connect using the 4-digit code</p>
          </div>
        ) : (
          sortedPlayers.map((player, idx) => {
            const isConnected = Object.keys(player.connections || {}).length > 0;
            const rank = idx + 1;
            const rankMedal =
              rank === 1 ? 'text-[#e5e2e1] font-bold' : rank === 2 ? 'text-[#c4c7c7]' : rank === 3 ? 'text-[#8C734B]' : 'text-white/30';

            return (
              <div
                key={player.playerId}
                className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  isConnected
                    ? 'bg-[#1c1b1b]/80 border-white/5 hover:border-white/10'
                    : 'bg-[#141313]/40 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs w-5 text-center font-mono ${rankMedal}`}>
                    {rank < 10 ? `0${rank}` : rank}
                  </span>
                  
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#2b2a2a] border border-white/10 flex items-center justify-center text-xs font-medium text-[#e5e2e1]">
                      {player.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#141313] ${
                        isConnected ? 'bg-emerald-400' : 'bg-amber-400/80 animate-pulse'
                      }`}
                      title={isConnected ? 'Connected' : 'Grace Period Active'}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-[#e5e2e1] truncate">{player.name}</span>
                      {rank === 1 && (
                        <span className="material-symbols-outlined text-[14px] text-amber-300">crown</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#8e9192]">
                      <span>Round: {player.score}</span>
                      {!isConnected && <span className="text-amber-400/80">Reconnecting…</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-[#e5e2e1] font-mono">
                    {player.roomScore.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8e9192] block">pts</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Capacity Info */}
      <div className="p-4 border-t border-white/5 bg-[#100f0f]/80">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-[#8e9192]">Chamber Capacity</span>
          <span className="font-mono text-[#e5e2e1]">
            {connectedCount} / {maxPlayers}
          </span>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-[#201f1f] h-1.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#c9c6c5] h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (connectedCount / maxPlayers) * 100)}%` }}
          />
        </div>

        <button
          onClick={onRefresh}
          className="w-full py-2 px-3 rounded-lg bg-[#201f1f] hover:bg-[#2b2a2a] text-[#c4c7c7] hover:text-[#e5e2e1] text-xs font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">sync</span>
          Update Standings
        </button>
      </div>
    </aside>
  );
};
