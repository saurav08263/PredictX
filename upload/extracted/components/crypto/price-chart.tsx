"use client"

import { useId } from "react"

type PriceChartProps = {
  points: number[]
  width?: number
  height?: number
  showMarker?: boolean
  markerLabel?: string
  className?: string
}

export function PriceChart({
  points,
  width = 600,
  height = 260,
  showMarker = true,
  markerLabel,
  className,
}: PriceChartProps) {
  const gradId = useId()
  const glowId = useId()

  const padX = 8
  const padY = 16
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

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
          <stop offset="0%" stopColor="#2fe07a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2fe07a" stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="#2fe07a"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        vectorEffect="non-scaling-stroke"
      />

      {showMarker && (
        <>
          <circle cx={lastX} cy={lastY} r={9} fill="#2fe07a" opacity={0.25} />
          <circle cx={lastX} cy={lastY} r={4.5} fill="#eafff2" stroke="#2fe07a" strokeWidth={2} />
        </>
      )}
    </svg>
  )
}
