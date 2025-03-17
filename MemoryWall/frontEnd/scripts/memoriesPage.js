import {
    memories,
    addMemory,
    deleteMemory,
    updateMemory,
    loadMemories
} from '../data/memories.js';

let memoryGrid;

export function initializeMemoriesApp() {
    memoryGrid = document.querySelector('.memories-grid');
    loadMemories()
    .then(() => {
        renderMemories();
    })
    .catch(error => {
        memoryGrid.innerHTML = `<div class="error">Error loading memories: ${error.message}</div>`;
        console.error('Error initializing memories app:', error);
    });
    setupEventListeners();
}

function setupEventListeners(){
    const addButton = document.querySelector('.add-button');

    addButton.addEventListener('click', () => {
        showAddMemoryForm();
    });
}

function renderMemories() {
    memoryGrid = document.querySelector('.memories-grid');
    if (!memoryGrid) return;
    
    memoryGrid.innerHTML = '';

    if (memories.length == 0) {
        memoryGrid.innerHTML = '<div class="no-memories">No memories found. Add your first memory!</div>';
        return;
    }

    const sortedMemories = [...memories].sort((a,b)=> new Date(b.date) - new Date(a.date));

    sortedMemories.forEach(memory => {
        const card = createMemoryCard(memory);
        memoryGrid.appendChild(card);
    });
}

function createMemoryCard(memory) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.setAttribute('data-id', memory.id);

    const firstMemoryDate = getFirstMemoryDate();
    const daysSince = firstMemoryDate ? getDaysBetween(firstMemoryDate, new Date(memory.date)) : 0;

    let imageHtml = '<div class="memory-image">Image Placeholder</div>';
    if (memory.image) {
        imageHtml = `<div class="memory-image"><img src="data:image/jpeg;base64,${memory.image}" alt="${memory.title}"></div>`;
    }

    card.innerHTML = `
    ${imageHtml}
    <div class="memory-details">
        <div class="memory-title">${memory.title}</div>
        <div class="memory-date">${formatDate(memory.date)}</div>
        <div class="memory-days">Day ${daysSince}</div>
    </div>
    <div class="memory-actions">
            <button class="edit-btn" data-id="${memory.id}">Edit</button>
            <button class="delete-btn" data-id="${memory.id}">Delete</button>
    </div>
    `
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showEditMemoryForm(memory.id);
    });
    
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteMemory(memory.id);
    });

    card.addEventListener('click', () => showMemoryDetails(memory.id));

    return card;
}

export function showAddMemoryForm(){
    const modalContent = `
    <h2>Add New Memory</h2>
        <form id="add-memory-form">
            <div class="form-group">
                <label for="memory-title">Title</label>
                <input type="text" id="memory-title" required>
            </div>
            <div class="form-group">
                <label for="memory-description">Description</label>
                <textarea id="memory-description" required></textarea>
            </div>
            <div class="form-group">
                <label for="memory-date">Date</label>
                <input type="date" id="memory-date" required>
            </div>
            <div class="form-group">
                <label for="memory-image">Image</label>
                <input type="file" id="memory-image" accept="image/*">
            </div>
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `
    showModal(modalContent);
    document.getElementById('add-memory-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNewMemory();
    });
}

function showEditMemoryForm(memoryId) {
    const memory = getMemory(memoryId);
    if (!memory) {
        alert('Memory not found');
        return;
    }
    
    const modalContent = `
        <h2>Edit Memory</h2>
        <form id="edit-memory-form">
            <input type="hidden" id="edit-memory-id" value="${memory.id}">
            <div class="form-group">
                <label for="edit-memory-title">Title</label>
                <input type="text" id="edit-memory-title" value="${memory.title}" required>
            </div>
            <div class="form-group">
                <label for="edit-memory-description">Description</label>
                <textarea id="edit-memory-description"  required>${memory.description}</textarea>
            </div>
            <div class="form-group">
                <label for="edit-memory-date">Date</label>
                <input type="date" id="edit-memory-date" value="${formatDateForInput(memory.date)}" required>
            </div>
            <div class="form-group">
                <label for="edit-memory-image">Image</label>
                <input type="file" id="edit-memory-image" accept="image/*">
            </div>
            ${memory.image ? `<div class="current-image"><img src="data:image/jpeg;base64,${memory.image}" alt="${memory.title}"></div>` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="save-btn">Update</button>
            </div>
        </form>
    `;
    
    showModal(modalContent);
    
    document.getElementById('edit-memory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateExistingMemory();
    });
}

