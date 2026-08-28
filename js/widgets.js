// ==========================================
// WIDGET REGISTRY & DUAL-SLOT WORKSPACE ENGINE
// ==========================================

const WIDGET_REGISTRY = {
  quicknotes: {
    id: "quicknotes",
    name: "Quick Notes",
    icon: "📝",
    desc: "Quick notes & scratchpad",
    render() {
      const saved = localStorage.getItem("quickNotes") || "";
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "quicknotes";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">📝</span>
            Quick Notes
          </div>
          <button class="widget-remove-btn" data-remove="quicknotes" title="Remove widget">✕</button>
        </div>
        <textarea
          id="quickNotesTextarea"
          class="quick-notes-textarea"
          placeholder="Quick ideas, temporary notes..."
          maxlength="1000"
        >${escapeHtml(saved)}</textarea>
        <div class="quick-notes-footer">
          <span class="quick-notes-autosave" id="quickNotesStatus">✓ Saved</span>
          <button class="quick-notes-clear-btn" id="quickNotesClearBtn">Clear all</button>
        </div>
      `;
      return card;
    },
    afterRender() {
      const textarea = document.getElementById("quickNotesTextarea");
      const status = document.getElementById("quickNotesStatus");
      const clearBtn = document.getElementById("quickNotesClearBtn");
      let saveTimer = null;

      if (textarea) {
        textarea.addEventListener("input", () => {
          clearTimeout(saveTimer);
          saveTimer = setTimeout(() => {
            localStorage.setItem("quickNotes", textarea.value);
            if (status) {
              status.classList.add("visible");
              setTimeout(() => status.classList.remove("visible"), 1800);
            }
          }, 600);
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          if (textarea && confirm("Clear all notes?")) {
            textarea.value = "";
            localStorage.removeItem("quickNotes");
            showToast("📝 Quick Notes cleared.", "info", 2000);
          }
        });
      }
    }
  },

  dailyquote: {
    id: "dailyquote",
    name: "Daily Quote",
    icon: "💡",
    desc: "Daily inspiration & quotes",
    quotes: [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
      { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
      { text: "Dream it. Wish it. Do it.", author: "Unknown" },
      { text: "Stay focused, go after your dreams and keep moving toward your goals.", author: "LL Cool J" },
      { text: "Great things never come from comfort zones.", author: "Unknown" },
      { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
      { text: "Work hard in silence, let your success be your noise.", author: "Frank Ocean" },
      { text: "The harder the struggle, the more glorious the triumph.", author: "Unknown" },
      { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
      { text: "Act as if what you do makes a difference. It does.", author: "William James" },
    ],
    getCurrentQuote() {
      const savedIdx = sessionStorage.getItem("dailyQuoteIdx");
      if (savedIdx !== null) return this.quotes[parseInt(savedIdx, 10) % this.quotes.length];
      const dayIdx = new Date().getDate() % this.quotes.length;
      return this.quotes[dayIdx];
    },
    render() {
      const q = this.getCurrentQuote();
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "dailyquote";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">💡</span>
            Daily Quote
          </div>
          <button class="widget-remove-btn" data-remove="dailyquote" title="Remove widget">✕</button>
        </div>
        <div class="quote-text" id="quoteText">${escapeHtml(q.text)}</div>
        <div class="quote-meta">
          <span class="quote-author" id="quoteAuthor">— ${escapeHtml(q.author)}</span>
          <button class="quote-refresh-btn" id="quoteRefreshBtn">↺ New</button>
        </div>
      `;
      return card;
    },
    afterRender() {
      const refreshBtn = document.getElementById("quoteRefreshBtn");
      const quoteText = document.getElementById("quoteText");
      const quoteAuthor = document.getElementById("quoteAuthor");
      if (refreshBtn && quoteText && quoteAuthor) {
        refreshBtn.addEventListener("click", () => {
          const currentIdx = parseInt(sessionStorage.getItem("dailyQuoteIdx") ?? new Date().getDate(), 10);
          const nextIdx = (currentIdx + 1) % this.quotes.length;
          sessionStorage.setItem("dailyQuoteIdx", nextIdx);
          const q = this.quotes[nextIdx];
          quoteText.style.opacity = '0';
          quoteAuthor.style.opacity = '0';
          setTimeout(() => {
            quoteText.textContent = q.text;
            quoteAuthor.textContent = `— ${q.author}`;
            quoteText.style.transition = 'opacity 0.3s ease';
            quoteAuthor.style.transition = 'opacity 0.3s ease';
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
          }, 200);
        });
      }
    }
  },

  focusstats: {
    id: "focusstats",
    name: "Focus Stats",
    icon: "📊",
    desc: "Daily productivity summary",
    render() {
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "focusstats";

      const totalTasks = (typeof todos !== 'undefined') ? todos.length : 0;
      const doneTasks = (typeof todos !== 'undefined') ? todos.filter(t => t.completed).length : 0;
      const totalTracked = (typeof todos !== 'undefined')
        ? todos.reduce((acc, t) => acc + (t.elapsedTime || 0), 0)
        : 0;

      const formatTime = (sec) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
      };

      const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">📊</span>
            Focus Stats
          </div>
          <button class="widget-remove-btn" data-remove="focusstats" title="Remove widget">✕</button>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${doneTasks}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalTasks}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${percent}%</div>
            <div class="stat-label">Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${totalTracked > 0 ? formatTime(totalTracked) : '—'}</div>
            <div class="stat-label">Tracked</div>
          </div>
        </div>
      `;
      return card;
    },
    afterRender() { }
  },

  quicklinks: {
    id: "quicklinks",
    name: "Quick Links",
    icon: "🔗",
    desc: "6 shortcut app tiles with labels",
    large: true, // occupies full column — prevents other widgets alongside

    _storageKey: "quickLinksData",
    _slotCount: 6,
    _modalInitialized: false,

    _defaultLinks() {
      return Array(this._slotCount).fill(null);
    },

    _load() {
      try {
        const raw = localStorage.getItem(this._storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data)) {
            // Pad or trim to current slot count (migration-safe)
            while (data.length < this._slotCount) data.push(null);
            return data.slice(0, this._slotCount);
          }
        }
      } catch (e) { }
      return this._defaultLinks();
    },

    _save(links) {
      localStorage.setItem(this._storageKey, JSON.stringify(links));
    },

    _faviconUrl(url) {
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (e) {
        return null;
      }
    },

    _selectedEmoji: null,

    get _curatedIcons() {
      return typeof CURATED_ICONS !== "undefined" ? CURATED_ICONS : [];
    },

    _renderEmojiGrid(query = "") {
      const grid = document.getElementById("qlEmojiGrid");
      const customRow = document.getElementById("qlCustomEmojiRow");
      if (!grid) return;

      const raw = query.trim();
      const q = raw.toLowerCase();

      // Show custom emoji shortcut button if input is typed/pasted
      if (customRow) {
        if (raw.length > 0) {
          customRow.innerHTML = `
            <button type="button" class="ql-use-custom-btn" id="qlUseCustomBtn">
              ✨ Use "<span class="ql-custom-char">${escapeHtml(raw)}</span>" as icon
            </button>
          `;
          customRow.classList.remove("hidden");
          const customBtn = document.getElementById("qlUseCustomBtn");
          if (customBtn) {
            customBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              this._selectEmoji(raw);
            });
          }
        } else {
          customRow.innerHTML = "";
          customRow.classList.add("hidden");
        }
      }

      // Filter curated icon list
      const filtered = q
        ? this._curatedIcons.filter(item => item.name.includes(q) || item.emoji.includes(q))
        : this._curatedIcons;

      grid.innerHTML = "";
      if (filtered.length === 0) {
        if (raw.length > 0) {
          grid.innerHTML = `<div class="ql-emoji-empty">Press <strong>Enter</strong> or click above to use "${escapeHtml(raw)}"</div>`;
        } else {
          grid.innerHTML = `<div class="ql-emoji-empty">No icons found</div>`;
        }
        return;
      }

      filtered.forEach(item => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `ql-emoji-item${this._selectedEmoji === item.emoji ? " active" : ""}`;
        btn.textContent = item.emoji;
        btn.title = item.name.split(" ")[0];
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._selectEmoji(item.emoji);
        });
        grid.appendChild(btn);
      });
    },

    _selectEmoji(emoji) {
      this._selectedEmoji = emoji || null;
      const preview = document.getElementById("qlSelectedIconPreview");
      const pickerBtn = document.getElementById("qlIconPickerBtn");
      const popover = document.getElementById("qlEmojiPickerPopover");

      if (preview) preview.textContent = emoji || "🌐";
      if (pickerBtn) pickerBtn.classList.toggle("is-custom", !!emoji);
      if (popover) popover.classList.add("hidden");
    },

    openModal(idx, existingData = null) {
      const modal = document.getElementById("quickLinksModal");
      if (!modal) return;

      const titleEl = document.getElementById("qlModalTitle");
      const nameInput = document.getElementById("qlInputName");
      const urlInput = document.getElementById("qlInputUrl");
      const deleteBtn = document.getElementById("qlDeleteBtn");
      const popover = document.getElementById("qlEmojiPickerPopover");

      modal.dataset.slotIdx = idx;
      if (popover) popover.classList.add("hidden");

      if (existingData && existingData.url) {
        if (titleEl) titleEl.textContent = `Edit Shortcut (Slot ${idx + 1})`;
        if (nameInput) nameInput.value = existingData.name || "";
        if (urlInput) urlInput.value = existingData.url || "";
        this._selectEmoji(existingData.emoji || null);
        if (deleteBtn) deleteBtn.classList.remove("hidden");
      } else {
        if (titleEl) titleEl.textContent = `Add Shortcut (Slot ${idx + 1})`;
        if (nameInput) nameInput.value = "";
        if (urlInput) urlInput.value = "";
        this._selectEmoji(null);
        if (deleteBtn) deleteBtn.classList.add("hidden");
      }

      this._initModalListeners();
      modal.classList.remove("hidden");

      setTimeout(() => {
        if (urlInput && !urlInput.value) urlInput.focus();
        else if (nameInput) nameInput.focus();
      }, 100);
    },

    closeModal() {
      const modal = document.getElementById("quickLinksModal");
      const popover = document.getElementById("qlEmojiPickerPopover");
      if (popover) popover.classList.add("hidden");
      if (modal) modal.classList.add("hidden");
    },

    _initModalListeners() {
      if (this._modalInitialized) return;
      this._modalInitialized = true;

      const modal = document.getElementById("quickLinksModal");
      const nameInput = document.getElementById("qlInputName");
      const urlInput = document.getElementById("qlInputUrl");
      const pickerBtn = document.getElementById("qlIconPickerBtn");
      const popover = document.getElementById("qlEmojiPickerPopover");
      const searchInput = document.getElementById("qlEmojiSearchInput");
      const resetFavBtn = document.getElementById("qlResetFaviconBtn");
      const saveBtn = document.getElementById("qlSaveBtn");
      const deleteBtn = document.getElementById("qlDeleteBtn");
      const cancelBtn = document.getElementById("qlCancelBtn");

      // Toggle emoji popover
      if (pickerBtn && popover) {
        pickerBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isHidden = popover.classList.contains("hidden");
          if (isHidden) {
            popover.classList.remove("hidden");
            if (searchInput) {
              searchInput.value = "";
              this._renderEmojiGrid("");
              setTimeout(() => searchInput.focus(), 60);
            }
          } else {
            popover.classList.add("hidden");
          }
        });
      }

      // Search input typing & Enter key support
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          this._renderEmojiGrid(searchInput.value);
        });

        searchInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const val = searchInput.value.trim();
            if (!val) return;

            const grid = document.getElementById("qlEmojiGrid");
            const firstItem = grid ? grid.querySelector(".ql-emoji-item") : null;
            // If there is a matched emoji and it's not a custom literal emoji entered directly
            if (firstItem && !val.match(/\p{Extended_Pictographic}/u)) {
              firstItem.click();
            } else {
              // Direct custom emoji or fallback
              this._selectEmoji(val);
            }
          } else if (e.key === "Escape") {
            if (popover) popover.classList.add("hidden");
          }
        });
      }

      // Reset to auto favicon button
      if (resetFavBtn) {
        resetFavBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._selectEmoji(null);
        });
      }

      // Close popover when clicking elsewhere inside modal
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (!e.target.closest("#qlEmojiPickerPopover") && !e.target.closest("#qlIconPickerBtn")) {
            if (popover) popover.classList.add("hidden");
          }
          if (e.target === modal) this.closeModal();
        });
      }

      const handleSave = () => {
        const idx = parseInt(modal.dataset.slotIdx, 10);
        if (isNaN(idx)) return;

        const url = urlInput.value.trim();
        if (!url) {
          showToast("⚠️ Please enter a website URL.", "warning", 2000);
          urlInput.focus();
          return;
        }

        let fullUrl = url;
        if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
          fullUrl = "https://" + fullUrl;
        }

        let name = nameInput.value.trim();
        if (!name) {
          try {
            name = new URL(fullUrl).hostname.replace(/^www\./, "");
          } catch (e) {
            name = fullUrl;
          }
        }

        const emoji = this._selectedEmoji || null;
        const links = this._load();
        links[idx] = { name, url: fullUrl, emoji };
        this._save(links);
        this.closeModal();
        this._rerender();
        showToast("🔗 Shortcut saved!", "success", 2000);
      };

      if (saveBtn) saveBtn.addEventListener("click", handleSave);
      if (cancelBtn) cancelBtn.addEventListener("click", () => this.closeModal());

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          const idx = parseInt(modal.dataset.slotIdx, 10);
          if (isNaN(idx)) return;
          const links = this._load();
          links[idx] = null;
          this._save(links);
          this.closeModal();
          this._rerender();
          showToast("Shortcut removed.", "info", 2000);
        });
      }

      [nameInput, urlInput].forEach(inp => {
        if (inp) {
          inp.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSave(); }
            else if (e.key === "Escape") this.closeModal();
          });
        }
      });
    },

    _renderSlot(idx, linkData) {
      const slotEl = document.createElement("div");
      slotEl.className = "ql-dock-slot";
      slotEl.dataset.idx = idx;

      const hasLink = linkData && linkData.url;

      // Squircle Tile Button
      const tile = document.createElement("button");
      tile.className = `ql-dock-tile ${hasLink ? "has-link" : "is-empty"}`;
      tile.type = "button";

      // Text Label underneath
      const label = document.createElement("span");
      label.className = "ql-dock-label";

      if (hasLink) {
        // Icon — emoji override or auto favicon
        if (linkData.emoji) {
          const emojiEl = document.createElement("span");
          emojiEl.className = "ql-dock-emoji";
          emojiEl.textContent = linkData.emoji;
          tile.appendChild(emojiEl);
        } else {
          const faviconUrl = this._faviconUrl(linkData.url);
          if (faviconUrl) {
            const img = document.createElement("img");
            img.className = "ql-dock-icon";
            img.src = faviconUrl;
            img.alt = linkData.name || "";
            img.onerror = () => {
              img.remove();
              const fallback = document.createElement("span");
              fallback.className = "ql-dock-emoji";
              fallback.textContent = "🌐";
              tile.appendChild(fallback);
            };
            tile.appendChild(img);
          } else {
            const fallback = document.createElement("span");
            fallback.className = "ql-dock-emoji";
            fallback.textContent = "🌐";
            tile.appendChild(fallback);
          }
        }

        // Label text
        try {
          label.textContent = linkData.name || new URL(linkData.url).hostname.replace(/^www\./, "");
        } catch (e) {
          label.textContent = linkData.name || linkData.url;
        }

        // Delete badge (✕ shown in edit mode)
        const badge = document.createElement("div");
        badge.className = "ql-edit-badge";
        const delBtn = document.createElement("button");
        delBtn.className = "ql-edit-badge-btn";
        delBtn.type = "button";
        delBtn.title = "Remove shortcut";
        delBtn.textContent = "✕";
        badge.appendChild(delBtn);
        tile.appendChild(badge);

        // Delete badge click
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const links = WIDGET_REGISTRY.quicklinks._load();
          links[idx] = null;
          WIDGET_REGISTRY.quicklinks._save(links);
          WIDGET_REGISTRY.quicklinks._rerender();
          showToast("Shortcut removed.", "info", 2000);
        });

        // Tile click: open URL normally; open modal in edit mode
        tile.addEventListener("click", (e) => {
          e.stopPropagation();
          const grid = slotEl.closest(".ql-dock-grid");
          if (grid && grid.classList.contains("edit-mode")) {
            WIDGET_REGISTRY.quicklinks.openModal(idx, linkData);
            return;
          }
          window.open(linkData.url, "_blank", "noopener,noreferrer");
        });

      } else {
        // Empty slot — + icon
        const plusIcon = document.createElement("span");
        plusIcon.className = "ql-dock-empty-icon";
        plusIcon.textContent = "+";
        tile.appendChild(plusIcon);

        label.textContent = "Add";
        label.style.opacity = "0.4";

        tile.addEventListener("click", (e) => {
          e.stopPropagation();
          WIDGET_REGISTRY.quicklinks.openModal(idx, null);
        });
      }

      slotEl.appendChild(tile);
      slotEl.appendChild(label);
      return slotEl;
    },

    _rerenderTimeout: null,
    _rerender() {
      clearTimeout(this._rerenderTimeout);
      this._rerenderTimeout = setTimeout(() => {
        const existing = document.querySelector('.widget-card[data-widget-id="quicklinks"]');
        if (!existing) return;
        const side = existing.dataset.side;
        const index = parseInt(existing.dataset.index, 10);
        const fresh = renderCardForSlot("quicklinks", side, index);
        if (fresh) {
          existing.replaceWith(fresh);
          WIDGET_REGISTRY.quicklinks.afterRender();
        }
      }, 0);
    },

    render() {
      const links = this._load();
      const card = document.createElement("div");
      card.className = "widget-card widget-card-large";
      card.dataset.widgetId = "quicklinks";

      // Header placeholder (populated by renderCardForSlot)
      const header = document.createElement("div");
      header.className = "widget-header";
      card.appendChild(header);

      // App Dock Grid Container (2x3 = 6 slots)
      const grid = document.createElement("div");
      grid.className = "ql-dock-grid";
      grid.id = "qlDockGrid";

      links.forEach((linkData, i) => {
        grid.appendChild(this._renderSlot(i, linkData));
      });

      card.appendChild(grid);
      return card;
    },

    afterRender() {
      const grid = document.getElementById("qlDockGrid");
      if (!grid) return;

      const card = grid.closest(".widget-card");
      if (!card) return;

      // Inject ✎ edit-toggle button into widget-card-actions
      const actionsEl = card.querySelector(".widget-card-actions");
      if (actionsEl && !actionsEl.querySelector(".ql-edit-toggle-btn")) {
        const editToggle = document.createElement("button");
        editToggle.className = "ql-edit-toggle-btn widget-action-btn";
        editToggle.type = "button";
        editToggle.title = "Edit shortcuts";
        editToggle.textContent = "✎";

        editToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          grid.classList.toggle("edit-mode");
          editToggle.classList.toggle("active", grid.classList.contains("edit-mode"));
        });

        const removeBtn = actionsEl.querySelector(".widget-remove-btn");
        if (removeBtn) actionsEl.insertBefore(editToggle, removeBtn);
        else actionsEl.appendChild(editToggle);
      }
    }
  },

  timer: {
    id: "timer",
    name: "Timer Panel",
    icon: "⏱️",
    desc: "Timer & Stopwatch next to todo",
    render() {
      const card = document.createElement("div");
      card.className = "widget-card";
      card.dataset.widgetId = "timer";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">⏱️</span>
            Timer
          </div>
          <button class="widget-remove-btn" data-remove="timer" title="Remove widget">✕</button>
        </div>
        <div style="text-align:center; padding: 8px 0;">
          <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-bottom:8px;">
            Use the ⏱️ button in the bottom right corner for full Timer & Stopwatch.
          </div>
          <div id="widgetTimerDisplay" style="font-size:1.6rem; font-weight:700; letter-spacing:1px; font-family:Arial,sans-serif;">00:00</div>
        </div>
      `;
      return card;
    },
    afterRender() {
      setInterval(() => {
        const globalDisplay = document.getElementById("displayGlobalTime");
        const widgetDisplay = document.getElementById("widgetTimerDisplay");
        if (globalDisplay && widgetDisplay) {
          widgetDisplay.textContent = globalDisplay.textContent.substring(0, 5);
        }
      }, 500);
    }
  },

  somedaybox: {
    id: "somedaybox",
    name: "Someday Box",
    icon: "🌱",
    desc: "Capture ideas & future tasks with reusable tags and 1-click move to today",

    _storageKey: "somedayBoxTasks",
    _tagsKey: "somedayBoxTags",
    _activeFilter: "ALL",
    _selectedTag: "🌱 Someday",

    _defaultTags: ["🌱 Someday", "💡 Idea", "📅 Next Week", "🎯 Project", "📚 Learn"],

    _loadTasks() {
      try {
        const raw = localStorage.getItem(this._storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) { }
      return [];
    },

    _saveTasks(tasks) {
      localStorage.setItem(this._storageKey, JSON.stringify(tasks));
    },

    _loadTags() {
      try {
        const raw = localStorage.getItem(this._tagsKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { }
      return [...this._defaultTags];
    },

    _saveTags(tags) {
      localStorage.setItem(this._tagsKey, JSON.stringify(tags));
    },

    _getTagColorClass(tag = "") {
      const lower = tag.toLowerCase();
      if (lower.includes("idea") || lower.includes("💡")) return "tag-cyan";
      if (lower.includes("learn") || lower.includes("📚")) return "tag-purple";
      if (lower.includes("next") || lower.includes("week") || lower.includes("📅")) return "tag-amber";
      if (lower.includes("project") || lower.includes("🎯")) return "tag-blue";
      return "tag-emerald";
    },

    _renderListHtml() {
      const tasks = this._loadTasks();
      const filtered = this._activeFilter === "ALL"
        ? tasks
        : tasks.filter(t => (t.tag || "🌱 Someday") === this._activeFilter);

      if (filtered.length === 0) {
        return `
          <div class="someday-empty">
            <span class="someday-empty-icon">🌱</span>
            <div class="someday-empty-text">${this._activeFilter === "ALL" ? "No ideas in Someday Box yet.<br>Plant a new idea above!" : `No items tagged "${escapeHtml(this._activeFilter)}"`}</div>
          </div>
        `;
      }

      return filtered.map(t => {
        const tagText = t.tag || "🌱 Someday";
        const colorClass = this._getTagColorClass(tagText); // e.g. "tag-cyan"
        const borderClass = colorClass.replace('tag-', 'border-');
        const textClass = colorClass.replace('tag-', 'text-');

        return `
          <div class="someday-item ${borderClass}" draggable="true" data-id="${t.id}">
            <div class="someday-item-content">
              <span class="someday-item-text" title="${escapeHtml(t.text)}">${escapeHtml(t.text)}</span>
              <span class="someday-item-tag-text ${textClass}">${escapeHtml(tagText)}</span>
            </div>
            <div class="someday-actions">
              <button type="button" class="someday-action-btn move-btn" data-action="move" data-id="${t.id}" title="Move to Today's Todo List">🚀</button>
              <button type="button" class="someday-action-btn edit-btn" data-action="edit" data-id="${t.id}" title="Edit item">✏️</button>
              <button type="button" class="someday-action-btn delete-btn" data-action="delete" data-id="${t.id}" title="Delete item">✕</button>
            </div>
          </div>
        `;
      }).join("");
    },

    _renderTagSelectorHtml() {
      const tags = this._loadTags();
      return `
        <div class="someday-tag-chip-bar" id="somedayTagChipBar">
          ${tags.map(tag => {
        const isSelected = tag === this._selectedTag;
        const colorClass = isSelected ? this._getTagColorClass(tag) : "";
        return `
              <button type="button" class="someday-tag-chip ${colorClass} ${isSelected ? 'active' : ''}" data-tag="${escapeHtml(tag)}" title="Tag: ${escapeHtml(tag)}">
                <span>${escapeHtml(tag)}</span>
              </button>
            `;
      }).join("")}
          <button type="button" class="someday-tag-chip-add" id="somedayAddCustomTagBtn" title="Create new tag">+</button>
        </div>
      `;
    },

    render() {
      const tasks = this._loadTasks();
      const tags = this._loadTags();
      if (!tags.includes(this._selectedTag)) {
        this._selectedTag = tags[0] || "🌱 Someday";
      }

      const card = document.createElement("div");
      card.className = "widget-card someday-widget-card";
      card.dataset.widgetId = "somedaybox";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">🌱</span>
            Someday Box
            <span class="someday-count-badge" id="somedayCountBadge">${tasks.length}</span>
          </div>
          <button class="widget-remove-btn" data-remove="somedaybox" title="Remove widget">✕</button>
        </div>

        <div class="someday-input-container">
          <div class="someday-input-row">
            <input
              type="text"
              id="somedayInput"
              class="someday-input"
              placeholder="Add idea or future task..."
              maxlength="120"
            />
            <button type="button" id="somedayAddBtn" class="someday-add-btn" title="Add to Someday Box">+</button>
          </div>
          <div id="somedayTagSelectorContainer">
            ${this._renderTagSelectorHtml()}
          </div>
        </div>

        <div class="someday-list" id="somedayList">
          ${this._renderListHtml()}
        </div>

        <div class="someday-footer">
          <span class="someday-footer-stats" id="somedayFooterStats">${tasks.length} item${tasks.length === 1 ? '' : 's'} in backlog</span>
          ${tasks.length > 0 ? `<button type="button" class="someday-clear-all-btn" id="somedayClearAllBtn">Clear All</button>` : ''}
        </div>
      `;
      return card;
    },

    _updateView() {
      const listEl = document.getElementById("somedayList");
      const badgeEl = document.getElementById("somedayCountBadge");
      const statsEl = document.getElementById("somedayFooterStats");
      const tagContainer = document.getElementById("somedayTagSelectorContainer");

      const tasks = this._loadTasks();
      if (listEl) listEl.innerHTML = this._renderListHtml();
      if (badgeEl) badgeEl.textContent = tasks.length;
      if (statsEl) statsEl.textContent = `${tasks.length} item${tasks.length === 1 ? '' : 's'} in backlog`;
      if (tagContainer) tagContainer.innerHTML = this._renderTagSelectorHtml();

      const footer = document.querySelector(".someday-footer");
      if (footer) {
        let existingClear = document.getElementById("somedayClearAllBtn");
        if (tasks.length > 0) {
          if (!existingClear) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "someday-clear-all-btn";
            btn.id = "somedayClearAllBtn";
            btn.textContent = "Clear All";
            btn.addEventListener("click", () => this._handleClearAll());
            footer.appendChild(btn);
          }
        } else if (existingClear) {
          existingClear.remove();
        }
      }
    },

    _handleClearAll() {
      const tasks = this._loadTasks();
      if (tasks.length === 0) return;
      if (confirm(`Clear all ${tasks.length} items from Someday Box?`)) {
        this._saveTasks([]);
        this._updateView();
        showToast("🌱 Someday Box cleared.", "info", 2500);
      }
    },

    afterRender() {
      const input = document.getElementById("somedayInput");
      const addBtn = document.getElementById("somedayAddBtn");
      const tagContainer = document.getElementById("somedayTagSelectorContainer");
      const listEl = document.getElementById("somedayList");
      const clearBtn = document.getElementById("somedayClearAllBtn");

      const handleAdd = () => {
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const tasks = this._loadTasks();
        const newTask = {
          id: Date.now(),
          text: text,
          tag: this._selectedTag || "🌱 Someday",
          createdAt: Date.now(),
        };

        tasks.unshift(newTask);
        this._saveTasks(tasks);
        input.value = "";
        this._updateView();
        showToast("🌱 Added to Someday Box!", "success", 2000);
      };

      if (addBtn) addBtn.onclick = handleAdd;
      if (input) {
        input.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        };
      }

      if (clearBtn) {
        clearBtn.onclick = () => this._handleClearAll();
      }

      // Tag Chip Selection & New Tag Addition
      if (tagContainer) {
        tagContainer.onclick = (e) => {
          const addCustomBtn = e.target.closest("#somedayAddCustomTagBtn");
          if (addCustomBtn) {
            const newTagName = prompt("Enter new tag name (e.g. 🎨 Design, ⚡ High):");
            if (newTagName && newTagName.trim()) {
              const trimmed = newTagName.trim();
              const tags = this._loadTags();
              if (!tags.includes(trimmed)) {
                tags.push(trimmed);
                this._saveTags(tags);
              }
              this._selectedTag = trimmed;
              this._updateView();
              showToast(`🏷️ Tag "${trimmed}" created!`, "success", 2000);
            }
            return;
          }

          const chip = e.target.closest(".someday-tag-chip");
          if (chip && chip.dataset.tag) {
            this._selectedTag = chip.dataset.tag;
            this._updateView();
          }
        };
      }

      // List Item Actions: Move, Edit, Delete
      if (listEl) {
        listEl.onclick = (e) => {
          const btn = e.target.closest(".someday-action-btn");
          if (!btn) return;
          const action = btn.dataset.action;
          const id = Number(btn.dataset.id);
          const tasks = this._loadTasks();
          const task = tasks.find(t => t.id === id);
          if (!task) return;

          if (action === "move") {
            if (typeof addTodo === "function") {
              addTodo(task.text);
            } else if (typeof todos !== "undefined" && Array.isArray(todos)) {
              todos.push({
                id: Date.now(),
                text: task.text,
                completed: false,
                subtasks: [],
                isExpanded: false
              });
              if (typeof saveTodos === "function") saveTodos();
              if (typeof renderTodos === "function") renderTodos();
            }

            const updated = tasks.filter(t => t.id !== id);
            this._saveTasks(updated);
            this._updateView();
            showToast(`🚀 Moved "${task.text}" to Today's Tasks!`, "success", 2500);
          } else if (action === "edit") {
            const newText = prompt("Edit someday task:", task.text);
            if (newText !== null && newText.trim()) {
              task.text = newText.trim();
              this._saveTasks(tasks);
              this._updateView();
              showToast("✏️ Item updated.", "success", 2000);
            }
          } else if (action === "delete") {
            const updated = tasks.filter(t => t.id !== id);
            this._saveTasks(updated);
            this._updateView();
            showToast("🗑️ Item removed.", "info", 2000);
          }
        };

        // Drag & Drop reordering for Someday tasks
        let draggedId = null;

        listEl.addEventListener("dragstart", (e) => {
          const item = e.target.closest(".someday-item");
          if (!item || e.target.closest(".someday-action-btn")) {
            e.preventDefault();
            return;
          }
          e.stopPropagation();
          draggedId = Number(item.dataset.id);
          item.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.dataset.id);
        });

        listEl.addEventListener("dragend", (e) => {
          const item = e.target.closest(".someday-item");
          if (item) item.classList.remove("dragging");
          listEl.querySelectorAll(".someday-item").forEach(el => el.classList.remove("drag-over"));
          draggedId = null;
        });

        listEl.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });

        listEl.addEventListener("dragenter", (e) => {
          const item = e.target.closest(".someday-item");
          if (item && Number(item.dataset.id) !== draggedId) {
            item.classList.add("drag-over");
          }
        });

        listEl.addEventListener("dragleave", (e) => {
          const item = e.target.closest(".someday-item");
          if (item && !item.contains(e.relatedTarget)) {
            item.classList.remove("drag-over");
          }
        });

        listEl.addEventListener("drop", (e) => {
          e.preventDefault();
          const targetItem = e.target.closest(".someday-item");
          if (!targetItem) return;
          targetItem.classList.remove("drag-over");

          const targetId = Number(targetItem.dataset.id);
          const sourceId = draggedId || Number(e.dataTransfer.getData("text/plain"));
          if (!sourceId || sourceId === targetId) return;

          const tasks = this._loadTasks();
          const fromIndex = tasks.findIndex(t => t.id === sourceId);
          const toIndex = tasks.findIndex(t => t.id === targetId);

          if (fromIndex !== -1 && toIndex !== -1) {
            const [movedItem] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, movedItem);
            this._saveTasks(tasks);
            this._updateView();
          }
        });
      }
    }
  },

  dailylearning: {
    id: "dailylearning",
    name: "Daily Learning Log",
    icon: "🧠",
    desc: "Log insights, new concepts & quotes with Obsidian export",

    _storageKey: "dailyLearningData",
    _tagsKey: "dailyLearningTags",
    _activeFilter: "ALL",
    _selectedTag: "🧠 TIL",

    _defaultTags: ["🧠 TIL", "💡 Insight", "📖 Quote", "✨ Term", "🛠️ Method"],

    _getPlaceholderForTag(tag = "") {
      const lower = tag.toLowerCase();
      if (lower.includes("til") || lower.includes("🧠")) return "Today I learned...";
      if (lower.includes("insight") || lower.includes("💡") || lower.includes("realiz")) return "I just realized that...";
      if (lower.includes("quote") || lower.includes("kutipan") || lower.includes("📖")) return "A quote or idea that resonated today...";
      if (lower.includes("term") || lower.includes("istilah") || lower.includes("diksi") || lower.includes("✨")) return "A new word, term, or concept defined...";
      if (lower.includes("method") || lower.includes("metode") || lower.includes("technique") || lower.includes("skill") || lower.includes("🛠️")) return "A useful workflow, command, or technique...";
      return `Log what you learned for ${tag}...`;
    },

    _loadLearnings() {
      try {
        let raw = localStorage.getItem(this._storageKey);
        if (!raw) {
          const oldRaw = localStorage.getItem("dailySparksData");
          if (oldRaw) {
            raw = oldRaw;
            localStorage.setItem(this._storageKey, oldRaw);
            localStorage.removeItem("dailySparksData");
          }
        }
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) { }
      return [];
    },

    _saveLearnings(items) {
      localStorage.setItem(this._storageKey, JSON.stringify(items));
    },

    _loadTags() {
      try {
        let raw = localStorage.getItem(this._tagsKey);
        if (!raw) {
          const oldTags = localStorage.getItem("dailySparksTags");
          if (oldTags) {
            raw = oldTags;
            localStorage.setItem(this._tagsKey, oldTags);
            localStorage.removeItem("dailySparksTags");
          }
        }
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { }
      return [...this._defaultTags];
    },

    _saveTags(tags) {
      localStorage.setItem(this._tagsKey, JSON.stringify(tags));
    },

    _getTagColorClass(tag = "") {
      const lower = tag.toLowerCase();
      if (lower.includes("til") || lower.includes("🧠")) return "learning-tag-cyan";
      if (lower.includes("insight") || lower.includes("💡") || lower.includes("realiz")) return "learning-tag-amber";
      if (lower.includes("quote") || lower.includes("kutipan") || lower.includes("📖")) return "learning-tag-purple";
      if (lower.includes("term") || lower.includes("istilah") || lower.includes("diksi") || lower.includes("✨")) return "learning-tag-rose";
      if (lower.includes("method") || lower.includes("metode") || lower.includes("technique") || lower.includes("skill") || lower.includes("🛠️")) return "learning-tag-emerald";
      return "learning-tag-slate";
    },

    _renderListHtml() {
      const items = this._loadLearnings();
      const filtered = this._activeFilter === "ALL"
        ? items
        : items.filter(s => (s.tag || "🧠 TIL") === this._activeFilter);

      if (filtered.length === 0) {
        return `
          <div class="learning-empty">
            <span class="learning-empty-icon">🌱</span>
            <div class="learning-empty-title">Nothing logged today yet</div>
            <div class="learning-empty-text">Spend 5 mins reading or exploring something new.<br>What's one thing you discovered today?</div>
          </div>
        `;
      }

      return filtered.map(item => {
        const tagText = item.tag || "🧠 TIL";
        const colorClass = this._getTagColorClass(tagText);
        const borderClass = colorClass.replace('learning-tag-', 'learning-border-');
        const textClass = colorClass.replace('learning-tag-', 'learning-text-');

        return `
          <div class="learning-item ${borderClass}" draggable="true" data-id="${item.id}">
            <div class="learning-item-content">
              <span class="learning-item-text" title="${escapeHtml(item.text)}">${escapeHtml(item.text)}</span>
              <div class="learning-item-meta">
                <span class="learning-item-tag-text ${textClass}">${escapeHtml(tagText)}</span>
                ${item.createdAt ? `<span class="learning-item-time">${escapeHtml(item.createdAt)}</span>` : ''}
              </div>
            </div>
            <div class="learning-actions">
              <button type="button" class="learning-action-btn copy-btn" data-action="copy" data-id="${item.id}" title="Copy Markdown">📋</button>
              <button type="button" class="learning-action-btn edit-btn" data-action="edit" data-id="${item.id}" title="Edit entry">✏️</button>
              <button type="button" class="learning-action-btn delete-btn" data-action="delete" data-id="${item.id}" title="Delete entry">✕</button>
            </div>
          </div>
        `;
      }).join("");
    },

    _renderTagSelectorHtml() {
      const tags = this._loadTags();
      return `
        <div class="learning-tag-chip-bar" id="learningTagChipBar">
          ${tags.map(tag => {
        const isSelected = tag === this._selectedTag;
        const colorClass = isSelected ? this._getTagColorClass(tag) : "";
        return `
              <button type="button" class="learning-tag-chip ${colorClass} ${isSelected ? 'active' : ''}" data-tag="${escapeHtml(tag)}" title="Tag: ${escapeHtml(tag)}">
                <span>${escapeHtml(tag)}</span>
              </button>
            `;
      }).join("")}
          <button type="button" class="learning-tag-chip-add" id="learningAddCustomTagBtn" title="Add new category">+</button>
        </div>
      `;
    },

    _renderFilterPillsHtml() {
      const items = this._loadLearnings();
      const tags = this._loadTags();
      const usedTags = tags.filter(t => items.some(s => (s.tag || "🧠 TIL") === t));

      if (items.length === 0 || usedTags.length === 0) {
        return "";
      }

      return `
        <div class="learning-filter-bar" id="learningFilterBar">
          <button type="button" class="learning-filter-chip ${this._activeFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">All (${items.length})</button>
          ${usedTags.map(tag => {
        const count = items.filter(s => (s.tag || "🧠 TIL") === tag).length;
        const isActive = this._activeFilter === tag;
        const colorClass = this._getTagColorClass(tag);
        return `
              <button type="button" class="learning-filter-chip ${colorClass} ${isActive ? 'active' : ''}" data-filter="${escapeHtml(tag)}">
                ${escapeHtml(tag)} (${count})
              </button>
            `;
      }).join("")}
        </div>
      `;
    },

    _formatObsidianMarkdown() {
      const items = this._loadLearnings();
      if (items.length === 0) return null;
      const today = new Date().toISOString().split("T")[0];
      let md = `### 🧠 Daily Learning Log (${today})\n\n`;
      items.forEach(item => {
        const cleanTag = (item.tag || "TIL")
          .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        const tagSlug = cleanTag ? ` #${cleanTag}` : "";
        md += `- **${(item.tag || "TIL").replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim()}**: ${item.text}${tagSlug}\n`;
      });
      return md;
    },

    render() {
      const items = this._loadLearnings();
      const tags = this._loadTags();
      if (!tags.includes(this._selectedTag)) {
        this._selectedTag = tags[0] || "🧠 TIL";
      }

      const hasLearned = items.length > 0;
      const statusBadgeHtml = hasLearned
        ? `<span class="learning-status-badge completed" id="learningStatusBadge">✓ ${items.length} Learned</span>`
        : `<span class="learning-status-badge pending" id="learningStatusBadge">⏳ Not learned yet</span>`;

      const currentPlaceholder = this._getPlaceholderForTag(this._selectedTag);

      const card = document.createElement("div");
      card.className = "widget-card learning-widget-card";
      card.dataset.widgetId = "dailylearning";
      card.innerHTML = `
        <div class="widget-header">
          <div class="widget-title">
            <span class="widget-title-icon">🧠</span>
            Learning Log
            ${statusBadgeHtml}
          </div>
          <button class="widget-remove-btn" data-remove="dailylearning" title="Remove widget">✕</button>
        </div>

        <div class="learning-input-container">
          <div class="learning-input-row">
            <input
              type="text"
              id="learningInput"
              class="learning-input"
              placeholder="${escapeHtml(currentPlaceholder)}"
              maxlength="160"
            />
            <button type="button" id="learningAddBtn" class="learning-add-btn" title="Save learning">+</button>
          </div>
          <div id="learningTagSelectorContainer">
            ${this._renderTagSelectorHtml()}
          </div>
        </div>

        <div id="learningFilterContainer">
          ${this._renderFilterPillsHtml()}
        </div>

        <div class="learning-list" id="learningList">
          ${this._renderListHtml()}
        </div>

        <div class="learning-footer">
          <button type="button" class="learning-obsidian-btn" id="learningExportObsidianBtn" title="Copy all learnings in Obsidian markdown">
            📋 Copy
          </button>
          <span class="learning-footer-count" id="learningFooterCount">${items.length} ${items.length === 1 ? 'learning' : 'learnings'}</span>
        </div>
      `;
      return card;
    },

    _updateTagChipsSelection() {
      const bar = document.getElementById("learningTagChipBar");
      if (!bar) return;
      bar.querySelectorAll(".learning-tag-chip").forEach(chip => {
        const tag = chip.dataset.tag;
        const isSelected = tag === this._selectedTag;
        chip.classList.toggle("active", isSelected);
        chip.classList.remove("learning-tag-cyan", "learning-tag-amber", "learning-tag-purple", "learning-tag-rose", "learning-tag-emerald", "learning-tag-slate");
        if (isSelected) {
          chip.classList.add(this._getTagColorClass(tag));
        }
      });
    },

    _updateView(rebuildTags = false) {
      const listEl = document.getElementById("learningList");
      const statusBadge = document.getElementById("learningStatusBadge");
      const footerCountEl = document.getElementById("learningFooterCount");
      const filterContainer = document.getElementById("learningFilterContainer");
      const tagContainer = document.getElementById("learningTagSelectorContainer");
      const input = document.getElementById("learningInput");

      const items = this._loadLearnings();
      if (listEl) listEl.innerHTML = this._renderListHtml();
      if (statusBadge) {
        if (items.length > 0) {
          statusBadge.className = "learning-status-badge completed";
          statusBadge.textContent = `✓ ${items.length} Learned`;
        } else {
          statusBadge.className = "learning-status-badge pending";
          statusBadge.textContent = `⏳ Not learned yet`;
        }
      }
      if (footerCountEl) footerCountEl.textContent = `${items.length} ${items.length === 1 ? 'learning' : 'learnings'}`;
      if (filterContainer) filterContainer.innerHTML = this._renderFilterPillsHtml();

      if (rebuildTags && tagContainer) {
        const prevBar = document.getElementById("learningTagChipBar");
        const prevScroll = prevBar ? prevBar.scrollLeft : 0;
        tagContainer.innerHTML = this._renderTagSelectorHtml();
        const newBar = document.getElementById("learningTagChipBar");
        if (newBar) newBar.scrollLeft = prevScroll;
      } else {
        this._updateTagChipsSelection();
      }

      if (input && !input.value) {
        input.placeholder = this._getPlaceholderForTag(this._selectedTag);
      }

      const footer = document.querySelector(".learning-footer");
      if (footer) {
        let existingClear = document.getElementById("learningClearAllBtn");
        if (items.length > 0) {
          if (!existingClear) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "learning-clear-all-btn";
            btn.id = "learningClearAllBtn";
            btn.textContent = "Clear All";
            btn.title = "Clear all learning entries";
            btn.addEventListener("click", () => this._handleClearAll());
            footer.appendChild(btn);
          }
        } else if (existingClear) {
          existingClear.remove();
        }
      }
    },

    _handleClearAll() {
      const items = this._loadLearnings();
      if (items.length === 0) return;
      if (confirm(`Clear all ${items.length} entries from Daily Learning Log?`)) {
        this._saveLearnings([]);
        this._updateView(false);
        showToast("🧠 Learning Log cleared.", "info", 2500);
      }
    },

    afterRender() {
      const input = document.getElementById("learningInput");
      const addBtn = document.getElementById("learningAddBtn");
      const tagContainer = document.getElementById("learningTagSelectorContainer");
      const filterContainer = document.getElementById("learningFilterContainer");
      const listEl = document.getElementById("learningList");
      const exportObsidianBtn = document.getElementById("learningExportObsidianBtn");
      const clearBtn = document.getElementById("learningClearAllBtn");

      const handleAdd = () => {
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const items = this._loadLearnings();
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newItem = {
          id: Date.now(),
          text: text,
          tag: this._selectedTag || "🧠 TIL",
          createdAt: timeStr,
          date: now.toISOString().split("T")[0]
        };

        items.unshift(newItem);
        this._saveLearnings(items);
        input.value = "";
        input.placeholder = this._getPlaceholderForTag(this._selectedTag);
        this._updateView(false);
        showToast("🎉 Great! 1 new insight logged today.", "success", 2500);
      };

      if (addBtn) addBtn.onclick = handleAdd;
      if (input) {
        input.onkeydown = (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        };
      }

      if (clearBtn) {
        clearBtn.onclick = () => this._handleClearAll();
      }

      // Obsidian Export
      if (exportObsidianBtn) {
        exportObsidianBtn.onclick = () => {
          const md = this._formatObsidianMarkdown();
          if (!md) {
            showToast("⚠️ No learning entries to export yet.", "info", 2000);
            return;
          }
          navigator.clipboard.writeText(md).then(() => {
            const originalText = exportObsidianBtn.innerHTML;
            exportObsidianBtn.innerHTML = "✅ Copied!";
            setTimeout(() => {
              exportObsidianBtn.innerHTML = originalText;
            }, 1800);
            showToast("📋 Copied Daily Learning Log to Obsidian!", "success", 2500);
          }).catch(() => {
            showToast("❌ Failed to copy to clipboard.", "danger", 2500);
          });
        };
      }

      // Tag Selector Click & Dynamic Placeholder Update
      if (tagContainer) {
        tagContainer.onclick = (e) => {
          const addCustomBtn = e.target.closest("#learningAddCustomTagBtn");
          if (addCustomBtn) {
            const newTagName = prompt("Enter new category name (e.g. 🔬 Research, ⚡ Mindset):");
            if (newTagName && newTagName.trim()) {
              const trimmed = newTagName.trim();
              const tags = this._loadTags();
              if (!tags.includes(trimmed)) {
                tags.push(trimmed);
                this._saveTags(tags);
              }
              this._selectedTag = trimmed;
              this._updateView(true);
              if (input) {
                input.placeholder = this._getPlaceholderForTag(this._selectedTag);
                input.focus();
              }
              const newlyAddedChip = tagContainer.querySelector(`[data-tag="${CSS.escape ? CSS.escape(trimmed) : trimmed}"]`);
              if (newlyAddedChip) {
                newlyAddedChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }
              showToast(`🏷️ Category "${trimmed}" created!`, "success", 2000);
            }
            return;
          }

          const chip = e.target.closest(".learning-tag-chip");
          if (chip && chip.dataset.tag) {
            this._selectedTag = chip.dataset.tag;
            this._updateView(false);
            chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            if (input) {
              input.placeholder = this._getPlaceholderForTag(this._selectedTag);
              input.focus();
            }
          }
        };
      }

      // Tag Filter Click
      if (filterContainer) {
        filterContainer.onclick = (e) => {
          const chip = e.target.closest(".learning-filter-chip");
          if (chip && chip.dataset.filter) {
            this._activeFilter = chip.dataset.filter;
            this._updateView();
          }
        };
      }

      // List Item Actions: Copy individual, Edit, Delete
      if (listEl) {
        listEl.onclick = (e) => {
          const btn = e.target.closest(".learning-action-btn");
          if (!btn) return;
          const action = btn.dataset.action;
          const id = Number(btn.dataset.id);
          const items = this._loadLearnings();
          const item = items.find(s => s.id === id);
          if (!item) return;

          if (action === "copy") {
            const cleanTag = (item.tag || "TIL")
              .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "-");
            const tagSlug = cleanTag ? ` #${cleanTag}` : "";
            const itemMd = `- **${(item.tag || "TIL").replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim()}**: ${item.text}${tagSlug}`;
            navigator.clipboard.writeText(itemMd).then(() => {
              showToast("📋 Entry copied to clipboard!", "success", 2000);
            });
          } else if (action === "edit") {
            const newText = prompt("Edit learning:", item.text);
            if (newText !== null && newText.trim()) {
              item.text = newText.trim();
              this._saveLearnings(items);
              this._updateView();
              showToast("✏️ Entry updated.", "success", 2000);
            }
          } else if (action === "delete") {
            const updated = items.filter(s => s.id !== id);
            this._saveLearnings(updated);
            this._updateView();
            showToast("🗑️ Entry removed.", "info", 2000);
          }
        };

        // Drag & Drop reordering for Daily Learnings
        let draggedId = null;

        listEl.addEventListener("dragstart", (e) => {
          const item = e.target.closest(".learning-item");
          if (!item || e.target.closest(".learning-action-btn")) {
            e.preventDefault();
            return;
          }
          e.stopPropagation();
          draggedId = Number(item.dataset.id);
          item.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.dataset.id);
        });

        listEl.addEventListener("dragend", (e) => {
          const item = e.target.closest(".learning-item");
          if (item) item.classList.remove("dragging");
          listEl.querySelectorAll(".learning-item").forEach(el => el.classList.remove("drag-over"));
          draggedId = null;
        });

        listEl.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        });

        listEl.addEventListener("dragenter", (e) => {
          const item = e.target.closest(".learning-item");
          if (item && Number(item.dataset.id) !== draggedId) {
            item.classList.add("drag-over");
          }
        });

        listEl.addEventListener("dragleave", (e) => {
          const item = e.target.closest(".learning-item");
          if (item && !item.contains(e.relatedTarget)) {
            item.classList.remove("drag-over");
          }
        });

        listEl.addEventListener("drop", (e) => {
          e.preventDefault();
          const targetItem = e.target.closest(".learning-item");
          if (!targetItem) return;
          targetItem.classList.remove("drag-over");

          const targetId = Number(targetItem.dataset.id);
          const sourceId = draggedId || Number(e.dataTransfer.getData("text/plain"));
          if (!sourceId || sourceId === targetId) return;

          const items = this._loadLearnings();
          const fromIndex = items.findIndex(s => s.id === sourceId);
          const toIndex = items.findIndex(s => s.id === targetId);

          if (fromIndex !== -1 && toIndex !== -1) {
            const [movedItem] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, movedItem);
            this._saveLearnings(items);
            this._updateView();
          }
        });
      }
    }
  }
};

