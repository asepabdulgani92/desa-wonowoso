// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initBackToTop();
  initContactPanel();
  initSmoothScroll();
  initProfilTabs();
  initHeaderScroll();
  initBeritaFilter();
  initHeroStatCounters();
}); // (Removed as we now use separate pages)

function initHeroStatCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');

  if (!counters.length) return;

  counters.forEach((counter) => {
    const rawValue = (counter.dataset.count || '').toString().trim();

    if (!rawValue) {
      counter.textContent = '0';
      return;
    }

    const numericValue = Number(rawValue);
    if (!Number.isFinite(numericValue)) {
      counter.textContent = rawValue;
      return;
    }

    const isDecimal = Number.isInteger(numericValue) ? false : true;
    const formatValue = (value) => isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString('id-ID');

    counter.textContent = '0';

    let current = 0;
    const step = Math.max(1, Math.ceil(numericValue / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= numericValue) {
        current = numericValue;
        clearInterval(timer);
      }
      counter.textContent = formatValue(current);
    }, 25);
  });
}

// Berita Filter
function initBeritaFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const newsCards = document.querySelectorAll('.news-card');

  if (filterBtns.length > 0 && newsCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        newsCards.forEach(card => {
          const category = card.getAttribute('data-category');

          if (filterValue === 'all' || category === filterValue) {
            card.style.display = 'flex'; // Ensure it's visible (flex for layout)
            // Add fade-in animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
}

// Header Scroll Effect
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}


// Close mobile nav
// Assuming mobileNav, mobileNavOverlay, and closeMobileNav are defined elsewhere or will be.
// For now, this block will only execute if closeMobileNav is defined.
// If this logic is meant to be inside a function, it needs to be wrapped.
// Based on the instruction, it's placed directly in the global scope or within a DOMContentLoaded block.
// Given the context, it's likely intended to be part of the DOMContentLoaded block or a new init function.
// For now, placing it as instructed, assuming it's part of the global script execution.
// If closeMobileNav is not defined, this block will simply be skipped.
// To make it syntactically correct and functional, it should ideally be inside a function called from DOMContentLoaded.
// However, strictly following the instruction to insert the code as provided:
// if (closeMobileNav) {
//   closeMobileNav.addEventListener("click", () => {
//     mobileNav.classList.remove("active");
//     mobileNavOverlay.classList.remove("active");
//     document.body.style.overflow = "";
//   });
// }


// Preloader
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 800);
    });
  }
}

// Back to top
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Contact Panel Dropdown
function initContactPanel() {
  const btnKontak = document.getElementById("btnKontak");
  const contactPanel = document.getElementById("contactPanel");

  if (btnKontak && contactPanel) {
    btnKontak.addEventListener("click", function (e) {
      e.preventDefault();
      contactPanel.style.display =
        contactPanel.style.display === "block" ? "none" : "block";
    });

    // Close on click outside
    document.addEventListener("click", function (e) {
      if (!contactPanel.contains(e.target) && !btnKontak.contains(e.target)) {
        contactPanel.style.display = "none";
      }
    });
  }
}

// Smooth Scroll for anchor links
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener("click", e => {
      const targetId = link.getAttribute("href");
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}
// Profil Tabs System
function initProfilTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabBtns.length > 0 && tabContents.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Show corresponding content
        const tabId = btn.getAttribute('data-tab');
        const content = document.getElementById(tabId);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  }
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  initProfilTabs();
});
