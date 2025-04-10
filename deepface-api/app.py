from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
import os
import tempfile

app = Flask(__name__)

def decode_base64_image(base64_string):
    if base64_string.startswith('data:image'):
        base64_string = base64_string.split(",")[1]
    
    return base64.b64decode(base64_string)

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    try:
        data = request.json

        captured_image_base64 = data['image']
        captured_image_data = decode_base64_image(captured_image_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as captured_image_file:
            captured_image_path = captured_image_file.name
            captured_image_file.write(captured_image_data)

        saved_image_base64 = data['saved_image']
        saved_image_data = decode_base64_image(saved_image_base64)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as saved_image_file:
            saved_image_path = saved_image_file.name
            saved_image_file.write(saved_image_data)

        if not os.path.exists(captured_image_path) or not os.path.exists(saved_image_path):
            return jsonify({"error": "Error saving images to temporary files."}), 500

        result = DeepFace.verify(
            img1_path=captured_image_path,
            img2_path=saved_image_path,
            model_name="ArcFace"
        )

        os.remove(captured_image_path)
        os.remove(saved_image_path)

        return jsonify({"verified": result['verified'], "distance": result['distance']})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