const MAX_WIDGETS = 4;
const MAX_WIDGETS_PER_SIDE = 2;
let targetAddSide = "right";
let draggedWidgetInfo = null;

function renderWidgets() {
  const colLeft = document.getElementById("widgetColumnLeft");
  const colRight = document.getElementById("widgetColumnRight");
  const addBtnLeft = document.getElementById("addWidgetBtnLeft");
  const addBtnRight = document.getElementById("addWidgetBtnRight");

  if (!colLeft || !colRight) return;

  if (!appSettings) appSettings = loadSettings();
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  if (!Array.isArray(appSettings.widgetSlots.left)) appSettings.widgetSlots.left = [];
  if (!Array.isArray(appSettings.widgetSlots.right)) appSettings.widgetSlots.right = [];

  // Sanitize slots: migrate legacy IDs and purge unknown/orphan IDs
  const sanitizeSlots = (slots) => {
    return slots
      .map(id => (id === "dailysparks" ? "dailylearning" : id))
      .filter(id => Boolean(WIDGET_REGISTRY[id]));
  };

  const cleanLeft = sanitizeSlots(appSettings.widgetSlots.left);
  const cleanRight = sanitizeSlots(appSettings.widgetSlots.right);

  if (
    cleanLeft.length !== appSettings.widgetSlots.left.length ||
    cleanRight.length !== appSettings.widgetSlots.right.length ||
    cleanLeft.some((id, i) => id !== appSettings.widgetSlots.left[i]) ||
    cleanRight.some((id, i) => id !== appSettings.widgetSlots.right[i])
  ) {
    appSettings.widgetSlots.left = cleanLeft;
    appSettings.widgetSlots.right = cleanRight;
    if (typeof saveSettings === "function") saveSettings();
  }

  colLeft.querySelectorAll(".widget-card").forEach(el => el.remove());
  colRight.querySelectorAll(".widget-card").forEach(el => el.remove());

  appSettings.widgetSlots.left.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "left", index);
    if (card && addBtnLeft) colLeft.insertBefore(card, addBtnLeft);
  });

  appSettings.widgetSlots.right.forEach((widgetId, index) => {
    const card = renderCardForSlot(widgetId, "right", index);
    if (card && addBtnRight) colRight.insertBefore(card, addBtnRight);
  });

  setupColumnDropTarget(colLeft, "left");
  setupColumnDropTarget(colRight, "right");

  [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right].forEach(widgetId => {
    const def = WIDGET_REGISTRY[widgetId];
    if (def && def.afterRender) def.afterRender();
  });

  if (addBtnLeft) {
    const hasLargeLeft = appSettings.widgetSlots.left.some(id => WIDGET_REGISTRY[id]?.large);
    const isFull = appSettings.widgetSlots.left.length >= MAX_WIDGETS_PER_SIDE || hasLargeLeft;
    const isEmpty = appSettings.widgetSlots.left.length === 0;
    addBtnLeft.classList.toggle("hidden", isFull);
    addBtnLeft.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnLeft.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Left Widget" : "More Widgets";
  }

  if (addBtnRight) {
    const hasLargeRight = appSettings.widgetSlots.right.some(id => WIDGET_REGISTRY[id]?.large);
    const isFull = appSettings.widgetSlots.right.length >= MAX_WIDGETS_PER_SIDE || hasLargeRight;
    const isEmpty = appSettings.widgetSlots.right.length === 0;
    addBtnRight.classList.toggle("hidden", isFull);
    addBtnRight.classList.toggle("empty-column-btn", isEmpty);
    const label = addBtnRight.querySelector(".add-widget-label");
    if (label) label.textContent = isEmpty ? "Right Widget" : "More Widgets";
  }

  if (typeof renderSettingsWidgetList === "function") {
    renderSettingsWidgetList();
  }
}

