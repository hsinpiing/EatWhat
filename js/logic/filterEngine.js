const FilterEngine = {
  activeFilters: {},

  setFilter(group, value) {
    if (this.activeFilters[group] === value) {
      delete this.activeFilters[group];
    } else {
      this.activeFilters[group] = value;
    }
    this.updateFilterCount();
  },

  toggleDietary(value) {
    if (!this.activeFilters.dietary) this.activeFilters.dietary = [];
    const idx = this.activeFilters.dietary.indexOf(value);
    if (idx >= 0) this.activeFilters.dietary.splice(idx, 1);
    else this.activeFilters.dietary.push(value);
    if (this.activeFilters.dietary.length === 0) delete this.activeFilters.dietary;
    this.updateFilterCount();
  },

  getFilters() {
    return this.activeFilters;
  },

  clearAll() {
    this.activeFilters = {};
    this.updateFilterCount();
  },

  updateFilterCount() {
    const el = document.getElementById('filter-count');
    if (!el) return;
    const count = Object.keys(this.activeFilters).filter(k => {
      const v = this.activeFilters[k];
      return v && (Array.isArray(v) ? v.length > 0 : true);
    }).length;
    el.textContent = count > 0 ? `${count} 個篩選` : '';
  },

  applyClientFilter(results) {
    return results.filter(p => !Storage.isBlacklisted(p.place_id));
  },

  buildParams() {
    const f = this.activeFilters;
    return {
      food: f.food || null,
      occasion: f.occasion || null,
      dietary: f.dietary || [],
      price: f.price || null,
      distance: f.distance ? parseInt(f.distance) : DISTANCE_RADIUS.default,
      sort: f.sort || 'weighted'
    };
  }
};
