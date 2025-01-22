// Check admin access
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAccess()) return;
    
    loadNovels();
    initializeEventListeners();
    initializeModals();
    updateNovelSelect();
});

// Event Listeners
function initializeEventListeners() {
    // Panel navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.panel}Panel`).classList.add('active');
        });
    });

    // Novel management
    document.getElementById('addNovelBtn').addEventListener('click', () => showNovelModal());
    document.getElementById('novelForm').addEventListener('submit', handleNovelSubmit);

    // Chapter management
    document.getElementById('novelSelect').addEventListener('change', loadChapters);
    document.getElementById('addChapterBtn').addEventListener('click', () => showChapterModal());
    document.getElementById('chapterForm').addEventListener('submit', handleChapterSubmit);

    // Delete confirmation
    document.getElementById('cancelDelete').addEventListener('click', () => hideModal('deleteModal'));
}

// Modal Management
function initializeModals() {
    // Set up modal close handlers
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => hideModal(modal.id));
        }

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });

    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Reset forms when closing modals
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Novel Management
function loadNovels() {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const novelsList = document.getElementById('novelsList');
    
    novelsList.innerHTML = novels.map(novel => `
        <div class="list-item">
            <div class="list-item-info">
                <h3 class="list-item-title">${novel.title}</h3>
                <div class="list-item-meta">
                    <span>By ${novel.author}</span> • 
                    <span>${novel.status}</span> • 
                    <span>${novel.chapters?.length || 0} chapters</span>
                </div>
            </div>
            <div class="list-item-actions">
                <button class="icon-button" onclick="editNovel('${novel.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button" onclick="confirmDelete('novel', '${novel.id}', '${novel.title}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateNovelSelect();
}

function showNovelModal(novelId = null) {
    const modal = document.getElementById('novelModal');
    const form = document.getElementById('novelForm');
    const title = document.getElementById('novelModalTitle');

    if (novelId) {
        const novels = JSON.parse(localStorage.getItem('novels')) || [];
        const novel = novels.find(n => n.id === novelId);
        if (novel) {
            form.elements.novelTitle.value = novel.title;
            form.elements.novelAuthor.value = novel.author;
            form.elements.novelDescription.value = novel.description;
            form.elements.novelStatus.value = novel.status;
            form.elements.novelCover.value = novel.coverUrl || '';
            form.elements.novelTags.value = novel.tags?.join(', ') || '';
        }
        title.textContent = 'Edit Novel';
        form.dataset.editId = novelId;
    } else {
        form.reset();
        title.textContent = 'Add New Novel';
        delete form.dataset.editId;
    }

    showModal('novelModal');
}

function handleNovelSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    
    const novelData = {
        title: form.elements.novelTitle.value,
        author: form.elements.novelAuthor.value,
        description: form.elements.novelDescription.value,
        status: form.elements.novelStatus.value,
        coverUrl: form.elements.novelCover.value,
        tags: form.elements.novelTags.value.split(',').map(tag => tag.trim()).filter(Boolean),
        lastUpdated: new Date().toISOString()
    };

    if (form.dataset.editId) {
        const index = novels.findIndex(n => n.id === form.dataset.editId);
        if (index !== -1) {
            novels[index] = { ...novels[index], ...novelData };
            showMessage('Novel updated successfully', 'success');
        }
    } else {
        novelData.id = Date.now().toString();
        novelData.chapters = [];
        novels.push(novelData);
        showMessage('Novel added successfully', 'success');
    }

    localStorage.setItem('novels', JSON.stringify(novels));
    hideModal('novelModal');
    loadNovels();
}

// Chapter Management
function updateNovelSelect() {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const select = document.getElementById('novelSelect');
    
    select.innerHTML = `
        <option value="">Select Novel</option>
        ${novels.map(novel => `
            <option value="${novel.id}">${novel.title}</option>
        `).join('')}
    `;
}

function loadChapters() {
    const novelId = document.getElementById('novelSelect').value;
    const chaptersList = document.getElementById('chaptersList');
    
    if (!novelId) {
        chaptersList.innerHTML = '<p>Please select a novel</p>';
        return;
    }

    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const novel = novels.find(n => n.id === novelId);
    
    if (!novel || !novel.chapters) {
        chaptersList.innerHTML = '<p>No chapters found</p>';
        return;
    }

    chaptersList.innerHTML = novel.chapters.map(chapter => `
        <div class="list-item">
            <div class="list-item-info">
                <h3 class="list-item-title">Chapter ${chapter.number}: ${chapter.title}</h3>
                <div class="list-item-meta">
                    <span>Added: ${new Date(chapter.dateAdded).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="list-item-actions">
                <button class="icon-button" onclick="editChapter('${novel.id}', ${chapter.number})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button" onclick="confirmDelete('chapter', '${novel.id}', '${chapter.title}', ${chapter.number})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showChapterModal(novelId = null, chapterNumber = null) {
    const modal = document.getElementById('chapterModal');
    const form = document.getElementById('chapterForm');
    const title = document.getElementById('chapterModalTitle');

    if (novelId && chapterNumber !== null) {
        const novels = JSON.parse(localStorage.getItem('novels')) || [];
        const novel = novels.find(n => n.id === novelId);
        const chapter = novel?.chapters?.find(c => c.number === chapterNumber);
        
        if (chapter) {
            form.elements.chapterTitle.value = chapter.title;
            form.elements.chapterNumber.value = chapter.number;
            form.elements.chapterContent.value = chapter.content;
            title.textContent = 'Edit Chapter';
            form.dataset.editNovelId = novelId;
            form.dataset.editChapterNumber = chapterNumber;
        }
    } else {
        const novelSelect = document.getElementById('novelSelect');
        form.reset();
        title.textContent = 'Add New Chapter';
        form.dataset.editNovelId = novelSelect.value;
        delete form.dataset.editChapterNumber;

        // Set next chapter number
        const novels = JSON.parse(localStorage.getItem('novels')) || [];
        const novel = novels.find(n => n.id === novelSelect.value);
        if (novel?.chapters?.length) {
            const maxChapterNum = Math.max(...novel.chapters.map(c => c.number));
            form.elements.chapterNumber.value = maxChapterNum + 1;
        } else {
            form.elements.chapterNumber.value = 1;
        }
    }

    showModal('chapterModal');
}

function handleChapterSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const novelId = form.dataset.editNovelId || document.getElementById('novelSelect').value;
    const novelIndex = novels.findIndex(n => n.id === novelId);

    if (novelIndex === -1) return;

    const chapterData = {
        title: form.elements.chapterTitle.value,
        number: parseInt(form.elements.chapterNumber.value),
        content: form.elements.chapterContent.value,
        dateAdded: new Date().toISOString()
    };

    if (!novels[novelIndex].chapters) {
        novels[novelIndex].chapters = [];
    }

    if (form.dataset.editChapterNumber) {
        const chapterIndex = novels[novelIndex].chapters.findIndex(
            c => c.number === parseInt(form.dataset.editChapterNumber)
        );
        if (chapterIndex !== -1) {
            novels[novelIndex].chapters[chapterIndex] = chapterData;
            showMessage('Chapter updated successfully', 'success');
        }
    } else {
        novels[novelIndex].chapters.push(chapterData);
        novels[novelIndex].lastUpdated = new Date().toISOString();
        showMessage('Chapter added successfully', 'success');
    }

    // Sort chapters by number
    novels[novelIndex].chapters.sort((a, b) => a.number - b.number);

    localStorage.setItem('novels', JSON.stringify(novels));
    hideModal('chapterModal');
    loadChapters();
}

// Delete Functionality
function confirmDelete(type, id, name, chapterNumber = null) {
    const modal = document.getElementById('deleteModal');
    const message = document.getElementById('deleteMessage');
    const confirmBtn = document.getElementById('confirmDelete');

    message.textContent = `Are you sure you want to delete ${type} "${name}"?`;
    
    confirmBtn.onclick = () => {
        if (type === 'novel') {
            deleteNovel(id);
        } else {
            deleteChapter(id, chapterNumber);
        }
        hideModal('deleteModal');
    };

    showModal('deleteModal');
}

function deleteNovel(novelId) {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const updatedNovels = novels.filter(novel => novel.id !== novelId);
    localStorage.setItem('novels', JSON.stringify(updatedNovels));
    loadNovels();
    showMessage('Novel deleted successfully', 'success');
}

function deleteChapter(novelId, chapterNumber) {
    const novels = JSON.parse(localStorage.getItem('novels')) || [];
    const novelIndex = novels.findIndex(n => n.id === novelId);
    
    if (novelIndex !== -1) {
        novels[novelIndex].chapters = novels[novelIndex].chapters.filter(
            chapter => chapter.number !== chapterNumber
        );
        localStorage.setItem('novels', JSON.stringify(novels));
        loadChapters();
        showMessage('Chapter deleted successfully', 'success');
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

// Helper function to generate unique IDs
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
