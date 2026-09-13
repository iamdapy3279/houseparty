"use client";
import React, { useState, useEffect } from 'react';
import { ControllerView, PlayerAction } from '../core/types';

interface ControllerRendererProps {
  view: ControllerView;
  playerId: string;
  onSubmitAction: (action: PlayerAction) => void;
  onDisconnect?: () => void;
  roomCode?: string;
  playerName?: string;
}

export const ControllerRenderer: React.FC<ControllerRendererProps> = ({
  view,
  playerId,
  onSubmitAction,
  onDisconnect,
  roomCode,
  playerName,
}) => {
  const [textInput, setTextInput] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Authoritative countdown timer calculated on client
  useEffect(() => {
    if (!view.timer || !view.timer.endsAt) {
      setRemainingSeconds(null);
      return;
    }

    const update = () => {
      const diff = view.timer!.endsAt - Date.now();
      setRemainingSeconds(Math.max(0, Math.ceil(diff / 1000)));
    };

    update();
    const timer = setInterval(update, 200);
    return () => clearInterval(timer);
  }, [view.timer, view.timer?.endsAt]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || view.disabled) return;

    // Client-generated unique actionId for strict idempotency
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    onSubmitAction({
      actionId,
      playerId,
      type: 'GUESS_WORD',
      payload: { word: textInput.trim() },
      clientTimestamp: Date.now(),
    });

    setTextInput('');
  };

  const handleOptionSelect = (optionId: string) => {
    if (view.disabled || view.submitted || selectedOptionId) return;

    setSelectedOptionId(optionId);
    const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    onSubmitAction({
      actionId,
      playerId,
      type: 'CHOOSE_OPTION',
      payload: { optionId },
      clientTimestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-[#e5e2e1] flex flex-col justify-between max-w-md mx-auto p-5 select-none touch-manipulation">
      {/* Top Controller Bar */}
      <header className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-[#8e9192] uppercase">
              ROOM {roomCode}
            </span>
          </div>
          <span className="text-sm font-medium text-[#e5e2e1] block mt-0.5">
            {playerName || 'Patron Guest'}
          </span>
        </div>

        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="text-[11px] text-[#8e9192] hover:text-white border border-white/10 px-2 py-1 rounded-md"
          >
            Leave
          </button>
        )}
      </header>

      {/* Main Controller Surface */}
      <main className="flex-1 flex flex-col justify-center py-6">
        {/* Timer Bar (Matching Screen 3) */}
        {remainingSeconds !== null && (
          <div className="mb-8">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-[#8e9192] uppercase tracking-wider text-[10px]">Time Remaining</span>
              <span className={`font-mono font-bold ${remainingSeconds <= 5 ? 'text-rose-400' : 'text-[#e5e2e1]'}`}>
                {remainingSeconds} SEC
              </span>
            </div>
            <div className="w-full bg-[#201f1f] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#e5e2e1] h-full transition-all duration-300"
                style={{
                  width: `${Math.max(0, Math.min(100, (remainingSeconds / 15) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="font-noto-serif text-xl text-[#e5e2e1] font-light">
            {view.title || 'Active Chamber'}
          </h2>
          <p className="text-xs text-[#8e9192] mt-1 font-light">
            {view.prompt || 'Transmit your intuition'}
          </p>
        </div>

        {/* 1. Multiple Choice Controller (Exact 2x2 grid from Screen 3) */}
        {view.type === 'multiple_choice' && (
          <div className="grid grid-cols-2 gap-4 w-full aspect-square max-h-80">
            {view.components.map(comp => {
              if (comp.type !== 'option_grid') return null;
              return comp.options.map(opt => {
                const isChosen = selectedOptionId === opt.id;
                const colors = {
                  ruby: 'bg-rose-950/60 border-rose-600/40 text-rose-300 active:bg-rose-900',
                  emerald: 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300 active:bg-emerald-900',
                  sapphire: 'bg-blue-950/60 border-blue-600/40 text-blue-300 active:bg-blue-900',
                  amber: 'bg-amber-950/60 border-amber-600/40 text-amber-300 active:bg-amber-900',
                };

                return (
                  <button
                    key={opt.id}
                    disabled={view.disabled || !!selectedOptionId}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`rounded-2xl border flex flex-col items-center justify-center p-4 transition-all duration-150 active:scale-95 ${
                      colors[opt.color]
                    } ${isChosen ? 'ring-2 ring-white scale-95 brightness-125' : ''} ${
                      view.disabled ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl mb-2">
                      {opt.glyph}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-semibold">
                      Option {opt.keyLetter}
                    </span>
                  </button>
                );
              });
            })}
          </div>
        )}

        {/* 2. Text Input Controller (Screen 4) */}
        {view.type === 'text_input' && (
          <form onSubmit={handleTextSubmit} className="space-y-4 w-full">
            <div className="relative">
              <input
                type="text"
                autoFocus
                disabled={view.disabled}
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="Enter answer..."
                className="w-full bg-[#1c1b1b] text-[#e5e2e1] placeholder-[#8e9192]/60 text-lg px-5 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 text-center tracking-wide"
              />
            </div>

            <button
              type="submit"
              disabled={view.disabled || !textInput.trim()}
              className="w-full py-4 rounded-xl bg-[#e5e2e1] text-[#141313] hover:bg-white active:scale-98 font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xl"
            >
              SUBMIT
            </button>
          </form>
        )}

        {/* Feedback Message */}
        {view.lastFeedback && (
          <div className="mt-6 p-4 rounded-xl bg-[#1c1b1b]/80 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#8e9192] block mb-1">
              PROXIMITY TELEMETRY
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-base font-bold text-[#e5e2e1]">
                &ldquo;{view.lastFeedback.text}&rdquo;
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-xs font-semibold ${
                  view.lastFeedback.rank && view.lastFeedback.rank <= 300
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                #{view.lastFeedback.rank}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-2 border-t border-white/5">
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-mono">
          ATMOSPHERE HANDHELD RUNTIME
        </span>
      </footer>
    </div>
  );
};
