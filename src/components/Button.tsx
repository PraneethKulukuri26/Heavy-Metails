import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = ({ children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      style={{
        background: '#222',
        color: 'white',
        border: '1px solid #444',
        borderRadius: 4,
        padding: '0.5rem 1rem',
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
};
