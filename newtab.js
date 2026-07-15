document.addEventListener("DOMContentLoaded", () => {
  // Elemen
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

  // Functions
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
        (t) => `
        <div class="todo-item${t.completed ? " completed" : ""}">
          <div class="todo-text">${escapeHtml(t.text)}</div>
          <div class="todo-actions">
            <button class="complete-btn" data-id="${t.id}" title="${
          t.completed ? "Tandai belum selesai" : "Tandai selesai"
        }">${t.completed ? "↩" : "✓"}</button>
            <button class="delete-btn" data-id="${
              t.id
            }" title="Hapus tugas">✕</button>
          </div>
        </div>
      `
      )
      .join("");
    todoList
      .querySelectorAll(".complete-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => toggleTodo(Number(btn.dataset.id)))
      );
    todoList
      .querySelectorAll(".delete-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteTodo(Number(btn.dataset.id)))
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

  // Init
  renderTodos();
  updateTimeAndGreeting();
  setInterval(updateTimeAndGreeting, 1000);
});
