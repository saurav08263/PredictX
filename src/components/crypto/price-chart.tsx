"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  LineSeries,
  type Time,
} from "lightweight-charts";

type PriceChartProps = {
  points: number[];
  className?: string;
  entryPrice?: number | null;
  direction?: "UP" | "DOWN" | null;
};

export function PriceChart({
  points,
  className,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<any>(null);

  const seriesRef = useRef<any>(null);

  // Create chart ONLY ONCE
  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 250,
      layout: {
        background: { color: "#0b0f19" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: {
          color: "rgba(255,255,255,0.04)",
        },
        horzLines: {
          color: "rgba(255,255,255,0.04)",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    seriesRef.current =
      chartRef.current.addSeries(LineSeries);

    return () => {
      chartRef.current?.remove();
    };
  }, []);

  // Update only data
  useEffect(() => {
    if (!seriesRef.current) return;

    const now = Math.floor(Date.now() / 1000);

    const data = points.map((price, index) => ({
      time: (now - points.length + index) as Time,
      value: price,
    }));

    seriesRef.current.setData(data);

    chartRef.current.timeScale().fitContent();
  }, [points]);

  return (
    <div
      ref={chartContainerRef}
      className={className}
    />
  );
}