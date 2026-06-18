import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(container) {
  const video = container.querySelector('video[data-src]');
  const startButton = container.querySelector('[data-player-start]');
  const status = container.querySelector('[data-player-status]');

  if (!video || !startButton) {
    return;
  }

  const source = video.getAttribute('data-src');
  let initialized = false;
  let hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initialize() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;
    setStatus('正在初始化播放源…');

    if (!source) {
      setStatus('当前影片没有可用播放源。');
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('已使用浏览器原生 HLS 播放。');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成。');
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络加载异常，正在重试…');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在恢复…');
          hls.recoverMediaError();
        } else {
          setStatus('播放源加载失败，请稍后再试。');
          hls.destroy();
        }
      });
      return Promise.resolve();
    }

    setStatus('当前浏览器不支持 HLS 播放。');
    return Promise.resolve();
  }

  startButton.addEventListener('click', function () {
    initialize().then(function () {
      const playPromise = video.play();
      startButton.classList.add('is-hidden');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          startButton.classList.remove('is-hidden');
          setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
        });
      }
    });
  });

  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      startButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
