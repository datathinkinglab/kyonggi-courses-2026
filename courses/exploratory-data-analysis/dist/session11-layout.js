(() => {
  const fit = () => {
    const scale = Math.min((innerWidth - 24) / 1600, (innerHeight - 94) / 900);
    document.documentElement.style.setProperty('--session-scale', String(Math.max(0.1, scale)));
  };
  addEventListener('resize', fit);
  document.addEventListener('fullscreenchange', fit);
  fit();
})();
