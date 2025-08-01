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
  Tooltip,
  Box
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { DataGridToolbar } from "../../subComponents/DataGridToolbar";
import { useCategoryListStore } from "./stores/useCategoryListStore";
import Swal from "sweetalert2";

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
    selectedCategory,
    openModal,
    closeModal,
    updateCategoryField,
    saveCategory,
    deleteCategory,
  } = useCategoryListStore();

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
      await deleteCategory(ids);
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
        <div>
          <Tooltip title="Editar">
            <Button onClick={() => openModal(cellData.row)}>
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Excluir">
            <Button onClick={() => handleDelete([cellData.row.id])}>
              <DeleteIcon />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Box
      sx={{
        p: "20px",
        bgcolor: "background.paper",
        borderRadius: "8px",
        width: "95%"
      }}
    >      <div style={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            bgcolor: 'background.variant'
          }}
          slots={{ toolbar: DataGridToolbar }}
          slotProps={{ toolbar: { onReload: handleRefresh } }}
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

      <Dialog
        maxWidth="md"
        PaperProps={{
          sx: {
            width: '700px',
            maxWidth: '90vw',
          },
        }}
        open={open}
        onClose={closeModal}
      >
        <DialogTitle>Editar Categoria</DialogTitle>
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
          <Button onClick={closeModal} color="secondary">Cancelar</Button>
          <Button onClick={saveCategory} color="primary">Confirmar</Button>
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
    </Box>
  );
};

export default Categories;
