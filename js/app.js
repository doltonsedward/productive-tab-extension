// ==========================================
// MAIN APPLICATION ENTRY POINT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");

  // Load persistent states
  todos = loadTodos();
  milestone = loadMilestone();
  isHidden = loadIsHidden();

  // Evaluate milestone gap/notices
  if (milestone) {
    milestone = checkMilestoneDayGap(milestone);
  }

  // Bind Main Todo Input
  if (todoInput) {
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const text = todoInput.value.trim();
        if (text) {
          addTodo(text);
          todoInput.value = "";
          todoInput.focus();
        }
      }
    });
  }

  // Initialize Modules & Sub-systems
  try { initSettings(); } catch (e) { console.error("Settings init error:", e); }
  try { renderMilestone(); } catch (e) { console.error("Milestone init error:", e); }
  try { checkMilestoneNotice(); } catch (e) { console.error("Notice error:", e); }
  try { renderTodos(); } catch (e) { console.error("Todos init error:", e); }
  try { updateTimeAndGreeting(); } catch (e) { console.error("Time init error:", e); }
  
  // Start 1-second clock tick
  setInterval(updateTimeAndGreeting, 1000);

  // Initialize Widgets, Calendar & Settings Drawer
  try { renderWidgets(); } catch (e) { console.error("Widgets render error:", e); }
  try { initFocusMode(); } catch (e) { console.error("Focus mode init error:", e); }
  try { initSettingsDrawer(); } catch (e) { console.error("Drawer init error:", e); }
  try { initCalendarEvents(); } catch (e) { console.error("Calendar init error:", e); }
  try { setupObsidianExport(); } catch (e) { console.error("Obsidian export init error:", e); }
  try { if (typeof BookmarkSpotlight !== "undefined") BookmarkSpotlight.init(); } catch (e) { console.error("BookmarkSpotlight init error:", e); }
  try { initUpdater(); } catch (e) { console.error("Updater init error:", e); }

  // Dismiss Loading Screen with smooth fade-out
  dismissAppLoader();
});

function dismissAppLoader() {
  const loader = document.getElementById("appLoader");
  if (!loader) return;

  const type = appSettings?.bgType || "default";
  const val = appSettings?.bgVal || "";

  if ((type === "preset" || type === "url" || type === "custom" || type === "default") && val && val !== "dark") {
    let imgSrc = "";
    if (type === "preset" && typeof BG_PRESETS !== "undefined" && BG_PRESETS[val]) {
      imgSrc = BG_PRESETS[val];
    } else if ((type === "url" || type === "custom") && val) {
      imgSrc = val;
    } else {
      imgSrc = "background/default.png";
    }

    if (imgSrc) {
      const img = new Image();
      img.src = imgSrc;
      const hideLoader = () => {
        requestAnimationFrame(() => {
          loader.classList.add("fade-out");
        });
      };

      if (img.complete) {
        hideLoader();
      } else {
        img.onload = hideLoader;
        img.onerror = hideLoader;
        setTimeout(hideLoader, 500);
      }
      return;
    }
  }

  requestAnimationFrame(() => {
    loader.classList.add("fade-out");
  });
}
