// ==========================================
// TODO & SUBTASK MANAGEMENT MODULE
// ==========================================

let dragStartIndex;

function addTodo(text) {
  if (!text || !text.trim()) return;

  todos.push({
    id: Date.now(),
    text: text.trim(),
    completed: false,
    subtasks: [],
    isExpanded: false,
  });

  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    if (Array.isArray(todo.subtasks)) {
      todo.subtasks.forEach((st) => (st.completed = todo.completed));
    }
    saveTodos();
    renderTodos();
    if (todo.completed) {
      checkAllTodosCompleted();
    }
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

async function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newText = await showPromptModal({
    badge: "✏️ Edit Task",
    title: "Edit your task",
    defaultValue: todo.text,
    placeholder: "Enter task text...",
    confirmText: "Save",
    cancelText: "Cancel",
  });
  if (newText !== null && newText.trim() !== "") {
    todo.text = newText.trim();
    saveTodos();
    renderTodos();
  }
}

// --- SUBTASK & ACCORDION MANAGEMENT ---
function toggleAccordion(parentId) {
  const todo = todos.find((t) => t.id === parentId);
  if (todo) {
    todo.isExpanded = !todo.isExpanded;
    saveTodos();
    renderTodos();
  }
}

function addSubtask(parentId, text) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !text || !text.trim()) return;

  if (!Array.isArray(todo.subtasks)) todo.subtasks = [];

  todo.subtasks.push({
    id: Date.now(),
    text: text.trim(),
    completed: false,
  });

  todo.isExpanded = true;
  todo.completed = false;

  saveTodos();
  renderTodos();
}

function toggleSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  const st = todo.subtasks.find((s) => s.id === subtaskId);
  if (st) {
    st.completed = !st.completed;

    if (todo.subtasks.length > 0) {
      const allDone = todo.subtasks.every((s) => s.completed);
      const wasCompleted = todo.completed;
      todo.completed = allDone;
      if (allDone && !wasCompleted) {
        checkAllTodosCompleted();
      }
    }

    saveTodos();
    renderTodos();
  }
}

function deleteSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  todo.subtasks = todo.subtasks.filter((s) => s.id !== subtaskId);

  if (todo.subtasks.length > 0) {
    todo.completed = todo.subtasks.every((s) => s.completed);
  }

  saveTodos();
  renderTodos();
}

async function editSubtask(parentId, subtaskId) {
  const todo = todos.find((t) => t.id === parentId);
  if (!todo || !Array.isArray(todo.subtasks)) return;

  const st = todo.subtasks.find((s) => s.id === subtaskId);
  if (!st) return;

  const newText = await showPromptModal({
    badge: "✏️ Edit Subtask",
    title: "Edit subtask",
    defaultValue: st.text,
    placeholder: "Enter subtask text...",
    confirmText: "Save",
    cancelText: "Cancel",
  });
  if (newText !== null && newText.trim() !== "") {
    st.text = newText.trim();
    saveTodos();
    renderTodos();
  }
}

// --- SCHEDULE TAG FORMATTER ---
function formatScheduleTag(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const dateFormatted = d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `<span class="task-schedule-tag" title="Scheduled: ${dateStr}">📅 ${dateFormatted} ${timeFormatted}</span>`;
  } catch {
    return "";
  }
}

