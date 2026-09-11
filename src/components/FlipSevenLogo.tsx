import React, { useId } from 'react';

interface FlipSevenLogoProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function FlipSevenLogo({
  size,
  width,
  height,
  className,
  style,
}: FlipSevenLogoProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cardGradId = `cardGrad_${id}`;
  const goldGradId = `goldGrad_${id}`;
  const glowId = `glow_${id}`;

  const finalWidth = width ?? size ?? 160;
  const finalHeight = height ?? size ?? 160;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 160"
      width={finalWidth}
      height={finalHeight}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={cardGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Background Card Base */}
      <rect
        x="15"
        y="20"
        width="85"
        height="120"
        rx="14"
        fill="#3B82F6"
        opacity="0.4"
        transform="rotate(-14 57 80)"
      />
      <rect
        x="40"
        y="16"
        width="92"
        height="128"
        rx="16"
        fill={`url(#${cardGradId})`}
        stroke={`url(#${goldGradId})`}
        strokeWidth="4"
        filter={`url(#${glowId})`}
      />
      {/* Decorative Corner 7s */}
      <text
        x="50"
        y="42"
        fontFamily="'Space Grotesk', 'Impact', sans-serif"
        fontSize="18"
        fontWeight="900"
        fill="#FBBF24"
      >
        7
      </text>
      <text
        x="122"
        y="132"
        fontFamily="'Space Grotesk', 'Impact', sans-serif"
        fontSize="18"
        fontWeight="900"
        fill="#FBBF24"
        textAnchor="end"
      >
        7
      </text>
      {/* Center Golden Bold 7 */}
      <text
        x="86"
        y="96"
        fontFamily="'Space Grotesk', 'Arial Black', sans-serif"
        fontSize="64"
        fontWeight="900"
        fill={`url(#${goldGradId})`}
        textAnchor="middle"
        letterSpacing="-2"
      >
        7
      </text>
      {/* Flip Sparkles */}
      <polygon
        points="112,38 116,48 126,52 116,56 112,66 108,56 98,52 108,48"
        fill="#FCD34D"
      />
    </svg>
  );
}
