import base64
from config import db

class Memory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    image = db.Column(db.LargeBinary, nullable=False)  

    def __init__(self, title, description, date, image):
        self.title = title
        self.description = description
        self.date = date
        self.image = image
        
    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date,
            'image': base64.b64encode(self.image).decode('utf-8')  # Encode image for JSON
        }

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.LargeBinary, nullable=False) 

    def __init__(self, image):
        self.image = image
        
    def to_json(self):
        return {
            'id': self.id,
            'image': base64.b64encode(self.image).decode('utf-8')  # Encode image for JSON
        }