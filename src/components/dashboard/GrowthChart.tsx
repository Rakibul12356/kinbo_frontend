"use client";

import React, { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface GrowthPoint {
  key: string;
  label: string;
  value: number;
}

interface GrowthChartProps {
  title: string;
  subtitle?: string;
  points: GrowthPoint[];
  color?: string;
  formatValue?: (value: number) => string;
  growthLabel?: string;
  growthPercent?: number | null;
}

export default function GrowthChart({
  title,
  subtitle,
  points,
  color = "#082F6B",
  formatValue = (v) => String(v),
  growthLabel,
  growthPercent,
}: GrowthChartProps) {
  const gradId = useId().replace(/:/g, "");
  const up = growthPercent != null && growthPercent >= 0;
  const hasData = points.some((p) => p.value > 0);
  const data = points.map((p) => ({ ...p, name: p.label }));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1F2937]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {growthPercent != null && (
          <div className="text-end">
            <p
              className={`text-sm font-extrabold tabular-nums ${
                up ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {up ? "+" : ""}
              {growthPercent.toFixed(1)}%
            </p>
            {growthLabel && <p className="text-[11px] text-zinc-500">{growthLabel}</p>}
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-56 items-center justify-center rounded-xl bg-[#F8FAFC] text-sm text-zinc-500">
          No growth data yet for this period.
        </div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  fontSize: 12,
                }}
                formatter={(value) => [formatValue(Number(value ?? 0)), title]}
                labelStyle={{ color: "#64748b", marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradId})`}
                dot={{ r: 3, fill: "#fff", stroke: color, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
