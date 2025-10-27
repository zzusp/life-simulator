'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface WoodFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 边框宽度（默认加厚）
   */
  borderWidth?: number;
  
  /**
   * 是否有圆角
   */
  rounded?: boolean;
  
  /**
   * 是否显示木质纹理
   */
  showTexture?: boolean;
  
  /**
   * 内边距
   */
  padding?: number;
}

/**
 * WoodFrame 木质边框组件
 * 
 * 特点：
 * - 木质边框风格
 * - 可选纹理效果
 * - 用于包裹内容增强层次
 */
export const WoodFrame: React.FC<WoodFrameProps> = ({
  className,
  borderWidth = 12,  // 加厚边框（从8到12）
  rounded = true,
  showTexture = true,
  padding = 24,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative',
        'bg-gradient-to-br from-cartoon-brown to-cartoon-brownLight',  // 使用渐变增强立体感
        rounded && 'rounded-cartoon-xl',  // 使用更大的圆角
        'shadow-wood-frame',  // 使用新的木质边框阴影
        className
      )}
      style={{ padding: borderWidth }}
      {...props}
    >
      {/* 木质纹理效果（增强版）*/}
      {showTexture && (
        <>
          {/* 木纹纹理 */}
          <div
            className={cn(
              'absolute inset-0',
              'pointer-events-none',
              'opacity-40',  // 提高不透明度
              rounded && 'rounded-cartoon-xl',
            )}
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                rgba(0,0,0,0.1) 0px,
                rgba(0,0,0,0.1) 2px,
                transparent 2px,
                transparent 6px
              ),
              repeating-linear-gradient(
                0deg,
                rgba(139,111,92,0.3) 0px,
                rgba(109,76,61,0.2) 50%,
                rgba(139,111,92,0.3) 100%
              )`,
              backgroundSize: '100% 8px',
            }}
            aria-hidden="true"
          />
          
          {/* 内部高光 */}
          <div
            className={cn(
              'absolute top-0 left-0 right-0',
              'h-[4px]',
              'pointer-events-none',
              'opacity-20',
              rounded && 'rounded-t-cartoon-xl',
            )}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />
          
          {/* 底部阴影 */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0',
              'h-[6px]',
              'pointer-events-none',
              'opacity-40',
              rounded && 'rounded-b-cartoon-xl',
            )}
            style={{
              background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* 内容区域（纸张背景）*/}
      <div
        className={cn(
          'relative',
          'bg-paper-light',
          rounded && 'rounded-cartoon',
          'shadow-card',
          'overflow-hidden'
        )}
        style={{ padding }}
      >
        {children}
      </div>
    </div>
  );
};

WoodFrame.displayName = 'WoodFrame';

export default WoodFrame;

