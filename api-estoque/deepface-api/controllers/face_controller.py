from flask import request, jsonify
from services.face_service import compare_faces_service
import logging

def compare_faces():
    try:
        data = request.get_json()

        if not data or 'image' not in data or 'saved_image' not in data:
            return jsonify({"error": "Parâmetros 'image' e 'saved_image' são obrigatórios."}), 400

        result = compare_faces_service(data['image'], data['saved_image'])

        return jsonify(result)

    except Exception as e:
        logging.exception("Erro ao comparar rostos:")
        return jsonify({"error": "Erro interno ao comparar rostos.", "details": str(e)}), 500
