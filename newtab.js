let todos = [];
let isHidden = false;

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos") || "[]");
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function editTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const newText = prompt("Ubah tugas kamu:", todo.text);
  if (newText !== null && newText.trim() !== "") {
    todo.text = newText.trim();
    saveTodos();
    renderTodos();
  }
}

// --- FUNGSI RENDER UTAMA ---
function renderTodos() {
  const todoList = document.getElementById("todoList");
  const todoStats = document.getElementById("todoStats");
  if (!todoList) return;

  if (!todos.length) {
    if (todoStats) todoStats.textContent = "0 tugas · 0 selesai";
    todoList.innerHTML = "";
    return;
  }

  // 1. Render List Item
  todoList.innerHTML = todos
    .map(
      (t, index) => `
    <div class="todo-item${t.completed ? " completed" : ""}${t.completed && isHidden ? " hidden" : ""}" draggable="true" data-index="${index}">
      <div class="todo-text">${escapeHtml(t.text)}</div>
        <div class="todo-actions">
          <!-- Tombol Track Stopwatch Task -->
          <button class="track-btn" data-id="${t.id}" title="Track waktu tugas">⏱️</button>
          
          <button class="complete-btn" data-id="${t.id}" title="${
            t.completed ? "Tandai belum selesai" : "Tandai selesai"
          }">${t.completed ? "↩" : "✓"}</button>
          
          <button class="edit-btn" data-id="${t.id}" title="Edit tugas">✎</button>
          
          <button class="delete-btn" data-id="${t.id}" title="Hapus tugas">✕</button>
        </div>
    </div>
  `,
    )
    .join("");

  // 2. Attach Event Listeners
  todoList.querySelectorAll(".todo-item").forEach((item) => {
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragover", dragOver);
    item.addEventListener("dragenter", dragEnter);
    item.addEventListener("dragleave", dragLeave);
    item.addEventListener("drop", dragDrop);
  });

  // Tombol ⏱️ memanggil fungsi startTaskTracking yang ada di timer.js
  todoList.querySelectorAll(".track-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (typeof startTaskTracking === "function") {
        startTaskTracking(Number(btn.dataset.id));
      }
    }),
  );

  todoList
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => editTodo(Number(btn.dataset.id))),
    );

  todoList
    .querySelectorAll(".complete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => toggleTodo(Number(btn.dataset.id))),
    );

  todoList
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteTodo(Number(btn.dataset.id))),
    );

  // 3. Render Stats & Toggle Pill
  const completedCount = todos.filter((t) => t.completed).length;
  let statsHtml = `${todos.length} tugas · ${completedCount} selesai`;

  if (completedCount > 0) {
    statsHtml += ` <span id="toggleHideBtn" class="toggle-hide" title="Sembunyikan/Tampilkan">
      ${isHidden ? "Tampilkan" : "Sembunyikan"}
    </span>`;
  }

  if (todoStats) todoStats.innerHTML = statsHtml;

  const toggleBtn = document.getElementById("toggleHideBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isHidden = !isHidden;
      renderTodos();
    });
  }
}

// --- FUNGSI DRAG AND DROP ---
let dragStartIndex;

function dragStart(e) {
  dragStartIndex = +e.target.closest(".todo-item").dataset.index;
  e.target.classList.add("dragging");
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  const item = e.target.closest(".todo-item");
  if (item) item.classList.add("over");
}

function dragLeave(e) {
  const item = e.target.closest(".todo-item");
  if (item) item.classList.remove("over");
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

// ==========================================
// DOM CONTENT LOADED (EVENT BINDINGS)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  todos = loadTodos();

  if (todoInput) {
    todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTodo();
    });
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({
      id: Date.now(),
      text,
      completed: false,
    });

    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
  }

  function updateTimeAndGreeting() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    if (greetingEl) {
      const h = now.getHours();
      greetingEl.textContent =
        h < 12
          ? "Good morning, dollong"
          : h < 15
            ? "Good afternoon, dollong"
            : h < 18
              ? "Good evening, dollong"
              : "Good night, dollong";
    }
  }

  // --- COPY KE OBSIDIAN ---
  const copyMdBtn = document.getElementById("copyMdBtn");
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      const dateStr = new Date().toLocaleDateString("en-GB");

      const completedTodos = todos.filter((t) => t.completed);
      const cancelledTodos = todos.filter((t) => !t.completed);

      // Helper kecil buat format detik ke text (misal: 1h 15m 04s atau 05m 12s)
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

      if (completedTodos.length > 0) {
        completedTodos.forEach((t) => {
          const duration = formatDuration(t.elapsedTime);
          markdownText += `- [x] ${t.text}${duration}\n`;
        });
      } else {
        markdownText += `*(Tidak ada tugas yang selesai)*\n`;
      }

      markdownText += `\n#### Cancelled\n\n`;

      if (cancelledTodos.length > 0) {
        cancelledTodos.forEach((t) => {
          const duration = formatDuration(t.elapsedTime);
          markdownText += `- ${t.text}${duration}\n`;
        });
      } else {
        markdownText += `*(Tidak ada tugas yang dibatalkan)*\n`;
      }

      navigator.clipboard.writeText(markdownText).then(() => {
        const originalText = copyMdBtn.textContent;
        copyMdBtn.textContent = "✅ Tersalin!";

        setTimeout(() => {
          copyMdBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // Init UI
  renderTodos();
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
});
