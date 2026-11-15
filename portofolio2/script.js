(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  //--------Loader -------
  var n = 0, num = $('#loadNum'), bar = $('#loadBar'), loader = $('#loader');
  var t = setInterval(function () {
    n = Math.min(100, n + Math.ceil(Math.random() * 9));
    num.textContent = n; bar.style.transform = 'scaleX(' + n / 100 + ')';
    if (n >= 100) { clearInterval(t); setTimeout(function () { loader.classList.add('is-leaving'); }, 250); }
  }, 60);

  //------ Meteors  -----
  var mw = $('#meteors');
  for (var i = 0; i < 8; i++) {
    var m = document.createElement('i'); m.className = 'meteor';
    m.style.setProperty('--meteor-top', (Math.random() * 40 - 10) + '%');
    m.style.setProperty('--meteor-left', (Math.random() * 80) + '%');
    m.style.setProperty('--meteor-duration', (6 + Math.random() * 6) + 's');
    m.style.setProperty('--meteor-delay', (Math.random() * 8) + 's');
    mw.appendChild(m);
  }

    // ------ stars -------
(() => {
  const starsContainer = document.getElementById('stars');
  if (!starsContainer) return;
  // Jumlah bintang yang ingin dibuat
  const starCount = 45;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('i');
    star.className = 'star';

    // 1. Ukuran bintang acak antara 1px hingga 3px
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // 2. Posisi horizontal acak (0% - 100% dari lebar layar)
    star.style.left = `${Math.random() * 100}%`;

    // 3. Durasi terbang acak (antara 12 detik sampai 28 detik)
    const duration = Math.random() * 16 + 12;
    star.style.animationDuration = `${duration}s`;

    // 4. Delay acak (0s - 15s) agar bintang tidak muncul bersamaan di awal
    const delay = Math.random() * 15;
    star.style.animationDelay = `${delay}s`;

    // 5. Tingkat transparansi acak agar kedalaman visual lebih alami
    star.style.opacity = Math.random() * 0.7 + 0.3;

    starsContainer.appendChild(star);
  }
})();
//----layer 3d-------

  //----------Typewriter ------
  var words = ['Fullstack Developer', 'Web Engineer', 'Problem Solver'], wi = 0, ci = 0, del = false, el = $('#typer');
  (function type() {
    var w = words[wi];
    el.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(type, 1400); }
    if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
    ci += del ? -1 : 1;
    setTimeout(type, del ? 40 : 80);
  })();

  // ------- Navbar: scrolled + active link ------
  var links = $$('.navbar-link-item'), sections = links.map(function (a) { return $(a.getAttribute('href')); });
  window.addEventListener('scroll', function () {
    $('#navbar').classList.toggle('navbar-scrolled', window.scrollY > 20);
    var y = window.scrollY + 160, cur = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
  }, { passive: true });

  // --------Mobile menu ------ 
  var menu = $('#mobileMenu');
  $('#menuBtn').addEventListener('click', function () { menu.classList.toggle('is-open'); });
  $$('.navbar-mobile-link').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('is-open'); }); });

  // ----------Tabs --------
  $$('.portfolio-tab-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.portfolio-tab-btn').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      $$('.tab-panel').forEach(function (p) { p.hidden = p.id !== 'tab-' + b.dataset.tab; });
    });
  });

  // ----------Contact form (demo: ganti dengan endpoint-mu, mis. Formspree / backend sendiri)-------
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault(); $('#toast').hidden = false; e.target.reset();
    setTimeout(function () { $('#toast').hidden = true; }, 4000);
  });

  // --------Copy email--------
  $('#copyBtn').addEventListener('click', function () {
    var b = this, txt = $('#mail').textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () {
      b.textContent = 'Tersalin'; setTimeout(function () { b.textContent = 'Salin'; }, 1800);
    }).catch(function () {});
  });

  $('#toTop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();
