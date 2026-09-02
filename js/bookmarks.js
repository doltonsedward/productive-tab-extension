// ==========================================
// MODULE: BOOKMARK SPOTLIGHT & COMMAND PALETTE
// ==========================================

const BookmarkSpotlight = (() => {
  let bookmarkTree = [];
  let flatBookmarks = [];
  let currentFolderId = "root";
  let breadcrumbStack = [{ id: "root", title: "Bookmarks" }];
  let selectedIndex = 0;
  let activeItems = []; // List of currently rendered navigable items (folders + links)

  // Mock bookmark dataset for local dev / non-extension preview
  const MOCK_BOOKMARKS = [
    {
      id: "1",
      title: "Bookmarks Bar",
      children: [
        { id: "101", title: "GitHub - Repositories", url: "https://github.com" },
        { id: "102", title: "Figma - Design Systems", url: "https://figma.com" },
        { id: "103", title: "Notion Workspace", url: "https://notion.so" },
        { id: "104", title: "ChatGPT", url: "https://chatgpt.com" },
        {
          id: "105",
          title: "Dev Tools",
          children: [
            { id: "201", title: "Vercel Dashboard", url: "https://vercel.com" },
            { id: "202", title: "MDN Web Docs", url: "https://developer.mozilla.org" },
            { id: "203", title: "Tailwind CSS Docs", url: "https://tailwindcss.com" },
            { id: "204", title: "NPM Registry", url: "https://npmjs.com" }
          ]
        },
        {
          id: "106",
          title: "Reading List",
          children: [
            { id: "301", title: "Hacker News", url: "https://news.ycombinator.com" },
            { id: "302", title: "Dev.to Articles", url: "https://dev.to" },
            { id: "303", title: "Medium Tech", url: "https://medium.com" }
          ]
        }
      ]
    },
    {
      id: "2",
      title: "Other Bookmarks",
      children: [
        { id: "401", title: "Google Drive", url: "https://drive.google.com" },
        { id: "402", title: "YouTube Music", url: "https://music.youtube.com" }
      ]
    }
  ];

  /**
   * Initialize module, bind keyboard shortcuts and Chrome bookmark event listeners
   */
  const init = () => {
    bindGlobalShortcut();
    bindDomEvents();
    loadBookmarks();
    initChromeListeners();
  };

  /**
   * Listen to real-time Chrome bookmark events
   */
  const initChromeListeners = () => {
    if (typeof chrome !== "undefined" && chrome.bookmarks) {
      const refresh = () => loadBookmarks();
      chrome.bookmarks.onCreated?.addListener(refresh);
      chrome.bookmarks.onRemoved?.addListener(refresh);
      chrome.bookmarks.onChanged?.addListener(refresh);
      chrome.bookmarks.onMoved?.addListener(refresh);
      chrome.bookmarks.onChildrenReordered?.addListener(refresh);
    }
  };

  /**
   * Load bookmarks from Chrome API or fallback mock
   */
  const loadBookmarks = async () => {
    if (typeof chrome !== "undefined" && chrome.bookmarks && chrome.bookmarks.getTree) {
      try {
        chrome.bookmarks.getTree((tree) => {
          if (tree && tree.length > 0) {
            // Chrome root node often has an empty title and children [Bookmarks Bar, Other, Mobile]
            const rootChildren = tree[0].children || tree;
            bookmarkTree = rootChildren;
          } else {
            bookmarkTree = MOCK_BOOKMARKS;
          }
          flattenBookmarks();
          if (isOpen()) renderContent();
        });
      } catch (err) {
        console.warn("Could not load chrome.bookmarks, using fallback:", err);
        bookmarkTree = MOCK_BOOKMARKS;
        flattenBookmarks();
      }
    } else {
      bookmarkTree = MOCK_BOOKMARKS;
      flattenBookmarks();
    }
  };

  /**
   * Create flat array of all links with their full folder path for instant fuzzy search
   */
  const flattenBookmarks = () => {
    flatBookmarks = [];
    const traverse = (node, path = []) => {
      if (!node) return;
      const currentPath = node.title ? [...path, node.title] : path;
      if (node.url) {
        flatBookmarks.push({
          id: node.id,
          title: node.title || node.url,
          url: node.url,
          folderPath: path.join(" / ") || "Bookmarks",
          folderName: path.length > 0 ? path[path.length - 1] : "Bookmarks"
        });
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, currentPath));
      }
    };

    bookmarkTree.forEach(rootNode => traverse(rootNode, []));
  };

  /**
   * Bind Ctrl+B / Cmd+B global keydown
   */
  const bindGlobalShortcut = () => {
    window.addEventListener("keydown", (e) => {
      // Check for Ctrl+B (Windows/Linux) or Cmd+B (macOS)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        // Prevent browser default bookmark bar toggle
        e.preventDefault();
        toggle();
      }
    });
  };

  /**
   * Bind DOM trigger buttons and search events
   */
  const bindDomEvents = () => {
    const fab = document.getElementById("toggleBookmarksBtn");
    if (fab) {
      fab.addEventListener("click", () => open());
    }

    const modal = document.getElementById("bookmarksModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    const closeBtn = document.getElementById("bookmarksCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => close());
    }

    const searchInput = document.getElementById("bookmarksSearchInput");
    const clearBtn = document.getElementById("bookmarksClearSearchBtn");

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        selectedIndex = 0;
        if (clearBtn) {
          clearBtn.style.display = searchInput.value ? "flex" : "none";
        }
        renderContent();
      });

      searchInput.addEventListener("keydown", handleKeyNavigation);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          clearBtn.style.display = "none";
          searchInput.focus();
          selectedIndex = 0;
          renderContent();
        }
      });
    }
  };

  /**
   * Handle keyboard navigation (Arrow keys, Enter, Esc, Backspace)
   */
  const handleKeyNavigation = (e) => {
    const searchInput = document.getElementById("bookmarksSearchInput");
    const query = searchInput ? searchInput.value.trim() : "";

    if (e.key === "Escape") {
      e.preventDefault();
      if (!query && breadcrumbStack.length > 1) {
        // Go back up one folder level
        goBackFolder();
      } else {
        close();
      }
      return;
    }

    if (e.key === "Backspace" && !query && breadcrumbStack.length > 1) {
      // Go back up folder if backspace pressed on empty search input
      e.preventDefault();
      goBackFolder();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % activeItems.length;
        updateSelectionHighlight();
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + activeItems.length) % activeItems.length;
        updateSelectionHighlight();
      }
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeItems.length > 0 && activeItems[selectedIndex]) {
        const item = activeItems[selectedIndex];
        if (item.isFolder) {
          openFolder(item.id, item.title);
        } else if (item.url) {
          openUrl(item.url, e.ctrlKey || e.metaKey);
        }
      }
    }
  };

  /**
   * Highlight currently selected keyboard item
   */
  const updateSelectionHighlight = () => {
    const container = document.getElementById("bookmarksContentArea");
    if (!container) return;

    const cards = container.querySelectorAll(".bm-folder-card, .bm-link-item");
    cards.forEach((el, idx) => {
      el.classList.toggle("selected", idx === selectedIndex);
      if (idx === selectedIndex) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  };

  /**
   * Open modal
   */
  const open = () => {
    const modal = document.getElementById("bookmarksModal");
    const input = document.getElementById("bookmarksSearchInput");
    const clearBtn = document.getElementById("bookmarksClearSearchBtn");
    if (!modal) return;

    // Reset search
    if (input) {
      input.value = "";
      if (clearBtn) clearBtn.style.display = "none";
    }

    currentFolderId = "root";
    breadcrumbStack = [{ id: "root", title: "Bookmarks" }];
    selectedIndex = 0;

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Fast render
    renderBreadcrumbs();
    renderContent();

    setTimeout(() => {
      if (input) input.focus();
    }, 50);
  };

  /**
   * Close modal
   */
  const close = () => {
    const modal = document.getElementById("bookmarksModal");
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  };

  const isOpen = () => {
    const modal = document.getElementById("bookmarksModal");
    return modal && !modal.classList.contains("hidden");
  };

  const toggle = () => {
    if (isOpen()) close();
    else open();
  };

  /**
   * Drill down into folder
   */
  const openFolder = (folderId, folderTitle) => {
    currentFolderId = folderId;
    breadcrumbStack.push({ id: folderId, title: folderTitle });
    selectedIndex = 0;

    const searchInput = document.getElementById("bookmarksSearchInput");
    if (searchInput) searchInput.value = "";

    renderBreadcrumbs();
    renderContent(true); // with macOS spring animation
  };

  /**
   * Navigate back up to a specific breadcrumb level
   */
  const navigateToBreadcrumb = (index) => {
    if (index >= 0 && index < breadcrumbStack.length) {
      breadcrumbStack = breadcrumbStack.slice(0, index + 1);
      currentFolderId = breadcrumbStack[breadcrumbStack.length - 1].id;
      selectedIndex = 0;
      renderBreadcrumbs();
      renderContent(true);
    }
  };

  /**
   * Go back up 1 folder level
   */
  const goBackFolder = () => {
    if (breadcrumbStack.length > 1) {
      navigateToBreadcrumb(breadcrumbStack.length - 2);
    }
  };

  /**
   * Open bookmark URL
   */
  const openUrl = (url, openInNewTab = false) => {
    if (!url) return;
    if (openInNewTab || url.startsWith("chrome://") || url.startsWith("edge://")) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  /**
   * Find node in tree by ID
   */
  const findNodeById = (nodes, id) => {
    if (id === "root") return { id: "root", title: "Bookmarks", children: nodes };
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Extract hostname cleanly
   */
  const getHostName = (urlStr) => {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  /**
   * Get Favicon URL using Google Favicon service
   */
  const getFaviconUrl = (urlStr) => {
    const host = getHostName(urlStr);
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  };

  /**
   * Render breadcrumb pills
   */
  const renderBreadcrumbs = () => {
    const bar = document.getElementById("bookmarksBreadcrumbBar");
    if (!bar) return;

    bar.innerHTML = breadcrumbStack.map((crumb, idx) => {
      const isLast = idx === breadcrumbStack.length - 1;
      const icon = idx === 0 ? "⭐️" : "📁";
      return `
        <span class="bm-crumb ${isLast ? "active" : ""}" data-index="${idx}">
          <span>${icon}</span> ${escapeHtml(crumb.title)}
        </span>
        ${!isLast ? '<span class="bm-crumb-sep">/</span>' : ""}
      `;
    }).join("");

    bar.querySelectorAll(".bm-crumb").forEach(crumb => {
      crumb.addEventListener("click", () => {
        const idx = parseInt(crumb.dataset.index, 10);
        navigateToBreadcrumb(idx);
      });
    });
  };

  /**
   * Render folder grid & bookmark rows
   */
  const renderContent = (animateSpring = false) => {
    const container = document.getElementById("bookmarksContentArea");
    const searchInput = document.getElementById("bookmarksSearchInput");
    if (!container) return;

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    activeItems = [];

    // 1. SEARCH MODE: Searching across all bookmarks
    if (query) {
      const matches = flatBookmarks.filter(bm =>
        bm.title.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query) ||
        bm.folderPath.toLowerCase().includes(query)
      ).slice(0, 30); // Top 30 matches

      if (matches.length === 0) {
        container.innerHTML = `
          <div class="bm-empty-state">
            <span class="bm-empty-icon">🔍</span>
            <strong>No bookmarks found</strong>
            <span>Try searching with a different keyword or check folder view.</span>
          </div>
        `;
        return;
      }

      activeItems = matches.map(bm => ({ ...bm, isFolder: false }));

      container.innerHTML = `
        <div class="bm-links-section">
          <div class="bm-section-title">SEARCH RESULTS (${matches.length})</div>
          ${matches.map((bm, idx) => renderLinkItemHtml(bm, idx)).join("")}
        </div>
      `;

      attachItemEvents(container);
      updateSelectionHighlight();
      return;
    }

    // 2. FOLDER EXPLORER MODE: Browsing current folder
    const currentNode = findNodeById(bookmarkTree, currentFolderId);
    if (!currentNode || !currentNode.children || currentNode.children.length === 0) {
      container.innerHTML = `
        <div class="bm-empty-state">
          <span class="bm-empty-icon">📂</span>
          <strong>This folder is empty</strong>
          <span>No bookmarks or subfolders saved here.</span>
        </div>
      `;
      return;
    }

    const subFolders = currentNode.children.filter(child => child.children && !child.url);
    const links = currentNode.children.filter(child => Boolean(child.url));

    let html = "";

    // Render Sub-folders Grid with macOS spring cards
    if (subFolders.length > 0) {
      html += `
        <div class="bm-folders-section">
          <div class="bm-section-title">FOLDERS (${subFolders.length})</div>
          <div class="bm-folder-grid">
            ${subFolders.map(folder => {
              const childCount = (folder.children || []).length;
              return `
                <div class="bm-folder-card ${animateSpring ? 'animate-spring' : ''}" data-folder-id="${folder.id}" data-folder-title="${escapeHtml(folder.title)}">
                  <span class="bm-folder-icon">📁</span>
                  <div class="bm-folder-info">
                    <span class="bm-folder-name">${escapeHtml(folder.title || "Folder")}</span>
                    <span class="bm-folder-count">${childCount} ${childCount === 1 ? "item" : "items"}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    // Render Links List
    if (links.length > 0) {
      html += `
        <div class="bm-links-section">
          <div class="bm-section-title">BOOKMARKS (${links.length})</div>
          ${links.map((link, idx) => {
            const bmObj = {
              id: link.id,
              title: link.title || link.url,
              url: link.url,
              folderName: currentNode.title || "Bookmarks"
            };
            return renderLinkItemHtml(bmObj, subFolders.length + idx);
          }).join("")}
        </div>
      `;
    }

    activeItems = [
      ...subFolders.map(f => ({ id: f.id, title: f.title, isFolder: true })),
      ...links.map(l => ({ id: l.id, title: l.title, url: l.url, isFolder: false }))
    ];

    container.innerHTML = html;
    attachItemEvents(container);
    updateSelectionHighlight();
  };

  /**
   * Helper to render link row item HTML
   */
  const renderLinkItemHtml = (bm, idx) => {
    const faviconUrl = getFaviconUrl(bm.url);
    const host = getHostName(bm.url);
    const isSelected = idx === selectedIndex;

    return `
      <div class="bm-link-item ${isSelected ? "selected" : ""}" data-url="${escapeHtml(bm.url)}" data-index="${idx}">
        <div class="bm-favicon-wrapper">
          ${faviconUrl
            ? `<img src="${faviconUrl}" class="bm-favicon-img" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" />
               <span class="bm-favicon-fallback" style="display:none;">🔗</span>`
            : `<span class="bm-favicon-fallback">🔗</span>`
          }
        </div>
        <div class="bm-link-details">
          <span class="bm-link-title">${escapeHtml(bm.title)}</span>
          <span class="bm-link-url">${escapeHtml(host || bm.url)}</span>
        </div>
        ${bm.folderName ? `<span class="bm-link-folder-tag">📁 ${escapeHtml(bm.folderName)}</span>` : ""}
      </div>
    `;
  };

  /**
   * Attach click & hover events to rendered items
   */
  const attachItemEvents = (container) => {
    // Folders click
    container.querySelectorAll(".bm-folder-card").forEach(card => {
      card.addEventListener("click", () => {
        const fId = card.dataset.folderId;
        const fTitle = card.dataset.folderTitle;
        openFolder(fId, fTitle);
      });
    });

    // Links click
    container.querySelectorAll(".bm-link-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const url = item.dataset.url;
        openUrl(url, e.ctrlKey || e.metaKey);
      });

      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.dataset.index, 10);
        if (!isNaN(idx)) {
          selectedIndex = idx;
          updateSelectionHighlight();
        }
      });
    });
  };

  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return {
    init,
    open,
    close,
    toggle,
    loadBookmarks
  };
})();
