import React, { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#F3EDE0] text-[#702F32] p-6 text-center ${className}`}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-3 opacity-70"
        >
          <path
            d="M18 4C18 4 12 11 12 16C12 19.3 14.7 22 18 22C21.3 22 24 19.3 24 16C24 11 18 4 18 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M7 24H29C28 28.5 23.5 31 18 31C12.5 31 8 28.5 7 24Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="font-display text-base text-[#242320]">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
