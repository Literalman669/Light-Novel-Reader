// Check authentication and redirect if not logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    loadBookmarks();
});

function loadBookmarks() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === currentUser.email);
    const bookmarksList = document.getElementById('bookmarksList');

    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <h3>No Bookmarks Yet</h3>
                <p>Start reading and bookmark your favorite chapters to keep track of them!</p>
                <a href="index.html" class="primary-button">
                    <i class="fas fa-book"></i> Browse Novels
                </a>
            </div>
        `;
        return;
    }

    // Sort bookmarks by timestamp (newest first)
    const sortedBookmarks = [...user.bookmarks].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Load novel data
    const novels = JSON.parse(localStorage.getItem('novels')) || [];

    bookmarksList.innerHTML = sortedBookmarks.map(bookmark => {
        const novel = novels.find(n => n.id === bookmark.novelId);
        if (!novel) return ''; // Skip if novel not found

        return `
            <div class="item-card" onclick="navigateToChapter('${bookmark.novelId}', ${bookmark.chapterNumber})">
                <img src="${novel.coverUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}" 
                     alt="${novel.title}" 
                     class="item-cover">
                <div class="item-info">
                    <h3 class="item-title">${novel.title}</h3>
                    <div class="item-meta">
                        <span><i class="fas fa-book-open"></i> Chapter ${bookmark.chapterNumber}: ${bookmark.chapterTitle}</span>
                        <span><i class="fas fa-clock"></i> ${formatDate(bookmark.timestamp)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="action-button" onclick="removeBookmark(event, '${bookmark.novelId}', ${bookmark.chapterNumber})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function navigateToChapter(novelId, chapterNumber) {
    window.location.href = `novel.html?id=${novelId}&chapter=${chapterNumber}`;
}

function removeBookmark(event, novelId, chapterNumber) {
    event.stopPropagation(); // Prevent navigation

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex === -1) return;

    users[userIndex].bookmarks = users[userIndex].bookmarks.filter(
        b => !(b.novelId === novelId && b.chapterNumber === chapterNumber)
    );

    localStorage.setItem('users', JSON.stringify(users));
    loadBookmarks(); // Refresh the list

    showMessage('Bookmark removed successfully', 'success');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
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
