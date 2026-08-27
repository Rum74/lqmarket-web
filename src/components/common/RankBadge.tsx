import React from 'react';
import { RankTier } from '../../types';
import { Shield, Award, Flame, Crown, Zap, Sparkles } from 'lucide-react';

interface RankBadgeProps {
  rank: RankTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', showIcon = true }) => {
  const getRankConfig = (r: RankTier) => {
    switch (r) {
      case 'Thách Đấu':
        return {
          bg: 'bg-gradient-to-r from-red-600/30 via-purple-600/30 to-amber-500/30 text-amber-200 border-amber-400/50 shadow-md shadow-red-500/20 font-black',
          icon: Crown,
          iconColor: 'text-amber-300 animate-pulse'
        };
      case 'Chiến Thần':
        return {
          bg: 'bg-gradient-to-r from-rose-600/30 via-red-600/30 to-orange-500/30 text-rose-200 border-rose-500/40 shadow-sm shadow-rose-500/20 font-extrabold',
          icon: Flame,
          iconColor: 'text-rose-400 animate-bounce'
        };
      case 'Chiến Tướng':
        return {
          bg: 'bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 text-amber-300 border-amber-500/40 shadow-red-500/10',
          icon: Crown,
          iconColor: 'text-amber-300 animate-pulse'
        };
      case 'Cao Thủ':
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-amber-400 border-amber-500/30',
          icon: Sparkles,
          iconColor: 'text-amber-400'
        };
      case 'Tinh Anh':
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-300 border-purple-500/30',
          icon: Zap,
          iconColor: 'text-purple-300'
        };
      case 'Kim Cương':
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-500/30',
          icon: Award,
          iconColor: 'text-cyan-300'
        };
      case 'Bạch Kim':
        return {
          bg: 'bg-gradient-to-r from-teal-500/20 to-emerald-600/20 text-teal-300 border-teal-500/30',
          icon: Shield,
          iconColor: 'text-teal-300'
        };
      case 'Vàng':
        return {
          bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
          icon: Flame,
          iconColor: 'text-yellow-400'
        };
      case 'Bạc':
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          icon: Shield,
          iconColor: 'text-slate-300'
        };
      case 'Đồng':
      default:
        return {
          bg: 'bg-amber-800/20 text-amber-500 border-amber-800/30',
          icon: Shield,
          iconColor: 'text-amber-600'
        };
    }
  };

  const config = getRankConfig(rank);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border backdrop-blur-sm shadow-xs ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <IconComponent size={iconSizes[size]} className={config.iconColor} />}
      <span>{rank}</span>
    </span>
  );
};
