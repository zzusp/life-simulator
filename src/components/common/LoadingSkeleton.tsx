'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  /**
   * 骨架屏类型
   */
  variant?: 'text' | 'card' | 'circle' | 'button';
  
  /**
   * 宽度
   */
  width?: string | number;
  
  /**
   * 高度
   */
  height?: string | number;
  
  /**
   * 数量（重复渲染）
   */
  count?: number;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * LoadingSkeleton 手绘风格加载骨架屏组件
 * 
 * 特点：
 * - 纸张色系渐变动画
 * - 圆润边框
 * - 支持多种形态
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
}) => {
  // 变体样式
  const variantStyles = {
    text: 'h-4 rounded-md',
    card: 'h-32 rounded-cartoon',
    circle: 'rounded-full aspect-square',
    button: 'h-12 rounded-cartoon-lg',
  };

  // 生成骨架元素
  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        'skeleton-cartoon animate-pulse',
        variantStyles[variant],
        className
      )}
      style={{
        width: width || (variant === 'circle' ? height : '100%'),
        height: height || undefined,
      }}
      aria-hidden="true"
    />
  ));

  return count > 1 ? (
    <div className="flex flex-col gap-3">
      {skeletons}
    </div>
  ) : (
    <>{skeletons}</>
  );
};

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * CardSkeleton 卡片骨架屏
 */
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="skeleton-cartoon rounded-cartoon p-6 space-y-3"
        >
          <LoadingSkeleton variant="text" width="60%" height="1.5rem" />
          <LoadingSkeleton variant="text" width="100%" />
          <LoadingSkeleton variant="text" width="80%" />
          <div className="flex gap-2 pt-2">
            <LoadingSkeleton variant="button" width="100px" />
            <LoadingSkeleton variant="button" width="100px" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ListSkeleton 列表骨架屏
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="skeleton-cartoon rounded-cartoon p-4 flex items-center gap-4"
        >
          <LoadingSkeleton variant="circle" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" width="40%" />
            <LoadingSkeleton variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * FullPageSkeleton 全屏加载骨架屏
 */
export const FullPageSkeleton: React.FC<{ text?: string }> = ({ 
  text = '加载中...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="text-center space-y-4">
        <LoadingSkeleton variant="circle" width="80px" height="80px" className="mx-auto" />
        <LoadingSkeleton variant="text" width="200px" height="24px" className="mx-auto" />
        {text && (
          <p className="font-body text-ink-light text-sm mt-4">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
