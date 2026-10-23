// ==========================================
// NEKONOTES
// Reward-Based Digital Diary and Tracker
// ==========================================

// CAT COLLECTION

const cats = [
    {
        id: 1,
        name: "Mochi",
        emoji: "🐱",
        description: "Your first loyal companion!",
        cost: 0
    },
    {
        id: 2,
        name: "Luna",
        emoji: "🐈‍⬛",
        description: "A mysterious cat who loves nighttime.",
        cost: 30
    },
    {
        id: 3,
        name: "Peaches",
        emoji: "🐈",
        description: "A sweet cat with a sunny personality.",
        cost: 60
    },
    {
        id: 4,
        name: "Mochimaru",
        emoji: "😺",
        description: "A cheerful friend who loves adventures.",
        cost: 100
    },
    {
        id: 5,
        name: "Snowball",
        emoji: "😽",
        description: "A fluffy cat who enjoys cozy naps.",
        cost: 150
    },
    {
        id: 6,
        name: "Princess",
        emoji: "😻",
        description: "A royal kitty worthy of your collection.",
        cost: 220
    }
];

const DEFAULT_STATE = {
    points: 0,
    entries: [],
    tasks: [],
    unlockedCats: [1],
    claimedRewards: {
        entries: [],
        tasks: []
    }
};

// ==========================================
// DATA STORAGE
// ==========================================

function loadState() {
    try {
        const saved = localStorage.getItem("nekoNotesData");

        if (!saved) {
            return structuredClone(DEFAULT_STATE);
        }

        const data = JSON.parse(saved);

        if (
            !data ||
            !Number.isFinite(data.points) ||
            data.points < 0 ||
            !Array.isArray(data.entries) ||
            !Array.isArray(data.tasks) ||
            !Array.isArray(data.unlockedCats) ||
            !data.claimedRewards
        ) {
            throw new Error("Invalid saved data.");
        }

        return {
            ...DEFAULT_STATE,
            ...data,
            points: Math.floor(data.points),
            entries: data.entries,
            tasks: data.tasks,
            unlockedCats: [
                ...new Set(
                    [1, ...data.unlockedCats].filter(
                        id => cats.some(cat => cat.id === id)
                    )
                )
            ],
            claimedRewards: {
                entries: Array.isArray(data.claimedRewards.entries)
                    ? data.claimedRewards.entries
                    : [],
                tasks: Array.isArray(data.claimedRewards.tasks)
                    ? data.claimedRewards.tasks
                    : []
            }
        };

    } catch (error) {
        console.error("Unable to load NekoNotes data:", error);

        alert(
            "Your saved data could not be read. " +
            "The website will start with fresh data. " +
            "Your previous browser data has not been deleted."
        );

        return structuredClone(DEFAULT_STATE);
    }
}

let state = loadState();

function saveState() {
    try {
        localStorage.setItem("nekoNotesData", JSON.stringify(state));
        return true;
    } catch (error) {
        console.error("Unable to save NekoNotes data:", error);

        showToast(
            "Saving failed. Your browser storage may be full or unavailable."
        );

        return false;
    }
}

// ==========================================
// GENERAL HELPERS
// ==========================================

function createId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeout);

    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

const pageTitles = {
    dashboard: "Welcome to NekoNotes! 🌸",
    diary: "Your Little Diary 📖",
    tracker: "Your Daily Tracker ✅",
    cats: "Your Cat Collection 🐱"
};

function openPage(pageName) {
    const target = document.getElementById(pageName);

    if (!target) {
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    target.classList.add("active-page");

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    document.getElementById("pageTitle").textContent =
        pageTitles[pageName] || "NekoNotes";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    renderAll();
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });
});

// ==========================================
// POINTS SYSTEM
// ==========================================

function awardPoints(amount, message) {
    state.points += amount;

    if (!saveState()) {
        state.points -= amount;
        return false;
    }

    renderAll();
    showToast(message);

    return true;
}

// ==========================================
// DIARY SYSTEM
// ==========================================

document.getElementById("saveEntryBtn").addEventListener(
    "click",
    saveDiaryEntry
);

function saveDiaryEntry() {
    const titleInput = document.getElementById("entryTitle");
    const moodInput = document.getElementById("entryMood");
    const contentInput = document.getElementById("entryContent");

    const title = titleInput.value.trim();
    const mood = moodInput.value;
    const content = contentInput.value.trim();

    if (!title || !content) {
        showToast("Please enter a title and your diary thoughts. 💗");
        return;
    }

    const entry = {
        id: createId(),
        title: title,
        mood: mood,
        content: content,
        date: new Date().toISOString()
    };

    state.entries.unshift(entry);

    // Each entry can earn its reward only once.
    state.claimedRewards.entries.push(entry.id);

    // Save the entry and points together.
    state.points += 10;

    if (!saveState()) {
        state.entries.shift();
        state.claimedRewards.entries.pop();
        state.points -= 10;
        return;
    }

    titleInput.value = "";
    contentInput.value = "";
    moodInput.value = "😊";

    renderAll();

    showToast("Diary entry saved! You earned 10 points! ⭐");

    openPage("diary");
}

