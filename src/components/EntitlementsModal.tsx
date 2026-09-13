"use client";
import React, { useState } from 'react';
import { HostAccount } from '../core/types';

interface EntitlementsModalProps {
  host: HostAccount;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (passType: '24_hour_pass' | 'annual_pass') => void;
}

export const EntitlementsModal: React.FC<EntitlementsModalProps> = ({
  host,
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const [processing, setProcessing] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (type: '24_hour_pass' | 'annual_pass') => {
    setProcessing(type);
    setTimeout(() => {
      onUpgrade(type);
      setProcessing(null);
    }, 800);
  };

  const hasActiveAnnual = host.activeEntitlements.some(
    e => e.type === 'annual_pass' && e.expiresAt > Date.now()
  );
  const hasActiveDayPass = host.activeEntitlements.some(
    e => e.type === '24_hour_pass' && e.expiresAt > Date.now()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141313] border border-white/10 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#8e9192] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-amber-400 text-lg">hotel_class</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C734B]">
            HOST PRIVILEGES & PASSES
          </span>
        </div>
        <h2 className="font-noto-serif text-2xl font-light text-[#e5e2e1] mb-2">
          Patron Entitlements
        </h2>
        <p className="text-xs text-[#8e9192] mb-6">
          Authenticated host privileges for curating multi-player salon chambers.
        </p>

        {/* Current Status Box */}
        <div className="p-4 rounded-xl bg-[#1c1b1b] border border-white/5 mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#8e9192] block">Current Plan</span>
            <span className="text-sm font-semibold text-[#e5e2e1] uppercase font-mono">
              {hasActiveAnnual ? 'Annual Patron Pass' : hasActiveDayPass ? '24-Hour Salon Pass' : 'Free Tier'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#8e9192] block">Rooms Today</span>
            <span className="text-sm font-mono text-[#e5e2e1]">
              {host.createdRoomsToday} / {hasActiveAnnual || hasActiveDayPass ? 'Unlimited' : '1 (Daily Limit)'}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* 24-Hour Pass */}
          <div className="p-5 rounded-xl bg-[#1c1b1b]/80 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#e5e2e1]">
                  24-Hour Pass
                </span>
                <span className="text-sm font-mono font-bold text-amber-300">₹99</span>
              </div>
              <p className="text-xs text-[#8e9192] mb-4">
                Unlimited chamber creation for 24 continuous hours. Ideal for evening gatherings.
              </p>
              <ul className="space-y-1.5 text-[11px] text-[#c4c7c7] mb-6">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                  Unlimited 20-player rooms
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                  All catalog game access
                </li>
              </ul>
            </div>

            <button
              disabled={!!processing || hasActiveDayPass}
              onClick={() => handlePurchase('24_hour_pass')}
              className="w-full py-2.5 px-3 rounded-lg bg-[#201f1f] hover:bg-[#2b2a2a] text-xs font-medium text-[#e5e2e1] border border-white/10 transition-colors disabled:opacity-40"
            >
              {processing === '24_hour_pass' ? 'Processing...' : hasActiveDayPass ? 'Pass Active' : 'Acquire Pass (₹99)'}
            </button>
          </div>

          {/* Annual Pass */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-[#201f1f] to-[#141313] border border-[#8C734B]/50 shadow-xl flex flex-col justify-between relative">
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#8C734B] text-black text-[9px] font-bold tracking-wider uppercase">
              BEST VALUE
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#e5e2e1]">
                  Annual Patron
                </span>
                <span className="text-sm font-mono font-bold text-amber-300">₹499</span>
              </div>
              <p className="text-xs text-[#8e9192] mb-4">
                Full 365-day developer and curator license. Unlimited rooms and upcoming releases.
              </p>
              <ul className="space-y-1.5 text-[11px] text-[#c4c7c7] mb-6">
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                  Year-round unlimited rooms
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                  Priority server authority
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs text-emerald-400">check</span>
                  Elite Tier curator badge
                </li>
              </ul>
            </div>

            <button
              disabled={!!processing || hasActiveAnnual}
              onClick={() => handlePurchase('annual_pass')}
              className="w-full py-2.5 px-3 rounded-lg bg-[#e5e2e1] hover:bg-white text-black text-xs font-semibold transition-colors disabled:opacity-40 shadow-lg"
            >
              {processing === 'annual_pass' ? 'Processing...' : hasActiveAnnual ? 'Pass Active' : 'Acquire Annual (₹499)'}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-center text-white/30">
          Transactions are authorized through secure server webhooks with full idempotency guarantees.
        </p>
      </div>
    </div>
  );
};
