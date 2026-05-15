"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";
import type { AdminMetrics } from "@/lib/auth-types";
import { getChartTheme } from "@/lib/chart-theme";

function subscribeCompactChart(onStoreChange: () => void) {
  const mq = window.matchMedia("(max-width: 639px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getCompactChartSnapshot() {
  return window.matchMedia("(max-width: 639px)").matches;
}

export function AdminCharts({ metrics }: { metrics: AdminMetrics }) {
  const theme = getChartTheme();
  const compactChart = useSyncExternalStore(
    subscribeCompactChart,
    getCompactChartSnapshot,
    () => false,
  );
  const statusChartData = Object.entries(metrics.byStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const topDoctorData = metrics.topDoctors.map((d) => ({
    name: d.name ?? `Dr.#${d.doctorId}`,
    count: d.count,
  }));

  const tooltipStyle = {
    borderRadius: "0.75rem",
    border: `1px solid ${theme.tooltipBorder}`,
    background: theme.tooltipBackground,
    backdropFilter: "blur(8px)",
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="app-card">
          <h2 className="mb-4 font-medium text-title dark:text-slate-100">
            Por estado
          </h2>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid stroke={theme.gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: theme.axisTick, fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: theme.axisTick, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Cantidad" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={theme.seriesColors[i % theme.seriesColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-card">
          <h2 className="mb-4 font-medium text-title dark:text-slate-100">
            Serie por día
          </h2>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.byDay}>
                <CartesianGrid stroke={theme.gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.axisTick }} />
                <YAxis allowDecimals={false} tick={{ fill: theme.axisTick, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Prescripciones"
                  stroke={theme.lineStroke}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {topDoctorData.length > 0 && (
        <div className="app-card">
          <h2 className="mb-4 font-medium text-title dark:text-slate-100">
            Top médicos por volumen
          </h2>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topDoctorData}
                layout="vertical"
                margin={{ left: compactChart ? 4 : 24, right: 8 }}
              >
                <CartesianGrid stroke={theme.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: theme.axisTick, fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={compactChart ? 72 : 120}
                  tick={{
                    fontSize: compactChart ? 10 : 11,
                    fill: theme.axisTick,
                  }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="count"
                  name="Recetas"
                  fill={theme.barFill}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
