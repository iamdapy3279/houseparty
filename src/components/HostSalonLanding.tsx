"use client";
import React, { useState } from 'react';

interface HostSalonLandingProps {
  onJoinSession: (moniker: string, roomCode: string) => void;
  onInitiateSession: () => void;
  onOpenSignIn: () => void;
  joinError?: string;
  isInitiating?: boolean;
}

export const HostSalonLanding: React.FC<HostSalonLandingProps> = ({
  onJoinSession,
  onInitiateSession,
  onOpenSignIn,
  joinError,
  isInitiating,
}) => {
  const [moniker, setMoniker] = useState('');
  const [coords, setCoords] = useState(['', '', '', '']);

  const handleCoordChange = (index: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const newCoords = [...coords];
    newCoords[index] = char;
    setCoords(newCoords);

    // Auto-focus next input
    if (char && index < 3) {
      const nextInput = document.getElementById(`coord-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !coords[index] && index > 0) {
      const prevInput = document.getElementById(`coord-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = coords.join('').trim().toUpperCase();
    if (!moniker.trim() || fullCode.length < 4) return;
    onJoinSession(moniker.trim(), fullCode);
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-[#e5e2e1] flex flex-col justify-between relative overflow-hidden px-6 py-8 md:py-12 selection:bg-[#e5e2e1] selection:text-[#0D0D0D]">
      {/* Film grain subtle overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-screen bg-repeat"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCClk80x2XAnAdUGUw7Sz6Rx24B1KGFu3qpHff6DUDVudyxWJRQm-GKcemHhxItkKoAZbUjGC8THSLNwzd2bqkeKRZ-JKX4gs374Z2RpIwwCg8FO2vGcreeMkfyhMZFwsiiwv7M82EpWOjskFbZaLIv_F_0BazbFBhRO_UjS49rTY--gi2h1pqaGM6BrlAKJVnDv-cvUDyZAID5xhHsSPFXAYGwvf_0I1Vy2XbrCFiXASWfKFOyC6_UslpuNp6D-niplgVxKZ_IKbY')`,
        }}
      />

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-white/20 flex items-center justify-center">
            <span className="text-[10px] font-mono tracking-tighter text-[#8C734B]">A</span>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#8e9192]">
            ATMOSPHERE // SALON
          </span>
        </div>

        <button
          onClick={onOpenSignIn}
          className="text-xs uppercase tracking-widest text-[#8e9192] hover:text-[#e5e2e1] transition-colors py-1 px-3 border border-transparent hover:border-white/10 rounded"
        >
          Patron Privileges
        </button>
      </header>

      {/* Hero Narrative */}
      <main className="max-w-6xl mx-auto w-full my-auto py-12 z-10">
        <div className="max-w-2xl mb-12">
          <h1 className="font-noto-serif text-4xl sm:text-5xl md:text-6xl font-light text-[#e5e2e1] tracking-tight leading-[1.1] mb-4">
            Atmosphere
          </h1>
          <p className="text-base sm:text-lg text-[#8e9192] font-light leading-relaxed">
            A curatorial space for collective contemplation and ludic inquiry. Connect phones as
            tactile controllers; experience synchronized art games on the shared chamber display.
          </p>
        </div>

        {/* Dual Grid Cards (Image 1 Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left / Join Card (8 cols) */}
          <div className="lg:col-span-7 bg-[#141313]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h2 className="font-noto-serif text-2xl font-normal text-[#e5e2e1]">
                  Join an Active Session
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C734B]">
                  GUEST PORTAL
                </span>
              </div>

              {joinError && (
                <div className="mb-6 p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{joinError}</span>
                </div>
              )}

              <form onSubmit={handleConnect} className="space-y-6">
                {/* Moniker Input */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#8e9192] mb-2 font-medium">
                    Player Moniker
                  </label>
                  <input
                    type="text"
                    required
                    value={moniker}
                    onChange={e => setMoniker(e.target.value)}
                    placeholder="Enter your pseudonym..."
                    className="w-full bg-[#1c1b1b] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-[#e5e2e1] placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                {/* 4-Digit/Character Room Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-[#8e9192] font-medium">
                      Room Coordinate
                    </label>
                    <span className="text-[10px] font-mono text-[#8e9192]">4 DIGITS / CHARS</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={i}
                        id={`coord-box-${i}`}
                        type="text"
                        maxLength={1}
                        value={coords[i]}
                        onChange={e => handleCoordChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        placeholder={['K', 'A', 'M', 'U'][i]}
                        className="w-full aspect-square bg-[#1c1b1b] border border-white/10 rounded-xl text-center text-xl font-mono uppercase font-bold text-[#e5e2e1] placeholder-white/10 focus:outline-none focus:border-[#e5e2e1] transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!moniker.trim() || coords.join('').length < 4}
                  className="w-full py-4 rounded-xl bg-[#e5e2e1] hover:bg-white text-[#141313] font-semibold text-xs tracking-widest uppercase transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none active-press flex items-center justify-center gap-2"
                >
                  CONNECT TO CHAMBER
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </form>
            </div>

            <p className="text-[11px] text-white/30 font-light mt-6 pt-4 border-t border-white/5">
              Access is ephemeral. No persistent trace of identity is retained beyond the chamber&apos;s
              collapse.
            </p>
          </div>

          {/* Right / Host Salon Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#141313]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h2 className="font-noto-serif text-2xl font-normal text-[#e5e2e1]">
                  Host a Salon
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C734B]">
                  SHARED SCREEN
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <button
                onClick={onInitiateSession}
                disabled={isInitiating}
                className="w-full py-4 rounded-xl bg-[#201f1f] hover:bg-[#2b2a2a] text-[#e5e2e1] border border-white/10 font-semibold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 active-press"
              >
                {isInitiating ? 'CREATING...' : 'CREATE A ROOM'}
                <span className="material-symbols-outlined text-base">theater_comedy</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#8e9192]/60 pt-8 border-t border-white/5 z-10">
        <span>ATMOSPHERE SALON PLATFORM // SPEC v1.2</span>
        <span className="font-mono text-[11px] mt-2 sm:mt-0">SERVER AUTHORITATIVE ENGINE</span>
      </footer>
    </div>
  );
};
