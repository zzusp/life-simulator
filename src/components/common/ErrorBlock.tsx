'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PaperCard } from '../cartoon/PaperCard';
import { CartoonButton } from '../cartoon/CartoonButton';
import { HandDrawnIcon } from '../cartoon/HandDrawnIcon';

export interface ErrorBlockProps {
  /**
   * 错误标题
   */
  title?: string;
  
  /**
   * 错误描述
   */
  description?: string;
  
  /**
   * 错误图标类型
   */
  icon?: 'error' | 'warning' | 'info';
  
  /**
   * 重试按钮文字
   */
  retryText?: string;
  
  /**
   * 重试回调
   */
  onRetry?: () => void;
  
  /**
   * 次要操作文字（如"返回首页"）
   */
  secondaryText?: string;
  
  /**
   * 次要操作回调
   */
  onSecondary?: () => void;
  
  /**
   * 是否显示为内嵌样式（非全屏）
   */
  inline?: boolean;
  
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * ErrorBlock 手绘风格错误区块组件
 * 
 * 特点：
 * - 使用 PaperCard 纸张风格
 * - 手绘图标
 * - 友好的错误提示
 * - 支持重试和次要操作
 * - 可内嵌或全屏显示
 */
export const ErrorBlock: React.FC<ErrorBlockProps> = ({
  title = '出现错误',
  description = '很抱歉，遇到了一个错误。请稍后重试。',
  icon = 'error',
  retryText = '重试',
  onRetry,
  secondaryText = '返回首页',
  onSecondary,
  inline = false,
  className,
}) => {
  const iconColors = {
    error: '#c76b6b',
    warning: '#d9a84a',
    info: '#7ba3d6',
  };

  const iconTypes = {
    error: 'cross' as const,
    warning: 'info' as const,
    info: 'info' as const,
  };

  const content = (
    <PaperCard
      className={cn(
        'max-w-md mx-auto',
        inline ? 'my-4' : '',
        className
      )}
      decoration="none"
      border="paper"
    >
      <div className="text-center py-6">
        {/* 错误图标 */}
        <div className="flex justify-center mb-4">
          <HandDrawnIcon
            type={iconTypes[icon]}
            size={64}
            color={iconColors[icon]}
            animated
            animationType="wiggle"
          />
        </div>

        {/* 错误标题 */}
        <h3 className="font-body font-bold text-xl text-ink mb-2">
          {title}
        </h3>

        {/* 错误描述 */}
        <p className="font-body text-base text-ink-light mb-6 leading-relaxed">
          {description}
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <CartoonButton
              variant="primary"
              size="md"
              onClick={onRetry}
            >
              {retryText}
            </CartoonButton>
          )}
          
          {onSecondary && (
            <CartoonButton
              variant="outline"
              size="md"
              onClick={onSecondary}
            >
              {secondaryText}
            </CartoonButton>
          )}
        </div>
      </div>
    </PaperCard>
  );

  // 全屏显示
  if (!inline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        {content}
      </div>
    );
  }

  // 内嵌显示
  return content;
};

ErrorBlock.displayName = 'ErrorBlock';

export default ErrorBlock;
