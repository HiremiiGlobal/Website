(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('[data-language-toggle]');
  const menuButton = document.querySelector('.menu');
  const navigation = document.querySelector('.nav');
  const form = document.querySelector('#enquiry-form');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const readingProgress = document.createElement('div');
  readingProgress.className = 'reading-progress';
  readingProgress.setAttribute('aria-hidden', 'true');
  const progressLine = document.createElement('span');
  readingProgress.append(progressLine);
  document.body.append(readingProgress);

  const backToTop = document.createElement('button');
  backToTop.type = 'button';
  backToTop.className = 'back-to-top';
  backToTop.hidden = true;
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12l6-6 6 6M12 6v13"/></svg>';
  document.body.append(backToTop);

  function setLanguage(language) {
    language = language === 'zh' ? 'zh' : 'en';
    root.dataset.lang = language;
    root.lang = language === 'zh' ? 'zh-Hans' : 'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(node => {
      node.innerHTML = language === 'zh' ? node.dataset.zh : node.dataset.en;
    });
    document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]').forEach(node => {
      node.placeholder = language === 'zh' ? node.dataset.placeholderZh : node.dataset.placeholderEn;
    });
    if (languageButton) {
      languageButton.textContent = language === 'en' ? '中文' : 'English';
      languageButton.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : '切换为英文');
    }
    updateMenuLabel();
    backToTop.setAttribute('aria-label', language === 'en' ? 'Back to top' : '返回顶部');
    backToTop.title = language === 'en' ? 'Back to top' : '返回顶部';
    scheduleScrollUpdate();
    try { localStorage.setItem('aqyr-demo-language', language); } catch {}
  }

  function updateMenuLabel() {
    const open = menuButton?.getAttribute('aria-expanded') === 'true';
    menuButton?.setAttribute('aria-label', root.dataset.lang === 'zh'
      ? (open ? '关闭导航菜单' : '打开导航菜单')
      : (open ? 'Close navigation menu' : 'Open navigation menu'));
  }

  function closeMenu(returnFocus = false) {
    navigation?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    updateMenuLabel();
    if (returnFocus) menuButton?.focus();
  }

  const pageLinks = [...document.querySelectorAll('.page-jump a[href^="#"]')]
    .map(link => ({ link, target: document.getElementById(link.hash.slice(1)) }))
    .filter(item => item.target);
  let scrollFrame = 0;
  function updateScrollState() {
    scrollFrame = 0;
    const distance = Math.max(0, root.scrollHeight - window.innerHeight);
    const progress = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    progressLine.style.transform = 'scaleX(' + progress + ')';
    backToTop.hidden = window.scrollY < Math.max(600, window.innerHeight * 0.8);
    let current = null;
    pageLinks.forEach(item => {
      if (item.target.getBoundingClientRect().top <= window.innerHeight * 0.35) current = item;
    });
    pageLinks.forEach(item => {
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  function scheduleScrollUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate);
  window.addEventListener('load', scheduleScrollUpdate);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScrollUpdate).observe(document.body);
  backToTop.addEventListener('click', () => {
    document.querySelector('.brand')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'instant' : 'smooth' });
  });

  let language = 'en';
  try { language = localStorage.getItem('aqyr-demo-language') || 'en'; } catch {}
  setLanguage(language);
  // Stored language and font loading can change the height above a shared case.
  const initialCaseHash = location.hash;
  const initialCaseTarget = document.getElementById(initialCaseHash.slice(1));
  if (initialCaseTarget?.matches('.case-detailed, .case-legacy-anchor')) {
    let userInteracted = false;
    const markInteraction = () => { userInteracted = true; };
    const events = ['pointerdown', 'wheel', 'touchstart', 'keydown'];
    events.forEach(type => window.addEventListener(type, markInteraction, { once: true, passive: true }));
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() => {
      events.forEach(type => window.removeEventListener(type, markInteraction));
      if (!userInteracted && location.hash === initialCaseHash) {
        initialCaseTarget.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }));
  }
  languageButton?.addEventListener('click', () => setLanguage(root.dataset.lang === 'en' ? 'zh' : 'en'));
  menuButton?.addEventListener('click', () => {
    const open = navigation?.classList.toggle('open') || false;
    menuButton.setAttribute('aria-expanded', String(open));
    updateMenuLabel();
  });
  navigation?.querySelectorAll('a').forEach(link => {
    if (new URL(link.getAttribute('href'), location.href).pathname === location.pathname) {
      link.setAttribute('aria-current', 'page');
    }
    link.addEventListener('click', () => closeMenu());
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation?.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (navigation?.classList.contains('open') && !event.target.closest('.top')) closeMenu();
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  if (form) {
    const requestedService = new URLSearchParams(location.search).get('service');
    const requestSelect = form.querySelector('[name="requestType"]');
    if (requestedService && [...requestSelect.options].some(option => option.value === requestedService)) {
      requestSelect.value = requestedService;
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const zh = root.dataset.lang === 'zh';
      const data = new FormData(form);
      const labels = zh ? ['咨询身份', '咨询需求', '姓名', '公司 / 职业', '邮箱', '电话', '需求说明']
        : ['Enquiry type', 'What you need', 'Name', 'Company / occupation', 'Email', 'Phone', 'Enquiry details'];
      const optionText = name => {
        const selected = form.querySelector('[name="' + name + '"]').selectedOptions[0];
        return zh ? selected.dataset.zh : selected.dataset.en;
      };
      const values = [optionText('enquiryType'), optionText('requestType'), data.get('name'),
        data.get('companyOccupation') || '—', data.get('email'), data.get('phone') || '—', data.get('message')];
      const subject = zh ? 'AQYR 网站咨询' : 'AQYR website enquiry';
      const body = labels.map((label, index) => label + ': ' + values[index]).join('\n\n');
      const status = form.querySelector('#enquiry-status');
      if (status) {
        status.dataset.en = 'Please send the draft from your email app. If it does not open, email info@hiremiiglobal.com directly.';
        status.dataset.zh = '请在邮件应用中自行发送草稿。如未打开，请直接发送邮件至 info@hiremiiglobal.com。';
        status.textContent = zh ? status.dataset.zh : status.dataset.en;
      }
      window.location.href = 'mailto:info@hiremiiglobal.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  // Content stays visible when JavaScript is unavailable; motion is progressive enhancement.
  const caseCounter = document.querySelector('[data-count-to]');
  if (caseCounter && 'IntersectionObserver' in window && !motionPreference.matches) {
    const target = Number(caseCounter.dataset.countTo);
    const numberNode = caseCounter.firstChild;
    if (Number.isFinite(target) && target > 1 && numberNode?.nodeType === Node.TEXT_NODE) {
      let countFrame = 0;
      let completed = false;
      const finishCount = () => {
        cancelAnimationFrame(countFrame);
        numberNode.nodeValue = String(target);
        caseCounter.classList.remove('counting');
        completed = true;
      };
      const counterObserver = new IntersectionObserver(entries => {
        if (completed || !entries.some(entry => entry.isIntersecting)) return;
        counterObserver.disconnect();
        if (motionPreference.matches) return finishCount();
        const started = performance.now();
        caseCounter.classList.add('counting');
        numberNode.nodeValue = '1';
        const tick = now => {
          if (motionPreference.matches) return finishCount();
          const progress = Math.min(1, Math.max(0, (now - started) / 1100));
          const eased = 1 - Math.pow(1 - progress, 3);
          numberNode.nodeValue = String(Math.round(1 + (target - 1) * eased));
          if (progress < 1) countFrame = requestAnimationFrame(tick);
          else finishCount();
        };
        countFrame = requestAnimationFrame(tick);
      }, { threshold: 0.5 });
      counterObserver.observe(caseCounter);
      motionPreference.addEventListener('change', event => {
        if (event.matches) {
          counterObserver.disconnect();
          finishCount();
        }
      });
    }
  }

  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    root.classList.add('motion-ready');
    document.querySelectorAll('.grid2, .grid3, .specialism-grid, .team-support, .partner-grid').forEach(group => {
      [...group.children].forEach((node, index) => {
        if (node.matches('.reveal')) node.style.setProperty('--reveal-delay', Math.min(index % 3, 2) * 65 + 'ms');
      });
    });
    document.querySelectorAll('.reveal').forEach(node => observer.observe(node));
    motionPreference.addEventListener('change', event => {
      if (event.matches) {
        root.classList.remove('motion-ready');
        observer.disconnect();
      }
    });
  }
})();
