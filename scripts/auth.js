// DOM Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerLink = document.getElementById('registerLink');
const loginLink = document.getElementById('loginLink');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const closeButtons = document.querySelectorAll('.close-modal');

// Event Listeners
loginBtn.addEventListener('click', () => showModal(loginModal));
registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(registerModal);
    hideModal(loginModal);
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showModal(loginModal);
    hideModal(registerModal);
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        hideModal(loginModal);
        hideModal(registerModal);
    });
});

// Handle clicking outside modal to close
window.addEventListener('click', (e) => {
    if (e.target === loginModal) hideModal(loginModal);
    if (e.target === registerModal) hideModal(registerModal);
});

// Form submissions
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Modal Functions
function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin || false
        }));
        hideModal(loginModal);
        updateNavigation();
        showMessage('Successfully logged in!', 'success');
    } else {
        showMessage('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showMessage('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        username,
        email,
        password,
        isAdmin: users.length === 0, // First user is admin
        bookmarks: [],
        readingHistory: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    localStorage.setItem('currentUser', JSON.stringify({
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin
    }));

    hideModal(registerModal);
    updateNavigation();
    showMessage('Registration successful!', 'success');
}

function logout() {
    localStorage.removeItem('currentUser');
    updateNavigation();
    showMessage('Successfully logged out!', 'success');
}

// UI Updates
function updateNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginBtn = document.getElementById('loginBtn');

    if (currentUser) {
        loginBtn.textContent = currentUser.username;
        loginBtn.href = '#';
        loginBtn.onclick = () => showUserMenu(currentUser);
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.href = '#';
        loginBtn.onclick = () => showModal(loginModal);
    }

    // Update navigation based on user role
    const navLinks = document.querySelector('.nav-links');
    const adminLinkExists = document.querySelector('.admin-link');
    
    if (currentUser?.isAdmin && !adminLinkExists) {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin/index.html';
        adminLink.className = 'nav-link admin-link';
        adminLink.innerHTML = '<i class="fas fa-cog"></i> Admin';
        navLinks.insertBefore(adminLink, loginBtn);
    } else if (!currentUser?.isAdmin && adminLinkExists) {
        adminLinkExists.remove();
    }

    // Add user menu if logged in
    const userMenuExists = document.querySelector('.user-menu-container');
    if (currentUser && !userMenuExists) {
        const userMenu = document.createElement('div');
        userMenu.className = 'user-menu-container';
        userMenu.innerHTML = `
            <button class="user-menu-button">
                <i class="fas fa-user"></i>
                <span>${currentUser.username}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-dropdown">
                <a href="#" class="menu-item" onclick="navigateToBookmarks()">
                    <i class="fas fa-bookmark"></i> My Bookmarks
                </a>
                <a href="#" class="menu-item" onclick="navigateToHistory()">
                    <i class="fas fa-history"></i> Reading History
                </a>
                <div class="menu-divider"></div>
                <a href="#" class="menu-item" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        `;
        navLinks.replaceChild(userMenu, loginBtn);

        // Add event listener for menu toggle
        const menuButton = userMenu.querySelector('.user-menu-button');
        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            userMenu.classList.remove('active');
        });
    }
}

// Message System
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// User Menu
function showUserMenu(user) {
    const existingMenu = document.querySelector('.user-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'user-menu';
    
    const items = [
        { text: 'My Bookmarks', onClick: () => navigateTo('/bookmarks') },
        { text: 'Reading History', onClick: () => navigateTo('/history') }
    ];

    if (user.isAdmin) {
        items.push({ text: 'Admin Panel', onClick: () => navigateTo('/admin') });
    }

    items.push({ text: 'Logout', onClick: logout });

    items.forEach(item => {
        const button = document.createElement('button');
        button.textContent = item.text;
        button.onclick = item.onClick;
        menu.appendChild(button);
    });

    const loginBtn = document.getElementById('loginBtn');
    const rect = loginBtn.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== loginBtn) {
            menu.remove();
        }
    }, { once: true });
}

// Navigation helper
function navigateTo(path) {
    switch (path) {
        case '/bookmarks':
            window.location.href = 'bookmarks.html';
            break;
        case '/history':
            window.location.href = 'history.html';
            break;
        case '/admin':
            window.location.href = 'admin/index.html';
            break;
        default:
            window.location.href = 'index.html';
    }
}

function navigateToBookmarks() {
    window.location.href = 'bookmarks.html';
}

function navigateToHistory() {
    window.location.href = 'history.html';
}

// Initialize navigation state
document.addEventListener('DOMContentLoaded', updateNavigation);
