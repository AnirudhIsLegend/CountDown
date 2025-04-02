let countdownInterval;
let endDate;

// Make sure DOM is loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to buttons
    document.getElementById('startButton').addEventListener('click', startCountdown);
    document.getElementById('resetButton').addEventListener('click', resetCountdown);
    document.getElementById('editTitleBtn').addEventListener('click', editTitle);

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;

    // Check for saved countdown
    const savedTitle = localStorage.getItem('countdownTitle');
    const savedDate = localStorage.getItem('countdownDate');
    const savedTime = localStorage.getItem('countdownTime');

    if (savedTitle && savedDate && savedTime) {
        document.getElementById('eventTitle').value = savedTitle;
        document.getElementById('eventDate').value = savedDate;
        document.getElementById('eventTime').value = savedTime;
        startCountdown();
    }

    // Theme picker functionality
    const themeToggle = document.getElementById('themeToggle');
    const colorOptions = document.getElementById('colorOptions');
    const colorButtons = document.querySelectorAll('.color-option');

    themeToggle.addEventListener('click', () => {
        colorOptions.classList.toggle('show');
    });

    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;
            const rgb = hexToRgb(color);
            
            document.documentElement.style.setProperty('--accent-color', color);
            document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            
            colorOptions.classList.remove('show');
            
            // Save color preference
            localStorage.setItem('accentColor', color);
        });
    });

    // Load saved color preference
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        const rgb = hexToRgb(savedColor);
        document.documentElement.style.setProperty('--accent-color', savedColor);
        document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Close color options when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeToggle.contains(e.target) && !colorOptions.contains(e.target)) {
            colorOptions.classList.remove('show');
        }
    });

    displayRandomQuote();
    
    // Optional: Change quote every few hours
    const QUOTE_CHANGE_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
    setInterval(displayRandomQuote, QUOTE_CHANGE_INTERVAL);
});

function startCountdown() {
    const title = document.getElementById('eventTitle').value;
    const dateInput = document.getElementById('eventDate').value;
    const timeInput = document.getElementById('eventTime').value || '00:00';

    console.log('Starting countdown with:', { title, dateInput, timeInput }); // Debug log

    if (!title || !dateInput) {
        alert('Please enter both title and date');
        return;
    }

    // Combine date and time
    const dateTimeString = `${dateInput}T${timeInput}`;
    endDate = new Date(dateTimeString);
    const now = new Date();

    if (endDate <= now) {
        alert('Please select a future date and time');
        return;
    }

    // Display title
    document.getElementById('titleDisplay').textContent = title;

    // Switch views
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('countdownSection').style.display = 'block';

    // Start the countdown
    updateCountdown();
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(updateCountdown, 1000);

    // Store in localStorage
    localStorage.setItem('countdownTitle', title);
    localStorage.setItem('countdownDate', dateInput);
    localStorage.setItem('countdownTime', timeInput);
}

function updateCountdown() {
    const now = new Date();
    const timeLeft = endDate - now;

    if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        document.querySelector('.countdown-display').innerHTML = '<h2 style="color: #0ff;">Countdown Complete!</h2>';
        return;
    }

    // Calculate time units
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Update countdown display
    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // Update analog clock
    updateAnalogClock();
}

function updateAnalogClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Calculate rotation angles
    const hourDegrees = (hours % 12 + minutes / 60) * 30; // 360 / 12 = 30
    const minuteDegrees = (minutes + seconds / 60) * 6; // 360 / 60 = 6
    const secondDegrees = seconds * 6;

    // Apply rotations
    document.querySelector('.hour-hand').style.transform = `rotate(${hourDegrees}deg)`;
    document.querySelector('.minute-hand').style.transform = `rotate(${minuteDegrees}deg)`;
    document.querySelector('.second-hand').style.transform = `rotate(${secondDegrees}deg)`;
}

function resetCountdown() {
    // Clear interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Reset inputs
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';

    // Switch views back
    document.getElementById('countdownSection').style.display = 'none';
    document.getElementById('inputSection').style.display = 'flex';

    // Clear localStorage
    localStorage.removeItem('countdownTitle');
    localStorage.removeItem('countdownDate');
    localStorage.removeItem('countdownTime');

    todos = [];
    saveTodos();
    renderTodos();
}

function editTitle() {
    const titleDisplay = document.getElementById('titleDisplay');
    const currentTitle = titleDisplay.textContent;
    const editBtn = document.getElementById('editTitleBtn');
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'title-edit-input';
    
    // Replace title with input
    titleDisplay.style.display = 'none';
    titleDisplay.parentNode.insertBefore(input, titleDisplay);
    
    // Hide edit button while editing
    editBtn.style.display = 'none';
    
    // Focus input
    input.focus();
    input.select();
    
    function saveTitle() {
        const newTitle = input.value.trim() || 'Countdown Clock';
        titleDisplay.textContent = newTitle;
        
        // Remove input and show title
        input.remove();
        titleDisplay.style.display = '';
        editBtn.style.display = '';
        
        // Update localStorage
        localStorage.setItem('countdownTitle', newTitle);
    }
    
    // Save on enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveTitle();
        }
    });
    
    // Save on blur (when input loses focus)
    input.addEventListener('blur', saveTitle);
}

// Add these new functions for todo list functionality
let todos = [];

function initializeTodoList() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }

    document.getElementById('addTodoBtn').addEventListener('click', addTodo);
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text) {
        todos.push({
            id: Date.now(),
            text: text,
            completed: false
        });
        
        input.value = '';
        saveTodos();
        renderTodos();
    }
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}>
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <button class="todo-delete"><i class="fas fa-trash"></i></button>
        `;
        
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        const deleteBtn = li.querySelector('.todo-delete');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        todoList.appendChild(li);
    });
    
    updateTaskCount();
}

function updateTaskCount() {
    const remaining = todos.filter(todo => !todo.completed).length;
    document.querySelector('.task-count').textContent = 
        `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Update your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    initializeTodoList();
});

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Add this to your existing JavaScript
const quotes = [
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "Don't count the days, make the days count.",
        author: "Muhammad Ali"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "Everything you've ever wanted is on the other side of fear.",
        author: "George Addair"
    },
    {
        text: "The only limit to our realization of tomorrow will be our doubts of today.",
        author: "Franklin D. Roosevelt"
    },
    {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
    },
    {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs"
    },
    {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    },
    {
        text: "Everything is possible. The impossible just takes longer.",
        author: "Dan Brown"
    }
];

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    document.getElementById('quote-text').textContent = quote.text;
    document.getElementById('quote-author').textContent = `― ${quote.author}`;
}

// Rest of your existing JavaScript remains the same...