function renderCardForSlot(widgetId, side, index) {
  const def = WIDGET_REGISTRY[widgetId];
  if (!def) return null;
  const card = def.render();
  card.dataset.widgetId = widgetId;
  card.dataset.side = side;
  card.dataset.index = index;

  const isCollapsed = typeof isWidgetCollapsed === "function" ? isWidgetCollapsed(widgetId) : false;
  if (isCollapsed) {
    card.classList.add("is-collapsed");
  }

  const header = card.querySelector(".widget-header");
  if (header) {
    const otherSide = side === "left" ? "right" : "left";
    const sameColCount = appSettings.widgetSlots[side].length;

    header.innerHTML = `
      <div class="widget-title" title="Click to minimize/expand widget">
        <span class="widget-drag-handle" title="Drag & Drop to move/swap position">⣿</span>
        <span class="widget-title-icon">${def.icon}</span>
        ${escapeHtml(def.name)}
      </div>
      <div class="widget-card-actions">
        <button class="widget-action-btn widget-collapse-btn" data-side="${side}" data-idx="${index}" data-widget-id="${widgetId}" title="${isCollapsed ? "Expand widget" : "Minimize widget"}">${isCollapsed ? "+" : "─"}</button>
        ${sameColCount > 1 ? `<button class="widget-action-btn move-updown-btn" data-side="${side}" data-idx="${index}" title="Swap top/bottom position">⇅</button>` : ''}
        <button class="widget-action-btn move-side-btn" data-side="${side}" data-idx="${index}" title="Move to ${otherSide === 'left' ? 'left' : 'right'} side">⇄</button>
        <button class="widget-action-btn widget-remove-btn" data-side="${side}" data-widget-id="${widgetId}" title="Remove widget">✕</button>
      </div>
    `;

    const collapseBtn = header.querySelector(".widget-collapse-btn");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const nowCollapsed = typeof toggleWidgetCollapsed === "function" ? toggleWidgetCollapsed(widgetId) : card.classList.toggle("is-collapsed");
        card.classList.toggle("is-collapsed", nowCollapsed);
        collapseBtn.textContent = nowCollapsed ? "+" : "─";
        collapseBtn.title = nowCollapsed ? "Expand widget" : "Minimize widget";
      });
    }

    const titleEl = header.querySelector(".widget-title");
    if (titleEl) {
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("click", (e) => {
        if (e.target.closest(".widget-drag-handle")) return;
        if (collapseBtn) collapseBtn.click();
      });
    }

    const removeBtn = header.querySelector(".widget-remove-btn");
    if (removeBtn) removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeWidget(widgetId);
    });

    const moveSideBtn = header.querySelector(".move-side-btn");
    if (moveSideBtn) moveSideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveWidgetToOtherSide(side, index);
    });

    const moveUpDownBtn = header.querySelector(".move-updown-btn");
    if (moveUpDownBtn) moveUpDownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      swapWidgetUpDown(side, index);
    });

    // Wrap non-header children in a .widget-body wrapper if not already wrapped
    let bodyWrapper = card.querySelector(":scope > .widget-body");
    if (!bodyWrapper) {
      bodyWrapper = document.createElement("div");
      bodyWrapper.className = "widget-body";
      const nonHeaderNodes = Array.from(card.childNodes).filter(node => node !== header);
      nonHeaderNodes.forEach(node => bodyWrapper.appendChild(node));
      card.appendChild(bodyWrapper);
    }
  }

  setupWidgetDragAndDrop(card, side, index, widgetId);

  return card;
}

