(function () {
  'use strict';

  const state = {
    currentStep: 1,
    selectedAmount: null,
    isAnimating: false
  };

  const steps = document.querySelectorAll('.step');
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customAmountWrap = document.getElementById('customAmountWrap');
  const customAmountInput = document.getElementById('customAmount');
  const amountContinue = document.getElementById('amountContinue');
  const selectedAmountDisplay = document.getElementById('selectedAmountDisplay');
  const cardPayment = document.getElementById('cardPayment');
  const copyToast = document.getElementById('copyToast');

  function getStep(stepNum) {
    return document.querySelector(`.step[data-step="${stepNum}"]`);
  }

  function goToStep(nextStep) {
    if (state.isAnimating || nextStep === state.currentStep) return;

    const current = getStep(state.currentStep);
    const next = getStep(nextStep);
    if (!current || !next) return;

    const isBack = nextStep < state.currentStep;
    state.isAnimating = true;

    current.classList.remove('step-active');
    current.classList.add(isBack ? 'step-exit-down' : 'step-exit-up');

    // Gelen adımı, geçişi geçici kapatarak başlangıç konumuna yerleştir.
    // İleri: aşağıdan (100%) gelir, Geri: yukarıdan (-100%) gelir.
    next.style.transition = 'none';
    next.style.transform = isBack ? 'translateY(-100%)' : 'translateY(100%)';
    next.style.opacity = '0';

    // Reflow ile başlangıç konumunu uygula, sonra geçişi tekrar aç.
    void next.offsetHeight;

    requestAnimationFrame(() => {
      next.style.transition = '';
      next.style.transform = '';
      next.style.opacity = '';
      next.classList.add('step-active');
    });

    setTimeout(() => {
      current.classList.remove('step-exit-up', 'step-exit-down');
      current.style.transform = '';
      current.style.opacity = '';
      state.currentStep = nextStep;
      state.isAnimating = false;

      if (nextStep === 4) {
        updateAmountDisplay();
      }
    }, 650);
  }

  function updateAmountDisplay() {
    if (!state.selectedAmount) return;
    const formatted = new Intl.NumberFormat('tr-TR').format(state.selectedAmount);
    selectedAmountDisplay.textContent = `Seçilen tutar: ${formatted} TL`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('tr-TR').format(value);
  }

  function enableContinue() {
    amountContinue.disabled = false;
  }

  function disableContinue() {
    amountContinue.disabled = true;
  }

  const appealImage = document.getElementById('appealImage');
  const appealStatement = document.getElementById('appealStatement');
  const appealCta = document.getElementById('appealCta');

  function fillAppeal(btn) {
    if (!btn.dataset.image) return;
    appealImage.src = btn.dataset.image;
    appealImage.alt = btn.textContent.trim();
    appealStatement.textContent = btn.dataset.statement || '';
    appealCta.textContent = btn.dataset.cta || 'Devam';
  }

  document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next, 10);
      if (btn.dataset.image) {
        fillAppeal(btn);
      }
      if (btn.id === 'amountContinue') {
        const isOther = customAmountWrap && !customAmountWrap.classList.contains('hidden');
        if (isOther) {
          const val = parseInt(customAmountInput.value, 10);
          if (!val || val < 1) {
            customAmountInput.focus();
            customAmountInput.style.borderColor = '#e85d5d';
            setTimeout(() => {
              customAmountInput.style.borderColor = '';
            }, 1500);
            return;
          }
          state.selectedAmount = val;
        }
        if (!state.selectedAmount) return;
      }
      goToStep(next);
    });
  });

  document.querySelectorAll('[data-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const back = parseInt(btn.dataset.back, 10);
      goToStep(back);
    });
  });

  amountBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      amountBtns.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (btn.dataset.amount === 'other') {
        customAmountWrap.classList.remove('hidden');
        customAmountInput.value = '';
        state.selectedAmount = null;
        disableContinue();
        customAmountInput.focus();
      } else {
        customAmountWrap.classList.add('hidden');
        state.selectedAmount = parseInt(btn.dataset.amount, 10);
        enableContinue();
      }
    });
  });

  customAmountInput.addEventListener('input', () => {
    const val = parseInt(customAmountInput.value, 10);
    if (val && val >= 1) {
      state.selectedAmount = val;
      enableContinue();
    } else {
      state.selectedAmount = null;
      disableContinue();
    }
  });

  cardPayment.addEventListener('click', () => {
    alert('Kredi kartı ödeme sayfası yakında aktif olacaktır.');
  });

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.copy;
      const el = document.getElementById(targetId);
      if (!el) return;

      const text = el.textContent.trim();

      try {
        await navigator.clipboard.writeText(text);
        showToast();
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast();
      }
    });
  });

  let toastTimer;
  function showToast() {
    copyToast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      copyToast.classList.add('hidden');
    }, 2000);
  }
})();
