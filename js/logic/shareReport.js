const ShareReport = {
  async generate(year, month) {
    const history = Storage.getHistory();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const monthData = history.filter(h => h.date && h.date.startsWith(monthStr));

    const template = document.getElementById('share-template');
    const label = document.getElementById('share-month-label');
    const calEl = document.getElementById('share-calendar');
    const statsEl = document.getElementById('share-stats');

    const monthNames = { 'zh-TW': `${year}年${month}月`, 'zh-CN': `${year}年${month}月`, 'en': `${new Date(year, month-1).toLocaleString('en', {month:'long'})} ${year}` };
    label.textContent = monthNames[getCurrentLang()] || `${year}/${month}`;

    // Build calendar
    calEl.innerHTML = this.buildCalendarHTML(year, month, monthData);

    // Build stats
    const stats = this.calcStats(monthData);
    statsEl.innerHTML = stats.map(s => `<p>${s}</p>`).join('');

    template.style.left = '-9999px';
    template.style.display = 'block';

    try {
      const html2canvas = window.html2canvas;
      if (!html2canvas) { this.fallbackShare(year, month, stats); return; }
      const canvas = await html2canvas(template, { backgroundColor: '#030712', scale: 2 });
      template.style.display = 'none';
      canvas.toBlob(blob => {
        const file = new File([blob], `EatWhat-${monthStr}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: '吃啥月報', text: `我的 ${monthStr} 飲食足跡 🍽️` });
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `EatWhat-${monthStr}.png`;
          a.click();
        }
      });
    } catch(e) {
      template.style.display = 'none';
      this.fallbackShare(year, month, stats);
    }
  },

  buildCalendarHTML(year, month, monthData) {
    const byDate = {};
    monthData.forEach(h => {
      if (!byDate[h.date]) byDate[h.date] = [];
      byDate[h.date].push(h.emoji || '🍽️');
    });
    const firstDay = new Date(year, month-1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayHeaders = ['日','一','二','三','四','五','六'];
    let html = `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:11px;">`;
    dayHeaders.forEach(d => { html += `<div style="color:#6b7280;padding:2px;">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const emojis = byDate[dateStr] || [];
      const display = emojis.slice(0,2).join('') + (emojis.length > 2 ? '+' : '');
      html += `<div style="padding:2px;"><div style="color:#9ca3af;font-size:10px;">${d}</div><div style="font-size:12px;">${display}</div></div>`;
    }
    html += '</div>';
    return html;
  },

  calcStats(monthData) {
    if (monthData.length === 0) return [t('history.empty')];
    const types = {};
    monthData.forEach(h => { types[h.category || '🍽️'] = (types[h.category || '🍽️'] || 0) + 1; });
    const topEntry = Object.entries(types).sort((a,b) => b[1]-a[1])[0];
    return [
      t('stats.visits', { n: monthData.length }),
      t('stats.types', { n: Object.keys(types).length }),
      topEntry ? t('stats.top', { emoji: topEntry[0], type: topEntry[0], n: topEntry[1] }) : ''
    ].filter(Boolean);
  },

  fallbackShare(year, month, stats) {
    const text = `🍽️ 吃啥 EatWhat ${year}/${month}\n${stats.join('\n')}\neatwhat.app`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard?.writeText(text); showToast('已複製到剪貼簿！'); }
  }
};