function setupWidgetDragAndDrop(card, side, index, widgetId) {
  const dragHandle = card.querySelector(".widget-drag-handle");

  if (dragHandle) {
    dragHandle.setAttribute("draggable", "true");

    dragHandle.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      draggedWidgetInfo = { side, index, widgetId };
      card.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", widgetId);
    });

    dragHandle.addEventListener("dragend", (e) => {
      e.stopPropagation();
      card.classList.remove("is-dragging");
      document.querySelectorAll(".widget-card").forEach(c => c.classList.remove("drag-over"));
      document.querySelectorAll(".widget-column").forEach(c => c.classList.remove("drag-over-column"));
      draggedWidgetInfo = null;
    });
  }

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedWidgetInfo && (draggedWidgetInfo.side !== side || draggedWidgetInfo.index !== index)) {
      card.classList.add("drag-over");
    }
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over");
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    card.classList.remove("drag-over");

    if (!draggedWidgetInfo) return;
    const { side: srcSide, index: srcIndex, widgetId: srcWidgetId } = draggedWidgetInfo;

    if (srcSide === side && srcIndex === index) return;

    const targetWidgetId = appSettings.widgetSlots[side][index];
    const isSrcLarge = !!WIDGET_REGISTRY[srcWidgetId]?.large;
    const isTargetLarge = !!WIDGET_REGISTRY[targetWidgetId]?.large;

    if (isSrcLarge || isTargetLarge) {
      // Large widget involved across columns -> swap the full columns
      if (srcSide !== side) {
        const tempSrc = [...appSettings.widgetSlots[srcSide]];
        appSettings.widgetSlots[srcSide] = [...appSettings.widgetSlots[side]];
        appSettings.widgetSlots[side] = tempSrc;
      }
    } else {
      appSettings.widgetSlots[srcSide][srcIndex] = targetWidgetId;
      appSettings.widgetSlots[side][index] = srcWidgetId;
    }

    saveSettings();
    renderWidgets();

    setTimeout(() => {
      document.querySelectorAll(`.widget-card[data-widget-id="${srcWidgetId}"], .widget-card[data-widget-id="${targetWidgetId}"]`).forEach(c => {
        c.classList.add("swapping");
        setTimeout(() => c.classList.remove("swapping"), 450);
      });
    }, 50);
  });
}

