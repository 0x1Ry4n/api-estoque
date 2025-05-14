import { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { fileExporters } from "../../../../utils/utils";
import { useCategoryStore } from "./stores/useCategoryStore";

const Categories = () => {
  const {
    rows,
    fetchCategories,
    pagination,
    setPagination,
    snackbar,
    showSnackbar,
    closeSnackbar,
    open,
    isEditing,
    selectedCategory,
    openModal,
    closeModal,
    updateCategoryField,
    saveCategory,
    deleteCategory,
  } = useCategoryStore();

   useEffect(() => {
      fetchCategories(pagination.page, pagination.pageSize);
    }, []);

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
      deleteCategory(ids[0]);
    }
  };

  const handleRefresh = () => {
    fetchCategories(pagination.page, pagination.pageSize);
    showSnackbar("Lista de categorias atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Categoria", width: 300 },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      renderCell: (cellData) => (
        <>
          <Button onClick={() => openModal(cellData.row)}>
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
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", width: "95%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Atualizar Lista
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            fileExporters.exportToExcel("Categorias", "categorias.xlsx", rows)
          }
        >
          Exportar Excel
        </Button>
      </div>

      <div style={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          rowCount={pagination.totalElements}
          paginationMode="server"
          paginationModel={{
            page: pagination.page,
            pageSize: pagination.pageSize,
          }}
          onPaginationModelChange={({ page, pageSize }) => {
            const newPagination = { ...pagination, page, pageSize };
            setPagination(newPagination);
            fetchCategories(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Dialog open={open} onClose={closeModal}>
        <DialogTitle>{isEditing ? "Editar Categoria" : "Adicionar Categoria"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Categoria"
            fullWidth
            margin="normal"
            value={selectedCategory?.name || ""}
            onChange={(e) => updateCategoryField("name", e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancelar</Button>
          <Button onClick={saveCategory}>
            {isEditing ? "Confirmar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Categories;
