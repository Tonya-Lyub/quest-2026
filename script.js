/* ============================================
   HACKER QUEST — Main Logic
   States: Locked → Unlocked
   ============================================ */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    correctAnswer: '2000',
    maxAttempts: 10,
    typingSpeed: 40,       // ms per character
    unlockDelay: 1800,     // ms before showing unlocked content
    progressDuration: 1500 // ms for progress bar animation
  };

  // --- DOM Elements ---
  const elements = {
    lockedSection: document.getElementById('locked-section'),
    unlockedSection: document.getElementById('unlocked-section'),
    codeInput: document.getElementById('code-input'),
    submitBtn: document.getElementById('submit-btn'),
    errorMsg: document.getElementById('error-msg'),
    statusIndicator: document.getElementById('status-indicator'),
    statusText: document.getElementById('status-text'),
    progressContainer: document.getElementById('progress-bar-container'),
    progressBar: document.getElementById('progress-bar'),
    attemptCounter: document.getElementById('attempt-counter'),
    terminalBody: document.getElementById('terminal-body'),
    typewriterEl: document.getElementById('typewriter-text')
  };

  // --- State ---
  let attempts = 0;
  let isSubmitting = false;

  // --- Initialize ---
  function init() {
    // Bind events
    elements.submitBtn.addEventListener('click', handleSubmit);
    elements.codeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });

    // Clear error on input
    elements.codeInput.addEventListener('input', () => {
      hideError();
    });

    // Start typewriter effect
    startTypewriter();

    // Start matrix rain
    initMatrixRain();
  }

  // --- Typewriter Effect ---
  function startTypewriter() {
    const text = elements.typewriterEl.getAttribute('data-text');
    elements.typewriterEl.textContent = '';
    let i = 0;

    function type() {
      if (i < text.length) {
        elements.typewriterEl.textContent += text.charAt(i);
        i++;
        setTimeout(type, CONFIG.typingSpeed);
      }
    }

    // slight delay before starting
    setTimeout(type, 600);
  }

  // --- Handle Submit ---
  function handleSubmit() {
    if (isSubmitting) return;

    const value = elements.codeInput.value.trim();

    if (!value) {
      showError('⚠ EMPTY INPUT. ENTER DECRYPTION CODE.');
      elements.codeInput.focus();
      return;
    }

    attempts++;
    updateAttemptCounter();

    if (value === CONFIG.correctAnswer) {
      handleSuccess();
    } else {
      handleFailure();
    }
  }

  // --- Handle Correct Answer ---
  function handleSuccess() {
    isSubmitting = true;
    hideError();

    // Change input style to success
    elements.codeInput.style.borderColor = 'var(--neon-green)';
    elements.codeInput.style.boxShadow = '0 0 15px var(--neon-green-glow-strong)';
    elements.codeInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = '✓';
    elements.submitBtn.style.borderColor = 'var(--neon-green)';
    elements.submitBtn.style.color = 'var(--neon-green)';

    // Show progress bar
    elements.progressContainer.classList.add('active');
    setTimeout(() => {
      elements.progressBar.classList.add('complete');
    }, 50);

    // Update status
    elements.statusIndicator.classList.remove('locked');
    elements.statusText.textContent = 'DECRYPTING... STAND BY';

    // Flash effect on terminal body
    elements.terminalBody.classList.add('success-flash');

    // After progress completes, switch to unlocked state
    setTimeout(() => {
      elements.statusText.textContent = 'ACCESS GRANTED';

      // Hide locked, show unlocked
      elements.lockedSection.classList.add('hidden');
      elements.unlockedSection.classList.add('visible');

      // Stagger the info items
      staggerReveal();
    }, CONFIG.unlockDelay);
  }

  // --- Stagger reveal of info items ---
  function staggerReveal() {
    const items = elements.unlockedSection.querySelectorAll('.info-item, .instruction-box');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(15px)';
      item.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;

      // Trigger
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
      });
    });
  }

  // --- Handle Wrong Answer ---
  function handleFailure() {
    const remaining = CONFIG.maxAttempts - attempts;

    if (remaining <= 0) {
      showError(`✖ ACCESS DENIED. SYSTEM LOCKED.`);
      elements.codeInput.disabled = true;
      elements.submitBtn.disabled = true;
      return;
    }

    showError(`✖ ACCESS DENIED. INVALID CODE. [${remaining} attempts left]`);

    // Brief red flash on input
    elements.codeInput.style.borderColor = 'var(--neon-red)';
    elements.codeInput.style.boxShadow = '0 0 10px var(--neon-red-glow)';

    setTimeout(() => {
      elements.codeInput.style.borderColor = '';
      elements.codeInput.style.boxShadow = '';
    }, 800);

    elements.codeInput.value = '';
    elements.codeInput.focus();
  }

  // --- Error display helpers ---
  function showError(msg) {
    elements.errorMsg.textContent = msg;
    elements.errorMsg.classList.add('visible');
  }

  function hideError() {
    elements.errorMsg.classList.remove('visible');
  }

  // --- Attempt counter ---
  function updateAttemptCounter() {
    elements.attemptCounter.textContent = `attempts: ${attempts}/${CONFIG.maxAttempts}`;
  }

  // --- Matrix Rain Canvas ---
  function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 60);
  }

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
