(function () {
  'use strict';

  function initSoundToggles() {
    const soundBtn = document.getElementById('soundBtn');
    const soundIcon = document.getElementById('soundIcon');
    let soundActive = true;

    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', function () {
        soundActive = !soundActive;
        soundIcon.innerText = soundActive ? 'volume_up' : 'volume_off';
        soundBtn.classList.toggle('bg-primary-container', !soundActive);
        soundBtn.setAttribute('aria-pressed', String(!soundActive));
      });
    }

    const narrationBtn = document.getElementById('narrationBtn');
    const passage = document.getElementById('storyPassage');
    let isPlaying = false;

    function stopNarration() {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    function startNarration() {
      if (!('speechSynthesis' in window) || !passage) return;
      const text = passage.innerText.replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.08;
      utterance.lang = 'en-US';
      utterance.onend = function () {
        isPlaying = false;
        narrationBtn.innerHTML = '<span class="material-symbols-outlined text-2xl fill-icon" style="font-variation-settings: \'FILL\' 1;">play_arrow</span>';
        narrationBtn.setAttribute('aria-pressed', 'false');
      };
      window.speechSynthesis.speak(utterance);
    }

    if (narrationBtn) {
      narrationBtn.addEventListener('click', function () {
        isPlaying = !isPlaying;
        narrationBtn.innerHTML = isPlaying
          ? '<span class="material-symbols-outlined text-2xl fill-icon" style="font-variation-settings: \'FILL\' 1;">pause</span>'
          : '<span class="material-symbols-outlined text-2xl fill-icon" style="font-variation-settings: \'FILL\' 1;">play_arrow</span>';
        narrationBtn.setAttribute('aria-pressed', String(isPlaying));

        if (isPlaying) {
          startNarration();
        } else {
          stopNarration();
        }
      });
    }

    document.querySelectorAll('.vocab-sparkle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const wordEl = btn.querySelector('span');
        const word = wordEl ? wordEl.textContent.trim() : btn.textContent.trim();
        if (!('speechSynthesis' in window)) return;
        stopNarration();
        const utterance = new SpeechSynthesisUtterance(word + '. To speak softly in a whisper.');
        utterance.rate = 0.9;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSoundToggles);
  } else {
    initSoundToggles();
  }
})();
