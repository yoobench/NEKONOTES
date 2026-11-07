(function () {

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

  function updatePaws(data) {
    $('pawCount').textContent = data.paws;
  }

  function renderCollection() {

    var data = loadData();
    var grid = $('collectionGrid');

    var ownedCount = data.owned.length;
    var totalCats = STICKERS.length;
    var percentage = Math.round((ownedCount / totalCats) * 100);

    updatePaws(data);

    $('collectionCount').textContent =
      ownedCount + ' / ' + totalCats + ' Cats';

    $('collectionPercent').textContent = percentage + '%';

    $('collectionProgressFill').style.width =
      percentage + '%';

    grid.innerHTML = '';

    STICKERS.forEach(function (sticker, index) {

      var unlocked = data.owned.indexOf(index) !== -1;

      var card = document.createElement('div');
    card.className = unlocked
    ? 'collection-card ' + sticker.r.toLowerCase()
    : 'collection-card locked';

      var imageBox = document.createElement('div');
      imageBox.className = 'collection-cat-image';

      if (unlocked) {

        var img = document.createElement('img');
        img.alt = sticker.n;

        img.src = data.custom[index] ||
          'stickers/cat-' +
          String(index + 1).padStart(2, '0') + '.png';

        img.onerror = function () {
          imageBox.innerHTML = '<span>🐱</span>';
        };

        imageBox.appendChild(img);

      } else {

        var lockIcon = document.createElement('span');
        lockIcon.textContent = '🔒';

        imageBox.appendChild(lockIcon);
      }

      var name = document.createElement('h3');
      name.textContent = unlocked ? sticker.n : 'Unknown Cat';

      var rarity = document.createElement('span');
rarity.className = 'collection-rarity ' + sticker.r.toLowerCase();
rarity.textContent = sticker.r;

      card.appendChild(imageBox);
      card.appendChild(name);
      card.appendChild(rarity);

      grid.appendChild(card);

    });
  }

  renderCollection();

  window.addEventListener('storage', renderCollection);

})();