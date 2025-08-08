(function(){
  try {
    // Avoid duplicate listeners in HMR
    if (window.__jinjiangHotkeysInstalled) return;
    window.__jinjiangHotkeysInstalled = true;

    window.addEventListener('keydown', function(e) {
      // Alt + T
      // e.altKey is true for Alt, and ignore if any modifier like Ctrl/Meta is pressed
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const key = e.key || e.code;
        // Normalize: 't' or 'KeyT'
        if (key === 't' || key === 'T' || key === 'KeyT') {
          // prevent interfering with inputs
          const tag = (document.activeElement && document.activeElement.tagName) || '';
          if (!/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
            e.preventDefault();
            window.location.assign('/football-tactical-board/dashboard.html');
          }
        }
      }
    }, { passive: false });
  } catch (err) {
    // no-op
  }
})();
