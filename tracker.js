(function () {
  var KEY = 'nekonotes.v1';

  var REWARDS = {
    tiny: 5,
    medium: 10,
    big: 20
  };

  function getData() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY));

      if (data && typeof data === 'object') {
        if (!Array.isArray(data.tasks)) data.tasks = [];
        if (typeof data.paws !== 'number') data.paws = 0;
        if (typeof data.doneTotal !== 'number') data.doneTotal = 0;

        return data;
      }
    } catch (error) {}

    return {
      tasks: [],
      paws: 0,
      doneTotal: 0
    };
  }

  function saveData(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function getToday() {
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
  }

  function updatePaws() {
    var data = getData();
    document.getElementById('pawCount').textContent = data.paws;
  }

  function renderStats() {
    var data = getData();
    var completed = data.tasks.filter(function (task) {
      return task.done;
    });

    var pawsToday = data.tasks.reduce(function (total, task) {
      if (task.done && task.completedOn === getToday()) {
        return total + task.pts;
      }

      return total;
    }, 0);

    document.getElementById('totalTasks').textContent =
      data.tasks.length;

    document.getElementById('completedTasks').textContent =
      completed.length;

    document.getElementById('earnedPaws').textContent =
      pawsToday;
  }

  function renderTasks() {
    var data = getData();
    var taskList = document.getElementById('taskList');

    taskList.innerHTML = '';

    if (data.tasks.length === 0) {
      taskList.innerHTML =
        '<p>Your task list is empty. Add your first task! ♡</p>';
    }

    data.tasks.forEach(function (task) {
      var card = document.createElement('div');
      card.className = 'tracker-task' + (task.done ? ' completed' : '');

      var checkButton = document.createElement('button');
      checkButton.className = 'tracker-check';
      checkButton.textContent = task.done ? '✓' : '○';

      var taskName = document.createElement('span');
      taskName.className = 'tracker-task-name';
      taskName.textContent = task.text;

      var reward = document.createElement('span');
      reward.className = 'tracker-task-reward';
      reward.textContent = '+' + task.pts + ' 🐾';

      var deleteButton = document.createElement('button');
      deleteButton.className = 'tracker-delete';
      deleteButton.textContent = '×';

      checkButton.addEventListener('click', function () {
        var latestData = getData();

        var currentTask = latestData.tasks.find(function (item) {
          return item.id === task.id;
        });

        if (!currentTask) return;

        if (!currentTask.done) {
          currentTask.done = true;
          currentTask.completedOn = getToday();
          latestData.doneTotal++;
          latestData.paws += currentTask.pts;
        } else {
          currentTask.done = false;
          currentTask.completedOn = null;
          latestData.doneTotal = Math.max(
            0,
            latestData.doneTotal - 1
          );

          latestData.paws = Math.max(
            0,
            latestData.paws - currentTask.pts
          );
        }

        saveData(latestData);
        renderTasks();
        renderStats();
        updatePaws();
      });

      deleteButton.addEventListener('click', function () {
        var latestData = getData();

        if (task.done) {
          latestData.doneTotal = Math.max(
            0,
            latestData.doneTotal - 1
          );
        }

        latestData.tasks = latestData.tasks.filter(function (item) {
          return item.id !== task.id;
        });

        saveData(latestData);
        renderTasks();
        renderStats();
        updatePaws();
      });

      card.appendChild(checkButton);
      card.appendChild(taskName);
      card.appendChild(reward);
      card.appendChild(deleteButton);

      taskList.appendChild(card);
    });
  }

  document.getElementById('addTaskBtn').addEventListener('click', function () {
    var input = document.getElementById('taskInput');
    var difficulty = document.getElementById('taskDifficulty');

    var taskText = input.value.trim();

    if (!taskText) {
      alert('Please enter a task first! ♡');
      return;
    }

    var data = getData();

    data.tasks.unshift({
      id: Date.now(),
      text: taskText,
      pts: REWARDS[difficulty.value],
      done: false,
      completedOn: null
    });

    saveData(data);

    input.value = '';

    renderTasks();
    renderStats();
    updatePaws();
  });

  renderTasks();
  renderStats();
  updatePaws();

})();