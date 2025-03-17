export let memories = [];

export function getMemory(memoryId){
    return memories.find(memory => memory.id === memoryId);
}

// Class to represent a memory
class Memory {
    constructor(id, title, description, date, image){
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.image = image;
    }
}

// Function to fetch all memories
export function loadMemories() {
    return fetch('http://127.0.0.1:5000/memories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        memories = data.map(memory => new Memory(memory.id, memory.title, memory.description, memory.date, memory.image));
        console.log('Memories loaded:', memories);
    })
    .catch(error => console.error('Error loading memories:', error));
}

// Function to add a new memory
export function addMemory(memoryDetails, imageFile) {
    return new Promise((resolve, reject) => {
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                memoryDetails.image = reader.result.split(',')[1]; // Remove base64 metadata
                sendMemoryData(memoryDetails)
                .then(resolve)
                .catch(reject);
            };
            reader.onerror = error => console.error('Error reading file:', error);
        } else {
            
            sendMemoryData(memoryDetails)
            .then(resolve)
            .catch(reject);
        }
    });
}

function sendMemoryData(memoryDetails) {
    return fetch('http://127.0.0.1:5000/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryDetails)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Memory added:', data);
        return loadMemories(); // Reload memories after adding
    })
    .catch(error => console.error('Error adding memory:', error));
}

// Function to update an existing memory
export function updateMemory(memoryId, updatedDetails, imageFile) {
    return new Promise((resolve, reject)=>{
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => {
                updatedDetails.image = reader.result.split(',')[1];
                sendUpdateData(memoryId, updatedDetails)
                .then(resolve)
                .catch(reject);
            };
            reader.onerror = error => console.error('Error reading file:', error);
        } else {
            sendUpdateData(memoryId, updatedDetails)
            .then(resolve)
            .catch(reject);
        }
    });
}

function sendUpdateData(memoryId, updatedDetails) {
    return fetch(`http://127.0.0.1:5000/memories/update_memory/${memoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDetails)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Memory updated:', data);
        return loadMemories();
    })
    .catch(error => console.error('Error updating memory:', error));
}

// Function to delete a memory
export function deleteMemory(memoryId) {
    return fetch(`http://127.0.0.1:5000/memories/delete_memory/${memoryId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Memory deleted:', data);
        return loadMemories();
    })
    .catch(error => console.error('Error deleting memory:', error));
}
