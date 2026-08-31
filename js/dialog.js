/* ==========================================================================
   DIALOG.JS — Custom Glassmorphism Dialog Manager
   Replaces native browser prompt(), confirm(), and alert() dialogs
   Provides: showPromptModal(), showConfirmModal(), showFormModal()
   ========================================================================== */

const DialogManager = (() => {
  // --------------------------------------------------------------------------
  // Internal state
  // --------------------------------------------------------------------------
  let _overlay = null;
  let _card = null;
  let _resolveCallback = null;
  let _keydownHandler = null;

  // --------------------------------------------------------------------------
  // DOM Setup — lazily initialize the singleton modal element
  // --------------------------------------------------------------------------
  function _init() {
    if (_overlay) return;

    _overlay = document.getElementById("customDialogModal");
    _card = _overlay ? _overlay.querySelector(".dialog-card") : null;

    if (!_overlay || !_card) {
      console.warn("[DialogManager] #customDialogModal not found in DOM.");
    }
  }

  // --------------------------------------------------------------------------
  // Open / Close helpers
  // --------------------------------------------------------------------------
  function _open() {
    _init();
    if (!_overlay) return;
    _overlay.classList.remove("dialog-hidden");
  }

  function _close() {
    if (!_overlay) return;
    _overlay.classList.add("dialog-hidden");

    // Clean up keyboard listener
    if (_keydownHandler) {
      document.removeEventListener("keydown", _keydownHandler);
      _keydownHandler = null;
    }

    // Clear content after transition (250ms matches CSS transition)
    setTimeout(() => {
      if (_card) _card.innerHTML = "";
      if (_card) _card.classList.remove("dialog-danger");
    }, 280);
  }

  function _resolve(value) {
    const cb = _resolveCallback;
    _resolveCallback = null;
    _close();
    if (cb) cb(value);
  }

  // --------------------------------------------------------------------------
  // Backdrop click to cancel (resolves null/false)
  // --------------------------------------------------------------------------
  function _attachBackdropListener(cancelValue) {
    _init();
    if (!_overlay) return;

    // Remove any existing backdrop listener first
    const newOverlay = _overlay.cloneNode(false);
    // We can't clone children, so use a flag approach instead
    _overlay._backdropHandler && _overlay.removeEventListener("click", _overlay._backdropHandler);
    _overlay._backdropHandler = (e) => {
      if (e.target === _overlay) _resolve(cancelValue);
    };
    _overlay.addEventListener("click", _overlay._backdropHandler);
  }

  // --------------------------------------------------------------------------
  // Keyboard handler builder
  // --------------------------------------------------------------------------
  function _attachKeyboard({ onEnter, onEscape }) {
    if (_keydownHandler) {
      document.removeEventListener("keydown", _keydownHandler);
    }
    _keydownHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      } else if (e.key === "Enter") {
        // Only trigger Enter if NOT in a textarea (allow newlines there)
        const tag = document.activeElement?.tagName;
        if (tag !== "TEXTAREA") {
          e.preventDefault();
          onEnter();
        }
      }
    };
    document.addEventListener("keydown", _keydownHandler);
  }

  // --------------------------------------------------------------------------
  // Build HTML helpers
  // --------------------------------------------------------------------------
  function _buildHeader(badge, title, message) {
    let html = "";
    if (badge) html += `<span class="dialog-badge">${badge}</span>`;
    if (title) html += `<h3 class="dialog-title">${title}</h3>`;
    if (message) html += `<p class="dialog-message">${message}</p>`;
    return html;
  }

  function _buildActions(cancelText, confirmText, isDanger) {
    const confirmClass = isDanger ? "dialog-btn-danger" : "dialog-btn-confirm";
    return `
      <div class="dialog-actions">
        <button class="dialog-btn dialog-btn-cancel" id="dialogCancelBtn">${cancelText}</button>
        <button class="dialog-btn ${confirmClass}" id="dialogConfirmBtn">${confirmText}</button>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // PUBLIC API: showPromptModal
  // --------------------------------------------------------------------------
  /**
   * Shows a single-input prompt modal.
   * @param {Object} opts
   * @param {string} [opts.title]         — Main heading text
   * @param {string} [opts.message]       — Secondary description text
   * @param {string} [opts.badge]         — Small all-caps label above title
   * @param {string} [opts.defaultValue]  — Pre-filled input value
   * @param {string} [opts.placeholder]   — Input placeholder text
   * @param {string} [opts.inputType]     — Input type (default: "text")
   * @param {string} [opts.confirmText]   — Confirm button label
   * @param {string} [opts.cancelText]    — Cancel button label
   * @param {boolean}[opts.required]      — Disallow empty submission
   * @returns {Promise<string|null>}      — Resolved value or null if cancelled
   */
  function showPromptModal({
    title = "Edit",
    message = "",
    badge = "",
    defaultValue = "",
    placeholder = "",
    inputType = "text",
    confirmText = "Save",
    cancelText = "Cancel",
    required = true,
  } = {}) {
    return new Promise((resolve) => {
      _init();
      if (!_overlay || !_card) {
        // Graceful fallback
        const result = window.prompt(title, defaultValue);
        return resolve(result);
      }

      _resolveCallback = resolve;

      _card.classList.remove("dialog-danger");
      _card.innerHTML = `
        ${_buildHeader(badge, title, message)}
        <div class="dialog-fields">
          <div class="dialog-field" id="dialogPromptField">
            <input
              type="${inputType}"
              id="dialogPromptInput"
              class="dialog-prompt-input"
              placeholder="${placeholder}"
              value="${defaultValue.replace(/"/g, "&quot;")}"
              autocomplete="off"
              spellcheck="true"
            />
            <span class="dialog-field-error">This field is required.</span>
          </div>
        </div>
        ${_buildActions(cancelText, confirmText, false)}
      `;

      _open();

      const input = _card.querySelector("#dialogPromptInput");
      const confirmBtn = _card.querySelector("#dialogConfirmBtn");
      const cancelBtn = _card.querySelector("#dialogCancelBtn");
      const field = _card.querySelector("#dialogPromptField");

      // Auto-focus and select existing text for fast editing
      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });

      function doConfirm() {
        const val = input.value.trim();
        if (required && val === "") {
          field.classList.add("has-error");
          input.focus();
          return;
        }
        _resolve(val === "" ? null : val);
      }

      confirmBtn.addEventListener("click", doConfirm);
      cancelBtn.addEventListener("click", () => _resolve(null));
      _attachBackdropListener(null);
      _attachKeyboard({ onEnter: doConfirm, onEscape: () => _resolve(null) });
    });
  }

  // --------------------------------------------------------------------------
  // PUBLIC API: showConfirmModal
  // --------------------------------------------------------------------------
  /**
   * Shows a confirmation modal.
   * @param {Object} opts
   * @param {string} [opts.title]       — Main heading
   * @param {string} [opts.message]     — Body message
   * @param {string} [opts.badge]       — Small badge label
   * @param {string} [opts.confirmText] — Confirm button label
   * @param {string} [opts.cancelText]  — Cancel button label
   * @param {boolean}[opts.isDanger]    — True = danger button styling
   * @returns {Promise<boolean>}
   */
  function showConfirmModal({
    title = "Are you sure?",
    message = "",
    badge = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
  } = {}) {
    return new Promise((resolve) => {
      _init();
      if (!_overlay || !_card) {
        return resolve(window.confirm(title + (message ? "\n\n" + message : "")));
      }

      _resolveCallback = resolve;

      if (isDanger) {
        _card.classList.add("dialog-danger");
      } else {
        _card.classList.remove("dialog-danger");
      }

      _card.innerHTML = `
        ${_buildHeader(badge, title, message)}
        ${_buildActions(cancelText, confirmText, isDanger)}
      `;

      _open();

      const confirmBtn = _card.querySelector("#dialogConfirmBtn");
      const cancelBtn = _card.querySelector("#dialogCancelBtn");

      confirmBtn.addEventListener("click", () => _resolve(true));
      cancelBtn.addEventListener("click", () => _resolve(false));
      _attachBackdropListener(false);
      _attachKeyboard({
        onEnter: () => _resolve(true),
        onEscape: () => _resolve(false),
      });
    });
  }

  // --------------------------------------------------------------------------
  // PUBLIC API: showFormModal
  // --------------------------------------------------------------------------
  /**
   * Shows a multi-field form modal.
   * @param {Object} opts
   * @param {string}   [opts.title]
   * @param {string}   [opts.message]
   * @param {string}   [opts.badge]
   * @param {Array}    opts.fields — Array of field configs:
   *   { name, label, type, value, placeholder, hint, min, max, required }
   * @param {string}   [opts.confirmText]
   * @param {string}   [opts.cancelText]
   * @param {boolean}  [opts.isDanger]
   * @returns {Promise<Object|null>}  — Object with field names as keys, or null if cancelled
   */
  function showFormModal({
    title = "",
    message = "",
    badge = "",
    fields = [],
    confirmText = "Save",
    cancelText = "Cancel",
    isDanger = false,
  } = {}) {
    return new Promise((resolve) => {
      _init();
      if (!_overlay || !_card) {
        // Graceful fallback — sequential prompts
        const result = {};
        for (const f of fields) {
          const val = window.prompt(f.label, f.value || "");
          if (val === null) return resolve(null);
          result[f.name] = val;
        }
        return resolve(result);
      }

      _resolveCallback = resolve;

      if (isDanger) {
        _card.classList.add("dialog-danger");
      } else {
        _card.classList.remove("dialog-danger");
      }

      // Build field HTML
      const fieldsHtml = fields.map((f, i) => {
        const inputEl = f.type === "textarea"
          ? `<textarea
               id="dialogField_${f.name}"
               placeholder="${f.placeholder || ""}"
               rows="3"
             >${f.value || ""}</textarea>`
          : `<input
               type="${f.type || "text"}"
               id="dialogField_${f.name}"
               placeholder="${f.placeholder || ""}"
               value="${String(f.value || "").replace(/"/g, "&quot;")}"
               ${f.min !== undefined ? `min="${f.min}"` : ""}
               ${f.max !== undefined ? `max="${f.max}"` : ""}
               autocomplete="off"
             />`;

        return `
          <div class="dialog-field" id="dialogFieldWrap_${f.name}">
            <label for="dialogField_${f.name}">${f.label}</label>
            ${inputEl}
            ${f.hint ? `<span class="dialog-field-hint">${f.hint}</span>` : ""}
            <span class="dialog-field-error">This field is required.</span>
          </div>
        `;
      }).join("");

      _card.innerHTML = `
        ${_buildHeader(badge, title, message)}
        <div class="dialog-fields">
          ${fieldsHtml}
        </div>
        ${_buildActions(cancelText, confirmText, isDanger)}
      `;

      _open();

      // Auto-focus first input
      const firstInput = _card.querySelector("input, textarea");
      if (firstInput) {
        requestAnimationFrame(() => {
          firstInput.focus();
          if (firstInput.select) firstInput.select();
        });
      }

      function doConfirm() {
        const result = {};
        let hasError = false;

        for (const f of fields) {
          const el = _card.querySelector(`#dialogField_${f.name}`);
          const wrap = _card.querySelector(`#dialogFieldWrap_${f.name}`);
          const val = el ? el.value.trim() : "";

          if (f.required !== false && val === "") {
            wrap.classList.add("has-error");
            if (!hasError) el.focus();
            hasError = true;
            continue;
          }

          wrap.classList.remove("has-error");
          result[f.name] = val;
        }

        if (hasError) return;
        _resolve(result);
      }

      const confirmBtn = _card.querySelector("#dialogConfirmBtn");
      const cancelBtn = _card.querySelector("#dialogCancelBtn");

      confirmBtn.addEventListener("click", doConfirm);
      cancelBtn.addEventListener("click", () => _resolve(null));
      _attachBackdropListener(null);
      _attachKeyboard({ onEnter: doConfirm, onEscape: () => _resolve(null) });
    });
  }

  // --------------------------------------------------------------------------
  // Expose public API
  // --------------------------------------------------------------------------
  return {
    showPromptModal,
    showConfirmModal,
    showFormModal,
  };
})();

// --- Convenience global aliases ---
function showPromptModal(opts) { return DialogManager.showPromptModal(opts); }
function showConfirmModal(opts) { return DialogManager.showConfirmModal(opts); }
function showFormModal(opts)    { return DialogManager.showFormModal(opts); }
