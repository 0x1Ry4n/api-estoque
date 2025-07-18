import React, { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Box,
  Tooltip
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import { fileExporters } from "../../../../utils/utils";
import { useExitListStore } from "./stores/useExitListStore";
import Swal from "sweetalert2";

const ExitList = () => {
  const {
    rows,
    pagination,
    setPagination,
    fetchExits,
    saveExit,
    saveStatus,
    deleteExit,
    snackbar,
    showSnackbar,
    closeSnackbar,
    open,
    selectedExit,
    openModal,
    closeModal,
  } = useExitListStore();

  const exitStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    fetchExits(pagination.page, pagination.pageSize);
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
      await deleteExit(ids);
    }
  };

  const handleStatusChange = async (id) => {
    const { value: status } = await Swal.fire({
      title: "Alterar Status",
      input: "select",
      inputOptions: exitStatusMap,
      inputPlaceholder: "Selecione um status",
      showCancelButton: true,
      confirmButtonText: "Editar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Você precisa selecionar um status!";
      },
    });

    if (status) {
      await saveStatus(id, status);
    }
  };

  const handleSave = async () => {
    await saveExit();
  };

  const handleRefresh = () => {
    fetchExits(pagination.page, pagination.pageSize);
    showSnackbar("Lista de Saídas atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "ID Produto", width: 100 },
    { field: "quantity", headerName: "Quantidade", width: 150 },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    {
      field: "status",
      headerName: "Status de Saída",
      width: 150,
      valueGetter: (params) => exitStatusMap[params.row.status] || "Desconhecido",
    },
    {
      field: "exitDate",
      headerName: "Data de Saída",
      width: 150,
      valueGetter: (params) => {
        const date = new Date(params.value);
        return !isNaN(date) ? date : null;
      },
      valueFormatter: (params) =>
        params.value ? format(addDays(params.value, 1), "dd/MM/yyyy") : "",
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (cellData) => (
        <div>
          <Button
            onClick={() => handleStatusChange(cellData.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Status
          </Button>
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
    <div style={{ padding: 20, backgroundColor: "#f5f5f5", borderRadius: 8, width: "95%" }}>
      <Box display="flex" gap={2} mb={2}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Atualizar Lista
        </Button>
        <Button variant="contained" onClick={() => fileExporters.exportToExcel("Saídas", "saidas.xlsx", rows)}>
          Exportar Excel
        </Button>
      </Box>

      <Box sx={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: 2 }}>
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
            setPagination({ ...pagination, page, pageSize });
            fetchExits(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </Box>

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
        <DialogTitle>Editar Saída</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                value={selectedExit?.quantity || ""}
                onChange={(e) =>
                  useExitListStore.setState({
                    selectedExit: {
                      ...selectedExit,
                      quantity: e.target.value,
                    },
                  })
                }
              />
              <TextField
                label="Data de Saída"
                type="date"
                fullWidth
                value={
                  selectedExit?.exitDate
                    ? new Date(selectedExit.exitDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  useExitListStore.setState({
                    selectedExit: {
                      ...selectedExit,
                      exitDate: e.target.value,
                    },
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ExitList;
