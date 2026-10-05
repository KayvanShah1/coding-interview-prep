(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const storageKey = 'coretrail-theme';
  let preference;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }

  function applyTheme() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.title = label;
      button.hidden = false;
    });
  }

  // This script runs before the stylesheet to avoid flashing the wrong theme.
  applyTheme();
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        try {
          localStorage.setItem(storageKey, preference);
        } catch {
          // The selected theme remains active for this page.
        }
      });
    });
  });
  system.addEventListener('change', () => {
    if (!preference) applyTheme();
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = ['light', 'dark'].includes(event.newValue) ? event.newValue : undefined;
    applyTheme();
  });
})();