function setupColumnDropTarget(columnEl, side) {
  if (columnEl.dataset.dropTargetInit) return;
  columnEl.dataset.dropTargetInit = "true";

  columnEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (draggedWidgetInfo && draggedWidgetInfo.side !== side) {
      columnEl.classList.add("drag-over-column");
    }
  });

  columnEl.addEventListener("dragleave", () => {
    columnEl.classList.remove("drag-over-column");
  });

  columnEl.addEventListener("drop", (e) => {
    if (e.target.closest(".widget-card")) return;
    e.preventDefault();
    columnEl.classList.remove("drag-over-column");

    if (!draggedWidgetInfo) return;
    const { side: srcSide, index: srcIndex, widgetId: srcWidgetId } = draggedWidgetInfo;

    if (srcSide === side) return;

    const srcArray = appSettings.widgetSlots[srcSide];
    const targetArray = appSettings.widgetSlots[side];
    const isSrcLarge = !!WIDGET_REGISTRY[srcWidgetId]?.large;
    const hasLargeInTarget = targetArray.some(id => WIDGET_REGISTRY[id]?.large);

    // If source is large and target has any widgets -> swap entire columns
    if (isSrcLarge && targetArray.length > 0) {
      const tempTarget = [...targetArray];
      appSettings.widgetSlots[side] = [srcWidgetId];
      srcArray.splice(srcIndex, 1);
      appSettings.widgetSlots[srcSide] = tempTarget;
    }
    // If target has a large widget -> swap entire columns
    else if (hasLargeInTarget) {
      const tempSrc = [...srcArray];
      appSettings.widgetSlots[srcSide] = [...targetArray];
      appSettings.widgetSlots[side] = tempSrc;
    }
    // Standard normal widget logic
    else if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
      showToast(`⚠️ ${side === 'left' ? 'Left' : 'Right'} side is full (max 2 widgets).`, "warning", 2500);
      return;
    } else {
      srcArray.splice(srcIndex, 1);
      targetArray.push(srcWidgetId);
    }

    saveSettings();
    renderWidgets();
  });
}

