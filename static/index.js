let tasks = [];
let currentFilter = "all";

async function fetchTasks() {
    const res = await fetch("/get_tasks");
    tasks = await res.json();
    renderTasks();
}

async function addTask() {
    const input = document.getElementById("taskInput");
    if (input.value.trim() === "") return;

    await fetch("/add_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text: input.value})
    });

    input.value = "";
    fetchTasks();
}

async function deleteTask(index) {
    await fetch("/delete_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index})
    });

    fetchTasks();
}

async function toggleComplete(index) {
    await fetch("/toggle_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index})
    });

    fetchTasks();
}

async function editTask(index) {
    const newTask = prompt("Edit task:", tasks[index].text);
    if (!newTask) return;

    await fetch("/edit_task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({index, text: newTask})
    });

    fetchTasks();
}

async function clearCompleted() {
    await fetch("/clear_completed", { method: "POST" });
    fetchTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
    document.getElementById("filter-" + filter).classList.add("active");
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    let completedCount = 0;

    tasks.forEach((task, index) => {
        if (task.completed) completedCount++;

        if (
            (currentFilter === "completed" && !task.completed) ||
            (currentFilter === "pending" && task.completed)
        ) return;

        list.innerHTML += `
            <li>
                <div class="left">
                    <input type="checkbox" ${task.completed ? "checked" : ""} 
                        onchange="toggleComplete(${index})">

                    <span class="${task.completed ? "completed" : ""}">
                        ${task.text}
                    </span>
                </div>

                <div class="actions">
                    <button onclick="editTask(${index})">Edit</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                </div>
            </li>
        `;
    });

    document.getElementById("total").textContent = "Total: " + tasks.length;
    document.getElementById("completed").textContent = "Completed: " + completedCount;
    document.getElementById("remaining").textContent = "Remaining: " + (tasks.length - completedCount);
}

// Load on start
fetchTasks();
