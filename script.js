
const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const total = document.getElementById("total");
const pending = document.getElementById("pending");
const completed = document.getElementById("completed");
const filter = document.getElementById("filter");
const calendarDate = document.getElementById("calendarDate");
const calendarTasks = document.getElementById("calendarTasks");

let tasks = JSON.parse(localStorage.getItem("studentTasks") || "[]");

function saveTasks() {
  localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function updateStats() {
  total.textContent = tasks.length;

  const completedCount = tasks.filter(t => t.done).length;
  pending.textContent = tasks.length - completedCount;
  completed.textContent = completedCount;

  const percentage = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  document.getElementById("progressText").textContent = percentage + "%";
  document.getElementById("progressBar").style.width = percentage + "%";
}

function renderUpcomingTasks() {
  const container = document.getElementById("upcomingTasks");
  container.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = tasks
    .filter(t => !t.done && t.date)
    .filter(t => new Date(t.date + "T00:00:00") >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (!upcoming.length) {
    container.textContent = "No upcoming tasks. Add a future task!";
    return;
  }

  upcoming.forEach(task => {
    const item = document.createElement("p");
    item.textContent = `${task.name} — ${task.type} — Due: ${task.date}`;
    container.appendChild(item);
  });
}

function renderDueDateReminders() {
  const container = document.getElementById("dueReminders");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeTasks = tasks.filter(task => !task.done && task.date);

  if (activeTasks.length === 0) {
    container.textContent = "No pending tasks. Great job! 🎉";
    return;
  }

  activeTasks.sort((a, b) => a.date.localeCompare(b.date));

  activeTasks.forEach(task => {
    const item = document.createElement("p");
    const dueDate = new Date(task.date + "T00:00:00");

    if (dueDate < today) {
      item.textContent = `⚠️ Overdue! ${task.name} — Due: ${task.date}`;
      item.className = "overdue";
    } else if (dueDate.getTime() === today.getTime()) {
      item.textContent = `🔔 Due Today! ${task.name}`;
      item.className = "due-today";
    } else {
      item.textContent = `📅 Upcoming: ${task.name} — Due: ${task.date}`;
      item.className = "upcoming";
    }

    container.appendChild(item);
  });
}

function renderCalendarTasks() {
  const selectedDate = calendarDate.value;
  calendarTasks.innerHTML = "";

  if (!selectedDate) {
    calendarTasks.textContent = "Choose a date to view your tasks.";
    return;
  }

  const matchingTasks = tasks.filter(t => t.date === selectedDate);

  if (!matchingTasks.length) {
    calendarTasks.textContent = "No tasks on this date.";
    return;
  }

  matchingTasks.forEach(task => {
    const item = document.createElement("p");
    item.textContent =
      `${task.done ? "✅ Completed" : "⏳ Pending"} — ${task.name} (${task.type})`;
    calendarTasks.appendChild(item);
  });
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(t => {
    if (filter.value === "pending") return !t.done;
    if (filter.value === "completed") return t.done;
    return true;
  });

  if (!visibleTasks.length) {
    taskList.textContent = "No tasks yet. Add your first task!";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = task.name;

    const details = document.createElement("p");
    details.textContent = `${task.type} • Due: ${task.date}`;
    info.append(name, details);

    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.textContent = task.done ? "Undo" : "Complete";

    doneButton.onclick = () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    };

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    };

    item.append(info, doneButton, deleteButton);
    taskList.appendChild(item);
  });

  updateStats();
  renderUpcomingTasks();
  renderDueDateReminders();
  renderCalendarTasks();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("taskTitle").value.trim();
  const type = document.getElementById("taskType").value;
  const date = document.getElementById("taskDate").value;

  if (!name || !date) return;

  tasks.push({
    id: Date.now(),
    name,
    type,
    date,
    done: false
  });

  saveTasks();
  form.reset();
  renderTasks();
});

filter.addEventListener("change", renderTasks);
calendarDate.addEventListener("change", renderCalendarTasks);

renderTasks();

// Dark Mode
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("studentTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");

    localStorage.setItem("studentTheme", isDark ? "dark" : "light");

    themeToggle.textContent = isDark
      ? "☀️ Light Mode"
      : "🌙 Dark Mode";
  });
}
