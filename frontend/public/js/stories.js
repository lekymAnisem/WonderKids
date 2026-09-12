(function () {
  'use strict';

  var storyDataEl = document.getElementById('wonder-story-data');
  var scenesEl = document.getElementById('wonder-scenes');
  if (!storyDataEl || !scenesEl) return;

  var story;
  var SCENES;
  try {
    story = JSON.parse(storyDataEl.textContent);
    SCENES = JSON.parse(scenesEl.textContent);
  } catch (err) {
    return;
  }

  var COVER = -1;
  var END = story.pages.length;

  var state = {
    index: COVER,
    playing: false
  };

  var elements = {
    stage: document.getElementById('readerStage'),
    bgGradient: document.getElementById('bgGradient'),
    watermarkEmoji: document.getElementById('watermarkEmoji'),
    decoLayer: document.getElementById('decoLayer'),
    pageIndicator: document.getElementById('pageIndicator'),
    progressBar: document.getElementById('progressBar'),
    chapterLabel: document.getElementById('chapterLabel'),
    pageEmoji: document.getElementById('pageEmoji'),
    pageHeading: document.getElementById('pageHeading'),
    pageSubtitle: document.getElementById('pageSubtitle'),
    pageText: document.getElementById('pageText'),
    pageIllustration: document.getElementById('pageIllustration'),
    pageImageContainer: document.getElementById('pageImageContainer'),
    pageImage: document.getElementById('pageImage'),
    coverMeta: document.getElementById('coverMeta'),
    beginSection: document.getElementById('beginSection'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    nextBtnLabel: document.getElementById('nextBtnLabel'),
    narrationBtn: document.getElementById('narrationBtn'),
    beginBtn: document.getElementById('beginBtn')
  };

  function sceneFor(page) {
    return SCENES[page.scene] || SCENES.forest;
  }

  var sceneEmojis = {
    forest: ['🌲', '🌳', '🦉', '🌿', '🍄', '🦊', '🦌', '🍂'],
    river: ['💧', '🐟', '🪨', '🌊', '🦆', '🪷', '🛶', '🐚'],
    cave: ['✨', '🪨', '💎', '🕯️', '🦇', '🍄', '🔮', '🦎'],
    waterfall: ['💦', '🌈', '🪷', '✨', '🦋', '🐸', '🪨', '🌸'],
    home: ['🏠', '🪟', '🥧', '☕', '🛋️', '🐱', '🕯️', '🫖'],
    meadow: ['🌼', '🐝', '🦋', '🌷', '🌻', '🐛', '☀️', '🌾'],
    night: ['🌙', '⭐', '✨', '🌠', '🦉', '🏕️', '🌌', '💫'],
    sky: ['☁️', '☀️', '🪁', '🐦', '🌤️', '🕊️', '🌈', '✈️'],
    space: ['🪐', '⭐', '🌠', '☄️', '🛸', '🌍', '💫', '🔭'],
    moon: ['🌕', '🪐', '⭐', '🚀', '👨‍🚀', '🌌', '💫', '🛸'],
    volcano: ['🌋', '🔥', '🪨', '✨', '🐉', '🦎', '💎', '🌶️'],
    cloud: ['☁️', '⛅', '🦅', '🌤️', '🌈', '💨', '🪁', '✨'],
    ocean: ['🌊', '🐬', '🐳', '🐟', '🐙', '🫧', '⚓', '🦑'],
    reef: ['🪸', '🐠', '🐡', '🐟', '🐚', '🦀', '🦈', '🫧'],
    shipwreck: ['🚢', '🐚', '🫧', '🪸', '⚓', '🗝️', '🦑', '💎'],
    deep: ['🐙', '🦑', '🫧', '✨', '🐡', '🪼', '🌊', '💎'],
    stage: ['🎵', '🎶', '🐚', '🎻', '🎤', '🎹', '🎸', '✨'],
    garden: ['🌳', '🌸', '🦋', '🌻', '🌺', '🐝', '🌷', '🍃'],
    treehouse: ['🏡', '🌿', '🗝️', '🐿️', '📚', '🪜', '🌳', '🗺️'],
    desert: ['🏜️', '🐪', '🌵', '✨', '🦂', '🌅', '🏺', '💎'],
    savanna: ['🦒', '🦁', '🌾', '🌅', '🐘', '🦓', '🌿', '☀️'],
    hills: ['⛰️', '🐺', '🌿', '⭐', '🌲', '🦌', '🍃', '🌤️'],
    island: ['🏝️', '🌴', '🐚', '🌅', '🦜', '🐠', '🥥', '⛵']
  };

  function illustrationMarkup(page) {
    if (!page || !page.scene) return '';
    var scene = sceneFor(page);
    var mainEmoji = scene.watermark || '✨';
    var extras = sceneEmojis[page.scene] || ['✨', '🌟', '💫', '⭐'];
    var topLeft = extras[0] || '✨';
    var topRight = extras[1] || '🌟';
    var midLeft = extras[2] || '💫';
    var midRight = extras[3] || '⭐';
    var botLeft = extras[4] || '🌈';
    var botRight = extras[5] || '🦋';
    return '<div class="relative h-48 sm:h-56 rounded-2xl overflow-hidden mb-5 bg-gradient-to-br ' + scene.grad + ' flex items-center justify-center shadow-inner border border-white/20">' +
      '<div class="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none">' +
        '<span class="text-[8rem] sm:text-[10rem] leading-none drop-shadow-xl">' + mainEmoji + '</span>' +
      '</div>' +
      '<div class="absolute inset-0 flex items-center justify-center">' +
        '<span class="text-7xl sm:text-8xl drop-shadow-lg animate-pulse">' + mainEmoji + '</span>' +
      '</div>' +
      '<span class="absolute top-3 left-4 text-3xl sm:text-4xl opacity-70 animate-bounce" style="animation-delay:0.1s">' + topLeft + '</span>' +
      '<span class="absolute top-4 right-5 text-3xl sm:text-4xl opacity-70 animate-bounce" style="animation-delay:0.3s">' + topRight + '</span>' +
      '<span class="absolute bottom-4 left-6 text-2xl sm:text-3xl opacity-60 animate-bounce" style="animation-delay:0.5s">' + midLeft + '</span>' +
      '<span class="absolute bottom-3 right-4 text-2xl sm:text-3xl opacity-60 animate-bounce" style="animation-delay:0.7s">' + midRight + '</span>' +
      '<span class="absolute top-1/2 left-3 text-xl sm:text-2xl opacity-50" style="transform:translateY(-50%)">' + botLeft + '</span>' +
      '<span class="absolute top-1/2 right-3 text-xl sm:text-2xl opacity-50" style="transform:translateY(-50%)">' + botRight + '</span>' +
    '</div>';
  }

  function showImage(src, alt) {
    if (!elements.pageImageContainer || !elements.pageImage) return;
    elements.pageImage.src = src;
    elements.pageImage.alt = alt || '';
    elements.pageImageContainer.style.display = '';
  }

  function hideImage() {
    if (!elements.pageImageContainer) return;
    elements.pageImageContainer.style.display = 'none';
  }

  function renderCover() {
    elements.chapterLabel.textContent = 'WonderKids Storybook';
    elements.pageEmoji.textContent = story.emoji;
    elements.pageEmoji.style.display = '';
    elements.pageHeading.textContent = story.title;
    if (elements.pageSubtitle) {
      elements.pageSubtitle.textContent = story.subtitle;
      elements.pageSubtitle.style.display = '';
    }
    elements.pageText.textContent = story.summary;
    if (elements.coverMeta) elements.coverMeta.style.display = '';
    if (elements.beginSection) elements.beginSection.style.display = '';

    if (elements.pageIllustration) {
      elements.pageIllustration.innerHTML = '';
    }

    if (story.coverImage) {
      showImage(story.coverImage, story.title + ' cover');
    } else {
      hideImage();
    }

    elements.pageIndicator.textContent = 'Cover';
    elements.pageIndicator.style.opacity = '0.75';
    elements.narrationBtn.disabled = true;
    elements.progressBar.style.width = '0%';
    elements.prevBtn.disabled = true;

    elements.nextBtn.classList.remove('bg-primary-container');
    elements.nextBtn.classList.add('bg-primary-container');
    elements.nextBtn.setAttribute('aria-disabled', 'false');
    elements.nextBtnLabel.textContent = 'Begin';

    setStage(story.cardGrad || 'from-[#181a2e] via-[#334155] to-[#818cf8]', null);
  }

  function renderPage(index) {
    if (index < 0 || index >= story.pages.length) return;
    var page = story.pages[index];
    var scene = sceneFor(page);

    elements.chapterLabel.textContent = 'Chapter ' + (index + 1) + ': ' + page.chapter;
    elements.pageEmoji.style.display = 'none';
    elements.pageHeading.textContent = page.chapter;
    if (elements.pageSubtitle) elements.pageSubtitle.style.display = 'none';
    elements.pageText.textContent = page.text;
    if (elements.coverMeta) elements.coverMeta.style.display = 'none';
    if (elements.beginSection) elements.beginSection.style.display = 'none';

    if (page.image) {
      showImage(page.image, page.chapter);
      if (elements.pageIllustration) elements.pageIllustration.innerHTML = '';
    } else {
      hideImage();
      if (elements.pageIllustration) {
        elements.pageIllustration.innerHTML = illustrationMarkup(page);
      }
    }

    elements.pageIndicator.textContent = 'Page ' + (index + 1) + ' of ' + story.pages.length;
    elements.pageIndicator.style.opacity = '1';
    elements.narrationBtn.disabled = false;
    elements.progressBar.style.width = Math.round(((index + 1) / story.pages.length) * 100) + '%';
    elements.prevBtn.disabled = index === 0;

    var isLast = index === story.pages.length - 1;
    elements.nextBtnLabel.textContent = isLast ? 'The End' : 'Next';
    if (isLast) {
      elements.nextBtn.classList.add('ring-2', 'ring-white');
    } else {
      elements.nextBtn.classList.remove('ring-2', 'ring-white');
    }

    setStage(scene.grad, page);
    setDecorations(page);
  }

  function setStage(grad, page) {
    var base = 'bg-gradient-to-b ';
    if (grad && elements.bgGradient) {
      elements.bgGradient.setAttribute('class', 'absolute inset-0 ' + base + grad + ' transition-colors duration-700');
    }
    if (elements.watermarkEmoji) {
      elements.watermarkEmoji.textContent = page ? sceneFor(page).watermark : story.emoji;
    }
  }

  function setDecorations(page) {
    if (!elements.decoLayer) return;
    var scene = sceneFor(page);
    var deco = scene.deco || [];
    var spots = [
      'top-[8%] left-[6%] text-4xl',
      'top-[18%] right-[8%] text-5xl',
      'top-[45%] left-[3%] text-3xl opacity-80',
      'top-[55%] right-[4%] text-3xl opacity-90',
      'bottom-[22%] left-[12%] text-4xl opacity-85',
      'bottom-[12%] right-[14%] text-5xl opacity-90'
    ];
    var html = deco.slice(0, spots.length).map(function (emoji, i) {
      return '<span class="absolute ' + spots[i] + ' opacity-90 animate-float" style="filter: brightness(0.35) sepia(1) hue-rotate(180deg) saturate(0.4);">' + emoji + '</span>';
    }).join('');
    elements.decoLayer.innerHTML = html;
  }

  function fadeIn() {
    var content = document.getElementById('readerCard');
    if (!content) return;
    content.classList.add('opacity-0', 'translate-y-2');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        content.classList.remove('opacity-0', 'translate-y-2');
      });
    });
  }

  function goTo(index) {
    if (index < COVER || index > END) return;
    if (index === END) {
      state.index = END;
      renderEnd();
      return;
    }
    stopNarration();
    state.index = index;
    if (index === COVER) {
      renderCover();
    } else {
      renderPage(index);
    }
    fadeIn();
    elements.stage.scrollIntoView({ block: 'start' });
  }

  function renderEnd() {
    var lastPage = story.pages[story.pages.length - 1];
    var scene = sceneFor(lastPage);

    elements.chapterLabel.textContent = 'The End';
    elements.pageEmoji.textContent = '🌟';
    elements.pageEmoji.style.display = '';
    elements.pageHeading.textContent = 'The End';
    if (elements.pageSubtitle) {
      elements.pageSubtitle.textContent = 'You finished the story!';
      elements.pageSubtitle.style.display = '';
    }
    elements.pageText.textContent = 'Thank you for reading "' + story.title + '"! Would you like to read it again, or explore more stories on Story Island?';
    if (elements.coverMeta) elements.coverMeta.style.display = 'none';
    if (elements.beginSection) elements.beginSection.style.display = 'none';

    hideImage();
    if (elements.pageIllustration) {
      elements.pageIllustration.innerHTML =
        '<div class="flex items-center justify-center gap-3 text-5xl mb-5 animate-bounce">' +
          '<span>🎉</span><span>⭐</span><span>🌟</span><span>🎊</span><span>⭐</span>' +
        '</div>';
    }

    elements.pageIndicator.textContent = 'Finished';
    elements.pageIndicator.style.opacity = '0.75';
    elements.narrationBtn.disabled = true;
    elements.prevBtn.disabled = false;
    elements.progressBar.style.width = '100%';
    elements.nextBtnLabel.textContent = 'More Stories';
    elements.nextBtn.classList.remove('ring-2', 'ring-white');

    setStage(scene.grad, lastPage);
    setDecorations(lastPage);
  }

  function startNarration() {
    if (!('speechSynthesis' in window)) return;
    if (state.index < 0 || state.index >= story.pages.length) return;
    var page = story.pages[state.index];
    var text = (page.chapter + '. ' + page.text).replace(/\s+/g, ' ').trim();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.08;
    utterance.lang = 'en-US';
    utterance.onend = function () {
      state.playing = false;
      setNarrationUi();
    };
    window.speechSynthesis.speak(utterance);
  }

  function stopNarration() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    state.playing = false;
    setNarrationUi();
  }

  function setNarrationUi() {
    if (!elements.narrationBtn) return;
    var disabled = state.index < 0 || state.index >= story.pages.length;
    elements.narrationBtn.disabled = disabled;
    elements.narrationBtn.innerHTML = state.playing
      ? '<span class="material-symbols-outlined text-2xl fill-icon" style="font-variation-settings: \'FILL\' 1;">pause</span>'
      : '<span class="material-symbols-outlined text-2xl fill-icon" style="font-variation-settings: \'FILL\' 1;">volume_up</span>';
    elements.narrationBtn.setAttribute('aria-pressed', String(state.playing));
  }

  function onClickNarration() {
    if (elements.narrationBtn.disabled) return;
    if (state.playing) {
      stopNarration();
    } else {
      state.playing = true;
      setNarrationUi();
      startNarration();
    }
  }

  function onClickNext() {
    if (state.index === END) {
      window.location.href = '/stories';
      return;
    }
    goTo(state.index + 1);
  }

  function onClickPrev() {
    if (state.index === COVER) return;
    goTo(state.index - 1);
  }

  function onClickBegin() {
    goTo(0);
  }

  if (elements.beginBtn) {
    elements.beginBtn.addEventListener('click', onClickBegin);
  }
  if (elements.nextBtn) {
    elements.nextBtn.addEventListener('click', onClickNext);
  }
  if (elements.prevBtn) {
    elements.prevBtn.addEventListener('click', onClickPrev);
  }
  if (elements.narrationBtn) {
    elements.narrationBtn.addEventListener('click', onClickNarration);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') onClickNext();
    else if (e.key === 'ArrowLeft') onClickPrev();
  });

  renderCover();
})();
