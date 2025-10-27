'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 卡片标题（可选）
   */
  title?: string;
  
  /**
   * 装饰元素类型
   * - clip: 回形针
   * - pin: 图钉
   * - tape: 胶带
   * - none: 无装饰
   */
  decoration?: 'clip' | 'pin' | 'tape' | 'none';
  
  /**
   * 装饰位置
   */
  decorationPosition?: 'top-left' | 'top-right' | 'top-center';
  
  /**
   * 边框样式
   * - wood: 木质边框
   * - paper: 纸张边框
   * - none: 无边框
   */
  border?: 'wood' | 'paper' | 'none';
  
  /**
   * 是否可悬停（添加悬停效果）
   */
  hoverable?: boolean;
  
  /**
   * 是否可点击（添加 pointer cursor）
   */
  clickable?: boolean;
  
  /**
   * 是否简化装饰（用于列表页）
   */
  simplified?: boolean;
}

/**
 * PaperCard 纸张卡片组件
 * 
 * 特点：
 * - 纸张纹理背景（桌面端）
 * - 适度装饰（回形针、图钉、胶带）
 * - 木质或纸张边框
 * - 悬停浮起效果（可选）
 * - 响应式简化（移动端减少装饰）
 */
export const PaperCard = React.forwardRef<HTMLDivElement, PaperCardProps>(
  (
    {
      className,
      title,
      decoration = 'none',
      decorationPosition = 'top-left',
      border = 'paper',
      hoverable = false,
      clickable = false,
      simplified = false,
      children,
      ...props
    },
    ref
  ) => {
    // 基础样式
    const baseStyles = cn(
      // 背景
      'bg-paper-light',
      // 圆角
      'rounded-cartoon',
      // 阴影
      'shadow-card',
      // 过渡动画
      'transition-all duration-cartoon',
      // 相对定位（用于装饰元素）
      'relative',
      // 内边距
      'p-6',
      // 可点击样式
      clickable && 'cursor-pointer',
      // 悬停效果
      hoverable && 'hover:shadow-card-hover hover:-translate-y-1'
    );

    // 边框样式
    const borderStyles = {
      wood: 'border-4 border-cartoon-brown',
      paper: 'border-2 border-paper-dark',
      none: '',
    };

    // 装饰位置样式（增大偏移以适应更大的装饰）
    const decorationPositionStyles = {
      'top-left': 'top-[-20px] left-6',
      'top-right': 'top-[-20px] right-6',
      'top-center': 'top-[-20px] left-1/2 -translate-x-1/2',
    };

    // 装饰元素映射（使用更大的emoji）
    const decorationElements = {
      clip: '📎',
      pin: '📌',
      tape: '🎀',
      none: null,
    };

    // 判断是否显示装饰（简化模式或移动端不显示）
    const showDecoration = !simplified && decoration !== 'none';

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          borderStyles[border],
          className
        )}
        {...props}
      >
        {/* 装饰元素（增大尺寸）*/}
        {showDecoration && decorationElements[decoration] && (
          <div
            className={cn(
              'absolute text-5xl transition-transform duration-cartoon',  // 从2xl增大到5xl
              decorationPositionStyles[decorationPosition],
              // 悬停时装饰元素轻微旋转
              hoverable && 'hover:rotate-12',
              // 可访问性：装饰元素不应被屏幕阅读器读取
              'select-none',
              // 添加阴影增强立体感
              'drop-shadow-lg'
            )}
            aria-hidden="true"
          >
            {decorationElements[decoration]}
          </div>
        )}

        {/* 标题（使用楷体）*/}
        {title && (
          <h3 className="font-body font-bold text-xl text-ink mb-4">
            {title}
          </h3>
        )}

        {/* 内容 */}
        <div className="font-body text-ink">
          {children}
        </div>

        {/* 纸张纹理效果（增强版）*/}
        <div
          className={cn(
            'absolute inset-0 rounded-cartoon pointer-events-none',
            'opacity-40 mix-blend-multiply',  // 提高不透明度使纹理更明显
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1' /%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
          aria-hidden="true"
        />
        
        {/* 纸张边缘阴影效果 */}
        <div
          className={cn(
            'absolute inset-0 rounded-cartoon pointer-events-none',
            'opacity-20',
          )}
          style={{
            boxShadow: 'inset 0 0 20px rgba(139, 115, 85, 0.15)',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }
);

PaperCard.displayName = 'PaperCard';

export default PaperCard;

