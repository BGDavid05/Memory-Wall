export let photos = [];

export function getPhoto(photoId) {
    return photos.find(photo => photo.id === photoId);
}

// Class to represent a photo
class Photo {
    constructor(id, image) {
        this.id = id;
        this.image = image;
    }
}

// Function to fetch all photos
export function loadPhotos() {
    return fetch('http://127.0.0.1:5000/photos', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        photos = data.map(photo => new Photo(photo.id, photo.image));
        console.log('Photos loaded:', photos);
    })
    .catch(error => console.error('Error loading photos:', error));
}

// Function to add a new photo
export function addPhoto(imageFile) {
    return new Promise((resolve, reject) => {
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                const photoDetails = { image: reader.result.split(',')[1] }; // Remove base64 metadata
                sendPhotoData(photoDetails)
                .then(resolve)
                .catch(reject);
            };
            reader.onerror = error => console.error('Error reading file:', error);
        } else {
            reject('No image file provided');
        }
    });
}

function sendPhotoData(photoDetails) {
    return fetch('http://127.0.0.1:5000/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoDetails)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo added:', data);
        return loadPhotos(); // Reload photos after adding
    })
    .catch(error => console.error('Error adding photo:', error));
}

// Function to update an existing photo
export function updatePhoto(photoId, imageFile) {
    return new Promise((resolve, reject) => {
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                const updatedDetails = { image: reader.result.split(',')[1] };
                sendUpdateData(photoId, updatedDetails)
                .then(resolve)
                .catch(reject);
            };
            reader.onerror = error => console.error('Error reading file:', error);
        } else {
            reject('No image file provided');
        }
    });
}

function sendUpdateData(photoId, updatedDetails) {
    return fetch(`http://127.0.0.1:5000/photos/update_photo/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo updated:', data);
        return loadPhotos();
    })
    .catch(error => console.error('Error updating photo:', error));
}

// Function to delete a photo
export function deletePhoto(photoId) {
    return fetch(`http://127.0.0.1:5000/photos/delete_photo/${photoId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Photo deleted:', data);
        return loadPhotos();
    })
    .catch(error => console.error('Error deleting photo:', error));
}
