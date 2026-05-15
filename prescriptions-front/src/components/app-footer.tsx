export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="app-footer-shell"
      role="contentinfo"
      aria-label="Pie de página"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 text-center text-xs text-muted-foreground sm:justify-between sm:px-5 sm:text-left lg:px-6">
        <span className="text-title dark:text-slate-200">
          Prescripciones
        </span>
        <span>
          © {year} · Uso interno
        </span>
      </div>
    </footer>
  );
}
