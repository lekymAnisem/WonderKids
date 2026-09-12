(function () {
  'use strict';

  var score = 0;
  var round = 1;
  var currentGame = 'math';

  var scoreEl = document.getElementById('gameScore');
  var roundEl = document.getElementById('gameRound');
  var restartBtn = document.getElementById('gameRestartBtn');

  function addScore(pts) {
    score += pts;
    if (scoreEl) scoreEl.textContent = score;
    showShareScoreBtn();
  }

  function showShareScoreBtn() {
    if (score <= 0) return;
    var existing = document.getElementById('shareGameScore');
    if (existing) return;

    var gameNames = { math: 'Math Quest', memory: 'Memory Match', word: 'Word Scramble', counting: 'Counting Stars', color: 'Color Match', pattern: 'Pattern Puzzle' };
    var gameName = gameNames[currentGame] || 'Games';

    var scoreBar = document.getElementById('gameScore');
    if (!scoreBar) return;

    var container = scoreBar.closest('.flex');
    if (!container) return;

    var btn = document.createElement('button');
    btn.id = 'shareGameScore';
    btn.className = 'ml-3 px-3 py-1.5 rounded-full bg-secondary text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-sm';
    btn.innerHTML = '<span class="material-symbols-outlined text-sm">share</span> Share Score';
    btn.addEventListener('click', function() {
      window.open('/wall?share_score=' + score + '&game=' + encodeURIComponent(gameName), '_self');
    });
    container.appendChild(btn);
  }

  function setRound(r) {
    round = r;
    if (roundEl) roundEl.textContent = round;
  }

  function showFeedback(el, type, title, msg) {
    if (!el) return;
    el.classList.remove('hidden');
    if (type === 'success') {
      el.className = 'mt-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex items-center gap-3';
      el.innerHTML = '<div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shrink-0">★</div>' +
        '<div class="flex-1"><span class="font-bold text-emerald-800 text-sm block">' + title + '</span>' +
        '<span class="text-xs text-emerald-700">' + msg + '</span></div>';
    } else if (type === 'wrong') {
      el.className = 'mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center gap-3';
      el.innerHTML = '<div class="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center text-lg font-bold shrink-0">!</div>' +
        '<div class="flex-1"><span class="font-bold text-amber-900 text-sm block">' + title + '</span>' +
        '<span class="text-xs text-amber-800">' + msg + '</span></div>';
    } else {
      el.className = 'mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-300 flex items-center gap-3';
      el.innerHTML = '<div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold shrink-0">i</div>' +
        '<div class="flex-1"><span class="font-bold text-blue-800 text-sm block">' + title + '</span>' +
        '<span class="text-xs text-blue-700">' + msg + '</span></div>';
    }
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function switchGame(game) {
    currentGame = game;
    var panels = document.querySelectorAll('.game-panel');
    panels.forEach(function (p) { p.classList.add('hidden'); });
    var target = document.getElementById('game-' + game);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.game-selector-btn').forEach(function (btn) {
      btn.classList.remove('border-tertiary-container', 'bg-tertiary-fixed/20');
      btn.classList.add('border-transparent');
    });
    var activeBtn = document.querySelector('.game-selector-btn[data-game="' + game + '"]');
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent');
      activeBtn.classList.add('border-tertiary-container', 'bg-tertiary-fixed/20');
    }

    setRound(1);
    initGame(game);
  }

  document.querySelectorAll('.game-selector-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchGame(btn.getAttribute('data-game'));
    });
  });

  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      setRound(1);
      initGame(currentGame);
    });
  }

  function initGame(game) {
    switch (game) {
      case 'math': initMath(); break;
      case 'memory': initMemory(); break;
      case 'word': initWord(); break;
      case 'counting': initCounting(); break;
      case 'color': initColor(); break;
      case 'pattern': initPattern(); break;
    }
  }

  // ========== MATH QUEST ==========
  function generateMathProblem() {
    var ops = ['+', '-'];
    var op = ops[Math.floor(Math.random() * ops.length)];
    var a, b;
    if (op === '+') {
      a = Math.floor(Math.random() * 15) + 1;
      b = Math.floor(Math.random() * 15) + 1;
    } else {
      a = Math.floor(Math.random() * 15) + 3;
      b = Math.floor(Math.random() * (a - 1)) + 1;
    }
    var answer = op === '+' ? a + b : a - b;
    return { a: a, b: b, op: op, answer: answer };
  }

  function initMath() {
    var fb = document.getElementById('mathFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    var prob = generateMathProblem();
    var problemEl = document.getElementById('mathProblem');
    var visualEl = document.getElementById('mathVisual');
    var answersEl = document.getElementById('mathAnswers');
    if (!problemEl || !answersEl) return;

    problemEl.textContent = prob.a + ' ' + prob.op + ' ' + prob.b + ' = ?';
    var emoji = ['💎', '⭐', '🍎', '🌟', '🎈'][Math.floor(Math.random() * 5)];
    var visA = Array(prob.a).fill(emoji).join('');
    var visB = Array(prob.b).fill(emoji).join('');
    if (prob.a + prob.b > 20) {
      visA = prob.a + ' ' + emoji;
      visB = prob.b + ' ' + emoji;
    }
    visualEl.textContent = visA + ' ' + prob.op + ' ' + visB;

    var options = [prob.answer];
    while (options.length < 4) {
      var off = Math.floor(Math.random() * 5) + 1;
      var sign = Math.random() > 0.5 ? 1 : -1;
      var fake = prob.answer + off * sign;
      if (fake >= 0 && options.indexOf(fake) === -1) options.push(fake);
    }
    options = shuffle(options);

    answersEl.innerHTML = '';
    options.forEach(function (val) {
      var btn = document.createElement('button');
      btn.className = 'p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-secondary text-2xl font-headline-md font-bold text-on-surface active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center gap-1';
      btn.innerHTML = '<span>' + val + '</span><span class="text-[10px] font-label-sm text-on-surface-variant font-normal">answer</span>';
      btn.addEventListener('click', function () {
        if (val === prob.answer) {
          addScore(10);
          showFeedback(fb, 'success', '🌟 Correct! ' + prob.a + ' ' + prob.op + ' ' + prob.b + ' = ' + prob.answer, '+10 stars earned!');
          answersEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.style.opacity = '0.5'; });
          btn.style.opacity = '1';
          btn.classList.add('border-emerald-500', 'bg-emerald-50');
          setTimeout(function () { setRound(round + 1); initMath(); }, 1800);
        } else {
          showFeedback(fb, 'wrong', 'Not quite!', 'Try again — count carefully!');
          btn.disabled = true;
          btn.style.opacity = '0.3';
        }
      });
      answersEl.appendChild(btn);
    });
  }

  // ========== MEMORY MATCH ==========
  var memoryEmojis = ['🦊', '🐸', '🦉', '🦋', '🐬', '🐉', '🦁', '🐢', '🐙', '🦄'];

  function initMemory() {
    var grid = document.getElementById('memoryGrid');
    var movesEl = document.getElementById('memoryMoves');
    var pairsEl = document.getElementById('memoryPairs');
    var fb = document.getElementById('memoryFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    if (!grid) return;

    var chosen = shuffle(memoryEmojis).slice(0, 6);
    var cards = shuffle(chosen.concat(chosen));
    var flipped = [];
    var matched = [];
    var moves = 0;
    var lockBoard = false;

    if (movesEl) movesEl.textContent = '0';
    if (pairsEl) pairsEl.textContent = '0';

    grid.innerHTML = '';
    grid.className = 'grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto';

    cards.forEach(function (emoji, idx) {
      var card = document.createElement('button');
      card.className = 'memory-card relative w-full aspect-square rounded-xl bg-gradient-to-br from-primary-container to-secondary-container text-white text-3xl sm:text-4xl font-bold flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer';
      card.setAttribute('data-idx', idx);
      card.setAttribute('data-emoji', emoji);
      card.innerHTML = '<span class="memory-front">❓</span><span class="memory-back hidden">' + emoji + '</span>';
      card.style.minHeight = '70px';

      card.addEventListener('click', function () {
        if (lockBoard || card.classList.contains('matched') || flipped.indexOf(card) !== -1) return;
        card.querySelector('.memory-front').classList.add('hidden');
        card.querySelector('.memory-back').classList.remove('hidden');
        card.classList.add('bg-white', 'border-2', 'border-secondary');
        card.classList.remove('from-primary-container', 'to-secondary-container');
        flipped.push(card);

        if (flipped.length === 2) {
          moves++;
          if (movesEl) movesEl.textContent = moves;
          lockBoard = true;
          if (flipped[0].getAttribute('data-emoji') === flipped[1].getAttribute('data-emoji')) {
            flipped[0].classList.add('matched');
            flipped[1].classList.add('matched');
            flipped[0].classList.add('border-emerald-500', 'bg-emerald-50');
            flipped[1].classList.add('border-emerald-500', 'bg-emerald-50');
            matched.push(flipped[0].getAttribute('data-emoji'));
            if (pairsEl) pairsEl.textContent = matched.length;
            flipped = [];
            lockBoard = false;
            if (matched.length === 6) {
              var pts = Math.max(10, 60 - moves * 2);
              addScore(pts);
              showFeedback(fb, 'success', '🎉 All pairs found in ' + moves + ' moves!', '+' + pts + ' stars earned!');
            }
          } else {
            setTimeout(function () {
              flipped.forEach(function (c) {
                c.querySelector('.memory-front').classList.remove('hidden');
                c.querySelector('.memory-back').classList.add('hidden');
                c.classList.remove('bg-white', 'border-2', 'border-secondary');
                c.classList.add('from-primary-container', 'to-secondary-container');
              });
              flipped = [];
              lockBoard = false;
            }, 800);
          }
        }
      });
      grid.appendChild(card);
    });
  }

  // ========== WORD SCRAMBLE ==========
  var wordList = [
    { word: 'apple', hint: 'A red or green fruit', emoji: '🍎' },
    { word: 'happy', hint: 'Feeling joy and cheer', emoji: '😊' },
    { word: 'ocean', hint: 'Big blue water', emoji: '🌊' },
    { word: 'tiger', hint: 'Striped big cat', emoji: '🐯' },
    { word: 'house', hint: 'Where you live', emoji: '🏠' },
    { word: 'star', hint: 'Twinkles in the night sky', emoji: '⭐' },
    { word: 'fish', hint: 'Swims in water', emoji: '🐟' },
    { word: 'cake', hint: 'Sweet treat for birthdays', emoji: '🎂' },
    { word: 'tree', hint: 'Has leaves and branches', emoji: '🌳' },
    { word: 'moon', hint: 'Shines at night', emoji: '🌙' },
    { word: 'bird', hint: 'Has wings and can fly', emoji: '🐦' },
    { word: 'rain', hint: 'Falls from clouds', emoji: '🌧️' },
    { word: 'frog', hint: 'Green and hops', emoji: '🐸' },
    { word: 'book', hint: 'You read this', emoji: '📚' },
    { word: 'sun', hint: 'Bright and warm in the sky', emoji: '☀️' }
  ];
  var wordIdx = 0;

  function initWord() {
    var hintEl = document.getElementById('wordHint');
    var scrambledEl = document.getElementById('scrambledLetters');
    var answerEl = document.getElementById('wordAnswer');
    var clearBtn = document.getElementById('wordClear');
    var shuffleBtn = document.getElementById('wordShuffle');
    var fb = document.getElementById('wordFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    if (!scrambledEl || !answerEl) return;

    var entry = wordList[wordIdx % wordList.length];
    wordIdx++;
    if (hintEl) hintEl.textContent = entry.emoji + ' ' + entry.hint;

    var letters = entry.word.split('');
    var scrambled = shuffle(letters);
    while (scrambled.join('') === entry.word && letters.length > 1) {
      scrambled = shuffle(letters);
    }

    var picked = [];

    function renderScrambled() {
      scrambledEl.innerHTML = '';
      scrambled.forEach(function (ch, i) {
        var btn = document.createElement('button');
        btn.className = 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-container to-primary-fixed text-on-surface text-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all';
        btn.textContent = ch.toUpperCase();
        btn.setAttribute('data-idx', i);
        if (picked.indexOf(i) !== -1) {
          btn.style.opacity = '0.3';
          btn.disabled = true;
        }
        btn.addEventListener('click', function () {
          if (picked.indexOf(i) !== -1) return;
          picked.push(i);
          renderScrambled();
          renderAnswer();
          checkWord();
        });
        scrambledEl.appendChild(btn);
      });
    }

    function renderAnswer() {
      answerEl.innerHTML = '';
      picked.forEach(function (idx, pi) {
        var btn = document.createElement('button');
        btn.className = 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface-container-lowest border-2 border-secondary text-on-surface text-xl font-bold shadow-sm hover:bg-surface-container active:scale-95 transition-all';
        btn.textContent = scrambled[idx].toUpperCase();
        btn.addEventListener('click', function () {
          picked.splice(pi, 1);
          renderScrambled();
          renderAnswer();
        });
        answerEl.appendChild(btn);
      });
    }

    function checkWord() {
      if (picked.length !== entry.word.length) return;
      var formed = picked.map(function (i) { return scrambled[i]; }).join('');
      if (formed === entry.word) {
        addScore(15);
        showFeedback(fb, 'success', '🎉 ' + entry.emoji + ' ' + entry.word.toUpperCase() + '!', '+15 stars! Great spelling!');
        scrambledEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        setTimeout(function () { initWord(); setRound(round + 1); }, 2000);
      } else {
        showFeedback(fb, 'wrong', 'Not quite right', 'Try a different order!');
        setTimeout(function () { if (fb) fb.classList.add('hidden'); }, 1500);
      }
    }

    if (clearBtn) {
      clearBtn.onclick = function () { picked = []; renderScrambled(); renderAnswer(); if (fb) fb.classList.add('hidden'); };
    }
    if (shuffleBtn) {
      shuffleBtn.onclick = function () {
        scrambled = shuffle(letters);
        while (scrambled.join('') === entry.word && letters.length > 1) scrambled = shuffle(letters);
        picked = [];
        renderScrambled();
        renderAnswer();
        if (fb) fb.classList.add('hidden');
      };
    }

    renderScrambled();
    answerEl.innerHTML = '';
  }

  // ========== COUNTING STARS ==========
  function initCounting() {
    var objectsEl = document.getElementById('countingObjects');
    var answersEl = document.getElementById('countingAnswers');
    var fb = document.getElementById('countingFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    if (!objectsEl || !answersEl) return;

    var count = Math.floor(Math.random() * 10) + 2;
    var emojis = ['⭐', '🌟', '💎', '🍎', '🦋', '🎈', '🌸', '🍒', '🐠', '🌻'];
    var chosen = emojis[Math.floor(Math.random() * emojis.length)];

    objectsEl.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var span = document.createElement('span');
      span.className = 'text-3xl sm:text-4xl animate-bounce inline-block';
      span.style.animationDelay = (i * 0.1) + 's';
      span.textContent = chosen;
      objectsEl.appendChild(span);
    }

    var options = [count];
    while (options.length < 4) {
      var fake = Math.floor(Math.random() * 12) + 1;
      if (options.indexOf(fake) === -1 && Math.abs(fake - count) > 1) options.push(fake);
    }
    if (options.length < 4) {
      while (options.length < 4) {
        options.push(Math.floor(Math.random() * 12) + 1);
      }
    }
    options = shuffle(options);

    answersEl.innerHTML = '';
    options.forEach(function (val) {
      var btn = document.createElement('button');
      btn.className = 'p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-secondary text-2xl font-headline-md font-bold text-on-surface active:scale-95 transition-all shadow-sm';
      btn.textContent = val;
      btn.addEventListener('click', function () {
        if (val === count) {
          addScore(10);
          showFeedback(fb, 'success', '🌟 Correct! There are ' + count + ' ' + chosen, '+10 stars!');
          answersEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.style.opacity = '0.5'; });
          btn.style.opacity = '1';
          btn.classList.add('border-emerald-500', 'bg-emerald-50');
          setTimeout(function () { setRound(round + 1); initCounting(); }, 1800);
        } else {
          showFeedback(fb, 'wrong', 'Not quite!', 'Try counting again carefully!');
          btn.disabled = true;
          btn.style.opacity = '0.3';
        }
      });
      answersEl.appendChild(btn);
    });
  }

  // ========== COLOR MATCH ==========
  function initColor() {
    var grid = document.getElementById('colorGrid');
    var targetEl = document.getElementById('colorTarget');
    var foundEl = document.getElementById('colorFound');
    var totalEl = document.getElementById('colorTotal');
    var fb = document.getElementById('colorFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    if (!grid || !targetEl) return;

    var colors = [
      { name: 'Red', hex: '#ef4444' }, { name: 'Blue', hex: '#3b82f6' },
      { name: 'Green', hex: '#22c55e' }, { name: 'Yellow', hex: '#eab308' },
      { name: 'Purple', hex: '#a855f7' }, { name: 'Orange', hex: '#f97316' },
      { name: 'Pink', hex: '#ec4899' }, { name: 'Teal', hex: '#14b8a6' }
    ];
    var targetColor = colors[Math.floor(Math.random() * colors.length)];
    targetEl.style.backgroundColor = targetColor.hex;

    var totalMatch = Math.floor(Math.random() * 3) + 3;
    var tiles = [];
    for (var i = 0; i < totalMatch; i++) tiles.push(targetColor);
    var others = colors.filter(function (c) { return c.hex !== targetColor.hex; });
    others = shuffle(others);
    while (tiles.length < 12) {
      tiles.push(others[tiles.length % others.length]);
    }
    tiles = shuffle(tiles);

    if (totalEl) totalEl.textContent = totalMatch;
    if (foundEl) foundEl.textContent = '0';
    var found = 0;

    grid.innerHTML = '';
    tiles.forEach(function (color) {
      var btn = document.createElement('button');
      btn.className = 'aspect-square rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border-2 border-white/50';
      btn.style.backgroundColor = color.hex;
      btn.style.minHeight = '60px';
      btn.setAttribute('data-color', color.hex);

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        if (color.hex === targetColor.hex) {
          btn.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-400');
          btn.disabled = true;
          found++;
          if (foundEl) foundEl.textContent = found;
          if (found === totalMatch) {
            addScore(20);
            showFeedback(fb, 'success', '🎨 All ' + targetColor.name + ' tiles found!', '+20 stars!');
          }
        } else {
          btn.classList.add('border-red-400', 'ring-2', 'ring-red-300');
          setTimeout(function () { btn.classList.remove('border-red-400', 'ring-2', 'ring-red-300'); }, 500);
        }
      });
      grid.appendChild(btn);
    });
  }

  // ========== PATTERN PUZZLE ==========
  function initPattern() {
    var seqEl = document.getElementById('patternSequence');
    var answersEl = document.getElementById('patternAnswers');
    var fb = document.getElementById('patternFeedback');
    if (fb) { fb.classList.add('hidden'); fb.innerHTML = ''; }
    if (!seqEl || !answersEl) return;

    var patternTypes = [
      function () {
        var items = shuffle(['🔴', '🔵', '🟢', '🟡']);
        var a = items[0], b = items[1];
        var seq = [a, b, a, b, a, b];
        return { seq: seq, answer: a, options: shuffle([a, b, items[2], items[3]]), label: 'What comes next?' };
      },
      function () {
        var items = shuffle(['🍎', '🍊', '🍇']);
        var a = items[0], b = items[1], c = items[2];
        var seq = [a, b, c, a, b, c];
        return { seq: seq, answer: a, options: shuffle([a, b, c, items[0]]), label: 'What comes next?' };
      },
      function () {
        var a = '⭐';
        var seq = [a, a, a, a, a];
        return { seq: seq, answer: a, options: shuffle([a, '🌙', '☀️', '🌈']), label: 'What comes next?' };
      },
      function () {
        var items = shuffle(['🐸', '🦊', '🐰', '🐻']);
        var a = items[0], b = items[1], c = items[2], d = items[3];
        var seq = [a, b, c, d, a, b];
        return { seq: seq, answer: c, options: shuffle([a, b, c, d]), label: 'What comes next?' };
      },
      function () {
        var a = '🌻', b = '🌼';
        var seq = [a, a, b, a, a, b];
        return { seq: seq, answer: a, options: shuffle([a, b, '🌷', '🌹']), label: 'What comes next?' };
      },
      function () {
        var items = shuffle(['🐶', '🐱', '🐰']);
        var a = items[0], b = items[1], c = items[2];
        var seq = [a, b, b, a, b, b];
        return { seq: seq, answer: a, options: shuffle([a, b, c, '🐻']), label: 'What comes next?' };
      }
    ];

    var pat = patternTypes[Math.floor(Math.random() * patternTypes.length)]();

    seqEl.innerHTML = '';
    pat.seq.forEach(function (emoji) {
      var span = document.createElement('span');
      span.textContent = emoji;
      span.className = 'inline-block';
      seqEl.appendChild(span);
    });
    var qmark = document.createElement('span');
    qmark.textContent = '❓';
    qmark.className = 'inline-block animate-pulse';
    seqEl.appendChild(qmark);

    answersEl.innerHTML = '';
    pat.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.className = 'p-5 rounded-2xl bg-surface-container-lowest border-2 border-surface-container hover:border-secondary text-3xl font-bold active:scale-95 transition-all shadow-sm flex items-center justify-center';
      btn.textContent = opt;
      btn.addEventListener('click', function () {
        if (opt === pat.answer) {
          addScore(10);
          showFeedback(fb, 'success', '🎉 Pattern complete! ' + pat.answer, '+10 stars!');
          answersEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; b.style.opacity = '0.5'; });
          btn.style.opacity = '1';
          btn.classList.add('border-emerald-500', 'bg-emerald-50');
          setTimeout(function () { setRound(round + 1); initPattern(); }, 1800);
        } else {
          showFeedback(fb, 'wrong', 'Not that one!', 'Look at the pattern again!');
          btn.disabled = true;
          btn.style.opacity = '0.3';
        }
      });
      answersEl.appendChild(btn);
    });
  }

  // ========== INIT ==========
  switchGame('math');
})();