function moveWidgetToOtherSide(currentSide, index) {
  const otherSide = currentSide === "left" ? "right" : "left";
  const srcArray = appSettings.widgetSlots[currentSide];
  const targetArray = appSettings.widgetSlots[otherSide];

  const widgetId = srcArray[index];
  const isSrcLarge = !!WIDGET_REGISTRY[widgetId]?.large;
  const hasLargeInTarget = targetArray.some(id => WIDGET_REGISTRY[id]?.large);

  // If source is large and target has any widgets -> swap entire columns
  if (isSrcLarge && targetArray.length > 0) {
    const tempTarget = [...targetArray];
    appSettings.widgetSlots[otherSide] = [widgetId];
    srcArray.splice(index, 1);
    appSettings.widgetSlots[currentSide] = tempTarget;
  }
  // If target has a large widget -> swap entire columns
  else if (hasLargeInTarget) {
    const tempSrc = [...srcArray];
    appSettings.widgetSlots[currentSide] = [...targetArray];
    appSettings.widgetSlots[otherSide] = tempSrc;
  }
  // Standard normal widget logic
  else if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
    const swappedId = targetArray[0];
    targetArray[0] = widgetId;
    srcArray[index] = swappedId;
  } else {
    srcArray.splice(index, 1);
    targetArray.push(widgetId);
  }

  saveSettings();
  renderWidgets();
}

