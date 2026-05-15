/** Reads theme colors from @theme CSS variables (set in globals.css). */

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Fallbacks alineados a pasteles no azules del tema */
const FB = {
  chart1: "#a8e6cf",
  chart2: "#ffd3b6",
  chart3: "#d4c4ec",
  chart4: "#fff4b8",
  line: "#e8a598",
  barAlt: "#f8b8c4",
  grid: "rgb(201 229 252 / 0.45)",
  axis: "#5b7aa5",
  tooltipBorder: "#c9e5fc",
  tooltipBg: "rgb(246 251 255 / 0.96)",
};

export function getChartTheme() {
  return {
    seriesColors: [
      readVar("--color-chart-1", FB.chart1),
      readVar("--color-chart-2", FB.chart2),
      readVar("--color-chart-3", FB.chart3),
      readVar("--color-chart-4", FB.chart4),
    ],
    lineStroke: readVar("--color-chart-line", FB.line),
    barFill: readVar("--color-chart-bar-alt", FB.barAlt),
    gridStroke: readVar("--color-chart-grid", FB.grid),
    axisTick: readVar("--color-chart-axis", FB.axis),
    tooltipBorder: readVar("--color-border", FB.tooltipBorder),
    tooltipBackground: FB.tooltipBg,
  };
}
