// ==========================================
// MODULE: BOOKMARK SPOTLIGHT — DUAL-PANE COLUMN FINDER
// ==========================================

const BookmarkSpotlight = (() => {
  let bookmarkTree = [];
  let flatBookmarks = [];
  let activeFolderId = null;    // Currently selected folder in left pane
  let activeFolderPath = [];    // Breadcrumb path for selected folder
  let focusPane = "left";       // "left" | "right"
  let selectedLeft = 0;         // Selected index in left pane
  let selectedRight = -1;       // Selected index in right pane
  let leftItems = [];           // All folder rows rendered in left pane
  let rightItems = [];          // All link/subfolder rows rendered in right pane

  // Flat folder list for the left pane (depth-aware for sub-folder indent)
  let allFolders = [];

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

  /* -------------------------------------------------- */

  const init = () => {
    bindGlobalShortcut();
    bindDomEvents();
    loadBookmarks();
    initChromeListeners();
  };

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

  const loadBookmarks = async () => {
    if (typeof chrome !== "undefined" && chrome.bookmarks && chrome.bookmarks.getTree) {
      try {
        chrome.bookmarks.getTree((tree) => {
          bookmarkTree = (tree && tree[0]?.children) ? tree[0].children : MOCK_BOOKMARKS;
          processTree();
          if (isOpen()) renderAll();
        });
      } catch {
        bookmarkTree = MOCK_BOOKMARKS;
        processTree();
      }
    } else {
      bookmarkTree = MOCK_BOOKMARKS;
      processTree();
    }
  };

  /**
   * Build flat folder list (with depth) and flat link list for search
   */
  const processTree = () => {
    allFolders = [];
    flatBookmarks = [];

    const walkFolders = (nodes, depth = 0, path = []) => {
      nodes.forEach(node => {
        if (node.children) {
          const currentPath = [...path, node.title];
          allFolders.push({ id: node.id, title: node.title, node, depth, path: currentPath });
          walkFolders(node.children, depth + 1, currentPath);
        }
        if (node.url) {
          flatBookmarks.push({
            id: node.id,
            title: node.title || node.url,
            url: node.url,
            folderName: path.length > 0 ? path[path.length - 1] : "Bookmarks"
          });
        }
      });
    };
    walkFolders(bookmarkTree);
  };

  /* -------------------------------------------------- */

  const bindGlobalShortcut = () => {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
        return;
      }
      if (isOpen()) handleKeydown(e);
    });
  };

  const bindDomEvents = () => {
    document.getElementById("toggleBookmarksBtn")?.addEventListener("click", () => open());
    document.getElementById("bookmarksModal")?.addEventListener("click", (e) => {
      if (e.target.id === "bookmarksModal") close();
    });
    document.getElementById("bookmarksCloseBtn")?.addEventListener("click", () => close());

    const input = document.getElementById("bookmarksSearchInput");
    const clearBtn = document.getElementById("bookmarksClearSearchBtn");

    input?.addEventListener("input", () => {
      selectedLeft = 0;
      selectedRight = -1;
      focusPane = "right";
      if (clearBtn) clearBtn.style.display = input.value ? "flex" : "none";
      renderAll();
    });

    clearBtn?.addEventListener("click", () => {
      if (input) {
        input.value = "";
        clearBtn.style.display = "none";
        input.focus();
        focusPane = "left";
        selectedLeft = 0;
        selectedRight = -1;
        renderAll();
      }
    });
  };

  const handleKeydown = (e) => {
    const query = document.getElementById("bookmarksSearchInput")?.value.trim() ?? "";

    if (e.key === "Escape") { e.preventDefault(); close(); return; }

    // Tab / Arrow Left / Arrow Right to switch panes (only in browse mode)
    if (!query) {
      if (e.key === "ArrowRight" && focusPane === "left") {
        e.preventDefault();
        focusPane = "right";
        selectedRight = rightItems.length > 0 ? 0 : -1;
        updateHighlight();
        return;
      }
      if ((e.key === "ArrowLeft" || e.key === "Tab") && focusPane === "right") {
        e.preventDefault();
        focusPane = "left";
        selectedRight = -1;
        updateHighlight();
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (query || focusPane === "right") {
        selectedRight = Math.min(rightItems.length - 1, selectedRight + 1);
        if (selectedRight < 0 && rightItems.length > 0) selectedRight = 0;
      } else {
        selectedLeft = Math.min(leftItems.length - 1, selectedLeft + 1);
      }
      updateHighlight();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (query || focusPane === "right") {
        selectedRight = Math.max(0, selectedRight - 1);
      } else {
        selectedLeft = Math.max(0, selectedLeft - 1);
      }
      updateHighlight();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (query || focusPane === "right") {
        if (selectedRight >= 0 && selectedRight < rightItems.length) {
          const item = rightItems[selectedRight];
          if (item.url) openUrlInNewTab(item.url);
          else if (item.isSubfolder) selectFolderById(item.id, item.title, item.parentPath);
        }
      } else {
        if (selectedLeft >= 0 && selectedLeft < leftItems.length) {
          selectFolderById(leftItems[selectedLeft].id, leftItems[selectedLeft].title, leftItems[selectedLeft].path);
          focusPane = "right";
          selectedRight = rightItems.length > 0 ? 0 : -1;
          updateHighlight();
        }
      }
    }
  };

  /* -------------------------------------------------- */

  const open = () => {
    const modal = document.getElementById("bookmarksModal");
    const input = document.getElementById("bookmarksSearchInput");
    const clearBtn = document.getElementById("bookmarksClearSearchBtn");
    if (!modal) return;

    if (input) { input.value = ""; if (clearBtn) clearBtn.style.display = "none"; }

    // Select first folder by default
    activeFolderId = null;
    activeFolderPath = [];
    selectedLeft = 0;
    selectedRight = -1;
    focusPane = "left";

    if (allFolders.length > 0) {
      const first = allFolders[0];
      activeFolderId = first.id;
      activeFolderPath = first.path;
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    renderAll();
    setTimeout(() => input?.focus(), 40);
  };

  const close = () => {
    document.getElementById("bookmarksModal")?.classList.add("hidden");
    document.body.style.overflow = "";
  };

  const isOpen = () => {
    const m = document.getElementById("bookmarksModal");
    return m && !m.classList.contains("hidden");
  };

  const toggle = () => isOpen() ? close() : open();

  /* -------------------------------------------------- */

  const selectFolderById = (id, title, path) => {
    activeFolderId = id;
    activeFolderPath = path || [title];
    selectedRight = -1;
    renderAll();
  };

  const openUrlInNewTab = (url) => {
    if (!url) return;
    window.open(url, "_blank");
    close();
  };

  const getHostName = (urlStr) => {
    try { return new URL(urlStr).hostname.replace(/^www\./, ""); } catch { return ""; }
  };

  const getFaviconUrl = (urlStr) => {
    const h = getHostName(urlStr);
    return h ? `https://www.google.com/s2/favicons?domain=${h}&sz=32` : null;
  };

  /* -------------------------------------------------- */

  /**
   * Main render function — decides search mode vs browse mode
   */
  const renderAll = () => {
    const query = document.getElementById("bookmarksSearchInput")?.value.trim().toLowerCase() ?? "";

    const breadcrumbBar = document.getElementById("bookmarksBreadcrumbBar");
    if (breadcrumbBar) breadcrumbBar.style.display = "none"; // Hide old breadcrumb bar

    if (query) {
      renderSearchMode(query);
    } else {
      renderBrowseMode();
    }
  };

  /**
   * Browse Mode: Left Folder Pane + Right Link Pane
   */
  const renderBrowseMode = () => {
    const container = document.getElementById("bookmarksContentArea");
    if (!container) return;

    // Build left items list
    leftItems = allFolders.map(f => ({ ...f }));

    // Find right pane content (direct children of activeFolderId)
    const activeNode = findNodeById(bookmarkTree, activeFolderId);
    rightItems = [];

    if (activeNode && activeNode.children) {
      activeNode.children.forEach(child => {
        if (child.children) {
          // Sub-folder
          rightItems.push({
            id: child.id,
            title: child.title,
            count: child.children.length,
            isSubfolder: true,
            parentPath: [...(activeFolderPath || []), child.title]
          });
        } else if (child.url) {
          rightItems.push({ id: child.id, title: child.title, url: child.url, isSubfolder: false });
        }
      });
    }

    // Clamp selectedLeft
    if (selectedLeft >= leftItems.length) selectedLeft = Math.max(0, leftItems.length - 1);

    // Render HTML
    container.innerHTML = `
      <div class="bm-dual-pane">
        <div class="bm-left-pane" id="bmLeftPane">
          <div class="bm-pane-label">Folders</div>
          ${leftItems.map((f, idx) => {
            const isActive = f.id === activeFolderId;
            const isSelected = idx === selectedLeft && focusPane === "left";
            const indent = f.depth > 0 ? "sub" : "";
            return `
              <div class="bm-folder-row ${indent} ${isActive ? "active" : ""} ${isSelected && !isActive ? "hovered" : ""}"
                   data-folder-id="${f.id}"
                   data-idx="${idx}">
                <span class="bm-folder-icon">${f.depth > 0 ? "🗂️" : "📁"}</span>
                <span class="bm-folder-name">${escapeHtml(f.title)}</span>
                <span class="bm-folder-badge">${countChildren(f.node)}</span>
              </div>
            `;
          }).join("")}
        </div>

        <div class="bm-right-pane" id="bmRightPane">
          <div class="bm-right-header">
            <div class="bm-right-breadcrumb">
              ${(activeFolderPath || []).map((seg, i, arr) =>
                i < arr.length - 1
                  ? `<span>${escapeHtml(seg)}</span><span style="opacity:0.3;">›</span>`
                  : `<span class="crumb">${escapeHtml(seg)}</span>`
              ).join(" ")}
            </div>
          </div>
          <div class="bm-right-list" id="bmRightList">
            ${renderRightContent()}
          </div>
        </div>
      </div>
    `;

    attachBrowseEvents(container);
    updateHighlight();
  };

  const renderRightContent = () => {
    if (rightItems.length === 0) {
      return `<div class="bm-empty-state"><span class="bm-empty-icon">📂</span><strong>Empty folder</strong></div>`;
    }

    const subfolders = rightItems.filter(i => i.isSubfolder);
    const links = rightItems.filter(i => !i.isSubfolder);
    let html = "";

    if (subfolders.length > 0) {
      html += `<div class="bm-section-label">Folders</div>`;
      html += subfolders.map((f, idx) => {
        const isSelected = rightItems.indexOf(f) === selectedRight && focusPane === "right";
        return `
          <div class="bm-subfolder-card ${isSelected ? "selected" : ""}"
               data-subfolder-id="${f.id}"
               data-right-idx="${rightItems.indexOf(f)}">
            <span style="font-size:1rem;">🗂️</span>
            <span class="bm-subfolder-name">${escapeHtml(f.title)}</span>
            <span class="bm-subfolder-count">${f.count} items</span>
            <span style="font-size:0.75rem; color:rgba(255,255,255,0.3);">›</span>
          </div>
        `;
      }).join("");
    }

    if (links.length > 0) {
      if (subfolders.length > 0) html += `<div class="bm-section-label">Bookmarks</div>`;
      html += links.map(link => {
        const idx = rightItems.indexOf(link);
        const faviconUrl = getFaviconUrl(link.url);
        const host = getHostName(link.url);
        const isSelected = idx === selectedRight && focusPane === "right";
        return `
          <div class="bm-link-item ${isSelected ? "selected" : ""}"
               data-url="${escapeHtml(link.url)}"
               data-right-idx="${idx}">
            <div class="bm-favicon-wrapper">
              ${faviconUrl
                ? `<img src="${faviconUrl}" class="bm-favicon-img" alt=""
                       onerror="this.style.display='none'; this.nextSibling.style.display='inline';" />
                   <span class="bm-favicon-fallback" style="display:none;">🔗</span>`
                : `<span class="bm-favicon-fallback">🔗</span>`}
            </div>
            <div class="bm-link-details">
              <span class="bm-link-title">${escapeHtml(link.title)}</span>
              <span class="bm-link-url">${escapeHtml(host || link.url)}</span>
            </div>
          </div>
        `;
      }).join("");
    }

    return html;
  };

  const attachBrowseEvents = (container) => {
    // Left pane folder click
    container.querySelectorAll(".bm-folder-row").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.dataset.folderId;
        const idx = parseInt(row.dataset.idx, 10);
        const folder = allFolders.find(f => f.id === id);
        if (folder) {
          selectedLeft = idx;
          focusPane = "right";
          selectFolderById(folder.id, folder.title, folder.path);
          selectedRight = rightItems.length > 0 ? 0 : -1;
          updateHighlight();
        }
      });

      row.addEventListener("mouseenter", () => {
        const idx = parseInt(row.dataset.idx, 10);
        if (!isNaN(idx) && focusPane === "left") {
          selectedLeft = idx;
          updateHighlight();
        }
      });
    });

    // Right pane sub-folder click
    container.querySelectorAll(".bm-subfolder-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.subfolderId;
        const item = rightItems.find(r => r.id === id);
        if (item) {
          selectFolderById(id, item.title, item.parentPath);
          // Sync left pane selection
          const leftIdx = leftItems.findIndex(f => f.id === id);
          if (leftIdx >= 0) selectedLeft = leftIdx;
          focusPane = "right";
          selectedRight = 0;
          updateHighlight();
        }
      });

      card.addEventListener("mouseenter", () => {
        const idx = parseInt(card.dataset.rightIdx, 10);
        if (!isNaN(idx)) { selectedRight = idx; focusPane = "right"; updateHighlight(); }
      });
    });

    // Right pane link click
    container.querySelectorAll(".bm-link-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        openUrlInNewTab(item.dataset.url);
      });

      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.dataset.rightIdx, 10);
        if (!isNaN(idx)) { selectedRight = idx; focusPane = "right"; updateHighlight(); }
      });
    });
  };

  /**
   * Search Mode — single-pane flat results
   */
  const renderSearchMode = (query) => {
    const container = document.getElementById("bookmarksContentArea");
    if (!container) return;

    const matches = flatBookmarks.filter(bm =>
      bm.title.toLowerCase().includes(query) ||
      bm.url.toLowerCase().includes(query)
    ).slice(0, 40);

    rightItems = matches.map(bm => ({ ...bm, isSubfolder: false }));
    leftItems = [];

    if (selectedRight >= rightItems.length) selectedRight = rightItems.length - 1;

    container.innerHTML = `
      <div class="bm-search-results" id="bmSearchResults">
        ${matches.length === 0
          ? `<div class="bm-empty-state">
               <span class="bm-empty-icon">🔍</span>
               <strong>No bookmarks found</strong>
             </div>`
          : matches.map((bm, idx) => {
              const faviconUrl = getFaviconUrl(bm.url);
              const host = getHostName(bm.url);
              const isSelected = idx === selectedRight;
              return `
                <div class="bm-link-item ${isSelected ? "selected" : ""}"
                     data-url="${escapeHtml(bm.url)}"
                     data-right-idx="${idx}">
                  <div class="bm-favicon-wrapper">
                    ${faviconUrl
                      ? `<img src="${faviconUrl}" class="bm-favicon-img" alt=""
                             onerror="this.style.display='none'; this.nextSibling.style.display='inline';" />
                         <span class="bm-favicon-fallback" style="display:none;">🔗</span>`
                      : `<span class="bm-favicon-fallback">🔗</span>`}
                  </div>
                  <div class="bm-link-details">
                    <span class="bm-link-title">${escapeHtml(bm.title)}</span>
                    <span class="bm-link-url">${escapeHtml(host)}</span>
                  </div>
                  <span style="font-size:0.65rem; padding:2px 6px; border-radius:4px;
                    background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.4);">
                    📁 ${escapeHtml(bm.folderName)}
                  </span>
                </div>
              `;
            }).join("")
        }
      </div>
    `;

    container.querySelectorAll(".bm-link-item").forEach(item => {
      item.addEventListener("click", (e) => { e.preventDefault(); openUrlInNewTab(item.dataset.url); });
      item.addEventListener("mouseenter", () => {
        const idx = parseInt(item.dataset.rightIdx, 10);
        if (!isNaN(idx)) { selectedRight = idx; updateHighlight(); }
      });
    });

    updateHighlight();
  };

  /* -------------------------------------------------- */

  const updateHighlight = () => {
    const container = document.getElementById("bookmarksContentArea");
    if (!container) return;

    // Left pane highlight (keyboard nav indicator only, not active)
    container.querySelectorAll(".bm-folder-row").forEach((el, idx) => {
      el.classList.toggle("keyboard-focus", idx === selectedLeft && focusPane === "left");
    });

    // Right pane highlight
    const rightEls = container.querySelectorAll(".bm-link-item, .bm-subfolder-card");
    rightEls.forEach((el, idx) => {
      el.classList.toggle("selected", idx === selectedRight && (focusPane === "right" || document.getElementById("bookmarksSearchInput")?.value));
      if (idx === selectedRight) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  /* -------------------------------------------------- */

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const countChildren = (node) => {
    if (!node || !node.children) return 0;
    return node.children.length;
  };

  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  };

  return { init, open, close, toggle, loadBookmarks };
})();
