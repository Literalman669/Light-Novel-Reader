// Theme Management
function initializeTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || (prefersDark.matches ? 'dark' : 'light');
    
    setTheme(currentTheme);

    // Add theme toggle click handler
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    });

    // Listen for system theme changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update all theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
        button.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });
}

// Search Functionality
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchOverlay || !closeSearch || !searchInput) return;

    // Show search overlay
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('active');
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    });

    // Hide search overlay
    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
        }
    });

    // Search input handler
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

function handleSearch() {
    const query = searchInput.value.toLowerCase();
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    
    const results = novels.filter(novel => 
        novel.title.toLowerCase().includes(query) ||
        novel.author.toLowerCase().includes(query) ||
        novel.description.toLowerCase().includes(query)
    );

    displaySearchResults(results);
}

// Novel Management
function displayNovels(novels, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    novels.forEach(novel => {
        const card = createNovelCard(novel);
        container.appendChild(card);
    });
}

function createNovelCard(novel) {
    const card = document.createElement('div');
    card.className = 'novel-card loading';
    card.onclick = () => navigateToNovel(novel.id);

    const statusText = {
        ongoing: 'Ongoing',
        completed: 'Completed',
        hiatus: 'On Hiatus'
    };

    card.innerHTML = `
        <div class="novel-status">${statusText[novel.status] || 'Unknown'}</div>
        <img src="${novel.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}" 
             alt="${novel.title}" 
             class="novel-cover"
             onload="this.parentElement.classList.remove('loading')">
        <div class="novel-info">
            <h3 class="novel-title">${novel.title}</h3>
            <p class="novel-author">By ${novel.author}</p>
        </div>
    `;

    // Add description tooltip
    if (novel.description) {
        card.setAttribute('title', novel.description);
    }

    // Fallback for image load error
    const img = card.querySelector('img');
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/200x300?text=No+Cover';
        card.classList.remove('loading');
    };

    return card;
}

function navigateToNovel(novelId) {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const novel = novels.find(n => n.id === novelId);
    
    if (!novel) return;

    // Add to reading history if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        
        if (userIndex !== -1) {
            if (!users[userIndex].readingHistory) {
                users[userIndex].readingHistory = [];
            }
            
            users[userIndex].readingHistory.unshift({
                novelId,
                title: novel.title,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Navigate to the novel page
    window.location.href = `novel.html?id=${novelId}`;
}

// Novel Data Management
function initializeNovelData() {
    const novels = JSON.parse(localStorage.getItem('novels'));
    if (!novels) {
        // Initialize with sample data
        const sampleNovels = [
            {
                id: '1',
                title: 'The Rising Hero',
                author: 'Sarah Chen',
                description: 'In a world where magic meets technology, a young apprentice discovers her hidden powers and must learn to harness them before darkness consumes everything she holds dear.',
                coverUrl: 'https://via.placeholder.com/200x300/4a90e2/ffffff?text=Rising+Hero',
                tags: ['Fantasy', 'Adventure', 'Magic'],
                chapters: [
                    {
                        number: 1,
                        title: 'The Awakening',
                        content: 'Maya never expected her sixteenth birthday to change everything. The morning started like any other, with the soft hum of hover-vehicles outside her window and the gentle whir of her room's environmental controls...',
                        dateAdded: new Date().toISOString()
                    },
                    {
                        number: 2,
                        title: 'First Steps',
                        content: 'The Academy's halls stretched endlessly before her, their crystal walls pulsing with magical energy. Maya's hand trembled as she reached for the door to her first class...',
                        dateAdded: new Date().toISOString()
                    }
                ],
                status: 'ongoing',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Cyber Samurai',
                author: 'Alex Tanaka',
                description: 'Set in Neo-Tokyo 2185, follow the journey of a modern samurai who must navigate both the ancient code of honor and the challenges of a world dominated by artificial intelligence.',
                coverUrl: 'https://via.placeholder.com/200x300/dc3545/ffffff?text=Cyber+Samurai',
                tags: ['Sci-Fi', 'Action', 'Cyberpunk'],
                chapters: [
                    {
                        number: 1,
                        title: 'Ghost in the Machine',
                        content: 'The neon signs cast their ethereal glow across the rain-slicked streets of Neo-Tokyo. Kenji adjusted his neural implant, the familiar tingle of data streaming through his consciousness...',
                        dateAdded: new Date().toISOString()
                    }
                ],
                status: 'ongoing',
                lastUpdated: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Academy of Dreams',
                author: 'Emily Walker',
                description: 'At the prestigious Dreamweaver Academy, students learn to navigate and shape the realm of dreams. But when nightmares begin leaking into reality, one freshman must step up to save both worlds.',
                coverUrl: 'https://via.placeholder.com/200x300/28a745/ffffff?text=Academy',
                tags: ['Fantasy', 'School Life', 'Mystery'],
                chapters: [
                    {
                        number: 1,
                        title: 'Welcome to Dreamweaver',
                        content: 'The acceptance letter shimmered in Lily's hands, the golden text seeming to float above the paper. She had done it - she had been accepted to the most prestigious dream academy in the world...',
                        dateAdded: new Date().toISOString()
                    }
                ],
                status: 'ongoing',
                lastUpdated: new Date().toISOString()
            }
        ];
        localStorage.setItem('novels', JSON.stringify(sampleNovels));
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function displaySearchResults(results) {
    // Create or get results container
    let resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        document.querySelector('.search-container').appendChild(resultsContainer);
    }

    resultsContainer.innerHTML = results.length > 0
        ? results.map(novel => `
            <div class="search-result" onclick="navigateToNovel('${novel.id}')">
                <img src="${novel.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}" alt="${novel.title}" class="result-cover">
                <div class="result-info">
                    <h4>${novel.title}</h4>
                    <p>${novel.author}</p>
                </div>
            </div>
        `).join('')
        : '<p class="no-results">No novels found</p>';
}

// Search reference
let searchInput;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Initialize search functionality
    initializeSearch();

    // Initialize novel data and display
    initializeNovelData();
    
    // Load featured novels
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const featuredContainer = document.getElementById('featuredNovels');
    if (featuredContainer) {
        displayNovels(novels.slice(0, 6), 'featuredNovels');
    }
    
    // Load latest updates
    const latestContainer = document.getElementById('latestUpdates');
    if (latestContainer) {
        const latestNovels = [...novels].sort((a, b) => 
            new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
        ).slice(0, 6);
        displayNovels(latestNovels, 'latestUpdates');
    }
});

// Make sure elements exist before adding event listeners
document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme');
    setTheme(theme === 'light' ? 'dark' : 'light');
});

// Initialize search when DOM is ready
document.querySelector('#searchBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        searchInput = document.getElementById('searchInput');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
});
