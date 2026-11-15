/**
 * Script Interaksi Utama Portofolio (Vanilla JavaScript)
 * Dibungkus dalam IIFE: (function () { ... })() agar variabel di dalamnya
 * tidak bentrok dengan script lain di global scope (window).
 */
(function () {
  // ==========================================================================
  // 1. HELPER SELECTOR (Mempersingkat penulisan document.querySelector)
  // ==========================================================================
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  // ==========================================================================
  // 2. LAYAR LOADING AWAL (0% -> 100%)
  // ==========================================================================
  const loadNum = $("#loadNum");
  const loadBar = $("#loadBar");
  const loader = $("#loader");

  if (loader && loadNum && loadBar) {
    let progress = 0;

    const timer = setInterval(() => {
      // Tambah angka progres secara acak (1 - 9) hingga maksimal 100
      progress = Math.min(100, progress + Math.ceil(Math.random() * 9));
      loadNum.textContent = progress;
      loadBar.style.transform = `scaleX(${progress / 100})`;

      // Jika sudah 100%, hentikan interval lalu geser layar loading ke atas
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => loader.classList.add("is-leaving"), 250);
      }
    }, 60);
  }

  // ==========================================================================
  // 3. GENERATOR EFEK METEOR JATUH
  // ==========================================================================
  const meteorContainer = $("#meteors");

  if (meteorContainer) {
    for (let i = 0; i < 8; i++) {
      const meteor = document.createElement("i");
      meteor.className = "meteor";

      // Suntikkan posisi, durasi, dan jeda acak ke variabel CSS
      meteor.style.setProperty("--meteor-top", `${Math.random() * 40 - 10}%`);
      meteor.style.setProperty("--meteor-left", `${Math.random() * 80}%`);
      meteor.style.setProperty("--meteor-duration", `${6 + Math.random() * 6}s`);
      meteor.style.setProperty("--meteor-delay", `${Math.random() * 8}s`);

      meteorContainer.appendChild(meteor);
    }
  }

  // ==========================================================================
  // 4. ANIMASI MESIN TIK (TYPEWRITER)
  // ==========================================================================
  const typerEl = $("#typer");

  if (typerEl) {
    const words = ["Fullstack Developer", "Web Engineer", "Problem Solver"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const currentWord = words[wordIndex];
      typerEl.textContent = currentWord.slice(0, charIndex);

      // Jeda 1.4 detik setelah selesai mengetik 1 kata sebelum mulai menghapus
      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        return setTimeout(typeLoop, 1400);
      }

      // Pindah ke kata berikutnya setelah seluruh huruf terhapus
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      charIndex += isDeleting ? -1 : 1;
      setTimeout(typeLoop, isDeleting ? 40 : 80); // Menghapus lebih cepat daripada mengetik
    }

    typeLoop();
  }

  // ==========================================================================
  // 5. NAVBAR: EFEK SCROLL & PENANDA MENU AKTIF (SCROLLSPY)
  // ==========================================================================
  const navbar = $("#navbar");
  const navLinks = $$(".navbar-link-item");
  const sections = navLinks.map((link) => $(link.getAttribute("href")));

  window.addEventListener(
    "scroll",
    () => {
      // Tambah class saat halaman digulir lebih dari 20px
      if (navbar) {
        navbar.classList.toggle("navbar-scrolled", window.scrollY > 20);
      }

      // Deteksi section mana yang sedang dilihat user (+160px untuk kompensasi tinggi navbar)
      const scrollPos = window.scrollY + 160;
      let activeIndex = 0;

      sections.forEach((section, index) => {
        if (section && section.offsetTop <= scrollPos) {
          activeIndex = index;
        }
      });

      // Nyalakan class ".is-active" hanya pada link yang sesuai
      navLinks.forEach((link, index) => {
        link.classList.toggle("is-active", index === activeIndex);
      });
    },
    { passive: true } // Optimasi performa agar browser tidak menunggu JS saat scroll
  );

  // ==========================================================================
  // 6. MENU MOBILE (BUKA / TUTUP DROPDOWN HP)
  // ==========================================================================
  const mobileMenu = $("#mobileMenu");
  const menuBtn = $("#menuBtn");

  if (mobileMenu && menuBtn) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });

    // Otomatis tutup menu saat salah satu link diklik
    $$(".navbar-mobile-link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
      });
    });
  }

  // ==========================================================================
  // 7. TAB SWITCHER PORTFOLIO (PROYEK / SKILL)
  // ==========================================================================
  const tabButtons = $$(".portfolio-tab-btn");
  const tabPanels = $$(".tab-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Aktifkan tombol tab yang diklik
      tabButtons.forEach((item) => item.classList.toggle("is-active", item === btn));

      // Tampilkan panel yang id-nya cocok dengan atribut data-tab (misal: "tab-projects")
      const targetId = `tab-${btn.dataset.tab}`;
      tabPanels.forEach((panel) => {
        panel.hidden = panel.id !== targetId;
      });
    });
  });

  // ==========================================================================
  // 8. FORM KONTAK & NOTIFIKASI TOAST
  // ==========================================================================
  const contactForm = $("#contactForm");
  const toast = $("#toast");

  if (contactForm && toast) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Mencegah halaman reload saat form dikirim
      toast.hidden = false;
      contactForm.reset();

      // Sembunyikan notifikasi setelah 4 detik
      setTimeout(() => {
        toast.hidden = true;
      }, 4000);
    });
  }

  // ==========================================================================
  // 9. TOMBOL SALIN EMAIL KE CLIPBOARD
  // ==========================================================================
  const copyBtn = $("#copyBtn");
  const mailEl = $("#mail");

  if (copyBtn && mailEl) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(mailEl.textContent);
        copyBtn.textContent = "Tersalin";
        setTimeout(() => {
          copyBtn.textContent = "Salin";
        }, 1800);
      } catch {
        // Abaikan jika browser memblokir akses clipboard
      }
    });
  }

  // ==========================================================================
  // 10. TOMBOL KEMBALI KE ATAS (BACK TO TOP)
  // ==========================================================================
  const toTopBtn = $("#toTop");

  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
