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
    const statsTitle = t('history.stats').replace('📊 ', '');
    statsEl.innerHTML = `
      <p style="font-weight:600;margin-bottom:8px;color:#2D2549;">📊 ${statsTitle}</p>
      <div style="display:grid;grid-template-columns:1fr auto;gap:5px 12px;">
        ${stats.map(s => `<span style="color:#2D2549;">${s.label}</span><span style="color:#2D2549;text-align:right;font-weight:500;">${s.value}</span>`).join('')}
      </div>`;

    template.style.left = '-9999px';
    template.style.display = 'block';

    try {
      const html2canvas = window.html2canvas;
      if (!html2canvas) { this.fallbackShare(year, month, stats); return; }
      const canvas = await html2canvas(template, { backgroundColor: '#F7F5FF', scale: 2 });
      template.style.display = 'none';

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) { this.fallbackShare(year, month, stats); return; }

      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast(t('toast.copied.image'));
      } catch {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `EatWhat-${monthStr}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast(t('toast.saved.image'));
      }
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
    dayHeaders.forEach(d => { html += `<div style="color:#8C7B70;padding:2px;">${d}</div>`; });
    for (let i = 0; i < firstDay; i++) html += `<div></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const emojis = byDate[dateStr] || [];
      const display = emojis.slice(0,2).join('') + (emojis.length > 2 ? '+' : '');
      html += `<div style="padding:2px;"><div style="color:#8C7B70;font-size:10px;">${d}</div><div style="font-size:12px;">${display}</div></div>`;
    }
    html += '</div>';
    return html;
  },

  calcStats(monthData) {
    if (monthData.length === 0) return [];
    const types = {};
    monthData.forEach(h => { types[h.category || '🍽️'] = (types[h.category || '🍽️'] || 0) + 1; });
    const topEntry = Object.entries(types).sort((a,b) => b[1]-a[1])[0];
    return [
      { label: t('stats.visits.label'), value: `${monthData.length} ${t('stats.visits.unit')}` },
      { label: t('stats.types.label'), value: `${Object.keys(types).length} ${t('stats.types.unit')}` },
      topEntry ? { label: t('stats.top.label'), value: topEntry[0] } : null
    ].filter(Boolean);
  },

  fallbackShare(year, month, stats) {
    const statsText = stats.map(s => `${s.label} ${s.value}`).join('\n');
    const text = `🍽️ 吃啥 EatWhat ${year}/${month}\n${statsText}\neatwhatla.vercel.app`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard?.writeText(text); showToast('已複製到剪貼簿！'); }
  }
};
