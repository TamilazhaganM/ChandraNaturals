import React from 'react';
import { Sparkles, Leaf, Flame, Award } from 'lucide-react';

export const Badge = ({ text, className = "" }) => {
  if (!text) return null;

  const normalized = text.toLowerCase();

  let badgeStyle = "bg-gold-antique/20 text-gold-antique border-gold-antique/50";
  let Icon = Sparkles;

  if (normalized.includes('go-to') || normalized.includes('pick')) {
    badgeStyle = "bg-gold-antique/25 text-gold-antique border-gold-antique shadow-[0_0_10px_rgba(201,162,78,0.25)]";
    Icon = Sparkles;
  } else if (normalized.includes('seasonal')) {
    badgeStyle = "bg-[#4A3018] text-[#FFFDF8] border-[#C1874F]";
    Icon = Leaf;
  } else if (normalized.includes('bestseller') || normalized.includes('popular')) {
    badgeStyle = "bg-forest-moss text-gold-champagne border-green-500/50";
    Icon = Flame;
  } else if (normalized.includes('value') || normalized.includes('combo')) {
    badgeStyle = "bg-[#4A3018]/95 text-[#FFFDF8] border-gold-antique";
    Icon = Award;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-sans font-medium uppercase tracking-wider rounded-full border ${badgeStyle} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{text}</span>
    </span>
  );
};
