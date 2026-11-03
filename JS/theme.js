/* =====================================================
   Alternância de tema claro / escuro
   ===================================================== */
(function () {
  const root = document.documentElement;
  const btn  = document.getElementById("themeToggle");
  const icon = btn ? btn.querySelector(".theme-icon") : null;

  // Lê preferência salva ou detecta o sistema
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let dark = saved ? saved === "dark" : prefersDark;

  function applyTheme() {
    root.setAttribute("data-theme", dark ? "dark" : "light");
    if (icon) icon.textContent = dark ? "☀️" : "🌙";
    if (btn)  btn.setAttribute("aria-label", dark ? "Ativar tema claro" : "Ativar tema escuro");
  }

  applyTheme();

  if (btn) {
    btn.addEventListener("click", () => {
      dark = !dark;
      localStorage.setItem("theme", dark ? "dark" : "light");
      applyTheme();
    });
  }
})();

