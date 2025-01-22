// DOM Elements
const novelTitle = document.getElementById('novelTitle');
const novelAuthor = document.getElementById('novelAuthor');
const novelStatus = document.getElementById('novelStatus');
const novelCover = document.getElementById('novelCover');
const novelTags = document.getElementById('novelTags');
const novelDescription = document.getElementById('novelDescription');
const chapterSelect = document.getElementById('chapterSelect');
const chapterContent = document.getElementById('chapterContent');
const prevChapter = document.getElementById('prevChapter');
const nextChapter = document.getElementById('nextChapter');
const addBookmark = document.getElementById('addBookmark');
const decreaseFont = document.getElementById('decreaseFont');
const increaseFont = document.getElementById('increaseFont');
const progressBar = document.getElementById('progressBar');

// State
let currentNovel = null;
let currentChapter = null;
let fontSize = parseInt(localStorage.getItem('readerFontSize') || '2');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const novelId = params.get('id');
    
    if (novelId) {
        loadNovel(novelId);
        const chapterNum = parseInt(params.get('chapter'));
        if (chapterNum) {
            setTimeout(() => loadChapter(chapterNum), 100);
        }
    } else {
        window.location.href = 'index.html';
    }

    initializeEventListeners();
    updateFontSize();
});

// Event Listeners
function initializeEventListeners() {
    chapterSelect.addEventListener('change', () => {
        const chapterNum = parseInt(chapterSelect.value);
        if (chapterNum) {
            loadChapter(chapterNum);
            updateURL(chapterNum);
        }
    });

    prevChapter.addEventListener('click', () => {
        if (currentChapter && currentChapter.number > 1) {
            loadChapter(currentChapter.number - 1);
            updateURL(currentChapter.number - 1);
        }
    });

    nextChapter.addEventListener('click', () => {
        if (currentChapter && currentNovel && currentChapter.number < currentNovel.chapters.length) {
            loadChapter(currentChapter.number + 1);
            updateURL(currentChapter.number + 1);
        }
    });

    addBookmark.addEventListener('click', toggleBookmark);
    
    decreaseFont.addEventListener('click', () => {
        if (fontSize > 1) {
            fontSize--;
            updateFontSize();
        }
    });

    increaseFont.addEventListener('click', () => {
        if (fontSize < 5) {
            fontSize++;
            updateFontSize();
        }
    });

    // Reading Progress
    window.addEventListener('scroll', updateReadingProgress);
}

// Novel Loading
function loadNovel(novelId) {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    currentNovel = novels.find(n => n.id === novelId);
    
    if (!currentNovel) {
        window.location.href = 'index.html';
        return;
    }

    updateNovelInfo();
    updateChapterList();
    updateBookmarkButton();
}

function updateNovelInfo() {
    document.title = `${currentNovel.title} - Light Novel Reader`;
    novelTitle.textContent = currentNovel.title;
    novelAuthor.textContent = `By: ${currentNovel.author}`;
    novelStatus.textContent = `Status: ${currentNovel.status}`;
    novelDescription.textContent = currentNovel.description;
    
    if (currentNovel.coverUrl) {
        novelCover.src = currentNovel.coverUrl;
    }

    // Update tags
    novelTags.innerHTML = (currentNovel.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
}

function updateChapterList() {
    if (!currentNovel.chapters) return;

    chapterSelect.innerHTML = `
        <option value="">Select Chapter</option>
        ${currentNovel.chapters.map(chapter => `
            <option value="${chapter.number}">Chapter ${chapter.number}: ${chapter.title}</option>
        `).join('')}
    `;
}

// Chapter Loading
function loadChapter(chapterNumber) {
    if (!currentNovel) return;

    const chapter = currentNovel.chapters.find(c => c.number === chapterNumber);
    if (!chapter) return;

    currentChapter = chapter;
    chapterSelect.value = chapter.number;
    
    // Add loading animation
    chapterContent.classList.add('loading');
    chapterContent.innerHTML = `
        <div class="loading-spinner"></div>
    `;

    // Simulate loading delay for smoother transition
    setTimeout(() => {
        chapterContent.classList.remove('loading');
        chapterContent.innerHTML = `
            <h2 class="chapter-title">Chapter ${chapter.number}: ${chapter.title}</h2>
            <div class="chapter-text">${formatChapterContent(chapter.content)}</div>
        `;

        // Restore scroll position if returning to a previously read chapter
        const savedPosition = localStorage.getItem(`scroll_${currentNovel.id}_${chapter.number}`);
        if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition));
        } else {
            window.scrollTo(0, 0);
        }

        updateNavigationButtons();
        updateReadingProgress();
        addToReadingHistory();

        // Add swipe navigation for mobile
        initializeSwipeNavigation();
    }, 300);

    // Update page title
    document.title = `${chapter.title} - ${currentNovel.title}`;

    // Update URL without reloading
    updateURL(chapterNumber);
}

