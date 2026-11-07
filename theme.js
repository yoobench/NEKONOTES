(function () {
  var STORAGE_KEY = 'nekonotes.v1';

  var THEME_COLORS = {
    pink: {
      bg: '#fff3f8',
      pink: '#ff8fb7',
      deep: '#e0457f'
    },
    lavender: {
      bg: '#f5f0ff',
      pink: '#b99bea',
      deep: '#8060b5'
    },
    mint: {
      bg: '#effff5',
      pink: '#78dba0',
      deep: '#378c60'
    },
    peach: {
      bg: '#fff5ed',
      pink: '#ffa77f',
      deep: '#d8754d'
    },
    ocean: {
      bg: '#eff9ff',
      pink: '#7fc5f0',
      deep: '#397eaf'
    },
    night: {
      bg: '#29243d',
      pink: '#8874ad',
      deep: '#e2d5ff'
    }
  };

  function applyTheme() {
    var data;

    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      data = {};
    }

    var themeId = data.activeTheme || 'pink';
    var colors = THEME_COLORS[themeId] || THEME_COLORS.pink;

    var root = document.documentElement;

    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--pink', colors.pink);
    root.style.setProperty('--pink-deep', colors.deep);
  }

  function updatePawCount() {
  var saved;

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    saved = {};
  }

  var pawCount = document.getElementById('pawCount');

  if (pawCount) {
    pawCount.textContent = Number(saved.paws) || 0;
  }
}

applyTheme();
updatePawCount();

window.addEventListener('storage', function () {
  applyTheme();
  updatePawCount();
});
})();

(function () {
  if (window.location.pathname.endsWith('achievements.html')) return;

  var STORAGE_KEY = 'nekonotes.v1';
  var HISTORY_KEY = 'nekonotes.achievementHistory';

  var saved;

  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return;
  }

  var achievements = [
    { name: 'First Memory', reward: 50, unlocked: function (d) { return d.entries.length >= 1; } },
    { name: 'Task Beginner', reward: 50, unlocked: function (d) { return d.doneTotal >= 10; } },
    { name: 'Cat Collector', reward: 50, unlocked: function (d) { return d.owned.length >= 1; } },
    { name: 'Little Writer', reward: 100, unlocked: function (d) { return d.rewardDays.length >= 7; } },
    { name: 'Purrfect Collection', reward: 150, unlocked: function (d) { return d.owned.length >= 10; } },
    { name: 'Task Champion', reward: 100, unlocked: function (d) { return d.doneTotal >= 30; } }
  ];

  var data = {
    entries: Array.isArray(saved.entries) ? saved.entries : [],
    owned: Array.isArray(saved.owned) ? saved.owned : [],
    rewardDays: Array.isArray(saved.rewardDays) ? saved.rewardDays : [],
    doneTotal: Number(saved.doneTotal) || 0
  };

  var unlocked = achievements
    .filter(function (item) {
      return item.unlocked(data);
    })
    .map(function (item) {
      return item.name;
    });

  var history = localStorage.getItem(HISTORY_KEY);

  if (history === null) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(unlocked));
    return;
  }

  history = JSON.parse(history);

  var newlyUnlocked = achievements.filter(function (item) {
    return unlocked.includes(item.name) && !history.includes(item.name);
  });

  if (newlyUnlocked.length === 0) return;

  var reward = newlyUnlocked.reduce(function (total, item) {
    return total + item.reward;
  }, 0);

  saved.paws = (Number(saved.paws) || 0) + reward;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.concat(
      newlyUnlocked.map(function (item) {
        return item.name;
      })
    ))
  );

  localStorage.setItem('nekonotes.achievementUnread', 'true');
})();
   (function () {
  var hasUnreadAchievement =
    localStorage.getItem('nekonotes.achievementUnread') === 'true';

  if (!hasUnreadAchievement) return;

  var achievementLink = document.querySelector(
    'a[href="achievements.html"]'
  );

  if (!achievementLink) return;

  if (achievementLink.querySelector('.achievement-nav-dot')) return;

  var dot = document.createElement('span');

  dot.className = 'achievement-nav-dot';

  achievementLink.appendChild(dot);
})();