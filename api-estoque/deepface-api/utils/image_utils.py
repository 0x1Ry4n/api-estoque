import base64
import tempfile

def decode_base64_image(base64_string: str) -> bytes:
    """Remove cabeçalho base64 e decodifica a imagem."""
    if base64_string.startswith('data:image'):
        base64_string = base64_string.split(",")[1]
    return base64.b64decode(base64_string)

def save_temp_image(image_data: bytes) -> str:
    """Salva dados da imagem em um arquivo temporário e retorna o caminho."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        temp_file.write(image_data)
        return temp_file.name
