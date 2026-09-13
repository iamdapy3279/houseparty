"use client";
import React, { useState } from 'react';
import { RoomPlayer } from '../core/types';

interface InviteModalProps {
  roomCode: string;
  players: RoomPlayer[];
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  roomCode,
  players,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}?code=${roomCode}` : `https://atmosphere.salon?code=${roomCode}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141313] border border-white/10 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8e9192] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C734B] block mb-1">
          CHAMBER ACCESS DIRECTIVE
        </span>
        <h2 className="font-noto-serif text-2xl font-light text-[#e5e2e1] mb-6">
          Invite Salon Patrons
        </h2>

        {/* 4-Digit Room Code Display */}
        <div className="p-6 rounded-xl bg-[#1c1b1b] border border-white/5 text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-[#8e9192] block mb-2 font-medium">
            Room Coordinate
          </span>
          <div className="flex items-center justify-center gap-3">
            {roomCode.split('').map((char, i) => (
              <span
                key={i}
                className="w-14 h-16 rounded-xl bg-[#141313] border border-white/10 flex items-center justify-center text-3xl font-mono font-bold text-[#e5e2e1] shadow-inner"
              >
                {char}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#8e9192] mt-3">
            Instruct patrons to navigate to Atmosphere and enter this 4-digit coordinate.
          </p>
        </div>

        {/* Shareable Link */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-[#8e9192] mb-2 font-medium">
            Direct Connection Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-[#1c1b1b] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-[#c4c7c7] select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#e5e2e1] hover:bg-white text-[#141313] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Active Patrons Status */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center justify-between text-xs text-[#8e9192] mb-2">
            <span>Connected Patrons</span>
            <span className="font-mono text-[#e5e2e1]">{players.length} / 20</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {players.length === 0 ? (
              <span className="text-xs text-white/30 italic">No patrons connected yet</span>
            ) : (
              players.map(p => (
                <span
                  key={p.playerId}
                  className="px-2.5 py-1 rounded-full bg-[#201f1f] text-xs text-[#e5e2e1] border border-white/5 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {p.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
