import { 
    initializeMemoriesApp 
} from './memoriesPage.js';

import { 
    initializePhotosApp 
} from './photosPage.js';

let activeView = 'memories';

export function initializeRouter() {
    // Set up the initial view
    switchView('memories');
    setupEventListeners();
}

export function setupEventListeners() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const viewName = event.currentTarget.getAttribute('data-view');
            if (viewName) {
                switchView(viewName);
            }
        });
    });
}

export function switchView(viewName) {
    activeView = viewName;
    
    // Hide all views
    document.getElementById('memories-view').style.display = 'none';
    document.getElementById('photos-view').style.display = 'none';
    
    // Show selected view
    document.getElementById(`${viewName}-view`).style.display = 'block';
    
    // Update sidebar active state
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));
    
    // Find and activate the clicked item
    const clickedItem = Array.from(sidebarItems).find(item => 
        item.getAttribute('data-view') === viewName
    );
    
    if (clickedItem) {
        clickedItem.classList.add('active');
    }
    
    // Initialize the appropriate view
    if (viewName === 'memories') {
        initializeMemoriesApp();
    } else if (viewName === 'photos') {
        initializePhotosApp();
    }
}

export function getActiveView() {
    return activeView;
}