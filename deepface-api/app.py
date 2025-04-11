from flask import Flask
from routes import face_bp
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
app.register_blueprint(face_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
