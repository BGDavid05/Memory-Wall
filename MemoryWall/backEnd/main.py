from flask import request, jsonify
from config import app, db
from models import Memory, Photo
import base64

@app.route('/memories', methods=['GET', 'POST'])
def memories():
    if request.method == 'GET':
        memories = Memory.query.all()
        memories = [memory.to_json() for memory in memories]
        return jsonify(memories)
    
    elif request.method == 'POST':
        data = request.json

        if 'title' not in data or 'description' not in data or 'date' not in data or 'image' not in data:
            return jsonify({'error': 'Missing data'}), 400
        
        try:
            image_data = base64.b64decode(data['image'])  # Decode image from base64
            memory = Memory(data['title'], data['description'], data['date'], image_data)
            db.session.add(memory)
            db.session.commit()
            return jsonify({'result': 'success'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/memories/update_memory/<int:id>', methods=['PATCH'])
def update_memory(id):
    memory = Memory.query.get(id)

    if memory is None:
        return jsonify({'error': 'Memory not found'}), 404

    data = request.json
    try:
        if 'title' in data:
            memory.title = data['title']
        if 'description' in data:
            memory.description = data['description']
        if 'date' in data:
            memory.date = data['date']
        if 'image' in data:
            memory.image = base64.b64decode(data['image'])  # Decode and store new image
        
        db.session.commit()
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/memories/delete_memory/<int:id>', methods=['DELETE'])
def delete_memory(id):
    memory = Memory.query.get(id)

    if memory is None:
        return jsonify({'error': 'Memory not found'}), 404

    try:
        db.session.delete(memory)
        db.session.commit()
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/photos', methods=['GET', 'POST'])
def photos():
    if request.method == 'GET':
        photos = Photo.query.all()
        return jsonify([photo.to_json() for photo in photos])
    
    elif request.method == 'POST':
        data = request.json
        if 'image' not in data:
            return jsonify({'error': 'Missing image data'}), 400
        
        try:
            image_data = base64.b64decode(data['image'])  # Decode image from base64
            photo = Photo(image_data)
            db.session.add(photo)
            db.session.commit()
            return jsonify({'result': 'success'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/photos/update_photo/<int:id>', methods=['PATCH'])
def update_photo(id):
    photo = Photo.query.get(id)
    if photo is None:
        return jsonify({'error': 'Photo not found'}), 404
    
    data = request.json
    try:
        if 'image' in data:
            photo.image = base64.b64decode(data['image'])  # Decode and store new image
        
        db.session.commit()
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/photos/delete_photo/<int:id>', methods=['DELETE'])
def delete_photo(id):
    photo = Photo.query.get(id)
    if photo is None:
        return jsonify({'error': 'Photo not found'}), 404
    
    try:
        db.session.delete(photo)
        db.session.commit()
        return jsonify({'result': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
app.run(debug=True)