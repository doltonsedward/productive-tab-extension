document.addEventListener("DOMContentLoaded", () => {
  const todoInput = document.getElementById("todoInput");
  const todoList = document.getElementById("todoList");
  const todoStats = document.getElementById("todoStats");
  const timeEl = document.getElementById("time");
  const dateEl = document.getElementById("date");
  const greetingEl = document.getElementById("greeting");

  // Data
  let todos = loadTodos();

  // Event: hanya Enter pada input
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.unshift({
      id: Date.now(),
      text,
      completed: false,
    });
    saveTodos();
    renderTodos();
    todoInput.value = "";
    todoInput.focus();
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

  function renderTodos() {
    if (!todos.length) {
      todoStats.textContent = "0 tugas · 0 selesai";
      return;
    }
    todoList.innerHTML = todos
      .map(
        (t, index) => `
      <div class="todo-item${t.completed ? " completed" : ""}" draggable="true" data-index="${index}">
        <div class="todo-text">${escapeHtml(t.text)}</div>
          <div class="todo-actions">
            <button class="complete-btn" data-id="${t.id}" title="${
              t.completed ? "Tandai belum selesai" : "Tandai selesai"
            }">${t.completed ? "↩" : "✓"}</button>
            
            <!-- Tambahan tombol edit -->
            <button class="edit-btn" data-id="${t.id}" title="Edit tugas">✎</button>
            
            <button class="delete-btn" data-id="${
              t.id
            }" title="Hapus tugas">✕</button>
          </div>
      </div>
    `,
      )
      .join("");
    todoList.querySelectorAll(".todo-item").forEach((item) => {
      item.addEventListener("dragstart", dragStart);
      item.addEventListener("dragover", dragOver);
      item.addEventListener("dragenter", dragEnter);
      item.addEventListener("dragleave", dragLeave);
      item.addEventListener("drop", dragDrop);
    });
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
    const completed = todos.filter((t) => t.completed).length;
    todoStats.textContent = `${todos.length} tugas · ${completed} selesai`;
  }

  function updateTimeAndGreeting() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    if (dateEl)
      dateEl.textContent = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
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

  // --- FUNGSI DRAG AND DROP ---
  let dragStartIndex;

  function dragStart(e) {
    dragStartIndex = +e.target.closest(".todo-item").dataset.index;
    e.target.classList.add("dragging");
  }

  function dragOver(e) {
    e.preventDefault(); // Wajib ada biar bisa di-drop
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

    // Tukar posisi di array
    const itemToMove = todos[dragStartIndex];
    todos.splice(dragStartIndex, 1);
    todos.splice(dragEndIndex, 0, itemToMove);

    saveTodos();
    renderTodos();
  }

  // --- FUNGSI EDIT TODO ---
  function editTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Munculin pop-up simpel buat ubah teks
    const newText = prompt("Ubah tugas kamu:", todo.text);
    if (newText !== null && newText.trim() !== "") {
      todo.text = newText.trim();
      saveTodos();
      renderTodos();
    }
  }

  // --- FUNGSI COPY KE OBSIDIAN ---
  const copyMdBtn = document.getElementById("copyMdBtn");
  if (copyMdBtn) {
    copyMdBtn.addEventListener("click", () => {
      // Ambil tanggal hari ini (format DD/MM/YYYY)
      const dateStr = new Date().toLocaleDateString("en-GB");

      // Bikin format teksnya
      let markdownText = `## Todo list for ${dateStr}\n\n`;
      todos.forEach((t) => {
        markdownText += `- [${t.completed ? "x" : " "}] ${t.text}\n`;
      });

      // Salin ke clipboard
      navigator.clipboard.writeText(markdownText).then(() => {
        const originalText = copyMdBtn.textContent;
        copyMdBtn.textContent = "✅ Tersalin!";

        // Balikin teks tombol setelah 2 detik
        setTimeout(() => {
          copyMdBtn.textContent = originalText;
        }, 2000);
      });
    });
  }

  // Init
  renderTodos();
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
});
