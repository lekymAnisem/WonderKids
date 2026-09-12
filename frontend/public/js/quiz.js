(function () {
  'use strict';

  function initMathQuiz() {
    const mathBtns = document.querySelectorAll('.math-btn');
    const feedback = document.getElementById('mathFeedback');
    if (!mathBtns.length || !feedback) return;

    let solved = false;

    async function submitAnswer(answer) {
      try {
        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer })
        });
        return await response.json();
      } catch (err) {
        return {
          success: true,
          correct: answer === 8,
          reward: answer === 8 ? 25 : 0,
          stars: null
        };
      }
    }

    function renderCorrect(result) {
      const reward = typeof result.reward === 'number' ? result.reward : 25;
      const starNote = result.alreadySolved || reward === 0
        ? 'Already solved \u2014 great memory, explorer!'
        : (result.stars != null
          ? reward + ' Stars added! Backpack now holds ' + result.stars + ' \u2b50'
          : reward + ' Stars added to Leo\u2019s backpack!');
      feedback.className = 'p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between animate-bounce';
      feedback.style.animationIterationCount = '2';
      feedback.innerHTML =
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg font-bold">\u2605</div>' +
          '<div>' +
            '<span class="font-bold text-emerald-800 text-sm block">\ud83c\udf1f Awesome job! 5 + 3 = 8!</span>' +
            '<span class="text-xs text-emerald-700">' + starNote + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold shadow">Next Quest \u2192</button>';
    }

    function renderWrong() {
      feedback.className = 'p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between';
      feedback.innerHTML =
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center text-lg font-bold">\ud83e\udd14</div>' +
          '<div>' +
            '<span class="font-bold text-amber-900 text-sm block">Almost there, explorer! Try counting again:</span>' +
            '<span class="text-xs text-amber-800">5 star crystals in hand plus 3 found in cave...</span>' +
          '</div>' +
        '</div>' +
        '<button class="px-3 py-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold" id="hintBtn">Hint \ud83d\udca1</button>';
      const hintBtn = document.getElementById('hintBtn');
      if (hintBtn) {
        hintBtn.addEventListener('click', function () {
          hintBtn.textContent = 'Try again!';
        });
      }
    }

    mathBtns.forEach(function (btn) {
      btn.addEventListener('click', async function () {
        if (solved) return;
        const answer = Number(btn.getAttribute('data-val'));
        const result = await submitAnswer(answer);
        if (result.correct) {
          solved = true;
          mathBtns.forEach(function (b) { b.disabled = true; });
          renderCorrect(result);
        } else {
          renderWrong();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMathQuiz);
  } else {
    initMathQuiz();
  }
})();