function swapWidgetUpDown(side, index) {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  const arr = appSettings.widgetSlots[side] || [];
  if (arr.length < 2) return;
  const otherIndex = index === 0 ? 1 : 0;
  const temp = arr[index];
  arr[index] = arr[otherIndex];
  arr[otherIndex] = temp;

  saveSettings();
  renderWidgets();
}

function addWidget(widgetId, side = "right") {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  if (!Array.isArray(appSettings.widgetSlots.left)) appSettings.widgetSlots.left = [];
  if (!Array.isArray(appSettings.widgetSlots.right)) appSettings.widgetSlots.right = [];

  const targetArray = appSettings.widgetSlots[side];
  const allActive = [...appSettings.widgetSlots.left, ...appSettings.widgetSlots.right];
  const def = WIDGET_REGISTRY[widgetId];

  if (allActive.includes(widgetId)) {
    showToast("This widget is already active.", "info", 2000);
    return;
  }

  // Large widget: column must be empty
  if (def?.large && targetArray.length > 0) {
    showToast(`🔗 Quick Links needs an empty column (remove existing widgets first).`, "warning", 3000);
    return;
  }

  // Column already has a large widget: cannot add alongside
  const hasLargeInTarget = targetArray.some(id => WIDGET_REGISTRY[id]?.large);
  if (hasLargeInTarget) {
    showToast(`⚠️ This column is taken by Quick Links. Move it first or use the other side.`, "warning", 3000);
    return;
  }

  if (targetArray.length >= MAX_WIDGETS_PER_SIDE) {
    showToast(`🧩 ${side === 'left' ? 'Left' : 'Right'} side is full (max 2 widgets).`, "warning", 2500);
    return;
  }

  targetArray.push(widgetId);
  saveSettings();
  renderWidgets();
  closeWidgetPicker();
  showToast(`🧩 Widget "${WIDGET_REGISTRY[widgetId]?.name}" added!`, "success", 2500);
}

