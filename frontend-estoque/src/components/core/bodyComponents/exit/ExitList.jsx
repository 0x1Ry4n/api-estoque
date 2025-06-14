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
} from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import { fileExporters } from "../../../../utils/utils";
import api from "../../../../api";
import Swal from "sweetalert2";

const ExitList = () => {
  const [open, setOpen] = useState(false);
  const [selectedExit, setSelectedExit] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0
  })

  const exitStatusMap = {
    PENDING: "Pendente",
    COMPLETED: "Completado",
    CANCELED: "Cancelado",
    RETURNED: "Retornado",
  };

  useEffect(() => {
    fetchExits(pagination.page, pagination.pageSize);
  }, []);

  const fetchExits = async (page, pageSize) => {
    try {
      const res = await api.get(`/exits?page=${page}&size=${pageSize}`);
      setRows(res.data.content);
      setPagination({
        page: res.data.number,
        pageSize: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages
      })
    } catch (error) {
      console.error("Erro ao buscar as saídas: ", error);
      setSnackbarMessage("Erro ao carregar as saídas.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (exit) => {
    setSelectedExit(exit);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedExit(null);
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
        await api.delete(`/exits/${ids[0]}`);
        setSnackbarMessage("Saída deletada com sucesso!");
        setSnackbarSeverity("success");
        fetchExits();
      } catch (error) {
        setSnackbarMessage(
          `Erro ao deletar a saída: ${error.response?.data?.message || error.response?.data?.error || error.message
          }`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await api.patch(`/exits/${selectedExit.id}`, {
          quantity: selectedExit.quantity,
          exitDate: selectedExit.exitDate,
        });
        setSnackbarMessage("Saída atualizada com sucesso!");
      } else {
        const newExit = { name: selectedExit.name };
        await api.post("/exits", newExit);
        setSnackbarMessage("Saída adicionada com sucesso!");
      }
      setSnackbarSeverity("success");
      fetchExits();
    } catch (error) {
      setSnackbarMessage(
        `Erro ao salvar a saída: ${error.response?.data?.message || error.response?.data?.error || error.message}`
      );
      setSnackbarSeverity("error");
    } finally {
      handleClose();
      setSnackbarOpen(true);
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
        if (!value) {
          return "Você precisa selecionar um status!";
        }
      },
    });

    if (status) {
      try {
        await api.patch(`/exits/${id}/status`, { status: status });
        setSnackbarMessage("Status atualizado com sucesso!");
        setSnackbarSeverity("success");
        fetchExits();
      } catch (error) {
        setSnackbarMessage(
          `Erro ao atualizar o status: ${error.response.data.message}`
        );
        setSnackbarSeverity("error");
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleRefresh = () => {
    fetchExits(pagination.page, pagination.pageSize);
    setSnackbarMessage("Lista de Saídas atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "productId", headerName: "ID Produto", width: 100 },
    { field: "quantity", headerName: "Quantidade", type: "number", width: 150 },
    { field: "inventoryCode", headerName: "Código (Inventário)", width: 150 },
    {
      field: "status",
      headerName: "Status de Saída",
      width: 150,
      valueGetter: (params) =>
        exitStatusMap[params.row.status] || "Desconhecido",
    },
    {
      field: "exitDate",
      headerName: "Data de Saída",
      width: 150,
      type: "date",
      valueGetter: (params) => {
        const value = params.value;
        const date = value ? new Date(value) : null;
        return date && !isNaN(date) ? date : null;
      },
      valueFormatter: (params) => {
        const date = addDays(params.value, 1);
        return date && !isNaN(date) ? format(date, "dd/MM/yyyy") : "";
      },
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (cellData) => (
        <>
          <Button
            onClick={() => handleStatusChange(cellData.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Status
          </Button>
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
        width: "95%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Atualizar Lista
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            fileExporters.exportToExcel("Saídas", "saidas.xlsx", rows)
          }
        >
          Exportar Excel
        </Button>
      </div>
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
            fetchExits(page, pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {isEditing ? "Editar Saída" : "Adicionar Saída"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Quantidade"
            type="number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedExit?.quantity || ""}
            onChange={(e) =>
              setSelectedExit({
                ...selectedExit,
                quantity: e.target.value,
              })
            }
            sx={{ mb: 3 }}
          />

          <TextField
            label="Data de Saída"
            type="date"
            variant="outlined"
            fullWidth
            margin="normal"
            value={
              selectedExit?.exitDate
                ? new Date(selectedExit.exitDate).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setSelectedExit({
                ...selectedExit,
                exitDate: e.target.value,
              })
            }
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 3 }}
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
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ExitList;