// Save scroll position periodically
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (currentNovel && currentChapter) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            localStorage.setItem(
                `scroll_${currentNovel.id}_${currentChapter.number}`,
                window.scrollY.toString()
            );
        }, 100);
    }
});

// Swipe navigation for mobile
function initializeSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const content = document.querySelector('.chapter-text');
    if (!content) return;

    content.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    content.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 100;
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) < swipeThreshold) return;

        if (diff > 0 && !prevChapter.disabled) {
            // Swipe right - previous chapter
            loadChapter(currentChapter.number - 1);
        } else if (diff < 0 && !nextChapter.disabled) {
            // Swipe left - next chapter
            loadChapter(currentChapter.number + 1);
        }
    }
}

function formatChapterContent(content) {
    return content
        .split('\n')
        .filter(para => para.trim())
        .map(para => `<p>${para}</p>`)
        .join('');
}

function updateNavigationButtons() {
    if (!currentChapter || !currentNovel) return;

    prevChapter.disabled = currentChapter.number <= 1;
    nextChapter.disabled = currentChapter.number >= currentNovel.chapters.length;
}

// Reading Progress
function updateReadingProgress() {
    const content = document.querySelector('.chapter-text');
    if (!content) return;

    const contentBox = content.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalHeight = content.offsetHeight;
    const scrolled = window.scrollY - content.offsetTop + windowHeight;
    
    const progress = Math.max(0, Math.min(100, (scrolled / totalHeight) * 100));
    progressBar.style.width = `${progress}%`;

    // Save progress if over 90% complete
    if (progress > 90) {
        saveReadingProgress();
    }
}

// Bookmarks
function toggleBookmark() {
    if (!currentNovel || !currentChapter) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showMessage('Please log in to bookmark chapters', 'info');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex === -1) return;

    if (!users[userIndex].bookmarks) {
        users[userIndex].bookmarks = [];
    }

    const bookmarkIndex = users[userIndex].bookmarks.findIndex(
        b => b.novelId === currentNovel.id && b.chapterNumber === currentChapter.number
    );

    if (bookmarkIndex === -1) {
        users[userIndex].bookmarks.push({
            novelId: currentNovel.id,
            novelTitle: currentNovel.title,
            chapterNumber: currentChapter.number,
            chapterTitle: currentChapter.title,
            timestamp: new Date().toISOString()
        });
        showMessage('Bookmark added', 'success');
    } else {
        users[userIndex].bookmarks.splice(bookmarkIndex, 1);
        showMessage('Bookmark removed', 'success');
    }

    localStorage.setItem('users', JSON.stringify(users));
    updateBookmarkButton();
}

function updateBookmarkButton() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentNovel || !currentChapter) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user) return;

    const isBookmarked = user.bookmarks?.some(
        b => b.novelId === currentNovel.id && b.chapterNumber === currentChapter.number
    );

    addBookmark.innerHTML = isBookmarked
        ? '<i class="fas fa-bookmark"></i> Bookmarked'
        : '<i class="far fa-bookmark"></i> Bookmark';
}

// Reading History
function addToReadingHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentNovel || !currentChapter) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex === -1) return;

    if (!users[userIndex].readingHistory) {
        users[userIndex].readingHistory = [];
    }

    // Remove older entry for this novel if exists
    const existingIndex = users[userIndex].readingHistory.findIndex(
        h => h.novelId === currentNovel.id
    );
    if (existingIndex !== -1) {
        users[userIndex].readingHistory.splice(existingIndex, 1);
    }

    // Add new entry at the beginning
    users[userIndex].readingHistory.unshift({
        novelId: currentNovel.id,
        novelTitle: currentNovel.title,
        chapterNumber: currentChapter.number,
        chapterTitle: currentChapter.title,
        timestamp: new Date().toISOString()
    });

    // Keep only last 50 entries
    if (users[userIndex].readingHistory.length > 50) {
        users[userIndex].readingHistory = users[userIndex].readingHistory.slice(0, 50);
    }

    localStorage.setItem('users', JSON.stringify(users));
}

// Font Size Management
function updateFontSize() {
    document.body.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5');
    document.body.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('readerFontSize', fontSize.toString());
}

// URL Management
function updateURL(chapterNum) {
    if (!currentNovel) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('chapter', chapterNum.toString());
    window.history.pushState({}, '', url.toString());
}
