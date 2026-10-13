import React from 'react';

interface MontraLogoProps {
  className?: string;
  size?: number;
  showTagline?: boolean;
}

export const MontraLogo: React.FC<MontraLogoProps> = ({
  className = '',
  size = 36,
  showTagline = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-[#173D32] shadow-sm shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base Wallet / Flow Arc */}
          <path
            d="M20 65 C20 78, 30 84, 50 84 C70 84, 80 78, 80 65"
            stroke="#2E6957"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Geometric M flow */}
          <path
            d="M22 68 L34 35 L50 56 L66 35 L78 68"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Soft Lime wealth crest node */}
          <circle cx="50" cy="24" r="8" fill="#D9F99D" />
          <path
            d="M50 20 L50 28 M47 22 C47 21, 53 21, 53 23 C53 25, 47 25, 47 27"
            stroke="#173D32"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-lg tracking-tight text-[#173D32]">Montra</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#173D32]"></span>
        </div>
        {showTagline && (
          <p className="text-[11px] font-medium text-stone-500 leading-none">
            Take Control of Your Money
          </p>
        )}
      </div>
    </div>
  );
};
