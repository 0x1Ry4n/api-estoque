import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material"; // Incluído o ícone de refresh
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import api from "../../../../api";

const Categories = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories(); // Atualiza a lista de categorias ao carregar o componente
  }, []);

  // Função para atualizar a lista de categorias
  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setRows(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar categorias: ", error);
      setSnackbarMessage("Erro ao carregar categorias.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (category) => {
    setSelectedCategory(category);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const handleDelete = async (ids) => {
    const confirmDelete = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter essa ação!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (confirmDelete.isConfirmed) {
      try {
        await api.delete(`/category/${ids[0]}`);
        setSnackbarMessage("Categoria deletada com sucesso!");
        setSnackbarSeverity("success");
        fetchCategories(); 
      } catch (error) {
        setSnackbarMessage(
          `Erro ao deletar a categoria: ${
            error.response?.data?.error || error.message
          }`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedCategory.name) {
      setSnackbarMessage("Por favor, preencha o nome da categoria!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEditing) {
        await api.patch(`/category/${selectedCategory.id}`, {
          name: selectedCategory.name,
        });
        setSnackbarMessage("Categoria atualizada com sucesso!");
      } else {
        const newCategory = { name: selectedCategory.name };
        await api.post("/category", newCategory);
        setSnackbarMessage("Categoria adicionada com sucesso!");
      }
      setSnackbarSeverity("success");
      fetchCategories(); 
    } catch (error) {
      setSnackbarMessage(
        `Erro ao salvar a categoria: ${
          error.response?.data?.error || error.message
        }`
      );
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
    }
  };

  const handleRefresh = () => {
    fetchCategories(); 
    setSnackbarMessage("Lista de categorias atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Categoria", width: 300, editable: true },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
          <Button onClick={() => handleDelete([cellData.row.id])}>
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
        width: "95%"
      }}
    >
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh} 
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
      <div
        style={{
          height: 400,
          width: "100%",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <DataGrid rows={rows} columns={columns} />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Categoria" : "Adicionar Categoria"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Categoria"
            fullWidth
            margin="normal"
            value={selectedCategory?.name || ""}
            onChange={(e) =>
              setSelectedCategory({ ...selectedCategory, name: e.target.value })
            }
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>
            {isEditing ? "Confirmar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Categories;
