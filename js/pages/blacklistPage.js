const BlacklistPage = {
  init() {
    document.getElementById('clear-all-blacklist').addEventListener('click', () => {
      if (confirm(t('confirm.clearAllBlacklist'))) {
        Storage.clearBlacklist();
        showToast(t('toast.cleared'));
        this.render();
      }
    });
  },

  render() {
    const list = Storage.getBlacklist();
    const container = document.getElementById('blacklist-list');
    const emptyEl = document.getElementById('blacklist-empty');
    const clearBtn = document.getElementById('clear-all-blacklist');

    if (list.length === 0) {
      container.innerHTML = '';
      emptyEl.classList.remove('hidden');
      clearBtn.classList.add('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    clearBtn.classList.remove('hidden');

    container.innerHTML = list.map(item => `
      <div class="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3" data-place-id="${item.placeId}">
        <div>
          <p class="text-sm font-medium">${item.name}</p>
          <p class="text-xs text-gray-500">${item.addedAt || ''}</p>
        </div>
        <button class="remove-btn text-xs text-red-400 hover:text-red-300 px-3 py-1 border border-red-900 rounded-lg transition"
                data-place-id="${item.placeId}">
          移除
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Storage.removeBlacklist(btn.dataset.placeId);
        showToast(t('toast.removed'));
        this.render();
      });
    });
  }
};
