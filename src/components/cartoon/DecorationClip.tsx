'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DecorationClipProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 装饰类型
   */
  type?: 'paperclip' | 'pin' | 'tape' | 'sticker';
  
  /**
   * 尺寸
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * 旋转角度
   */
  rotation?: number;
  
  /**
   * 位置（用于绝对定位）
   */
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right';
}

/**
 * DecorationClip 装饰元素组件
 * 
 * 特点：
 * - 回形针、图钉、胶带等装饰
 * - 适度使用，增强氛围
 * - 支持自定义旋转和位置
 * - 响应式隐藏（移动端简化）
 */
export const DecorationClip: React.FC<DecorationClipProps> = ({
  className,
  type = 'paperclip',
  size = 'md',
  rotation = -15,
  position,
  ...props
}) => {
  // 装饰元素映射（使用 emoji 或 SVG）
  const decorationEmojis: Record<string, string> = {
    paperclip: '📎',
    pin: '📌',
    tape: '📏',
    sticker: '⭐',
  };

  // 尺寸样式（增大以匹配示例图片）
  const sizeStyles = {
    sm: 'text-3xl',   // 从xl增大到3xl
    md: 'text-4xl',   // 从2xl增大到4xl
    lg: 'text-5xl',   // 从3xl增大到5xl
  };

  // 位置样式（绝对定位，调整位置以适应更大的尺寸）
  const positionStyles = position ? {
    'top-left': 'absolute top-[-16px] left-6',
    'top-right': 'absolute top-[-16px] right-6',
    'top-center': 'absolute top-[-16px] left-1/2 -translate-x-1/2',
    'bottom-left': 'absolute bottom-[-16px] left-6',
    'bottom-right': 'absolute bottom-[-16px] right-6',
  }[position] : '';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        'select-none pointer-events-none',
        'transition-transform duration-cartoon',
        // 移动端隐藏装饰
        'hidden md:inline-flex',
        sizeStyles[size],
        positionStyles,
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
      {...props}
    >
      {decorationEmojis[type]}
    </div>
  );
};

DecorationClip.displayName = 'DecorationClip';

export default DecorationClip;

