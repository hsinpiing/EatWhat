const HomePage = {
  init() {
    this.bindLocationButtons();
    this.bindFilterButtons();
    this.bindRecommendButton();
    this.bindSettingsButton();
  },

  bindLocationButtons() {
    document.getElementById('gps-btn').addEventListener('click', async () => {
      const status = document.getElementById('location-status');
      status.textContent = '📍 定位中...';
      try {
        const coords = await LocationService.getCurrentPosition();
        // Use Maps JS SDK Geocoder for reverse geocoding (works with HTTP Referrer restricted keys)
        const geocoder = new google.maps.Geocoder();
        await new Promise(resolve => {
          geocoder.geocode({ location: coords, language: getCurrentLang() }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              document.getElementById('location-input').value = results[0].formatted_address;
            }
            resolve();
          });
        });
        status.textContent = '✅ 定位成功';
        setTimeout(() => status.textContent = '', 2000);
      } catch(e) {
        status.textContent = t('error.location');
      }
    });
  },

  bindFilterButtons() {
    document.querySelectorAll('.tag-btn[data-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        if (group === 'dietary') {
          FilterEngine.toggleDietary(value);
          btn.classList.toggle('active');
        } else {
          const wasActive = btn.classList.contains('active');
          document.querySelectorAll(`.tag-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
          if (!wasActive) {
            btn.classList.add('active');
            FilterEngine.setFilter(group, value);
          } else {
            FilterEngine.setFilter(group, value);
          }
        }
      });
    });
  },

  bindRecommendButton() {
    document.getElementById('recommend-btn').addEventListener('click', () => this.doRecommend());
    document.getElementById('retry-btn').addEventListener('click', () => this.doRecommend());
    document.getElementById('error-retry-btn').addEventListener('click', () => {
      FilterEngine.clearAll();
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      this.doRecommend();
    });
    document.getElementById('error-refresh-btn').addEventListener('click', () => this.doRecommend());
  },

  bindSettingsButton() {
    document.getElementById('settings-btn').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.remove('hidden');
      const lang = getCurrentLang();
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
      });
    });
    document.getElementById('settings-close').addEventListener('click', () => {
      document.getElementById('settings-modal').classList.add('hidden');
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLanguage(btn.dataset.lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    document.getElementById('clear-history-btn').addEventListener('click', () => {
      if (confirm(t('confirm.clearHistory'))) { Storage.clearHistory(); showToast(t('toast.cleared')); }
    });
    document.getElementById('clear-blacklist-btn').addEventListener('click', () => {
      if (confirm(t('confirm.clearBlacklist'))) { Storage.clearBlacklist(); showToast(t('toast.cleared')); }
    });
  },

  async doRecommend() {
    const input = document.getElementById('location-input').value.trim();
    let coords = LocationService.getCoords();

    this.showLoading(true);
    this.hideResults();
    this.hideError();

    try {
      if (!coords && !input) { this.showError('location'); return; }
      if (input && !coords) {
        try { const r = await LocationService.geocodeAddress(input); coords = r.coords; }
        catch(e) { this.showError('location'); return; }
      }

      const params = FilterEngine.buildParams();
      let results = await MapsService.searchNearby(coords.lat, coords.lng, params);
      results = FilterEngine.applyClientFilter(results);

      if (results.length === 0) {
        // retry with larger radius
        const biggerParams = { ...params, distance: Math.min((params.distance || 2000) * 2, 10000) };
        results = await MapsService.searchNearby(coords.lat, coords.lng, biggerParams);
        results = FilterEngine.applyClientFilter(results);
      }

      if (results.length === 0) { this.showError('noResults'); return; }

      const picks = WeightedRandom.pick(results, params.sort, 2);
      const details = await Promise.allSettled(picks.map(p => MapsService.getPlaceDetails(p.place_id)));
      const places = details.map((d, i) => d.status === 'fulfilled' ? d.value : picks[i]);

      this.renderResults(places, coords);
    } catch(e) {
      if (e.message === 'QUOTA_EXCEEDED') this.showError('quota');
      else this.showError('network');
    } finally {
      this.showLoading(false);
    }
  },

  showLoading(show) {
    const btn = document.getElementById('recommend-btn');
    btn.disabled = show;
    btn.innerHTML = show
      ? `<span class="animate-spin">⏳</span> <span>${t('loading')}</span>`
      : `<span>🎲</span> <span data-i18n="home.cta">${t('home.cta')}</span>`;
  },

  renderResults(places, userCoords) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';
    places.forEach(place => {
      const card = this.createCard(place, userCoords);
      container.appendChild(card);
    });
    document.getElementById('results-section').classList.remove('hidden');
    container.querySelectorAll('.restaurant-card').forEach(c => c.classList.add('card-enter'));
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  createCard(place, userCoords) {
    const visitCount = Storage.getVisitCount(place.place_id);
    const distText = MapsService.getDistanceText(place, userCoords);
    const stars = place.rating ? '⭐'.repeat(Math.round(place.rating)) : '';
    const priceText = place.price_level ? '$'.repeat(place.price_level) : '';
    const visitText = visitCount > 0 ? t('card.visited', { n: visitCount }) : t('card.firstTime');
    const photo = place.photos && place.photos[0] ? place.photos[0] : null;
    const photoUrl = photo ? MapsService.getPhotoUrl(photo) : null;

    const card = document.createElement('div');
    card.className = 'restaurant-card bg-white rounded-2xl overflow-hidden flex flex-col border border-purple-100';
    card.innerHTML = `
      ${photoUrl ? `<img src="${photoUrl}" alt="${place.name}" class="w-full h-24 object-cover" loading="lazy" onerror="this.style.display='none'" />` : `<div class="w-full h-24 bg-purple-50 flex items-center justify-center text-4xl">🍽️</div>`}
      <div class="p-3 flex flex-col gap-1 flex-1">
        <h3 class="font-bold text-sm leading-tight line-clamp-2" style="color:#2D2549">${place.name}</h3>
        <div class="flex items-center gap-1 text-xs" style="color:#8C7B70">
          ${place.rating ? `<span>${place.rating} ⭐</span>` : ''}
          ${priceText ? `<span>· ${priceText}</span>` : ''}
          ${distText ? `<span>· ${distText}</span>` : ''}
        </div>
        <p class="text-xs" style="color:#8C7B70">${visitText}</p>
        <div class="mt-auto pt-2 grid grid-cols-2 gap-1">
          <a href="${place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`}" target="_blank"
             class="text-center text-xs text-white py-1.5 rounded-lg transition" style="background:#7C6FCD">
            🗺️ ${t('card.go')}
          </a>
          <button class="share-btn text-xs py-1.5 rounded-lg transition border border-purple-200" style="background:#F3F0FF;color:#7C6FCD"
                  data-url="${place.url || ''}" data-name="${place.name}">
            📤 ${t('card.share')}
          </button>
          <button class="pick-btn text-xs py-1.5 rounded-lg transition col-span-1 border border-green-200" style="background:#F0FDF4;color:#16a34a"
                  data-place-id="${place.place_id}" data-name="${place.name}">
            ✅ ${t('card.pick')}
          </button>
          <button class="ban-btn text-xs py-1.5 rounded-lg transition border border-red-200" style="background:#FFF1F2;color:#dc2626"
                  data-place-id="${place.place_id}" data-name="${place.name}">
            ❌ ${t('card.ban')}
          </button>
        </div>
      </div>`;

    card.querySelector('.pick-btn').addEventListener('click', (e) => {
      const placeId = e.target.dataset.placeId;
      const name = e.target.dataset.name;
      const category = this.guessCategory(place);
      Storage.addHistory({ placeId, name, category, emoji: CATEGORY_EMOJI[category] || '🍽️', rating: place.rating, visitedAt: new Date().toISOString(), date: new Date().toISOString().slice(0,10) });
      showToast(t('toast.added'));
      card.style.opacity = '0.5';
    });

    card.querySelector('.ban-btn').addEventListener('click', (e) => {
      Storage.addBlacklist({ placeId: e.target.dataset.placeId, name: e.target.dataset.name });
      showToast(t('toast.banned'));
      card.style.transition = 'all 0.3s';
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
    });

    card.querySelector('.share-btn').addEventListener('click', (e) => {
      const url = e.target.dataset.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
      if (navigator.share) navigator.share({ title: place.name, url });
      else { navigator.clipboard?.writeText(url); showToast('已複製連結！'); }
    });

    return card;
  },

  guessCategory(place) {
    const types = place.types || [];
    if (types.includes('cafe')) return 'cafe';
    if (types.includes('bar')) return 'bar';
    const f = FilterEngine.activeFilters.food;
    if (f && CATEGORY_EMOJI[f]) return f;
    return 'restaurant';
  },

  showError(type) {
    const section = document.getElementById('error-section');
    const msg = document.getElementById('error-message');
    const retryBtn = document.getElementById('error-retry-btn');
    const icons = { noResults: '🔍', network: '😅', location: '📍', quota: '⚠️' };
    document.getElementById('error-icon').textContent = icons[type] || '😅';
    msg.textContent = t(`error.${type}`) || t('error.network');
    retryBtn.classList.toggle('hidden', type !== 'noResults');
    section.classList.remove('hidden');
  },

  hideError() { document.getElementById('error-section').classList.add('hidden'); },
  hideResults() { document.getElementById('results-section').classList.add('hidden'); }
};
