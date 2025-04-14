from flask import Blueprint
from controllers.face_controller import compare_faces

face_bp = Blueprint('face', __name__)
face_bp.route('/compare-faces', methods=['POST'])(compare_faces)
