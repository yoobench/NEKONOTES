(function () {
  var musicButton = document.getElementById('musicToggle');
  var musicStatus = document.getElementById('musicStatus');
  var musicTitle = document.getElementById('musicTitle');
  var volumeSlider = document.getElementById('musicVolume');


  function sendToPlayer(action, extraData) {
    var message = Object.assign({
      app: 'nekonotes',
      action: action
    }, extraData || {});

    window.parent.postMessage(message, '*');
  }

 musicButton.addEventListener('click', function () {
  sendToPlayer('music-toggle');
});

  volumeSlider.addEventListener('input', function () {
    sendToPlayer('set-volume', {
      value: volumeSlider.value
    });
  });

 document.querySelectorAll('.ambient-card').forEach(function (button) {
  button.addEventListener('click', function () {
    var sound = button.dataset.sound;

    sendToPlayer('ambient-toggle', {
      sound: sound
    });
  });
});
window.addEventListener('message', function (event) {
  if (event.source !== window.parent) return;

  var data = event.data;

  if (!data || data.app !== 'nekonotes' || data.action !== 'audio-state') return;

  musicButton.textContent = data.musicPlaying ? 'Ⅱ Pause' : '▶ Play';

  musicStatus.textContent = data.musicPlaying
    ? 'Playing peaceful tones ♡'
    : 'Music paused ♡';

  musicTitle.textContent = 'Peaceful Moments';
  volumeSlider.value = data.volume;

  document.querySelectorAll('.ambient-card').forEach(function (card) {
    card.classList.toggle('active', card.dataset.sound === data.activeAmbient);
  });
});
})();