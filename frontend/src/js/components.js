// ======================================
// WEB SECURITY LAB
// SHARED COMPONENT LOADER
// ======================================

// ======================================
// LOAD COMPONENT
// ======================================

async function loadComponent(selector, filePath) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `Không thể tải component: ${filePath} - HTTP ${response.status}`,
      );
    }

    container.innerHTML = await response.text();
  } catch (error) {
    console.error("Component loading error:", error);

    container.innerHTML = `
      <div class="component-error">
        Không thể tải thành phần giao diện.
      </div>
    `;
  }
}

// ======================================
// DETECT CURRENT PAGE
// ======================================

function isInnerPage() {
  return window.location.pathname.includes("/pages/");
}

// ======================================
// COMPONENT PATH
// ======================================

function getComponentPath() {
  return isInnerPage() ? "../components/" : "src/components/";
}

// ======================================
// NAVIGATION PATH
// ======================================

function getNavigationPath(target) {
  if (!target) {
    return "#";
  }

  // Homepage
  if (!isInnerPage()) {
    if (target === "index.html") {
      return "index.html";
    }

    return `src/pages/${target}`;
  }

  // Inner page
  if (target === "index.html") {
    return "../../index.html";
  }

  return target;
}

// ======================================
// SETUP NAVIGATION
// ======================================

function setupNavigation() {
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const target = link.dataset.target;

    if (!target) {
      return;
    }

    link.href = getNavigationPath(target);
  });
}

// ======================================
// ACTIVE NAVIGATION
// ======================================

function setActiveNavigation() {
  const currentPage = document.body.dataset.page || "home";

  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    const linkPage = link.dataset.page;

    const isActive = linkPage === currentPage;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

// ======================================
// SET HEADER TITLE
// ======================================

function setPageTitle() {
  const title = document.body.dataset.title;

  const pageTitle = document.getElementById("pageTitle");

  if (!pageTitle) {
    return;
  }

  if (title) {
    pageTitle.textContent = title;
  }
}

// ======================================
// SIDEBAR TOGGLE
// ======================================

function initSidebar() {
  const sidebar = document.getElementById("sidebar");

  const menuToggle = document.getElementById("menuToggle");

  if (!sidebar || !menuToggle) {
    return;
  }

  // Initial state
  sidebar.classList.remove("show");

  menuToggle.setAttribute("aria-expanded", "false");

  // Open / close sidebar
  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = sidebar.classList.toggle("show");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close when clicking outside
  document.addEventListener("click", (event) => {
    const clickedSidebar = sidebar.contains(event.target);

    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedSidebar && !clickedToggle) {
      sidebar.classList.remove("show");

      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Close after clicking navigation
  sidebar.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("show");

      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ======================================
// LOAD PAGE LAYOUT
// ======================================

async function loadLayout() {
  const componentPath = getComponentPath();

  await Promise.all([
    loadComponent("#sidebar-container", `${componentPath}sidebar.html`),

    loadComponent("#header-container", `${componentPath}header.html`),

    loadComponent("#footer-container", `${componentPath}footer.html`),
  ]);

  // Components đã được load xong
  setupNavigation();

  setActiveNavigation();

  setPageTitle();

  initSidebar();
}

// ======================================
// START
// ======================================

document.addEventListener("DOMContentLoaded", loadLayout);