function removeWidget(widgetId) {
  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  appSettings.widgetSlots.left = (appSettings.widgetSlots.left || []).filter(id => id !== widgetId);
  appSettings.widgetSlots.right = (appSettings.widgetSlots.right || []).filter(id => id !== widgetId);
  saveSettings();
  renderWidgets();
  showToast("Widget removed.", "info", 2000);
}

const WIDGET_PRIORITY_ORDER = [
  "quicklinks",     // 🔗 Quick Links (App dock & frequent shortcuts)
  "somedaybox",     // 🌱 Someday Box (Idea capture & backlog)
  "dailylearning",  // 🧠 Daily Learning Log (Knowledge & insights)
  "quicknotes",     // 📝 Quick Notes (Scratchpad)
  "focusstats",     // 📊 Focus Stats (Productivity stats)
  "timer",          // ⏱️ Timer Panel (In-card timer)
  "dailyquote",     // 💡 Daily Quote (Inspiration)
];

function openWidgetPicker(side = "right") {
  targetAddSide = side;
  const modal = document.getElementById("widgetPickerModal");
  const list = document.getElementById("widgetPickerList");
  if (!modal || !list) return;

  if (!appSettings.widgetSlots) appSettings.widgetSlots = { left: [], right: [] };
  const leftSlots = appSettings.widgetSlots.left || [];
  const rightSlots = appSettings.widgetSlots.right || [];
  const targetSlots = appSettings.widgetSlots[targetAddSide] || [];

  list.innerHTML = "";
  const allActive = [...leftSlots, ...rightSlots];
  const hasLargeInTarget = targetSlots.some(id => WIDGET_REGISTRY[id]?.large);

  const orderedList = [
    ...WIDGET_PRIORITY_ORDER.map(id => WIDGET_REGISTRY[id]).filter(Boolean),
    ...Object.values(WIDGET_REGISTRY).filter(def => !WIDGET_PRIORITY_ORDER.includes(def.id))
  ];

  orderedList.forEach(def => {
    const isActive = allActive.includes(def.id);
    const isTargetFull = targetSlots.length >= MAX_WIDGETS_PER_SIDE;
    // Large widget needs empty column; normal widget can't go in a large-widget column
    const isBlockedByLarge = def.large
      ? targetSlots.length > 0
      : hasLargeInTarget;
    const isDisabled = isActive || isTargetFull || isBlockedByLarge;

    let descText = def.desc;
    if (isActive) descText = "Active";
    else if (isBlockedByLarge && def.large) descText = "Needs empty column";
    else if (isBlockedByLarge) descText = "Column taken by Quick Links";

    const item = document.createElement("button");
    item.className = `widget-picker-item${isDisabled ? " disabled" : ""}`;
    item.innerHTML = `
      <span class="widget-picker-item-icon">${def.icon}</span>
      <span class="widget-picker-item-name">${def.name}</span>
      <span class="widget-picker-item-desc">${descText}</span>
    `;
    if (!isDisabled) {
      item.addEventListener("click", () => addWidget(def.id, targetAddSide));
    }
    list.appendChild(item);
  });

  modal.classList.remove("hidden");
}

function closeWidgetPicker() {
  const modal = document.getElementById("widgetPickerModal");
  if (modal) modal.classList.add("hidden");
}

// ==========================================
// FOCUS MODE / WIDGETS MINIMIZE CONTROLLER
// ==========================================

function toggleWidgetsMinimize(forceState = null, showNotification = true) {
  const layout = document.getElementById("workspaceLayout");
  const btn = document.getElementById("toggleFocusModeBtn");
  if (!layout) return;

  const isCurrentlyMinimized = layout.classList.contains("widgets-minimized");
  const willMinimize = forceState !== null ? Boolean(forceState) : !isCurrentlyMinimized;

  if (willMinimize) {
    layout.classList.add("widgets-minimized");
    if (btn) {
      btn.classList.add("is-minimized");
      btn.title = "Restore Widgets (Show All)";
      btn.setAttribute("aria-label", "Restore Widgets");
      btn.innerHTML = "👁️‍🗨️";
    }
    saveWidgetsMinimized(true);
    if (showNotification) {
      showToast("🎯 Focus Mode active · Widgets minimized", "info", 2200);
    }
  } else {
    layout.classList.remove("widgets-minimized");
    if (btn) {
      btn.classList.remove("is-minimized");
      btn.title = "Focus Mode: Minimize Widgets";
      btn.setAttribute("aria-label", "Focus Mode: Minimize Widgets");
      btn.innerHTML = "👁️";
    }
    saveWidgetsMinimized(false);
    if (showNotification) {
      showToast("🧩 Widgets restored", "success", 2200);
    }
  }
}

function initFocusMode() {
  const btn = document.getElementById("toggleFocusModeBtn");
  const isMinimized = typeof loadWidgetsMinimized === "function" ? loadWidgetsMinimized() : false;

  // Apply initial saved state without toast notification
  if (isMinimized) {
    toggleWidgetsMinimize(true, false);
  }

  if (btn && !btn.dataset.focusInit) {
    btn.dataset.focusInit = "true";
    btn.addEventListener("click", () => {
      toggleWidgetsMinimize();
    });
  }
}
