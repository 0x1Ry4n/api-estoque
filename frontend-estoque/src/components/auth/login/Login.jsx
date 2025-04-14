import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useMediaQuery,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Face,
  CameraAlt,
  ArrowBack,
} from "@mui/icons-material";
import LoginIcon from "@mui/icons-material/Login";
import { useAuth } from "../../../context/AuthContext";
import Webcam from "react-webcam";
import api from "../../../api";
import * as faceapi from "face-api.js";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faceDetection, setFaceDetection] = useState(null);
  const [detectionScore, setDetectionScore] = useState(0);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        setSnackbarMessage("Erro ao carregar modelos de reconhecimento facial");
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!isVerifyingFace || !modelsLoaded || faceImage || !webcamRef.current)
      return;

    const video = webcamRef.current.video;
    let animationFrameId;

    const detectFaces = async () => {
      if (video && video.readyState === 4) {
        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: isMobile ? 224 : 512,
              scoreThreshold: 0.5,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (detections.length > 0) {
          const canvas = canvasRef.current;
          const displaySize = { width: video.width, height: video.height };
          faceapi.matchDimensions(canvas, displaySize);

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          faceapi.draw.drawDetections(canvas, resizedDetections, {
            lineWidth: 10,
            boxColor: "#00FF00",
            drawLabelOptions: {
              fontSize: 18,
              fontStyle: "bold",
              fontColor: "#FFFFFF",
              backgroundColor: "#00AA00",
              padding: 5,
              anchorPosition: "TOP_LEFT",
            },
          });

          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, {
            lineWidth: 5,
            drawLines: true,
            color: "#FF0000",
          });

          setDetectionScore(detections[0].detection.score.toFixed(2));
          setFaceDetection(detections[0]);
        } else {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setFaceDetection(null);
          setDetectionScore(0);
        }
      }
      animationFrameId = requestAnimationFrame(detectFaces);
    };

    detectFaces();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVerifyingFace, modelsLoaded, faceImage, isMobile]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (userType === "user" && !faceImage) {
      setSnackbarMessage("Por favor, verifique o rosto antes de continuar.");
      setSnackbarOpen(true);
      return;
    }

    try {
      const isAuthenticated = await login(email, password);
      if (isAuthenticated) {
        navigate("/home");
      } else {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      }
    } catch (err) {
      setError("Erro ao tentar entrar. Tente novamente mais tarde.");
    }
  };

  const captureFace = async () => {
    if (webcamRef.current && faceDetection) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFaceImage(imageSrc);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setSnackbarMessage("Nenhum rosto detectado. Posicione-se melhor.");
      setSnackbarOpen(true);
    }
  };

  const verifyFace = async () => {
    try {
      if (!faceImage) {
        setSnackbarMessage("Nenhuma imagem facial capturada.");
        setSnackbarOpen(true);
        return;
      }

      setIsLoading(true);

      const img = await faceapi.fetchImage(faceImage);
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setSnackbarMessage("Nenhum rosto detectado na imagem capturada.");
        setSnackbarOpen(true);
        setIsLoading(false);
        return;
      }

      const response = await api.post("/auth/verify-face", {
        email,
        image: faceImage,
      });

      if (response.status === 200) {
        if (response.data.error) {
          setSnackbarMessage(`Erro: ${response.data.error}`);
          setSnackbarOpen(true);
          setFaceImage(null);
          setIsLoading(false);
          return;
        }

        if (!response.data.verified) {
          setSnackbarMessage(`Rosto incompatível com o cadastro de usuário!`);
          setSnackbarOpen(true);
          setFaceImage(null);
          setIsLoading(false);
          return;
        }

        setSnackbarMessage("Rosto verificado com sucesso!");
        setSnackbarOpen(true);
        setIsLoading(false);
      } else {
        setSnackbarMessage("Falha na verificação do rosto.");
        setSnackbarOpen(true);
        setFaceImage(null);
        setIsLoading(false);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao verificar rosto.";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      setFaceImage(null);
      setIsLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#e0f2f1"
      px={2}
      py={4}
    >
      <Box
        bgcolor="#fff"
        p={isMobile ? 3 : 4}
        borderRadius={4}
        boxShadow={4}
        padding={8}
        width={isMobile ? "95%" : "700px"}
      >
        {isVerifyingFace && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setIsVerifyingFace(false)}
            sx={{ mb: 2 }}
          >
            Voltar
          </Button>
        )}

        <Typography
          variant="h5"
          mb={3}
          textAlign="center"
          color="#00796b"
          fontWeight="bold"
        >
          {isVerifyingFace ? (
            "Verificação Facial"
          ) : (
            <>
              <LoginIcon sx={{ mr: 1 }} /> Acesse sua conta
            </>
          )}
        </Typography>

        {error && (
          <Typography color="error" mb={2} textAlign="center">
            {error}
          </Typography>
        )}

        {!isVerifyingFace ? (
          <form onSubmit={handleLogin} style={{ margin: 'auto', width: '85%' }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">Tipo de Login</InputLabel>
              <Select
                labelId="user-type-label"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                label="Tipo de Login"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">Usuário</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#00796b" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#00796b" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {userType === "user" && (
              <Box mt={2} textAlign="center">
               
                <Button
                  variant={faceImage ? "contained" : "outlined"}
                  color={faceImage ? "success" : "secondary"}
                  fullWidth
                  sx={{ py: 1.5 }}
                  onClick={() => setIsVerifyingFace(true)}
                  startIcon={<Face />}
                  disabled={!modelsLoaded || isLoading}
                >
                  {faceImage
                    ? "Rosto capturado"
                    : "Iniciar Reconhecimento Facial"}
                  {isLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Button>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                mt: 3,
                bgcolor: "#00796b",
                "&:hover": { bgcolor: "#004d40" },
                py: 1.5,
              }}
              disabled={(userType === "user" && !faceImage) || isLoading}
            >
              Entrar
              {isLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
            </Button>
          </form>
        ) : (
          <Box>
            {faceImage ? (
              <Box textAlign="center">
                <Box position="relative" display="inline-block">
                  <img
                    src={faceImage}
                    alt="Face capturada"
                    style={{
                      width: '85%',
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  />
                </Box>
                <Box
                  display="flex"
                  justifyContent="center"
                  gap={2}
                  flexWrap="wrap"
                >
                  <Button
                    variant="contained"
                    onClick={verifyFace}
                    startIcon={<Face />}
                    color="success"
                    disabled={isLoading}
                    sx={{ flexGrow: 1, maxWidth: 200 }}
                  >
                    Verificar
                    {isLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setFaceImage(null)}
                    startIcon={<CameraAlt />}
                    disabled={isLoading}
                    sx={{ flexGrow: 1, maxWidth: 200 }}
                  >
                    Capturar Novamente
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" position="relative">
                <Box position="relative" display="inline-block">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    width={isMobile ? 320 : 640}
                    height={isMobile ? 240 : 480}
                    videoConstraints={{
                      facingMode: "user",
                      width: isMobile ? 320 : 640,
                      height: isMobile ? 240 : 480,
                    }}
                    style={{
                      display: "block",
                      borderRadius: 8,
                      margin: "0 auto",
                      transform: "scaleX(-1)",
                      maxWidth: "100%",
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      transform: "scaleX(-1)",
                    }}
                  />
                </Box>

                <Box mt={3}>
                  {faceDetection ? (
                    <Box>
                      <Typography variant="body1" color="text.secondary">
                        Confiança da detecção:{" "}
                        {Math.round(detectionScore * 100)}%
                      </Typography>

                      <Button
                        variant="contained"
                        onClick={captureFace}
                        startIcon={<CameraAlt />}
                        sx={{ mt: 2, py: 1.5, width: "100%", maxWidth: 300 }}
                        disabled={isLoading}
                      >
                        Capturar Foto
                        {isLoading && (
                          <CircularProgress size={24} sx={{ ml: 1 }} />
                        )}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body1" color="error" mt={1}>
                        Posicione seu rosto dentro do quadro
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Certifique-se de que seu rosto está bem iluminado e
                        visível
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={
              snackbarMessage.includes("sucesso")
                ? "success"
                : snackbarMessage.includes("Erro")
                ? "error"
                : "warning"
            }
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Login;
