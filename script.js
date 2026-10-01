(() => {
  const root = document.documentElement;
  const languageButton = document.querySelector('[data-language-toggle]');
  const menuButton = document.querySelector('.menu');
  const navigation = document.querySelector('.nav');
  const form = document.querySelector('#enquiry-form');

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

  let language = 'en';
  try { language = localStorage.getItem('aqyr-demo-language') || 'en'; } catch {}
  setLanguage(language);
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
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    root.classList.add('motion-ready');
    document.querySelectorAll('.reveal').forEach(node => observer.observe(node));
  }
})();
