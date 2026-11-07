(function () {

  var STORAGE_KEY = 'nekonotes.v1';
  var ACHIEVEMENT_HISTORY_KEY = 'nekonotes.achievementHistory';

  var achievements = [
    {
  name: 'First Memory',
  description: 'Write your very first diary entry.',
  icon: '📖',
  reward: 50,
  unlocked: function (data) {
    return data.entries.length >= 1;
  }
},
    {
      name: 'Task Beginner',
      description: 'Complete 10 tasks.',
      icon: '✅',
      reward: 50,
      unlocked: function (data) {
        return data.doneTotal >= 10;
      }
    },
    {
      name: 'Cat Collector',
      description: 'Unlock your very first cat.',
      icon: '🐱',
      reward: 50,
      unlocked: function (data) {
        return data.owned.length >= 1;
      }
    },
    {
      name: 'Little Writer',
      description: 'Earn diary rewards on 7 different days.',
      icon: '✍️',
      reward: 100,
      unlocked: function (data) {
        return data.rewardDays.length >= 7;
      }
    },
    {
      name: 'Purrfect Collection',
      description: 'Collect all 10 cats.',
      icon: '🐈',
      reward: 150,
      unlocked: function (data) {
        return data.owned.length >= 10;
      }
    },
    {
      name: 'Task Champion',
      description: 'Complete 30 tasks.',
      icon: '🏆',
      reward: 100,
      unlocked: function (data) {
        return data.doneTotal >= 30;
      }
    }
  ];
  function getSavedData() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      return {
        entries: Array.isArray(saved.entries) ? saved.entries : [],
        owned: Array.isArray(saved.owned) ? saved.owned : [],
        rewardDays: Array.isArray(saved.rewardDays) ? saved.rewardDays : [],
        doneTotal: Number(saved.doneTotal) || 0
      };

    } catch (error) {
      return {
        entries: [],
        owned: [],
        rewardDays: [],
        doneTotal: 0
      };
    }
  }  function getAchievementHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(ACHIEVEMENT_HISTORY_KEY)
      ) || [];
    } catch (error) {
      return [];
    }
  }  function checkNewAchievements(data) {
    var history = getAchievementHistory();

    var unlockedNow = achievements
      .filter(function (achievement) {
        return achievement.unlocked(data);
      })
      .map(function (achievement) {
        return achievement.name;
      });

    if (localStorage.getItem(ACHIEVEMENT_HISTORY_KEY) === null) {
      localStorage.setItem(
        ACHIEVEMENT_HISTORY_KEY,
        JSON.stringify(unlockedNow)
      );

      return [];
    }

    var newlyUnlocked = unlockedNow.filter(function (name) {
      return !history.includes(name);
    });

    if (newlyUnlocked.length > 0) {
      localStorage.setItem(
        ACHIEVEMENT_HISTORY_KEY,
        JSON.stringify(history.concat(newlyUnlocked))
      );
    }

    return newlyUnlocked;
  }   function awardAchievementRewards(names) {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    var totalReward = 0;

    names.forEach(function (name) {
      var achievement = achievements.find(function (item) {
        return item.name === name;
      });

      if (achievement) {
        totalReward += achievement.reward;
      }
    });

    saved.paws = (Number(saved.paws) || 0) + totalReward;
        if (names.length > 0) {
      localStorage.setItem('nekonotes.achievementUnread', 'true');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    return totalReward;
  } function showAchievementNotification(name) {
    var notification = document.createElement('div');

    notification.className = 'achievement-notification';

        var achievement = achievements.find(function (item) {
      return item.name === name;
    });

    var reward = achievement ? achievement.reward : 0;

    notification.innerHTML = `
      <span class="notification-icon">🏆</span>
      <div>
        <strong>Achievement Unlocked!</strong>
        <p>${name}</p>
        <p>+${reward} 🐾 paws earned!</p>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(function () {
      notification.classList.add('show');
    }, 100);

    setTimeout(function () {
      notification.classList.remove('show');

      setTimeout(function () {
        notification.remove();
      }, 400);

    }, 4000);
  }

    function displayAchievements() {
    var data = getSavedData();
    var grid = document.getElementById('achievementGrid');
    var newlyUnlocked = checkNewAchievements(data);
    var totalReward = awardAchievementRewards(newlyUnlocked);

    newlyUnlocked.forEach(function (name, index) {
      setTimeout(function () {
        showAchievementNotification(name);
      }, index * 1000);
    });
    var unlockedCount = 0;

    grid.innerHTML = '';

    achievements.forEach(function (achievement) {
      var isUnlocked = achievement.unlocked(data);

      if (isUnlocked) {
        unlockedCount++;
      }

      var card = document.createElement('div');

      card.className = isUnlocked
        ? 'achievement-card unlocked'
        : 'achievement-card locked';

      card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <h3>${achievement.name}</h3>
        <p>${achievement.description}</p>
        <span class="achievement-status">
          ${isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
        </span>
      `;

      grid.appendChild(card);
    });

    var percentage = Math.round(
      (unlockedCount / achievements.length) * 100
    );

    document.getElementById('achievementCount').textContent =
      unlockedCount + ' / ' + achievements.length;

    document.getElementById('achievementProgress').style.width =
      percentage + '%';

    document.getElementById('achievementPercent').textContent =
      percentage + '% completed';
  }

  displayAchievements();
  var pawCount = document.getElementById('pawCount');

if (pawCount) {
  var saved = JSON.parse(localStorage.getItem('nekonotes.v1')) || {};
  pawCount.textContent = Number(saved.paws) || 0;
}
    localStorage.removeItem('nekonotes.achievementUnread');

  var achievementLink = document.querySelector('a[href="achievements.html"]');

  if (achievementLink) {
    var dot = achievementLink.querySelector('.achievement-nav-dot');

    if (dot) dot.remove();
  }
})();