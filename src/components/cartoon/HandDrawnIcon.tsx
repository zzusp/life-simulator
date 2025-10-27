'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface HandDrawnIconProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 图标类型
   */
  type: 'star' | 'heart' | 'arrow' | 'check' | 'cross' | 'info' | 'trophy' | 'sparkle';
  
  /**
   * 尺寸（像素）
   */
  size?: number;
  
  /**
   * 颜色
   */
  color?: string;
  
  /**
   * 是否启用动画
   */
  animated?: boolean;
  
  /**
   * 动画类型
   */
  animationType?: 'wiggle' | 'float' | 'bounce' | 'pulse';
}

/**
 * HandDrawnIcon 手绘图标组件
 * 
 * 特点：
 * - 手绘风格 SVG 图标
 * - 支持多种图标类型
 * - 可选动画效果
 * - 自定义颜色和尺寸
 */
export const HandDrawnIcon: React.FC<HandDrawnIconProps> = ({
  className,
  type,
  size = 24,
  color = 'currentColor',
  animated = false,
  animationType = 'float',
  ...props
}) => {
  // 动画类名
  const animationClass = animated ? {
    wiggle: 'animate-wiggle',
    float: 'animate-float',
    bounce: 'animate-bounce-in',
    pulse: 'animate-pulse',
  }[animationType] : '';

  // SVG 路径数据（手绘风格）
  const iconPaths: Record<string, string> = {
    star: 'M12 2l2.5 7.5h7.5l-6 4.5 2.5 7.5-6-4.5-6 4.5 2.5-7.5-6-4.5h7.5z',
    heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    arrow: 'M12 4l-8 8h5v8h6v-8h5z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    cross: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    trophy: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
    sparkle: 'M12 3l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3L8 6h3z',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        animationClass,
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${type} icon`}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          // 手绘风格：略微不规则的描边
          filter: 'url(#hand-drawn-filter)',
        }}
      >
        {/* 手绘风格滤镜 */}
        <defs>
          <filter id="hand-drawn-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.02" 
              numOctaves="2" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="0.5" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
        
        <path d={iconPaths[type]} />
      </svg>
    </div>
  );
};

HandDrawnIcon.displayName = 'HandDrawnIcon';

export default HandDrawnIcon;

