import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Lock,
  Save,
  CameraAlt,
  Refresh,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import api from "../../../../api";

const CreateUser = ({ onUserAdded }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Face detection state
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [userFaceImage, setUserFaceImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(0);
  const [faceDetection, setFaceDetection] = useState(null);
  const detectionInterval = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const MODEL_URL = "/models";

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);

        setModelsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        setSnackbarMessage("Erro ao carregar modelos de reconhecimento facial");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  const detectFaces = async () => {
    if (!webcamRef.current || !canvasRef.current || !modelsLoaded) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    const detections = await faceapi
      .detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();

    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detections.length > 0) {
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      setDetectionScore(detections[0].detection.score.toFixed(2));
      setFaceDetection(detections[0]);
      setIsFaceDetected(true);
    } else {
      setFaceDetection(null);
      setDetectionScore(0);
      setIsFaceDetected(false);
    }
  };

  const startCamera = () => {
    setIsCameraActive(true);
    setUserFaceImage(null);
    
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    detectionInterval.current = setInterval(detectFaces, 300);
  };

  const stopCamera = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setIsCameraActive(false);
  };

  const captureFace = () => {
    if (webcamRef.current && faceDetection) {
      const imageSrc = webcamRef.current.getScreenshot();
      setUserFaceImage(imageSrc);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stopCamera();
    } else {
      setSnackbarMessage("Nenhum rosto detectado. Posicione-se melhor.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (!userFaceImage) {
        setSnackbarMessage("Por favor, capture uma imagem facial antes de continuar.");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      setIsLoading(true);

      const response = await api.post("/auth/register/user", {
        username: data.username,
        email: data.email,
        password: data.password,
        role: "USER",
        status: "ACTIVE",
        faceImage: userFaceImage,
      });

      if (response.status === 201) {
        if (typeof onUserAdded === "function") {
          onUserAdded(response.data);
        }

        setSnackbarSeverity("success");
        setSnackbarMessage("Usuário criado com sucesso!");
        setSnackbarOpen(true);
        reset();
        setUserFaceImage(null);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Erro ao criar usuário. Tente novamente.";
      setSnackbarSeverity("error");
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", padding: 3 }}>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 3 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            color: "primary.main",
          }}
        >
          <AccountCircle sx={{ mr: 2 }} />
          Cadastro de Usuário
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                    Informações Pessoais
                  </Typography>

                  <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Nome de usuário obrigatório",
                      minLength: {
                        value: 3,
                        message: "Mínimo 3 caracteres",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="Nome de Usuário"
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountCircle />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "E-mail obrigatório",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "E-mail inválido",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="E-mail"
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: "Senha obrigatória",
                      minLength: {
                        value: 6,
                        message: "Mínimo 6 caracteres",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        variant="outlined"
                        {...field}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock />
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
                    )}
                  />
                </CardContent>
              </Card>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!userFaceImage || isLoading}
                  sx={{
                    minWidth: "200px",
                    py: 1.5,
                    fontSize: "1rem",
                  }}
                  startIcon={isLoading ? <CircularProgress size={24} /> : <Save />}
                >
                  Finalizar Cadastro
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                    Cadastro Facial
                  </Typography>

                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "300px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      p: 2,
                      position: "relative",
                    }}
                  >
                    {!isCameraActive && !userFaceImage ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={startCamera}
                        startIcon={<CameraAlt />}
                        sx={{ py: 2 }}
                        disabled={!modelsLoaded || isLoading}
                      >
                        {modelsLoaded ? "Iniciar Câmera" : "Carregando modelos..."}
                        {isLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
                      </Button>
                    ) : userFaceImage ? (
                      <Box textAlign="center">
                        <Box position="relative" display="inline-block">
                          <img
                            src={userFaceImage}
                            alt="Face capturada"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "300px",
                              borderRadius: 8,
                              marginBottom: 16,
                            }}
                          />
                        </Box>
                        <Button
                          variant="contained"
                          onClick={startCamera}
                          startIcon={<Refresh />}
                          sx={{ mt: 2 }}
                        >
                          Tirar Outra Foto
                        </Button>
                      </Box>
                    ) : (
                      <Box textAlign="center" position="relative">
                        <Box position="relative" display="inline-block">
                          <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            width={640}
                            height={480}
                            videoConstraints={{
                              facingMode: "user",
                              width: 640,
                              height: 480,
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

                  <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
                    {userFaceImage
                      ? "Foto capturada com sucesso!"
                      : isCameraActive
                      ? isFaceDetected
                        ? "Rosto detectado! Clique em Capturar Foto"
                        : "Posicione seu rosto na câmera"
                      : "Clique para iniciar a câmera"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateUser;