"use client";
import React, { useEffect, useState } from 'react';
import { HostView, HostComponent } from '../core/types';

interface HostViewRendererProps {
  view: HostView;
  onAdvanceRound?: () => void;
}

export const HostViewRenderer: React.FC<HostViewRendererProps> = ({
  view,
  onAdvanceRound,
}) => {
  // Server-authoritative countdown timer calculated purely client-side
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!view.timer || !view.timer.endsAt) {
      setRemainingSeconds(null);
      return;
    }

    const updateTimer = () => {
      const diffMs = view.timer!.endsAt - Date.now();
      const sec = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(sec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);
    return () => clearInterval(interval);
  }, [view.timer, view.timer?.endsAt]);

  const renderComponent = (comp: HostComponent, index: number) => {
    switch (comp.type) {
      case 'question':
        return (
          <div key={index} className="p-8 rounded-2xl bg-[#1c1b1b]/70 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
            {comp.category && (
              <span className="text-[11px] uppercase tracking-widest text-[#8C734B] font-semibold block mb-2">
                {comp.category}
              </span>
            )}
            <h2 className="font-noto-serif text-2xl md:text-3xl font-light text-[#e5e2e1] leading-snug mb-3">
              {comp.text}
            </h2>
            {comp.subtitle && (
              <p className="text-sm text-[#8e9192] max-w-2xl font-light">
                {comp.subtitle}
              </p>
            )}
          </div>
        );

      case 'stats_row':
        return (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {comp.stats.map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#141313]/90 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-[#8e9192] block mb-1">
                  {st.label}
                </span>
                <span className="text-lg font-mono font-semibold text-[#e5e2e1]">
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        );

      case 'clues_list':
        return (
          <div key={index} className="rounded-2xl bg-[#141313]/90 border border-white/5 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-widest text-[#c4c7c7] font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#8C734B]">explore</span>
                Proximity Telemetry ({comp.clues.length} submissions)
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-mono text-[#8e9192]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;300 Hot
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> &lt;1500 Warm
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> &gt;1500 Distant
                </span>
              </div>
            </div>

            {comp.clues.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#8e9192]">
                <p>Waiting for players to transmit conjecture words from controllers...</p>
                <p className="text-xs text-white/30 mt-1">Guessed words will organize here by semantic proximity rank.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-hide">
                {comp.clues.map(c => {
                  const badgeColor =
                    c.rank === 1
                      ? 'bg-amber-300 text-black border-amber-200 shadow-[0_0_12px_rgba(252,211,77,0.4)]'
                      : c.proximity === 'hot'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : c.proximity === 'warm'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : c.proximity === 'tepid'
                      ? 'bg-orange-500/15 text-orange-300 border-orange-500/20'
                      : 'bg-[#201f1f] text-[#8e9192] border-white/5';

                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-[#1c1b1b] border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-xs font-semibold border ${badgeColor}`}
                        >
                          #{c.rank}
                        </span>
                        <div className="min-w-0">
                          <span className="font-mono text-sm font-semibold text-[#e5e2e1] block tracking-wide truncate">
                            {c.word}
                          </span>
                          <span className="text-[10px] text-[#8e9192] block truncate">
                            By {c.player}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8e9192] shrink-0">
                        {c.rank === 1 ? 'FOUND!' : c.proximity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'card_grid':
        return (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comp.items.map(item => {
              const glyphBg =
                item.color === 'ruby'
                  ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                  : item.color === 'emerald'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  : item.color === 'sapphire'
                  ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/40';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-[#1c1b1b]/80 border border-white/5 flex items-center gap-4 shadow-lg"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg ${glyphBg}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{item.glyph || 'change_history'}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8e9192] block">
                      Option {item.label}
                    </span>
                    <span className="text-sm font-medium text-[#e5e2e1] block">
                      {item.subtext}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'result_banner':
        return (
          <div
            key={index}
            className="p-8 rounded-2xl bg-gradient-to-r from-[#201f1f] to-[#1c1b1b] border border-[#8C734B]/40 text-center relative overflow-hidden shadow-2xl"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-[#8C734B]/20 text-[#e5e2e1] text-[10px] font-semibold tracking-widest uppercase mb-3 border border-[#8C734B]/30">
              Round Resolution
            </div>
            <h2 className="font-noto-serif text-3xl font-light text-[#e5e2e1] mb-2">
              {comp.title}
            </h2>
            <p className="text-sm text-[#c4c7c7] max-w-xl mx-auto font-light mb-6">
              {comp.subtitle}
            </p>

            {onAdvanceRound && (
              <button
                onClick={onAdvanceRound}
                className="px-6 py-3 rounded-xl bg-[#e5e2e1] text-[#141313] hover:bg-white text-xs font-semibold tracking-wider uppercase transition-all shadow-lg active-press"
              >
                Advance to Next Chamber &rarr;
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-hide max-w-6xl mx-auto w-full">
      {/* Top Banner with Title & Authoritative Timer */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#8C734B] font-semibold block">
            {view.subtitle || 'SALON RUNTIME'}
          </span>
          <h1 className="font-noto-serif text-2xl text-[#e5e2e1] font-light">
            {view.title}
          </h1>
        </div>

        {remainingSeconds !== null && (
          <div className="flex items-center gap-3 bg-[#1c1b1b] border border-white/10 px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-base text-amber-400">timer</span>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-widest text-[#8e9192] block">Time Remaining</span>
              <span className={`text-base font-mono font-bold ${remainingSeconds <= 5 ? 'text-rose-400 animate-pulse' : 'text-[#e5e2e1]'}`}>
                {remainingSeconds}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Render Declarative Components */}
      {view.content.map((comp, idx) => renderComponent(comp, idx))}
    </div>
  );
};
