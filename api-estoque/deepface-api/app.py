from flask import Flask
from routes import face_bp
from dotenv import load_dotenv
import logging
import os

load_dotenv()

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
app.register_blueprint(face_bp)

api_port = os.getenv('DEEPFACE_API_LOCAL_PORT')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=api_port)
