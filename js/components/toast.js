function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const colors = { success: 'bg-gray-800 border-gray-600', error: 'bg-red-900 border-red-700' };
  toast.className = `toast px-4 py-3 rounded-xl border text-sm max-w-xs ${colors[type] || colors.success}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