function deleteDiaryEntry(entryId) {
    const entry = state.entries.find(item => item.id === entryId);

    if (!entry) {
        return;
    }

    const confirmed = confirm(
        "Delete this diary entry? This action cannot be undone."
    );

    if (!confirmed) {
        return;
    }

    const previousEntries = state.entries;

    state.entries = state.entries.filter(
        item => item.id !== entryId
    );

    // Points already earned are not removed.
    if (!saveState()) {
        state.entries = previousEntries;
        return;
    }

    renderAll();
    showToast("Diary entry deleted.");
}

function renderEntries() {
    const allEntries = document.getElementById("allEntries");
    const recentEntries = document.getElementById("recentEntries");

    document.getElementById("entryCountLabel").textContent =
        `${state.entries.length} ${state.entries.length === 1 ? "entry" : "entries"}`;

    if (state.entries.length === 0) {
        const emptyHTML = `
            <div class="empty-state">
                <div style="font-size: 40px;">📖</div>
                <p>Your diary is waiting for its first story!</p>
                <p>Write something about your day. 💗</p>
            </div>
        `;

        allEntries.innerHTML = emptyHTML;
        recentEntries.innerHTML = emptyHTML;

        return;
    }

    const createEntryHTML = entry => `
        <article class="entry-card">
            <div class="entry-card-top">
                <div>
                    <h3>${escapeHTML(entry.title)}</h3>
                    <p class="entry-date">
                        ${escapeHTML(formatDate(entry.date))}
                    </p>
                </div>

                <span class="entry-mood">
                    ${escapeHTML(entry.mood)}
                </span>
            </div>

            <p class="entry-content">${escapeHTML(entry.content)}</p>

            <div class="entry-card-bottom">
                <span class="entry-reward">⭐ +10 points earned</span>

                <button
                    class="delete-btn"
                    data-delete-entry="${escapeHTML(entry.id)}"
                >
                    Delete
                </button>
            </div>
        </article>
    `;

    allEntries.innerHTML = state.entries
        .map(createEntryHTML)
        .join("");

    recentEntries.innerHTML = state.entries
        .slice(0, 3)
        .map(createEntryHTML)
        .join("");
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-delete-entry]");

    if (!button) {
        return;
    }

    deleteDiaryEntry(button.dataset.deleteEntry);
});

// ==========================================
// DAILY TASK TRACKER
// ==========================================

let currentFilter = "all";

document.getElementById("taskForm").addEventListener(
    "submit",
    addTask
);

function addTask(event) {
    event.preventDefault();

    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        showToast("Please enter a task first! 🌷");
        return;
    }

    const task = {
        id: createId(),
        title: title,
        completed: false,
        createdAt: new Date().toISOString()
    };

    state.tasks.unshift(task);

    if (!saveState()) {
        state.tasks.shift();
        return;
    }

    input.value = "";

    renderAll();

    showToast("New task added! Good luck! 🌱");
}

function toggleTask(taskId) {
    const task = state.tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    const previousCompleted = task.completed;
    const previousPoints = state.points;

    task.completed = !task.completed;

    if (task.completed) {
        // Only award points if this task has never earned them.
        if (!state.claimedRewards.tasks.includes(task.id)) {
            state.claimedRewards.tasks.push(task.id);
            state.points += 5;
        }
    }

    // Unchecking a task does not take back its earned points.
    if (!saveState()) {
        task.completed = previousCompleted;
        state.points = previousPoints;

        if (previousCompleted === false) {
            state.claimedRewards.tasks =
                state.claimedRewards.tasks.filter(
                    id => id !== task.id
                );
        }

        return;
    }

    renderAll();

    if (task.completed) {
        showToast("Task completed! You earned 5 points! ⭐");
    } else {
        showToast("Task marked as in progress.");
    }
}

function deleteTask(taskId) {
    const task = state.tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    const confirmed = confirm("Delete this task?");

    if (!confirmed) {
        return;
    }

    const previousTasks = state.tasks;

    state.tasks = state.tasks.filter(
        item => item.id !== taskId
    );

    // Keep previously earned points.
    if (!saveState()) {
        state.tasks = previousTasks;
        return;
    }

    renderAll();
    showToast("Task deleted.");
}

document.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-task-check]");

    if (!checkbox) {
        return;
    }

    toggleTask(checkbox.dataset.taskCheck);
});

document.addEventListener("click", event => {
    const button = event.target.closest("[data-delete-task]");

    if (!button) {
        return;
    }

    deleteTask(button.dataset.deleteTask);
});

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

function createTaskHTML(task) {
    return `
        <div class="task-item ${task.completed ? "completed" : ""}">
            <input
                type="checkbox"
                class="task-check"
                data-task-check="${escapeHTML(task.id)}"
                aria-label="Mark ${escapeHTML(task.title)} as completed"
                ${task.completed ? "checked" : ""}
            >

            <span class="task-text">
                ${escapeHTML(task.title)}
            </span>

            <span class="task-reward">
                ${task.completed ? "✓ Earned" : "+5 ⭐"}
            </span>

            <button
                class="delete-btn"
                data-delete-task="${escapeHTML(task.id)}"
                aria-label="Delete task"
            >
                ✕
            </button>
        </div>
    `;
}

