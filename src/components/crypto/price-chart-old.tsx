"use client"

import { useId } from "react"

type PriceChartProps = {
  points: number[]
  width?: number
  height?: number
  showMarker?: boolean
  markerLabel?: string
  className?: string
  entryPrice?: number | null
  direction?: "UP" | "DOWN" | null
}

export function PriceChart({
  points,
  width = 600,
  height = 260,
  showMarker = true,
  markerLabel,
  className,
  entryPrice,
  direction,
}: PriceChartProps) {
  const gradId = useId()
  const glowId = useId()

  const padX = 8
  const padY = 16
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  // Determine color based on direction or price trend
  const isUp = direction === "UP" || (direction === null && points[points.length - 1] >= points[0])
  const lineColor = isUp ? "#2fe07a" : "#f23f4b"
  const lineColorRgb = isUp ? "47, 224, 122" : "242, 63, 75"

  const stepX = (width - padX * 2) / (points.length - 1)
  const toX = (i: number) => padX + i * stepX
  const toY = (v: number) => padY + (1 - (v - min) / range) * (height - padY * 2)

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(2)} ${toY(p).toFixed(2)}`)
    .join(" ")

  const areaPath =
    `${linePath} L ${toX(points.length - 1).toFixed(2)} ${height - padY} ` +
    `L ${toX(0).toFixed(2)} ${height - padY} Z`

  const lastX = toX(points.length - 1)
  const lastY = toY(points[points.length - 1])

  // Entry price line
  const entryY = entryPrice && entryPrice >= min && entryPrice <= max ? toY(entryPrice) : null

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img"
      aria-label="Live price chart"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`rgb(${lineColorRgb})`} stopOpacity="0.35" />
          <stop offset="100%" stopColor={`rgb(${lineColorRgb})`} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines (subtle) */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={padX}
          y1={padY + frac * (height - padY * 2)}
          x2={width - padX}
          y2={padY + frac * (height - padY * 2)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}

      {/* Entry price line */}
      {entryY !== null && (
        <line
          x1={padX}
          y1={entryY}
          x2={width - padX}
          y2={entryY}
          stroke="#f5c518"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeOpacity={0.7}
        />
      )}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        vectorEffect="non-scaling-stroke"
      />

      {/* Current price marker */}
      {showMarker && (
        <>
          <circle cx={lastX} cy={lastY} r={12} fill={lineColor} opacity={0.15}>
            <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={lastX} cy={lastY} r={4.5} fill={isUp ? "#eafff2" : "#fff0f0"} stroke={lineColor} strokeWidth={2} />
        </>
      )}

      {/* Entry price label */}
      {entryY !== null && (
        <rect
          x={width - padX - 52}
          y={entryY - 8}
          width={48}
          height={16}
          rx={3}
          fill="#f5c518"
          fillOpacity={0.15}
          stroke="#f5c518"
          strokeWidth={0.5}
          strokeOpacity={0.4}
        />
      )}
    </svg>
  )
}
