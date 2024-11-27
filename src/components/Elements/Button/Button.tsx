import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import './Button.css';

const variants = {
  default: 'btn_default',
  small: 'btn_small',
};

type IconProps =
  | { leftIcon: string; rightIcon?: never }
  | { rightIcon: string; leftIcon?: never }
  | { rightIcon?: undefined; leftIcon?: undefined };

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  isLoading?: boolean;
  text?: boolean;
} & IconProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className = '',
      variant = 'default',
      isLoading = false,
      text = true,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx('btn', variants[variant], className)}
        {...props}
      >
        {leftIcon && <img src={leftIcon} alt="" />}
        {isLoading && <span>Loading</span>}
        {text && props.children}
        {rightIcon && <img src={rightIcon} alt="" />}
      </button>
    );
  }
);

Button.displayName = 'Button';
