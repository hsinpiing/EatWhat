const HistoryPage = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  selectedDate: null,

  init() {
    document.getElementById('prev-month').addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 1) { this.currentMonth = 12; this.currentYear--; }
      this.render();
    });
    document.getElementById('next-month').addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 12) { this.currentMonth = 1; this.currentYear++; }
      this.render();
    });
    document.getElementById('share-report-btn').addEventListener('click', () => {
      ShareReport.generate(this.currentYear, this.currentMonth);
    });
  },

  render() {
    const history = Storage.getHistory();
    const monthStr = `${this.currentYear}-${String(this.currentMonth).padStart(2,'0')}`;
    const monthData = history.filter(h => h.date && h.date.startsWith(monthStr));

    const langs = { 'zh-TW': `${this.currentYear}年${this.currentMonth}月`, 'zh-CN': `${this.currentYear}年${this.currentMonth}月`, 'en': `${new Date(this.currentYear, this.currentMonth-1).toLocaleString('en',{month:'long'})} ${this.currentYear}` };
    document.getElementById('calendar-month-label').textContent = langs[getCurrentLang()] || `${this.currentYear}/${this.currentMonth}`;

    this.renderCalendar(monthData);
    this.renderStats(monthData);

    const isEmpty = history.length === 0;
    document.getElementById('history-empty').classList.toggle('hidden', !isEmpty);
    document.getElementById('monthly-stats').classList.toggle('hidden', monthData.length === 0);
  },

  renderCalendar(monthData) {
    const byDate = {};
    monthData.forEach(h => {
      if (!byDate[h.date]) byDate[h.date] = [];
      byDate[h.date].push(h);
    });

    const firstDay = new Date(this.currentYear, this.currentMonth-1, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const dayHeaders = getCurrentLang() === 'en'
      ? ['Su','Mo','Tu','We','Th','Fr','Sa']
      : ['日','一','二','三','四','五','六'];

    let html = `<div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">`;
    dayHeaders.forEach(d => { html += `<div class="text-gray-500 py-1">${d}</div>`; });
    html += '</div><div class="grid grid-cols-7 gap-1 text-center text-xs">';

    for (let i = 0; i < firstDay; i++) html += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const records = byDate[dateStr] || [];
      const emojis = records.slice(0,3).map(r => r.emoji || '🍽️').join('');
      const extra = records.length > 3 ? `<span class="text-gray-500">+${records.length-3}</span>` : '';
      const isSelected = this.selectedDate === dateStr;
      const hasData = records.length > 0;
      html += `<div class="day-cell py-1 rounded-lg cursor-pointer ${isSelected ? 'ring-1 ring-primary' : hasData ? 'hover:bg-purple-50' : ''}"
                    style="${isSelected ? 'background:#EDE9FE' : ''}"
                    data-date="${dateStr}">
                 <div style="color:#8C7B70;font-size:11px">${d}</div>
                 <div class="text-base leading-none">${emojis}${extra}</div>
               </div>`;
    }
    html += '</div>';

    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = html;

    grid.querySelectorAll('.day-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.dataset.date;
        const records = byDate[date] || [];
        if (records.length === 0) return;
        if (this.selectedDate === date) {
          this.selectedDate = null;
          document.getElementById('day-detail').classList.add('hidden');
        } else {
          this.selectedDate = date;
          this.showDayDetail(date, records);
        }
        this.renderCalendar(monthData);
      });
    });
  },

  showDayDetail(date, records) {
    const detail = document.getElementById('day-detail');
    document.getElementById('day-detail-title').textContent = `📅 ${date}`;
    const list = document.getElementById('day-detail-list');
    list.innerHTML = records.map(r => {
      const time = r.visitedAt ? new Date(r.visitedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';
      return `<div class="flex items-center gap-2 py-1 border-b border-purple-100 last:border-0">
        <span class="text-lg">${r.emoji || '🍽️'}</span>
        <div class="flex-1">
          <p class="text-sm font-medium" style="color:#2D2549">${r.name}</p>
          ${time ? `<p class="text-xs" style="color:#8C7B70">${time}</p>` : ''}
        </div>
      </div>`;
    }).join('');
    detail.classList.remove('hidden');
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  renderStats(monthData) {
    if (monthData.length === 0) return;
    const types = {};
    monthData.forEach(h => { types[h.emoji || '🍽️'] = (types[h.emoji || '🍽️'] || 0) + 1; });
    const topEntry = Object.entries(types).sort((a,b) => b[1]-a[1])[0];
    const statsEl = document.getElementById('stats-content');
    statsEl.innerHTML = [
      `<p>${t('stats.visits', { n: monthData.length })}</p>`,
      `<p>${t('stats.types', { n: Object.keys(types).length })}</p>`,
      topEntry ? `<p>${t('stats.top', { emoji: topEntry[0], type: topEntry[0], n: topEntry[1] })}</p>` : ''
    ].join('');
  }
};
