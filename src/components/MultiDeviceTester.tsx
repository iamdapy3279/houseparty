"use client";
import { OperationalLogEvent } from '../core/types';
import React, { useState } from 'react';



interface MultiDeviceTesterProps {
  currentViewMode: 'host' | 'controller' | 'split';
  onChangeViewMode: (mode: 'host' | 'controller' | 'split') => void;
  onAddSimulatedPlayer?: () => void;
  onAdvanceRound?: () => void;
  playerCount: number;
  maxPlayers: number;
  roomCode?: string;
}

export const MultiDeviceTester: React.FC<MultiDeviceTesterProps> = ({
  currentViewMode,
  onChangeViewMode,
  onAddSimulatedPlayer,
  onAdvanceRound,
  playerCount,
  maxPlayers,
  roomCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<OperationalLogEvent[]>([]);

  const handleOpenLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Minimized Pill Toggle */}
      {!isOpen ? (
        <div className="flex items-center gap-2 bg-[#141313]/90 backdrop-blur-md border border-white/15 px-3 py-2 rounded-full shadow-2xl">
          <div className="flex bg-[#201f1f] p-0.5 rounded-full border border-white/5">
            <button
              onClick={() => onChangeViewMode('host')}
              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                currentViewMode === 'host' ? 'bg-[#e5e2e1] text-[#141313]' : 'text-[#8e9192] hover:text-white'
              }`}
            >
              Host
            </button>
            <button
              onClick={() => onChangeViewMode('controller')}
              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                currentViewMode === 'controller' ? 'bg-[#e5e2e1] text-[#141313]' : 'text-[#8e9192] hover:text-white'
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => onChangeViewMode('split')}
              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                currentViewMode === 'split' ? 'bg-[#e5e2e1] text-[#141313]' : 'text-[#8e9192] hover:text-white'
              }`}
            >
              Split
            </button>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              handleOpenLogs();
            }}
            title="Open Simulator Tools & Operational Logs"
            className="w-7 h-7 rounded-full bg-[#201f1f] hover:bg-[#2b2a2a] text-[#8C734B] flex items-center justify-center border border-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
          </button>
        </div>
      ) : (
        /* Expanded Luxury Drawer */
        <div className="bg-[#141313] border border-white/15 rounded-2xl p-5 shadow-2xl w-80 sm:w-96 text-[#e5e2e1] backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-sm">terminal</span>
              <span className="text-xs uppercase font-mono tracking-wider font-bold">
                RUNTIME CONTROLS
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8e9192] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          {/* View Modes */}
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-wider text-[#8e9192] block mb-1.5 font-medium">
              Simulation Viewport
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeViewMode('host')}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  currentViewMode === 'host'
                    ? 'bg-[#e5e2e1] text-black border-transparent font-semibold'
                    : 'bg-[#1c1b1b] text-[#c4c7c7] border-white/5'
                }`}
              >
                Host Screen
              </button>
              <button
                onClick={() => onChangeViewMode('controller')}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  currentViewMode === 'controller'
                    ? 'bg-[#e5e2e1] text-black border-transparent font-semibold'
                    : 'bg-[#1c1b1b] text-[#c4c7c7] border-white/5'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => onChangeViewMode('split')}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  currentViewMode === 'split'
                    ? 'bg-[#e5e2e1] text-black border-transparent font-semibold'
                    : 'bg-[#1c1b1b] text-[#c4c7c7] border-white/5'
                }`}
              >
                Split Dual
              </button>
            </div>
          </div>

          {/* Testing Helpers */}
          {roomCode && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-[#8e9192]">
                <span>Chamber: #{roomCode}</span>
                <span className="font-mono">{playerCount} / {maxPlayers} Patrons</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={playerCount >= maxPlayers}
                  onClick={onAddSimulatedPlayer}
                  className="py-2 px-3 rounded-lg bg-[#201f1f] hover:bg-[#2b2a2a] text-xs font-medium text-[#e5e2e1] border border-white/5 flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-xs text-emerald-400">person_add</span>
                  + Add Bot Patron
                </button>

                {onAdvanceRound && (
                  <button
                    onClick={onAdvanceRound}
                    className="py-2 px-3 rounded-lg bg-[#201f1f] hover:bg-[#2b2a2a] text-xs font-medium text-[#e5e2e1] border border-white/5 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-xs text-amber-400">fast_forward</span>
                    Next Round
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Operational Logs Accordion */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8e9192] font-medium">
                Structured Operational Logs
              </span>
              <button
                onClick={handleOpenLogs}
                className="text-[10px] text-[#8C734B] hover:underline"
              >
                Refresh
              </button>
            </div>
            <div className="bg-[#0e0e0e] rounded-lg p-2 max-h-32 overflow-y-auto font-mono text-[10px] space-y-1 text-[#8e9192] scrollbar-hide border border-white/5">
              {logs.length === 0 ? (
                <div className="text-white/20 italic">No events logged yet</div>
              ) : (
                logs.slice(0, 8).map((log, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-amber-400/80">[{log.type}]</span> {log.details || ''}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