function renderTasks() {
    const allTasks = document.getElementById("allTasks");
    const dashboardTasks = document.getElementById("dashboardTasks");

    const completedCount = state.tasks.filter(
        task => task.completed
    ).length;

    document.getElementById("taskCountLabel").textContent =
        `${state.tasks.length} tasks · ${completedCount} completed`;

    let filteredTasks = state.tasks;

    if (currentFilter === "active") {
        filteredTasks = state.tasks.filter(
            task => !task.completed
        );
    }

    if (currentFilter === "completed") {
        filteredTasks = state.tasks.filter(
            task => task.completed
        );
    }

    if (filteredTasks.length === 0) {
        allTasks.innerHTML = `
            <div class="empty-state">
                No tasks here yet. 🌸
            </div>
        `;
    } else {
        allTasks.innerHTML = filteredTasks
            .map(createTaskHTML)
            .join("");
    }

    if (state.tasks.length === 0) {
        dashboardTasks.innerHTML = `
            <div class="empty-state">
                <p>No tasks yet!</p>
                <p>Add a small goal to get started. 🌷</p>
            </div>
        `;
    } else {
        dashboardTasks.innerHTML = state.tasks
            .slice(0, 4)
            .map(createTaskHTML)
            .join("");
    }
}

// ==========================================
// CAT COLLECTION AND REWARDS
// ==========================================

function unlockCat(catId) {
    const cat = cats.find(item => item.id === catId);

    if (!cat) {
        return;
    }

    if (state.unlockedCats.includes(catId)) {
        showToast("You already have this adorable cat! 🐱");
        return;
    }

    if (state.points < cat.cost) {
        showToast(
            `You need ${cat.cost - state.points} more points! ⭐`
        );
        return;
    }

    const previousPoints = state.points;

    state.points -= cat.cost;
    state.unlockedCats.push(catId);

    if (!saveState()) {
        state.points = previousPoints;

        state.unlockedCats = state.unlockedCats.filter(
            id => id !== catId
        );

        return;
    }

    renderAll();

    showToast(`You unlocked ${cat.name}! Welcome to your family! 💗`);
}

function renderCats() {
    const catGrid = document.getElementById("catGrid");

    document.getElementById("collectionCount").textContent =
        state.unlockedCats.length;

    catGrid.innerHTML = cats.map(cat => {
        const unlocked = state.unlockedCats.includes(cat.id);

        let buttonHTML;

        if (unlocked) {
            buttonHTML = `
                <span class="cat-status">✓ Collected</span>
            `;
        } else {
            buttonHTML = `
                <button
                    class="primary-btn unlock-btn"
                    data-unlock-cat="${cat.id}"
                    ${state.points < cat.cost ? "disabled" : ""}
                >
                    Unlock · ${cat.cost} ⭐
                </button>
            `;
        }

        return `
            <article class="cat-card ${unlocked ? "unlocked" : "locked"}">
                <div class="cat-image">
                    ${unlocked ? cat.emoji : "🐾"}
                </div>

                <h3>${escapeHTML(cat.name)}</h3>

                <p>
                    ${unlocked
                        ? escapeHTML(cat.description)
                        : "A mystery kitty is waiting to join you!"}
                </p>

                <div class="cat-cost">
                    ${unlocked ? "YOUR LITTLE COMPANION" : `COST: ${cat.cost} POINTS`}
                </div>

                ${buttonHTML}
            </article>
        `;
    }).join("");

    const featuredCat = cats.find(
        cat => cat.id === state.unlockedCats[
            state.unlockedCats.length - 1
        ]
    ) || cats[0];

    document.getElementById("featuredCatImage").textContent =
        featuredCat.emoji;

    document.getElementById("featuredCatName").textContent =
        featuredCat.name;

    document.getElementById("featuredCatDescription").textContent =
        featuredCat.description;
}

document.addEventListener("click", event => {
    const button = event.target.closest("[data-unlock-cat]");

    if (!button) {
        return;
    }

    unlockCat(Number(button.dataset.unlockCat));
});

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function renderDashboard() {
    document.getElementById("totalPoints").textContent =
        state.points;

    document.getElementById("headerPoints").textContent =
        state.points;

    document.getElementById("totalEntries").textContent =
        state.entries.length;

    document.getElementById("totalTasks").textContent =
        state.tasks.filter(task => task.completed).length;

    document.getElementById("totalCats").textContent =
        state.unlockedCats.length;
}

// ==========================================
// RENDER EVERYTHING
// ==========================================

function renderAll() {
    renderDashboard();
    renderEntries();
    renderTasks();
    renderCats();
}

// ==========================================
// INITIALIZE THE WEBSITE
// ==========================================

function initializeApp() {
    const now = new Date();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    renderAll();
}

initializeApp();