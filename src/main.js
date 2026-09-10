import { PROJECTS } from './data/projects.js';
import QRCode from 'qrcode';


document.addEventListener('DOMContentLoaded', () => {
  const webGalleryView = document.getElementById('web-gallery-view');
  const a3GridContainer = document.getElementById('a3-grid-container');
  const appContainer = document.getElementById('app');

  const btnModeGallery = document.getElementById('btn-mode-gallery');
  const btnModeA3 = document.getElementById('btn-mode-a3');
  const btnPrint = document.getElementById('btn-print');

  const searchInput = document.getElementById('search-input');
  const filterPills = document.getElementById('filter-pills');

  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const modalProjectDesc = document.getElementById('modal-project-desc');
  const modalProjectLink = document.getElementById('modal-project-link');
  const modalOpenLiveBtn = document.getElementById('modal-open-live-btn');
  const modalQrCanvas = document.getElementById('modal-qr-canvas');

  let currentCategory = 'All';
  let searchQuery = '';

  // Render Web Gallery Cards
  function renderWebGallery(projectsToRender) {
    webGalleryView.innerHTML = '';

    if (projectsToRender.length === 0) {
      webGalleryView.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <h3>No applications found</h3>
          <p>Try clearing your search or selecting another category.</p>
        </div>
      `;
      return;
    }

    projectsToRender.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="card-media">
          <img src="${project.image}" alt="${project.title} cover photo" class="card-cover-img" loading="lazy">
          <span class="card-badge">${project.category}</span>
          <div class="card-qr-overlay" data-project-id="${project.id}" title="Scan or view enlarged QR code">
            <canvas id="qr-web-${project.id}"></canvas>
          </div>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h2 class="card-title">${project.title}</h2>
          </div>
          <p class="card-subtitle">${project.subtitle}</p>
          <p class="card-description">${project.description}</p>
          
          <div class="card-tags">
            ${project.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
          </div>

          <div class="card-actions">
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn-primary">
              Launch Live App
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
            <button type="button" class="btn-icon btn-inspect-qr" data-project-id="${project.id}" title="View QR Details">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>
        </div>
      `;

      webGalleryView.appendChild(card);

      // Render Web QR Code
      setTimeout(() => {
        const canvas = document.getElementById(`qr-web-${project.id}`);
        const qrLib = QRCode || window.QRCode;
        if (canvas && qrLib) {
          qrLib.toCanvas(canvas, project.url, {
            width: 54,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          }, (err) => {
            if (err) console.error('QR rendering error:', err);
          });
        }
      }, 0);
    });

    // Attach click listeners for QR overlays and inspect buttons
    document.querySelectorAll('.card-qr-overlay, .btn-inspect-qr').forEach(elem => {
      elem.addEventListener('click', (e) => {
        const projId = elem.getAttribute('data-project-id');
        const proj = PROJECTS.find(p => p.id === projId);
        if (proj) openModal(proj);
      });
    });
  }

  // Render A3 Paper Grid Layout
  function renderA3PaperSheet(projectsToRender) {
    a3GridContainer.innerHTML = '';

    projectsToRender.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'a3-card';
      card.innerHTML = `


        <div class="a3-card-pic">
          <img src="${project.image}" alt="${project.title}" class="a3-cover-img">
        </div>

        <div class="a3-card-title-box">
          <h3 class="a3-card-title">${project.title}</h3>
          <span class="a3-card-cat">${project.category}</span>
        </div>

        <div class="a3-card-body">
          <div class="a3-qr-box">
            <canvas id="qr-a3-${project.id}"></canvas>
          </div>
          <div class="a3-card-info">
            <p class="a3-card-desc">${project.description}</p>
            <a href="${project.url}" target="_blank" class="a3-card-url">${project.url}</a>
          </div>
        </div>
      `;

      a3GridContainer.appendChild(card);

      // Render A3 High-Res QR Code
      setTimeout(() => {
        const canvas = document.getElementById(`qr-a3-${project.id}`);
        const qrLib = QRCode || window.QRCode;
        if (canvas && qrLib) {
          qrLib.toCanvas(canvas, project.url, {
            width: 140,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          }, (err) => {
            if (err) console.error('A3 QR rendering error:', err);
          });
        }
      }, 0);
    });
  }

  // Filter & Search Logic
  function getFilteredProjects() {
    return PROJECTS.filter(project => {
      const matchesCategory = (currentCategory === 'All') || (project.category === currentCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.subtitle.toLowerCase().includes(q) ||
        project.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }

  function updateViews() {
    const filtered = getFilteredProjects();
    renderWebGallery(filtered);
    renderA3PaperSheet(PROJECTS); // A3 sheet displays full 12 catalog projects
  }

  // Mode Toggles & Print (Optional)
  if (btnModeGallery) {
    btnModeGallery.addEventListener('click', () => {
      btnModeGallery.classList.add('active');
      if (btnModeA3) btnModeA3.classList.remove('active');
      appContainer.classList.remove('a3-mode-active');
    });
  }

  if (btnModeA3) {
    btnModeA3.addEventListener('click', () => {
      btnModeA3.classList.add('active');
      if (btnModeGallery) btnModeGallery.classList.remove('active');
      appContainer.classList.add('a3-mode-active');
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      appContainer.classList.add('a3-mode-active');
      window.print();
    });
  }

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateViews();
  });

  // Category filter pills
  filterPills.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-category');
      updateViews();
    }
  });

  // Modal logic
  function openModal(project) {
    modalProjectTitle.textContent = project.title;
    modalProjectDesc.textContent = project.description;
    modalProjectLink.textContent = project.url;
    modalProjectLink.href = project.url;
    modalOpenLiveBtn.href = project.url;

    const qrLib = QRCode || window.QRCode;
    if (qrLib) {
      qrLib.toCanvas(modalQrCanvas, project.url, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }

    modalBackdrop.classList.add('open');
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Initial render
  updateViews();
});
