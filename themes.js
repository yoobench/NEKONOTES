(function () {
  var STORAGE_KEY = 'nekonotes.v1';

  var THEMES = [
    {
      id: 'pink',
      name: 'Cotton Candy',
      description: 'The original soft and sweet pink look.',
      price: 0,
      colors: ['#fff3f8', '#ffb5d2', '#ff8fb7', '#e0457f']
    },
    {
      id: 'lavender',
      name: 'Dreamy Lavender',
      description: 'A peaceful mix of soft purple shades.',
      price: 50,
      colors: ['#f5f0ff', '#d9c5ff', '#b99bea', '#8060b5']
    },
    {
      id: 'mint',
      name: 'Minty Garden',
      description: 'Fresh green colors for a relaxing diary.',
      price: 75,
      colors: ['#effff5', '#b9efce', '#78dba0', '#378c60']
    },
    {
      id: 'peach',
      name: 'Peach Paradise',
      description: 'Warm peach colors with a cozy feeling.',
      price: 100,
      colors: ['#fff5ed', '#ffd0b5', '#ffa77f', '#d8754d']
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      description: 'Cool blue shades inspired by the sea.',
      price: 125,
      colors: ['#eff9ff', '#b9e3ff', '#7fc5f0', '#397eaf']
    },
    {
      id: 'night',
      name: 'Midnight Dream',
      description: 'A calm and dreamy dark purple palette.',
      price: 150,
      colors: ['#29243d', '#514568', '#8874ad', '#e2d5ff']
    }
  ];

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function renderThemes() {
    var data = getData();

    if (!Array.isArray(data.unlockedThemes)) {
      data.unlockedThemes = ['pink'];
    }

    if (!data.activeTheme) {
      data.activeTheme = 'pink';
    }

    saveData(data);

    var grid = document.getElementById('themeGrid');
    var pawCount = document.getElementById('pawCount');

    if (!grid) return;

    pawCount.textContent = data.paws || 0;
    grid.innerHTML = '';

    THEMES.forEach(function (theme) {
      var unlocked = data.unlockedThemes.includes(theme.id);
      var active = data.activeTheme === theme.id;

      var card = document.createElement('div');
      card.className = 'theme-card' + (active ? ' active-theme' : '');

      var preview = document.createElement('div');
      preview.className = 'theme-preview';
      preview.style.background = theme.colors[0];

      var top = document.createElement('div');
      top.className = 'theme-preview-top';

      var dots = document.createElement('div');
      dots.className = 'theme-preview-dots';

      theme.colors.slice(1).forEach(function (color) {
        var dot = document.createElement('span');
        dot.style.background = color;
        dots.appendChild(dot);
      });

      var icon = document.createElement('span');
      icon.textContent = '🐱';

      top.appendChild(dots);
      top.appendChild(icon);

      var note = document.createElement('div');
      note.className = 'theme-preview-note';
      note.textContent = 'Today is a lovely day to write something special.';

      preview.appendChild(top);
      preview.appendChild(note);

      var info = document.createElement('div');
      info.className = 'theme-card-info';

      var title = document.createElement('h3');
      title.textContent = theme.name;

      var description = document.createElement('p');
      description.textContent = theme.description;

      var bottom = document.createElement('div');
      bottom.className = 'theme-card-bottom';

      var price = document.createElement('span');
      price.className = 'theme-price';
      price.textContent = theme.price === 0
        ? 'FREE'
        : '🐾 ' + theme.price;

      var button = document.createElement('button');
      button.className = 'theme-button';

      if (active) {
        button.textContent = 'Currently Using';
        button.disabled = true;
      } else if (unlocked) {
        button.textContent = 'Use Theme';
      } else {
        button.textContent = 'Unlock Theme';
        button.disabled = (data.paws || 0) < theme.price;
      }

      button.addEventListener('click', function () {
        var latestData = getData();

        if (!Array.isArray(latestData.unlockedThemes)) {
          latestData.unlockedThemes = ['pink'];
        }

        if (latestData.unlockedThemes.includes(theme.id)) {
          latestData.activeTheme = theme.id;
        } else {
          if ((latestData.paws || 0) < theme.price) {
            return;
          }

          latestData.paws -= theme.price;
          latestData.unlockedThemes.push(theme.id);
          latestData.activeTheme = theme.id;
        }

        saveData(latestData);
        renderThemes();
      });

      bottom.appendChild(price);
      bottom.appendChild(button);

      info.appendChild(title);
      info.appendChild(description);
      info.appendChild(bottom);

      card.appendChild(preview);
      card.appendChild(info);

      grid.appendChild(card);
    });
  }

  renderThemes();

  window.addEventListener('storage', renderThemes);
})();