import {
    photos,
    addPhoto,
    deletePhoto,
    updatePhoto,
    loadPhotos
} from '../data/photos.js';

let photoGrid;

export function initializePhotosApp() {
    photoGrid = document.querySelector('.photos-grid');
    
    loadPhotos()
    .then(() => {
        renderPhotos();
    })
    .catch(error => {
        photoGrid.innerHTML = `<div class="error">Error loading photos: ${error.message}</div>`;
        console.error('Error initializing photos app:', error);
    });
    setupEventListeners();
}

function setupEventListeners(){
    const addButton = document.querySelector('.add-button-photo');

    addButton.addEventListener('click', () => {
        showAddPhotoForm();
    });
}

function renderPhotos() {
    photoGrid = document.querySelector('.photos-grid');
    if (!photoGrid) return;
    
    photoGrid.innerHTML = '';

    if (photos.length === 0) {
        photoGrid.innerHTML = '<div class="no-photos">No photos found. Add your first photo!</div>';
        return;
    }

    photos.forEach(photo => {
        const card = createPhotoCard(photo);
        photoGrid.appendChild(card);
    });
}

function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.setAttribute('data-id', photo.id);

    let imageHtml = '<div class="photo-placeholder">No Image</div>';
    if (photo.image) {
        imageHtml = `<div class="photo-image"><img src="data:image/jpeg;base64,${photo.image}" alt="Photo"></div>`;
    }

    card.innerHTML = `
        ${imageHtml}
        <div class="photo-actions">
            <button class="delete-btn" data-id="${photo.id}">Delete</button>
        </div>
    `;

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeletePhoto(photo.id);
    });

    card.addEventListener('click', ()=>{
        showPhoto(photo.id);
    });

    return card;
}

export function showAddPhotoForm() {
    const modalContent = `
        <h2>Add New Photo</h2>
        <form id="add-photo-form">
            <div class="form-group">
                <label for="photo-image">Image</label>
                <input type="file" id="photo-image" accept="image/*" multiple required>
                <div class="help-text">Select multiple photos by holding Ctrl (or Cmd on Mac) while selecting files</div>

            </div>
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
                <button type="submit" class="save-btn">Save</button>
            </div>
        </form>
    `;
    showPhotoModal(modalContent);

    document.getElementById('add-photo-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveMultiplePhotos();
    });

    console.log('Add photo form displayed');
}

window.showEditPhotoForm = function(photoId) {
    const photo = getPhoto(photoId);
    if (!photo) {
        alert('Photo not found');
        return;
    }

    const modalContent = `
        <h2>Edit Photo</h2>
        <form id="edit-photo-form">
            <input type="hidden" id="edit-photo-id" value="${photo.id}">
            <div class="form-group">
                <label for="edit-photo-image">New Image</label>
                <input type="file" id="edit-photo-image" accept="image/*">
            </div>
            ${photo.image ? `<div class="current-image"><img src="data:image/jpeg;base64,${photo.image}" alt="Photo"></div>` : ''}
            <div class="form-actions">
                <button type="button" class="cancel-btn" onclick="showPhoto(${photoId})">Cancel</button>
                <button type="submit" class="save-btn">Update</button>
            </div>
        </form>
    `;
    showPhotoModal(modalContent);

    document.getElementById('edit-photo-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewPhoto();
    });
}

function saveMultiplePhotos() {
    const imageFiles = document.getElementById('photo-image').files;
    
    if (imageFiles.length === 0) {
        alert('Please select at least one photo');
        return;
    }

    let uploadPromises = []
    for (let i = 0; i < imageFiles.length; i++) {
        const promise = addPhoto(imageFiles[i])
            .catch(error => {
                console.error(`Error saving photo ${i+1}:`, error);
                return false;
            });
        
        uploadPromises.push(promise);
    }

    Promise.all(uploadPromises)
        .then(        
            closeModal(),
            renderPhotos()
        )
        .catch(error => {
            console.error('Error during bulk upload:', error);
            saveButton.textContent = originalText;
            saveButton.disabled = false;
            alert('Error uploading photos. Please try again.');
        });
}

