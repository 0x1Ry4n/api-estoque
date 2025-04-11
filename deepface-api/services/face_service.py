from deepface import DeepFace
from utils.image_utils import decode_base64_image, save_temp_image
import os

def compare_faces_service(captured_image_base64: str, saved_image_base64: str) -> dict:
    captured_image_path = save_temp_image(decode_base64_image(captured_image_base64))
    saved_image_path = save_temp_image(decode_base64_image(saved_image_base64))

    try:
        if not os.path.exists(captured_image_path) or not os.path.exists(saved_image_path):
            raise FileNotFoundError("Falha ao salvar imagens temporárias.")

        result = DeepFace.verify(
            img1_path=captured_image_path,
            img2_path=saved_image_path,
            model_name="ArcFace"
        )

        return {
            "verified": result.get("verified"),
            "distance": result.get("distance")
        }

    finally:
        for path in [captured_image_path, saved_image_path]:
            if path and os.path.exists(path):
                os.remove(path)
