(function () {

  var COST = 30;
  var KEY = 'nekonotes.v1';

  var STICKERS = [
  { n: 'Heart Kit', r: 'Common' },
  { n: 'Hello Wave', r: 'Common' },
  { n: 'Silly Love', r: 'Uncommon' },
  { n: 'Wink Fluff', r: 'Rare' },
  { n: 'Tulip Gift', r: 'Epic' },
  { n: 'Who Me', r: 'Common' },
  { n: 'Smug Smile', r: 'Uncommon' },
  { n: 'Starry Wink', r: 'Rare' },
  { n: 'Bow Kitten', r: 'Legendary' },
  { n: 'Snoot Bows', r: 'Epic' }
];

  function $(id) {
    return document.getElementById(id);
  }

  function loadData() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));

      if (data && typeof data === 'object') {
        return Object.assign({
          paws: 0,
          owned: [],
          custom: {}
        }, data);
      }

    } catch (e) {
      console.error('Could not load saved data:', e);
    }

    return {
      paws: 0,
      owned: [],
      custom: {}
    };
  }

  var S = loadData();

  function saveData() {
    localStorage.setItem(KEY, JSON.stringify(S));
  }

  function updatePaws() {
    $('pawCount').textContent = S.paws;

    var button = $('chestOpenBtn');

    if (S.owned.length >= STICKERS.length) {
      button.disabled = true;
      button.textContent = 'Collection Complete!';
    } else if (S.paws < COST) {
      button.disabled = true;
      button.textContent = 'Need ' + (COST - S.paws) + ' more paws';
    } else {
      button.disabled = false;
      button.textContent = '🎁 Open Mystery Chest';
    }
  }

  function showReward(index) {

    var sticker = STICKERS[index];

    var modal = document.createElement('div');
    modal.className = 'modal show';

    var box = document.createElement('div');
    box.className =
  'modal-box reward-box ' + sticker.r.toLowerCase();

    var title = document.createElement('span');
    title.className = 'new';
    title.textContent = 'New Cat Unlocked!';

    // Add special effects for Legendary cats
if (sticker.r === 'Legendary') {

  var sparkles = document.createElement('div');
  sparkles.className = 'legendary-sparkles';
  sparkles.textContent = '✨ ✦ ✧ ✨ ✦';

  box.appendChild(sparkles);

  title.textContent = '👑 LEGENDARY CAT UNLOCKED!';

}

    var image = document.createElement('div');
    image.className = 'big slot';

    var img = document.createElement('img');
    img.alt = sticker.n;

    if (S.custom[index]) {
      img.src = S.custom[index];
    } else {
      img.src = 'stickers/cat-' +
        String(index + 1).padStart(2, '0') + '.png';
    }

    img.onerror = function () {
      image.textContent = '🐱';
    };

    image.appendChild(img);

    var name = document.createElement('h3');
    name.textContent = sticker.n;

    var rarity = document.createElement('p');
    rarity.className = 'rar reward-rarity ' + sticker.r.toLowerCase();
    rarity.textContent = sticker.r;

    var close = document.createElement('button');
    close.className = 'small-btn';
    close.textContent = 'Add to collection';

    close.onclick = function () {
      modal.remove();
    };

    box.appendChild(title);
    box.appendChild(image);
    box.appendChild(name);
    box.appendChild(rarity);
    box.appendChild(close);

    modal.appendChild(box);
    document.body.appendChild(modal);

    modal.onclick = function (e) {
      if (e.target === modal) {
        modal.remove();
      }
    };
  }

  function openChest() {

    S = loadData();

    if (S.paws < COST) {
      updatePaws();
      return;
    }

    var locked = [];

    STICKERS.forEach(function (_, index) {
      if (S.owned.indexOf(index) === -1) {
        locked.push(index);
      }
    });

    if (locked.length === 0) {
      updatePaws();
      return;
    }

    var rarityChances = {
  Common: 40,
  Uncommon: 25,
  Rare: 18,
  Epic: 12,
  Legendary: 5
};

// Get rarity levels that still have locked cats
var availableRarities = Object.keys(rarityChances).filter(function (rarity) {
  return locked.some(function (index) {
    return STICKERS[index].r === rarity;
  });
});

// Calculate the total available chance
var totalWeight = availableRarities.reduce(function (total, rarity) {
  return total + rarityChances[rarity];
}, 0);

// Randomly select a rarity
var roll = Math.random() * totalWeight;
var selectedRarity = availableRarities[0];

for (var i = 0; i < availableRarities.length; i++) {
  var rarity = availableRarities[i];

  roll -= rarityChances[rarity];

  if (roll < 0) {
    selectedRarity = rarity;
    break;
  }
}

// Select a random locked cat from that rarity
var rarityCats = locked.filter(function (index) {
  return STICKERS[index].r === selectedRarity;
});

var randomIndex = Math.floor(Math.random() * rarityCats.length);
var pick = rarityCats[randomIndex];

    S.paws -= COST;
    S.owned.push(pick);

    saveData();

    updatePaws();
    showReward(pick);
  }

  $('chestOpenBtn').addEventListener('click', openChest);

  updatePaws();

})();