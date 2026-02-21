const Storage = {
  getHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  },
  addHistory(record) {
    try {
      const history = this.getHistory();
      history.unshift(record);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch(e) {
      if (e.name === 'QuotaExceededError') showToast('儲存空間不足，建議清理歷史紀錄', 'error');
    }
  },
  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },
  getBlacklist() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLACKLIST) || '[]');
  },
  addBlacklist(place) {
    try {
      const list = this.getBlacklist();
      if (!list.find(p => p.placeId === place.placeId)) {
        list.push({ placeId: place.placeId, name: place.name, addedAt: new Date().toISOString().slice(0,10) });
        localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(list));
      }
    } catch(e) {
      if (e.name === 'QuotaExceededError') showToast('儲存空間不足，建議清理歷史紀錄', 'error');
    }
  },
  removeBlacklist(placeId) {
    const list = this.getBlacklist().filter(p => p.placeId !== placeId);
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(list));
  },
  clearBlacklist() {
    localStorage.removeItem(STORAGE_KEYS.BLACKLIST);
  },
  isBlacklisted(placeId) {
    return this.getBlacklist().some(p => p.placeId === placeId);
  },
  getSettings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  isFirstVisit() {
    return !localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
  },
  markVisited() {
    localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
  },
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
  getVisitCount(placeId) {
    return this.getHistory().filter(h => h.placeId === placeId).length;
  }
};