function saveNewPhoto() {
    
    const imageFile = document.getElementById('photo-image').files[0];

    addPhoto(imageFile)
    .then(() => {
        closeModal();
        renderPhotos();
    })
    .catch(error => {
        console.error('Error saving photo:', error);
        alert('Error saving photo. Please try again.');
    });
}

function updateExistingPhoto() {
    const photoId = document.getElementById('edit-photo-id').value;
    const imageFile = document.getElementById('edit-photo-image').files[0];

    updatePhoto(photoId, imageFile)
    .then(() => {
        closeModal();
        renderPhotos();
    })
    .catch(error => {
        console.error('Error updating photo:', error);
        alert('Error updating photo. Please try again.');
    });
}

function confirmDeletePhoto(photoId) {
    const photo = getPhoto(photoId);
    if (!photo) {
        alert('Photo not found');
        return;
    }

    const modalContent = `
        <h2>Delete Photo</h2>
        <p>Are you sure you want to delete this photo?</p>
        <p>This action cannot be undone.</p>
        <div class="form-actions">
            <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
            <button type="button" class="delete-confirm-btn">Delete</button>
        </div>
    `;

    showPhotoModal(modalContent);

    document.querySelector('.delete-confirm-btn').addEventListener('click', () => {
        deletePhoto(photoId)
        .then(() => {
            closeModal();
            renderPhotos();
        })
        .catch(error => {
            console.error('Error deleting photo:', error);
            alert('Error deleting photo. Please try again.');
        });
    });
}

function showPhotoModal(content, isPhotoView = false) {
    let modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        document.body.appendChild(modalContainer);
    }

    modalContainer.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content ${isPhotoView ? 'photo-view-modal' : ''}">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-body">${content}</div>
        </div>
    `;

    modalContainer.style.display = 'block';
}

window.closePhotoModal = function() {
    document.removeEventListener('keydown', handleKeyboardNavigation);
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
    
};

function getPhoto(photoId) {
    return photos.find(photo => photo.id == photoId) || null;
}

window.showPhoto = function (photoId) {
    let currentIndex = photos.findIndex(photo => photo.id == photoId);
    if (currentIndex === -1) return;

    function renderModal(photo) {
        const modalContent = `
            <div class="photo-modal">
                <button class="nav-left">&#10094;</button>
                <div class="photo-wrapper">
                    <img src="data:image/jpeg;base64,${photo.image}" alt="Photo">
                    <div class="photo-actions">
                        <button class="edit1-btn">Edit</button>
                        <button class="close1-btn">Close</button>
                    </div>
                </div>
                <button class="nav-right">&#10095;</button>
            </div>
        `;

        showPhotoModal(modalContent, true);
        document.addEventListener('keydown', handleKeyboardNavigation);
        document.querySelector(".edit1-btn").addEventListener("click", ()=> {
            showEditPhotoForm(photo.id)
        });
        document.querySelector(".close1-btn").addEventListener("click", closeModal);
        document.querySelector(".nav-left").addEventListener("click", () => navigateLeft());
        document.querySelector(".nav-right").addEventListener("click", () => navigateRight());
    }

    window.handleKeyboardNavigation = function(event) {
        if (event.key === "ArrowLeft") {
            navigateLeft();
        } else if (event.key === "ArrowRight") {
            navigateRight();
        } else if (event.key === "Escape") {
            closeModal();
        }
    }

    function navigateLeft() {
        currentIndex--;
        if (currentIndex < 0) currentIndex = photos.length - 1;
        renderModal(photos[currentIndex]);
    }

    function navigateRight() {
        currentIndex++;
        if (currentIndex >= photos.length) currentIndex = 0;
        renderModal(photos[currentIndex]);
    }

    renderModal(photos[currentIndex]);
}
