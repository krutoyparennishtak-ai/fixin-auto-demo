(function () {
  // ── Configuration ──
  // Replace these URLs after deploying your Google Apps Script web app
  var API_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

  var messageInput = document.getElementById('wallMessage');
  var charCount = document.getElementById('charCount');
  var submitBtn = document.getElementById('wallSubmit');
  var errorEl = document.getElementById('wallError');
  var messagesContainer = document.getElementById('wallMessages');
  var loadingEl = document.getElementById('wallLoading');

  if (!messageInput || !submitBtn || !messagesContainer) return;

  // ── Character counter ──
  messageInput.addEventListener('input', function () {
    var len = this.value.length;
    charCount.textContent = len + ' / 200';
    charCount.classList.toggle('wall__char-count--limit', len >= 180);
  });

  // ── Load messages ──
  function loadMessages() {
    if (!API_URL) {
      showDemoMessages();
      return;
    }

    fetch(API_URL + '?limit=20', { redirect: 'follow' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        renderMessages(data);
      })
      .catch(function () {
        showDemoMessages();
      });
  }

  function showDemoMessages() {
    var demo = [
      { text: 'Great service, highly recommend!', timestamp: '2024-11-01T14:30:00Z' },
      { text: 'Oil changed in 20 minutes. Legends!', timestamp: '2024-11-01T12:00:00Z' },
      { text: 'Was here, everything solid', timestamp: '2024-10-31T18:45:00Z' },
      { text: 'Mike was here 🔧', timestamp: '2024-10-31T10:15:00Z' },
      { text: 'Suspension fixed — rides like new!', timestamp: '2024-10-30T16:20:00Z' },
      { text: 'Hello to the next visitor! 👋', timestamp: '2024-10-30T09:00:00Z' },
    ];
    renderMessages(demo);
  }

  function renderMessages(messages) {
    if (loadingEl) loadingEl.remove();

    if (!messages || messages.length === 0) {
      messagesContainer.innerHTML =
        '<div class="wall__empty">No messages yet. Be the first!</div>';
      return;
    }

    var existingEmpty = messagesContainer.querySelector('.wall__empty');
    if (existingEmpty) existingEmpty.remove();

    var fragment = document.createDocumentFragment();
    messages.forEach(function (msg) {
      fragment.appendChild(createMessageCard(msg));
    });

    // Clear loading/old content, add new
    var oldCards = messagesContainer.querySelectorAll('.wall__message');
    oldCards.forEach(function (card) { card.remove(); });

    messagesContainer.appendChild(fragment);
  }

  function createMessageCard(msg) {
    var card = document.createElement('div');
    card.className = 'wall__message';

    var textEl = document.createElement('p');
    textEl.className = 'wall__message-text';
    textEl.textContent = msg.text;

    var timeEl = document.createElement('span');
    timeEl.className = 'wall__message-time';
    timeEl.textContent = formatTime(msg.timestamp);

    card.appendChild(textEl);
    card.appendChild(timeEl);
    return card;
  }

  function formatTime(ts) {
    if (!ts) return '';
    var date = new Date(ts);
    if (isNaN(date.getTime())) return ts;

    var now = new Date();
    var diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
    if (diff < 86400) return Math.floor(diff / 3600) + ' hr ago';
    if (diff < 604800) {
      var days = Math.floor(diff / 86400);
      if (days === 1) return 'yesterday';
      return days + ' days ago';
    }

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
    });
  }

  // ── Submit message ──
  submitBtn.addEventListener('click', handleSubmit);
  messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  });

  function handleSubmit() {
    var text = messageInput.value.trim();
    hideError();

    var modResult = FixinModeration.check(text);
    if (!modResult.pass) {
      showError(modResult.reason);
      return;
    }

    submitBtn.disabled = true;

    if (!API_URL) {
      // Demo mode: optimistic insert only
      addOptimisticMessage(text);
      messageInput.value = '';
      charCount.textContent = '0 / 200';
      submitBtn.disabled = false;
      return;
    }

    var body = new URLSearchParams({ message: text });

    fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    })
      .then(function () {
        addOptimisticMessage(text);
        messageInput.value = '';
        charCount.textContent = '0 / 200';

        // Refresh from server after short delay
        setTimeout(loadMessages, 2000);
      })
      .catch(function () {
        showError('Failed to send. Please try again.');
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  }

  function addOptimisticMessage(text) {
    var msg = { text: text, timestamp: new Date().toISOString() };
    var card = createMessageCard(msg);

    var firstChild = messagesContainer.querySelector('.wall__message');
    var emptyEl = messagesContainer.querySelector('.wall__empty');
    if (emptyEl) emptyEl.remove();

    if (firstChild) {
      messagesContainer.insertBefore(card, firstChild);
    } else {
      messagesContainer.appendChild(card);
    }
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  }

  function hideError() {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }

  // ── Init ──
  loadMessages();
})();
