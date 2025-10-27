'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CartoonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮变体
   * - primary: 深蓝色主按钮
   * - secondary: 暖橙色次要按钮
   * - outline: 轮廓按钮
   * - ghost: 幽灵按钮
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  
  /**
   * 按钮尺寸
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * 图标（可选）
   */
  icon?: React.ReactNode;
  
  /**
   * 图标位置
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * 是否全宽
   */
  fullWidth?: boolean;
}

/**
 * CartoonButton 卡通风格按钮组件
 * 
 * 特点：
 * - 立体阴影效果（多层box-shadow）
 * - 300-400ms 弹跳动效
 * - 按下时有 translateY(2px) 效果
 * - 支持 4 种变体和 3 种尺寸
 */
export const CartoonButton = React.forwardRef<HTMLButtonElement, CartoonButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 基础样式
    const baseStyles = cn(
      // 字体和排版
      'font-body font-semibold',
      // 圆角
      'rounded-cartoon-lg',
      // 过渡动画（300-400ms，弹性曲线）
      'transition-all duration-cartoon ease-bounce',
      // Flex 布局
      'inline-flex items-center justify-center gap-2',
      // 焦点样式（可访问性）
      'focus:outline-none focus-visible:ring-3 focus-visible:ring-cartoon-blue focus-visible:ring-offset-2',
      // 禁用状态
      disabled && 'opacity-50 cursor-not-allowed',
      // 全宽
      fullWidth && 'w-full',
      // 默认按钮行为
      !disabled && 'active:translate-y-[2px]'
    );

    // 变体样式（增强版，类似示例图片）
    const variantStyles = {
      primary: cn(
        'bg-cartoon-blue text-white border-[4px] border-[#3d4d5f]',  // 加厚边框
        'shadow-button',
        !disabled && 'hover:shadow-button-hover hover:bg-[#647a99]',
        !disabled && 'active:shadow-button-active active:translate-y-[3px]'  // 按下效果更明显
      ),
      secondary: cn(
        'bg-cartoon-orange text-white border-[4px] border-[#c67445]',
        'shadow-button',
        !disabled && 'hover:shadow-button-hover hover:bg-[#eda972]',
        !disabled && 'active:shadow-button-active active:translate-y-[3px]'
      ),
      outline: cn(
        'bg-paper-light text-ink border-[3px] border-cartoon-brown',
        'shadow-md',
        !disabled && 'hover:bg-paper hover:shadow-lg',
        !disabled && 'active:shadow-sm'
      ),
      ghost: cn(
        'bg-transparent text-ink',
        !disabled && 'hover:bg-paper/50',
        !disabled && 'active:bg-paper'
      ),
    };

    // 尺寸样式（增大内边距，更立体）
    const sizeStyles = {
      sm: 'px-5 py-2.5 text-sm',
      md: 'px-8 py-4 text-base',
      lg: 'px-10 py-5 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

CartoonButton.displayName = 'CartoonButton';

export default CartoonButton;

