(function () {
  var KEY = 'nekonotes.v1';
  var DIARY_REWARD = 15;
  var editingId = null;

  var titleInput = document.getElementById('diaryTitle');
  var contentInput = document.getElementById('diaryContent');
  var saveButton = document.getElementById('saveDiaryBtn');
  var entriesContainer = document.getElementById('diaryEntries');
  var message = document.getElementById('diaryMessage');

  function getData() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY)) || {};

      data.entries = Array.isArray(data.entries) ? data.entries : [];
      data.rewardDays = Array.isArray(data.rewardDays) ? data.rewardDays : [];
      data.paws = Number(data.paws) || 0;

      return data;
    } catch (error) {
      return {
        entries: [],
        rewardDays: [],
        paws: 0
      };
    }
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getToday() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
  }

  function showMessage(text) {
    message.textContent = text;
  }

 function updatePaws() {
  var data = getData();

  console.log('Diary page paw data:', data.paws);

  document.getElementById('pawCount').textContent = data.paws;
}

  function resetEditor() {
    editingId = null;
    titleInput.value = '';
    contentInput.value = '';
    saveButton.textContent = 'Save Entry ♡';
  }

  function formatDate(time) {
    if (!time) return 'Date unavailable';

    var date = new Date(time);

    if (isNaN(date.getTime())) return 'Date unavailable';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' · ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function renderEntries() {
    var data = getData();

    entriesContainer.innerHTML = '';

    document.getElementById('diaryEntryCount').textContent =
      data.entries.length + (data.entries.length === 1 ? ' entry' : ' entries');

    if (data.entries.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'diary-empty';
      empty.textContent = 'No memories yet. Your first diary entry is waiting! ♡';
      entriesContainer.appendChild(empty);
      return;
    }

    data.entries.forEach(function (entry) {
      var card = document.createElement('article');
      card.className = 'diary-entry-card';

      var heading = document.createElement('div');
      heading.className = 'diary-entry-card-heading';

      var title = document.createElement('h3');
      title.textContent = entry.title || 'Untitled Memory';

      var date = document.createElement('span');
      date.textContent = formatDate(entry.time);

      heading.appendChild(title);
      heading.appendChild(date);

      var content = document.createElement('p');
      content.className = 'diary-entry-text';
      content.textContent = entry.text || '';

      var actions = document.createElement('div');
      actions.className = 'diary-entry-actions';

      var editButton = document.createElement('button');
      editButton.textContent = 'Edit';
      editButton.className = 'diary-edit-btn';

      var deleteButton = document.createElement('button');
deleteButton.textContent = 'Delete';
deleteButton.className = 'diary-delete-btn';

      editButton.addEventListener('click', function () {
        titleInput.value = entry.title || '';
        contentInput.value = entry.text || '';
        editingId = entry.id;

        saveButton.textContent = 'Update Entry ♡';
showMessage("You're editing an existing memory.");
window.scrollTo({ top: 0, behavior: 'smooth' });
});

      deleteButton.addEventListener('click', function () {
        if (!confirm('Are you sure you want to delete this memory?')) {
          return;
        }

        var latestData = getData();

        latestData.entries = latestData.entries.filter(function (item) {
          return item.id !== entry.id;
        });

        saveData(latestData);
        renderEntries();
        updatePaws();
        showMessage('Your memory has been deleted.');
      });

      actions.appendChild(editButton);
      actions.appendChild(deleteButton);

      card.appendChild(heading);
      card.appendChild(content);
      card.appendChild(actions);

      entriesContainer.appendChild(card);
    });
  }

  function saveEntry() {
    var title = titleInput.value.trim();
    var content = contentInput.value.trim();

    if (!content) {
      showMessage('Please write something before saving. ♡');
      contentInput.focus();
      return;
    }

    var data = getData();

    if (editingId !== null) {
      var existingEntry = data.entries.find(function (entry) {
        return entry.id === editingId;
      });

      if (!existingEntry) {
        editingId = null;
        showMessage('This entry could not be found. Please try again.');
        return;
      }

      existingEntry.title = title;
      existingEntry.text = content;

      saveData(data);
      resetEditor();
      renderEntries();
      updatePaws();
      showMessage('Your memory has been updated! ♡');

      return;
    }

    var now = new Date();
    var today = getToday();

    var newEntry = {
      id: Date.now(),
      title: title,
      text: content,
      mood: '',
      day: today,
      time: now.toISOString()
    };

    data.entries.unshift(newEntry);

    if (data.rewardDays.indexOf(today) === -1) {
      data.paws += DIARY_REWARD;
      data.rewardDays.push(today);

      showMessage('Entry saved! You earned 15 paws! 🐾');
    } else {
      showMessage('Entry saved! Keep writing your memories. ♡');
    }

    saveData(data);
    resetEditor();
    renderEntries();
    updatePaws();
  }

  document.getElementById('diaryDate').textContent =
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

  saveButton.addEventListener('click', saveEntry);

  renderEntries();
  updatePaws();

  window.addEventListener('storage', function () {
    renderEntries();
    updatePaws();
  });
})();