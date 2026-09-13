"use client";
import React from 'react';
import { GameMetadata } from '../core/types';

interface ExperienceCardProps {
  metadata: GameMetadata;
  isSelected: boolean;
  onSelect: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  metadata,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border ${
        isSelected
          ? 'border-[#e5e2e1] ring-1 ring-[#e5e2e1]/30 shadow-2xl scale-[1.01]'
          : 'border-white/5 hover:border-white/20 bg-[#1c1b1b]/50'
      }`}
    >
      {/* Aspect Ratio Box */}
      <div className="aspect-[16/10] w-full relative overflow-hidden bg-[#141313]">
        {metadata.thumbnail ? (
          <img
            src={metadata.thumbnail}
            alt={metadata.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
              isSelected ? 'brightness-100' : 'brightness-75 group-hover:brightness-90'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#201f1f] to-[#141313]">
            <span className="material-symbols-outlined text-4xl text-white/20">stadia_controller</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141313] via-[#141313]/40 to-transparent" />

        {/* Selected Indicator Badge */}
        {isSelected && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#e5e2e1] text-[#141313] text-[10px] font-bold tracking-widest uppercase shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#141313]" />
            SELECTED
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] tracking-wider uppercase font-semibold text-[#8C734B] border border-white/5">
          {metadata.category}
        </div>

        {/* Title & Description Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-noto-serif text-lg font-normal text-[#e5e2e1] tracking-tight mb-0.5">
            {metadata.name}
          </h3>
          <p className="text-xs text-[#c4c7c7] line-clamp-1 font-light opacity-90">
            {metadata.description}
          </p>
        </div>
      </div>
    </div>
  );
};
