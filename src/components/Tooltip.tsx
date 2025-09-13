import { useState, type ReactNode } from 'react';

export function Tooltip({ children, content }: { children: ReactNode; content: ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs rounded-lg bg-slate-800 dark:bg-slate-900 px-3 py-2 text-sm text-white dark:text-slate-100 shadow-lg z-10">
          {content}
        </div>
      )}
    </div>
  );
}
