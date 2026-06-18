// script.js
(function() {
    "use strict";

    // ---------- elementos DOM ----------
    const motivationalPhraseEl = document.getElementById('motivationalPhrase');
    const newPhraseBtn = document.getElementById('newPhraseBtn');

    const taskInput = document.getElementById('taskInput');
    const taskTime = document.getElementById('taskTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const sortByTimeBtn = document.getElementById('sortByTimeBtn');

    // ---------- dados ----------
    let tasks = [];  // array de { text, time (string "HH:MM"), id }

    // frases motivacionais (base)
    const motivationalQuotes = [
        "“Ação é a ponte entre intenção e realização.”",
        "“Comece onde você está. Use o que você tem. Faça o que você pode.”",
        "“O segredo para começar é quebrar tarefas complexas em pequenas ações.”",
        "“Não espere por condições perfeitas. Comece agora.”",
        "“A disciplina é a mãe do sucesso.”",
        "“Cada minuto que você procrastina, você está roubando de si mesmo.”",
        "“Foco: 90% de atenção + 10% de ação.”",
        "“O agora é o único momento que você pode controlar.”",
        "“Pare de pensar demais. Comece a fazer.”",
        "“Motivação é o que te faz começar. Hábito é o que te mantém.”"
    ];

    // ---------- funções auxiliares ----------
    function getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        return motivationalQuotes[randomIndex];
    }

    // atualizar frase motivacional
    function updateMotivationalPhrase() {
        motivationalPhraseEl.textContent = getRandomQuote();
    }

    // gerar ID simples
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    }

    // renderizar lista de tarefas
    function renderTasks() {
        // limpa a lista (mas mantém o item vazio se necessário)
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'empty-message';
            emptyLi.textContent = 'Nenhuma tarefa ainda. Adicione acima!';
            taskList.appendChild(emptyLi);
            return;
        }

        // ordenar por horário (caso tenha) – mas apenas visual, mantemos a ordem do array
        // a ordenação por botão é separada
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;

            // texto da tarefa
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            textSpan.textContent = task.text;

            // horário (se existir)
            const timeSpan = document.createElement('span');
            timeSpan.className = 'task-time';
            timeSpan.textContent = task.time ? `⏰ ${task.time}` : '⏱️ livre';

            // botão deletar
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '✕';
            deleteBtn.setAttribute('aria-label', 'Remover tarefa');
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = li.dataset.id;
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
                // salvar no localStorage (opcional)
                saveToLocalStorage();
            });

            li.appendChild(textSpan);
            li.appendChild(timeSpan);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    // adicionar nova tarefa
    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') {
            alert('Por favor, digite uma tarefa.');
            return;
        }

        const time = taskTime.value; // "HH:MM"

        const newTask = {
            id: generateId(),
            text: text,
            time: time || '' // se não selecionar, fica vazio
        };

        tasks.push(newTask);
        renderTasks();
        // limpar input
        taskInput.value = '';
        // foco no input
        taskInput.focus();
        // salvar
        saveToLocalStorage();

        // feedback visual
        taskInput.style.borderColor = '#6d8b7a';
        setTimeout(() => taskInput.style.borderColor = '', 400);
    }

    // limpar todas as tarefas
    function clearAllTasks() {
        if (tasks.length === 0) return;
        if (confirm('Tem certeza que deseja remover todas as tarefas?')) {
            tasks = [];
            renderTasks();
            saveToLocalStorage();
        }
    }

    // ordenar por horário (crescente)
    function sortByTime() {
        if (tasks.length <= 1) return;

        tasks.sort((a, b) => {
            // tarefas sem horário vão para o final
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
        });

        renderTasks();
        saveToLocalStorage();
    }

    // ---------- persistência (localStorage) ----------
    function saveToLocalStorage() {
        try {
            const data = tasks.map(t => ({ text: t.text, time: t.time, id: t.id }));
            localStorage.setItem('procrastinationTasks', JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('procrastinationTasks');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    tasks = parsed;
                    renderTasks();
                }
            }
        } catch (e) { /* ignore */ }
    }

    // ---------- eventos ----------
    newPhraseBtn.addEventListener('click', updateMotivationalPhrase);

    addTaskBtn.addEventListener('click', addTask);

    // adicionar com Enter no campo de texto
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    clearAllBtn.addEventListener('click', clearAllTasks);

    sortByTimeBtn.addEventListener('click', sortByTime);

    // carregar dados e inicializar
    function init() {
        // carregar tarefas do localStorage
        loadFromLocalStorage();

        // se não houver tarefas, adicionamos um exemplo
        if (tasks.length === 0) {
            tasks = [
                { id: generateId(), text: '📚 Estudar 1h (Pomodoro)', time: '09:00' },
                { id: generateId(), text: '🧘 Meditar 10 min', time: '08:30' },
                { id: generateId(), text: '💻 Revisar e-mails', time: '10:15' },
            ];
            renderTasks();
            saveToLocalStorage();
        }

        // exibir frase motivacional aleatória
        motivationalPhraseEl.textContent = getRandomQuote();
    }

    // iniciar
    init();

    // atualizar frase a cada 40 segundos (opcional)
    setInterval(() => {
        updateMotivationalPhrase();
    }, 40000);

})();