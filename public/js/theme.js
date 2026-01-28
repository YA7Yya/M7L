document.addEventListener('DOMContentLoaded', function() {
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('kalmata-theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', function() {
    var currentTheme = document.body.getAttribute('data-theme');
    var newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('kalmata-theme', newTheme);
    showNotification(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : 'تم تفعيل الوضع النهاري ☀️');
  });
});

function showNotification(message) {
  var existing = document.querySelector('.notification');
  if (existing) existing.remove();

  var notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(function() {
    notification.style.opacity = '0';
    setTimeout(function() { notification.remove(); }, 300);
  }, 3000);
}