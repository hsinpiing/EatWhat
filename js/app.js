document.addEventListener('DOMContentLoaded', () => {
  // Init i18n
  applyI18n();

  // Init pages
  HomePage.init();
  HistoryPage.init();
  BlacklistPage.init();

  // Navigation
  const pages = { home: 'page-home', history: 'page-history', blacklist: 'page-blacklist' };
  let currentPage = 'home';

  function navigateTo(page) {
    Object.values(pages).forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(pages[page]).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('text-primary', 'text-text-muted');
      btn.classList.add(btn.dataset.page === page ? 'text-primary' : 'text-text-muted');
    });
    currentPage = page;
    if (page === 'history') HistoryPage.render();
    if (page === 'blacklist') BlacklistPage.render();
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // First visit modal
  if (Storage.isFirstVisit()) {
    document.getElementById('first-visit-modal').classList.remove('hidden');
    document.getElementById('first-visit-ok').addEventListener('click', () => {
      Storage.markVisited();
      document.getElementById('first-visit-modal').classList.add('hidden');
    });
  }

  // Settings modal close on backdrop click
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });
  document.getElementById('first-visit-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      Storage.markVisited();
      e.currentTarget.classList.add('hidden');
    }
  });

  // Init nav state
  navigateTo('home');
});
