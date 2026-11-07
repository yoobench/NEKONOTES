(function () {
  var audioContext = null;
  var masterVolume = null;
  var musicGain = null;
  var ambientGain = null;

  var musicNodes = [];
  var ambientNodes = [];
  var ambientTimers = [];

  var musicPlaying = false;
  var activeAmbient = null;
  var currentVolume = 50;

  var playButton = document.getElementById('persistentPlay');
  var appFrame = document.getElementById('appFrame');

  function setupAudio() {
    if (audioContext) return;

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    masterVolume = audioContext.createGain();
    musicGain = audioContext.createGain();
    ambientGain = audioContext.createGain();

    masterVolume.gain.value = 0.5;
    musicGain.gain.value = 0.15;
    ambientGain.gain.value = 0.35;

    musicGain.connect(masterVolume);
    ambientGain.connect(masterVolume);
    masterVolume.connect(audioContext.destination);
  }

  function stopMusic() {
    musicNodes.forEach(function (node) {
      if (node.stop) {
        try { node.stop(); } catch (error) {}
      }
      if (node.disconnect) node.disconnect();
    });

    musicNodes = [];
    musicPlaying = false;

    playButton.textContent = '▶ Play';
    updateFrameUI();
  }

  function createTone(frequency, volume) {
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(musicGain);

    oscillator.start();

    musicNodes.push(oscillator, gain);
  }

  function playMusic() {
    setupAudio();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    stopMusic();

    createTone(261.63, 0.25);
    createTone(329.63, 0.18);
    createTone(392.00, 0.15);

    musicPlaying = true;
    playButton.textContent = 'Ⅱ Pause';
    updateFrameUI();
  }

  function createNoiseLayer(type, frequency, volume) {
    var bufferSize = audioContext.sampleRate * 8;
    var buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );

    var output = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    var filter = audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;

    var gain = audioContext.createGain();
    gain.gain.value = volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ambientGain);

    source.start();

    ambientNodes.push(source, filter, gain);
  }

  function createRain() {
    createNoiseLayer('lowpass', 900, 0.10);
    createNoiseLayer('highpass', 1800, 0.025);
  }

  function createCafe() {
    createNoiseLayer('lowpass', 450, 0.12);
    createNoiseLayer('bandpass', 1000, 0.035);
  }

  function createNight() {
    createNoiseLayer('lowpass', 350, 0.045);

    var timer = setInterval(function () {
      if (audioContext.state !== 'running') return;

      var oscillator = audioContext.createOscillator();
      var gain = audioContext.createGain();
      var now = audioContext.currentTime;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(2600, now);
      oscillator.frequency.exponentialRampToValueAtTime(1900, now + 0.12);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.012, now + 0.025);
      gain.gain.linearRampToValueAtTime(0, now + 0.14);

      oscillator.connect(gain);
      gain.connect(ambientGain);

      oscillator.onended = function () {
        oscillator.disconnect();
        gain.disconnect();
      };

      oscillator.start(now);
      oscillator.stop(now + 0.15);

    }, 900);

    ambientTimers.push(timer);
  }

  function stopAmbient() {
    ambientTimers.forEach(function (timer) {
      clearInterval(timer);
    });

    ambientTimers = [];

    ambientNodes.forEach(function (node) {
      if (node.stop) {
        try { node.stop(); } catch (error) {}
      }

      if (node.disconnect) node.disconnect();
    });

    ambientNodes = [];
    activeAmbient = null;
    updateFrameUI();
  }

  function playAmbient(type) {
    setupAudio();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (activeAmbient === type) {
      stopAmbient();
      return;
    }

    stopAmbient();
    activeAmbient = type;

    if (type === 'rain') createRain();
    if (type === 'cafe') createCafe();
    if (type === 'night') createNight();

    updateFrameUI();
  }

 function setVolume(value) {
  setupAudio();

  currentVolume = Number(value);
  masterVolume.gain.value = currentVolume / 100;

  updateFrameUI();
}
  function updateFrameUI() {
  if (!appFrame.contentWindow) return;

  appFrame.contentWindow.postMessage({
    app: 'nekonotes',
    action: 'audio-state',
    musicPlaying: musicPlaying,
    activeAmbient: activeAmbient,
    volume: currentVolume
  }, '*');
}
appFrame.addEventListener('load', function () {
  updateFrameUI();
});

  playButton.addEventListener('click', function () {
    if (musicPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  });

  window.addEventListener('message', function (event) {
    if (event.source !== appFrame.contentWindow) return;

    var data = event.data;

    if (!data || data.app !== 'nekonotes') return;

    if (data.action === 'music-toggle') {
      if (musicPlaying) stopMusic();
      else playMusic();
    }

    if (data.action === 'ambient-toggle') {
      playAmbient(data.sound);
    }

    if (data.action === 'set-volume') {
      setVolume(data.value);
    }
  });

})();