// --- MAIN TODO RENDER FUNCTION ---
function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todoStats = document.getElementById("todoStats");
  if (!todoList) return;

  if (!todos.length) {
    if (todoStats) todoStats.textContent = "0 tasks · 0 completed";
    todoList.innerHTML = "";
    return;
  }

  todoList.innerHTML = todos
    .map((t, index) => {
      const subtasks = t.subtasks || [];
      const completedSubtasks = subtasks.filter((s) => s.completed).length;
      const hasSubtasks = subtasks.length > 0;
      const allSubtasksDone = hasSubtasks && completedSubtasks === subtasks.length;

      const subtaskBadge = hasSubtasks
        ? `<span class="subtask-badge${allSubtasksDone ? " all-done" : ""}">${completedSubtasks}/${subtasks.length}</span>`
        : "";

      const accordionIcon = t.isExpanded ? "▼" : "▶";

      return `
    <div class="todo-wrapper${t.completed && isHidden ? " hidden" : ""}">
      <div class="todo-item${t.completed ? " completed" : ""}" draggable="true" data-index="${index}" data-id="${t.id}">
        <button class="accordion-btn${t.isExpanded ? " expanded" : ""}" data-id="${t.id}" title="${t.isExpanded ? "Hide subtasks" : "Show/add subtasks"}">
          ${accordionIcon}
        </button>

        <div class="todo-text">
          ${escapeHtml(t.text)}
          ${subtaskBadge}
          ${formatScheduleTag(t.scheduledDate)}
        </div>

        <div class="todo-actions">
          <button class="cal-btn" data-id="${t.id}" title="Schedule in Google Calendar">📅</button>
          <button class="track-btn" data-id="${t.id}" title="Track task time">⏱️</button>
          
          <button class="complete-btn" data-id="${t.id}" title="${
            t.completed ? "Mark incomplete" : "Mark complete"
          }">${t.completed ? "↩" : "✓"}</button>
          
          <button class="edit-btn" data-id="${t.id}" title="Edit task">✏️</button>
          <button class="delete-btn" data-id="${t.id}" title="Delete task">✕</button>
        </div>
      </div>

      ${
        t.isExpanded
          ? `
      <div class="subtask-container">
        <div class="subtask-list">
          ${subtasks
            .map(
              (st) => `
            <div class="subtask-item${st.completed ? " completed" : ""}">
              <input type="checkbox" class="subtask-checkbox" data-parent-id="${t.id}" data-sub-id="${st.id}" ${st.completed ? "checked" : ""} />
              <span class="subtask-text" data-parent-id="${t.id}" data-sub-id="${st.id}">${escapeHtml(st.text)}</span>
              <div class="subtask-actions">
                <button class="subtask-edit-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Edit">✏️</button>
                <button class="subtask-delete-btn" data-parent-id="${t.id}" data-sub-id="${st.id}" title="Delete">✕</button>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="subtask-add-row">
          <input type="text" class="subtask-input" data-parent-id="${t.id}" placeholder="+ Add subtask (press Enter)" maxlength="80" />
        </div>
      </div>
      `
          : ""
      }
    </div>
    `;
    })
    .join("");

  todoList.querySelectorAll(".complete-btn").forEach((btn) =>
    btn.addEventListener("click", () => toggleTodo(Number(btn.dataset.id)))
  );

  todoList.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => editTodo(Number(btn.dataset.id)))
  );

  todoList.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => deleteTodo(Number(btn.dataset.id)))
  );

  todoList.querySelectorAll(".todo-item").forEach((item) => {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("dragenter", dragEnter);
    item.addEventListener("dragleave", dragLeave);
    item.addEventListener("drop", dragDrop);
  });

  todoList.querySelectorAll(".accordion-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleAccordion(Number(btn.dataset.id));
    })
  );

  todoList.querySelectorAll(".subtask-checkbox").forEach((cb) =>
    cb.addEventListener("change", () => {
      toggleSubtask(Number(cb.dataset.parentId), Number(cb.dataset.subId));
    })
  );

  todoList.querySelectorAll(".subtask-text").forEach((stText) => {
    stText.addEventListener("click", () => {
      toggleSubtask(Number(stText.dataset.parentId), Number(stText.dataset.subId));
    });
    stText.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      editSubtask(Number(stText.dataset.parentId), Number(stText.dataset.subId));
    });
  });

  todoList.querySelectorAll(".subtask-edit-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      editSubtask(Number(btn.dataset.parentId), Number(btn.dataset.subId));
    })
  );

  todoList.querySelectorAll(".subtask-delete-btn").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSubtask(Number(btn.dataset.parentId), Number(btn.dataset.subId));
    })
  );

  todoList.querySelectorAll(".subtask-input").forEach((input) =>
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addSubtask(Number(input.dataset.parentId), input.value);
      }
    })
  );

  todoList.querySelectorAll(".cal-btn").forEach((btn) =>
    btn.addEventListener("click", () => openGcalModal(Number(btn.dataset.id)))
  );

  todoList.querySelectorAll(".track-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (typeof startTaskTracking === "function") {
        startTaskTracking(Number(btn.dataset.id));
      }
    })
  );

  const completedCount = todos.filter((t) => t.completed).length;
  let statsHtml = `${todos.length} tasks · ${completedCount} completed`;

  if (completedCount > 0) {
    statsHtml += ` <span id="toggleHideCompleted" class="toggle-hide">${
      isHidden ? "Show All" : "Hide Completed"
    }</span>`;
  }

  if (todoStats) {
    todoStats.innerHTML = statsHtml;
    const toggleBtn = document.getElementById("toggleHideCompleted");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        isHidden = !isHidden;
        saveIsHidden();
        renderTodos();
      });
    }
  }
}

// --- DRAG AND DROP HANDLERS ---
function dragStart(e) {
  dragStartIndex = +e.target.closest(".todo-item").dataset.index;
  e.target.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.target.closest(".todo-item")?.classList.add("over");
}

function dragLeave(e) {
  e.target.closest(".todo-item")?.classList.remove("over");
}

function dragDrop(e) {
  const item = e.target.closest(".todo-item");
  if (!item) return;

  const dragEndIndex = +item.dataset.index;
  item.classList.remove("over");

  const itemToMove = todos[dragStartIndex];
  todos.splice(dragStartIndex, 1);
  todos.splice(dragEndIndex, 0, itemToMove);

  saveTodos();
  renderTodos();
}

// --- OBSIDIAN MARKDOWN EXPORT ---
function setupObsidianExport() {
  const copyMdBtn = document.getElementById("copyMdBtn");
  if (!copyMdBtn) return;

  copyMdBtn.addEventListener("click", () => {
    const dateStr = new Date().toLocaleDateString("en-GB");

    const completedTodos = todos.filter((t) => t.completed);
    const cancelledTodos = todos.filter((t) => !t.completed);

    const formatDuration = (sec) => {
      if (!sec || sec <= 0) return "";
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;

      let timeStr = "";
      if (h > 0) timeStr += `${h}h `;
      if (m > 0 || h > 0) timeStr += `${m}m `;
      timeStr += `${String(s).padStart(2, "0")}s`;

      return ` ⏱️ (${timeStr.trim()})`;
    };

    let markdownText = `### Todo list for ${dateStr}\n\n`;

    if (milestone) {
      const statusStr = milestone.failed
        ? "🚨 FAILED"
        : milestone.strikes > 0
        ? "⚠️ 1 STRIKE WARNING"
        : `🔥 ${milestone.currentStreak}-day streak`;
      markdownText += `🏆 **Milestone:** ${milestone.title} — Day ${milestone.currentStreak}/${milestone.targetDays} (${statusStr})\n\n`;
    }

    if (completedTodos.length > 0) {
      completedTodos.forEach((t) => {
        const duration = formatDuration(t.elapsedTime);
        const sched = t.scheduledDate ? ` [📅 ${t.scheduledDate.replace("T", " ")}]` : "";
        markdownText += `- [x] ${t.text}${sched}${duration}\n`;
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach((st) => {
            markdownText += `  - [${st.completed ? "x" : " "}] ${st.text}\n`;
          });
        }
      });
    } else {
      markdownText += `*(No completed tasks)*\n`;
    }

    markdownText += `\n#### Incomplete\n\n`;

    if (cancelledTodos.length > 0) {
      cancelledTodos.forEach((t) => {
        const duration = formatDuration(t.elapsedTime);
        const sched = t.scheduledDate ? ` [📅 ${t.scheduledDate.replace("T", " ")}]` : "";
        markdownText += `- [ ] ${t.text}${sched}${duration}\n`;
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach((st) => {
            markdownText += `  - [${st.completed ? "x" : " "}] ${st.text}\n`;
          });
        }
      });
    } else {
      markdownText += `*(No incomplete tasks)*\n`;
    }

    navigator.clipboard.writeText(markdownText).then(() => {
      const originalText = copyMdBtn.textContent;
      copyMdBtn.textContent = "✅ Copied!";

      setTimeout(() => {
        copyMdBtn.textContent = originalText;
      }, 2000);
    });
  });
}
