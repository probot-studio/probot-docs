// 404 handling for local dev (optional)
(function() {
  const currentPath = window.location.pathname;
  const isGhPages = false; // custom domain will serve root
  if (!isGhPages) return; // no-op when custom domain
})();

// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
let sidebarOpen = localStorage.getItem('sidebarOpen') !== 'false';

if (!sidebarOpen) {
  sidebar.classList.add('collapsed');
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  sidebarOpen = !sidebar.classList.contains('collapsed');
  localStorage.setItem('sidebarOpen', sidebarOpen);
});

// GitHub Stats
fetch('https://api.github.com/repos/tunapro1234/probot-lib')
  .then(response => response.json())
  .then(data => {
    const starEl = document.getElementById('starCount');
    const forkEl = document.getElementById('forkCount');
    if (starEl) starEl.textContent = data.stargazers_count || '0';
    if (forkEl) forkEl.textContent = data.forks_count || '0';
  })
  .catch(() => {
    const starEl = document.getElementById('starCount');
    const forkEl = document.getElementById('forkCount');
    if (starEl) starEl.textContent = '0';
    if (forkEl) forkEl.textContent = '0';
  });

// Search functionality with expand animation
const searchInput = document.getElementById('searchInput');
const searchContainer = document.querySelector('.search-container');
const navLinks = document.querySelectorAll('.nav-link');

if (searchInput && searchContainer) {
  searchInput.addEventListener('focus', () => searchContainer.classList.add('expanded'));
  searchInput.addEventListener('blur', () => { if (!searchInput.value) searchContainer.classList.remove('expanded'); });
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    navLinks.forEach(link => {
      const text = link.textContent.toLowerCase();
      const parent = link.closest('.nav-item');
      if (!parent) return;
      parent.style.display = (text.includes(query) || !query) ? '' : 'none';
    });
    document.querySelectorAll('.nav-section').forEach(section => {
      const visibleItems = section.querySelectorAll('.nav-item:not([style*="display: none"])');
      section.style.display = visibleItems.length > 0 ? '' : 'none';
    });
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput?.focus();
  }
});

// Section navigation
const sectionContainers = document.querySelectorAll('.section-container');
const navButtons = document.querySelectorAll('.nav-button[data-next], .nav-button[data-prev]');

function showSection(sectionName) {
  sectionContainers.forEach(container => {
    container.classList.remove('active');
    if (container.dataset.section === sectionName) {
      container.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  navLinks.forEach(link => link.classList.remove('active'));
  const activeSection = document.querySelector(`.section-container[data-section="${sectionName}"]`);
  if (activeSection) {
    const firstId = activeSection.querySelector('h2[id]')?.id;
    if (firstId) {
      const activeLink = document.querySelector(`.nav-link[href="#${firstId}"]`);
      activeLink?.classList.add('active');
    }
  }
}

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    const nextSection = button.dataset.next;
    const prevSection = button.dataset.prev;
    if (nextSection) showSection(nextSection);
    else if (prevSection) showSection(prevSection);
  });
});

// Smooth scrolling for nav links (within sections)
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      const parentSection = target.closest('.section-container');
      if (parentSection) {
        showSection(parentSection.dataset.section);
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// Mobile responsive behavior
if (window.innerWidth < 768) {
  sidebar.classList.add('collapsed');
  navLinks.forEach(link => {
    link.addEventListener('click', () => sidebar.classList.add('collapsed'));
  });
} 