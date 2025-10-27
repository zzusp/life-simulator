'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelTabProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 标签文字
   */
  text: string;
  
  /**
   * 标签颜色
   */
  color?: 'blue' | 'yellow' | 'pink' | 'green' | 'orange';
  
  /**
   * 标签尺寸
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * 是否显示回形针装饰
   */
  hasClip?: boolean;
  
  /**
   * 旋转角度（轻微倾斜）
   */
  rotation?: number;
}

/**
 * LabelTab 标签纸组件
 * 
 * 特点：
 * - 标签纸风格外观
 * - 多种颜色选择
 * - 可选回形针装饰
 * - 轻微旋转效果
 */
export const LabelTab: React.FC<LabelTabProps> = ({
  className,
  text,
  color = 'blue',
  size = 'md',
  hasClip = false,
  rotation = 0,
  ...props
}) => {
  // 颜色样式
  const colorStyles = {
    blue: 'bg-cartoon-blueLight text-cartoon-blue',
    yellow: 'bg-functional-warning/20 text-functional-warning',
    pink: 'bg-red-100 text-red-600',
    green: 'bg-functional-success/20 text-functional-success',
    orange: 'bg-cartoon-orange/30 text-cartoon-orange',
  };

  // 尺寸样式（增大以更明显）
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base font-bold',  // 增大并加粗
    lg: 'px-6 py-3 text-lg font-bold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1',
        'relative',
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
      {...props}
    >
      {/* 回形针装饰 */}
      {hasClip && (
        <span className="text-base select-none" aria-hidden="true">
          📎
        </span>
      )}
      
      {/* 标签内容 */}
      <span
        className={cn(
          'font-body font-medium',
          'rounded-md',
          'shadow-sm',
          'border border-current',
          colorStyles[color],
          sizeStyles[size]
        )}
      >
        {text}
      </span>
    </div>
  );
};

LabelTab.displayName = 'LabelTab';

export default LabelTab;

