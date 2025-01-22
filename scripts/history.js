// Check authentication and redirect if not logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    loadReadingHistory();
});

function loadReadingHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === currentUser.email);
    const historyList = document.getElementById('historyList');

    if (!user || !user.readingHistory || user.readingHistory.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>No Reading History</h3>
                <p>Your reading history will appear here once you start reading novels.</p>
                <a href="index.html" class="primary-button">
                    <i class="fas fa-book"></i> Browse Novels
                </a>
            </div>
        `;
        return;
    }

    // Get unique novels from history (most recent entry for each novel)
    const uniqueNovels = user.readingHistory.reduce((acc, entry) => {
        if (!acc.some(e => e.novelId === entry.novelId)) {
            acc.push(entry);
        }
        return acc;
    }, []);

    // Load novel data
    const novels = JSON.parse(localStorage.getItem('novels')) || [];

    historyList.innerHTML = uniqueNovels.map(historyEntry => {
        const novel = novels.find(n => n.id === historyEntry.novelId);
        if (!novel) return ''; // Skip if novel not found

        // Find the latest chapter read
        const latestChapter = user.readingHistory.find(h => h.novelId === historyEntry.novelId);

        return `
            <div class="item-card" onclick="navigateToChapter('${historyEntry.novelId}', ${latestChapter.chapterNumber})">
                <img src="${novel.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}" 
                     alt="${novel.title}" 
                     class="item-cover">
                <div class="item-info">
                    <h3 class="item-title">${novel.title}</h3>
                    <div class="item-meta">
                        <span><i class="fas fa-book-open"></i> Last Read: Chapter ${latestChapter.chapterNumber}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(latestChapter.timestamp)}</span>
                        <span><i class="fas fa-bookmark"></i> Progress: ${calculateProgress(novel, latestChapter.chapterNumber)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="action-button" onclick="continueReading(event, '${historyEntry.novelId}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="action-button" onclick="removeFromHistory(event, '${historyEntry.novelId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add sort controls
    addSortControls();
}

function calculateProgress(novel, currentChapter) {
    if (!novel.chapters || novel.chapters.length === 0) return '0%';
    const progress = (currentChapter / novel.chapters.length) * 100;
    return `${Math.round(progress)}%`;
}

function addSortControls() {
    const controls = document.createElement('div');
    controls.className = 'sort-controls';
    controls.innerHTML = `
        <button class="sort-button active" data-sort="recent">
            <i class="fas fa-clock"></i> Most Recent
        </button>
        <button class="sort-button" data-sort="progress">
            <i class="fas fa-tasks"></i> By Progress
        </button>
    `;

    const historyList = document.getElementById('historyList');
    historyList.parentNode.insertBefore(controls, historyList);

    // Add event listeners
    controls.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', () => {
            controls.querySelectorAll('.sort-button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            sortHistory(button.dataset.sort);
        });
    });
}

function sortHistory(sortBy) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user || !user.readingHistory) return;

    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    
    let sortedHistory = [...user.readingHistory];
    if (sortBy === 'progress') {
        sortedHistory.sort((a, b) => {
            const novelA = novels.find(n => n.id === a.novelId);
            const novelB = novels.find(n => n.id === b.novelId);
            const progressA = novelA ? (a.chapterNumber / novelA.chapters.length) : 0;
            const progressB = novelB ? (b.chapterNumber / novelB.chapters.length) : 0;
            return progressB - progressA;
        });
    }

    loadReadingHistory(); // Reload with new sort
}

function navigateToChapter(novelId, chapterNumber) {
    window.location.href = `novel.html?id=${novelId}&chapter=${chapterNumber}`;
}

function continueReading(event, novelId) {
    event.stopPropagation();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === currentUser.email);
    
    if (!user || !user.readingHistory) return;

    const lastRead = user.readingHistory.find(h => h.novelId === novelId);
    if (lastRead) {
        navigateToChapter(novelId, lastRead.chapterNumber);
    }
}

function removeFromHistory(event, novelId) {
    event.stopPropagation();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) return;

    users[userIndex].readingHistory = users[userIndex].readingHistory.filter(
        h => h.novelId !== novelId
    );

    localStorage.setItem('users', JSON.stringify(users));
    loadReadingHistory();

    showMessage('Reading history entry removed', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const hours = Math.floor(diffTime / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diffTime / (1000 * 60));
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Message System (reused from main.js)
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