function updateExistingMemory() {
    const memoryId = document.getElementById('edit-memory-id').value;
    const title = document.getElementById('edit-memory-title').value;
    const description = document.getElementById('edit-memory-description').value;
    const date = document.getElementById('edit-memory-date').value;
    const imageFile = document.getElementById('edit-memory-image').files[0];
    
    const updatedDetails = {
        title,
        description,
        date
    };
    
    updateMemory(memoryId, updatedDetails, imageFile)
    .then(() => {
        closeModal();
        renderMemories();
    })
    .catch(error => {
        console.error('Error updating memory:', error);
        alert('Error updating memory. Please try again.');
    });
}

function saveNewMemory() {
    const title = document.getElementById('memory-title').value;
    const description = document.getElementById('memory-description').value;
    const date = document.getElementById('memory-date').value;
    const imageFile = document.getElementById('memory-image').files[0];
    
    const memoryDetails = {
        title,
        description,
        date
    };
    
    addMemory(memoryDetails, imageFile)
    .then(() => {
        closeModal();
        renderMemories();
    })
    .catch(error => {
        console.error('Error saving memory:', error);
        alert('Error saving memory. Please try again.');
    });
}

function confirmDeleteMemory(memoryId) {
    const memory = getMemory(memoryId);
    if (!memory) {
        alert('Memory not found');
        return;
    }
    
    const modalContent = `
        <h2>Delete Memory</h2>
        <p>Are you sure you want to delete "${memory.title}"?</p>
        <p>This action cannot be undone.</p>
        <div class="form-actions">
            <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
            <button type="button" class="delete-confirm-btn">Delete</button>
        </div>
    `;
    
    showModal(modalContent);
    
    // Add event listener for confirmation
    document.querySelector('.delete-confirm-btn').addEventListener('click', () => {
        deleteMemory(memoryId)
        .then(() => {
            closeModal();
            renderMemories();
        })
        .catch(error => {
            console.error('Error deleting memory:', error);
            alert('Error deleting memory. Please try again.');
        });
    });
}

function showMemoryDetails(memoryId) {
    const memory = getMemory(memoryId);
    if (!memory) {
        alert('Memory not found');
        return;
    }
    
    const firstMemoryDate = getFirstMemoryDate();
    const daysSince = firstMemoryDate ? getDaysBetween(firstMemoryDate, new Date(memory.date)) : 0;
    
    const modalContent = `
        <h2>${memory.title}</h2>
        <div class="memory-detail-date">Date: ${formatDate(memory.date)}</div>
        <div class="memory-detail-days">Day ${daysSince}</div>
        ${memory.image ? `<div class="memory-detail-image"><img src="data:image/jpeg;base64,${memory.image}" alt="${memory.title}"></div>` : ''}
        <div class="memory-detail-description">${memory.description}</div>
        <div class="form-actions">
            <button type="button" class="close-btn" onclick="closeModal()">Close</button>
        </div>
    `;
    
    showModalMemory(modalContent);
}

function showModal(content) {
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.style.display = 'block';
    
    modalContainer.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

function showModalMemory(content) {
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content-memory">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-body-memory">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.style.display = 'block';
    
    modalContainer.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

window.closeModal = function() {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
};

function getMemory(memoryId) {
    return memories.find(memory => memory.id == memoryId) || null;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function getFirstMemoryDate() {
    if (memories.length === 0) return null;
    
    return new Date(memories.reduce((earliest, memory) => {
        const memoryDate = new Date(memory.date);
        return memoryDate < earliest ? memoryDate : earliest;
    }, new Date()));
}

function getDaysBetween(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; 
    const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));
    return diffDays;
}