import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import { Edit as EditIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import { fileExporters } from "../../../../utils/utils";
import { useUserListStore } from "./stores/useUserListStore";

const UserList = () => {
  const {
    rows,
    snackbar,
    fetchUsers,
    saveUser,
    saveStatus,
    savePassword,
    showSnackbar,
    closeSnackbar,
  } = useUserListStore();

  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const userStatusMap = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClickOpen = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setIsEditing(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setUsername("");
    setEmail("");
  };

  const handleSave = async () => {
    await saveUser(selectedUser.id, {
      username,
      email,
    });
  };

  const handleStatusChange = async (id) => {
    const { value: status } = await Swal.fire({
      title: "Alterar Status",
      input: "select",
      inputOptions: userStatusMap,
      inputPlaceholder: "Selecione um status",
      showCancelButton: true,
      confirmButtonText: "Editar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => (!value ? "Você precisa selecionar um status!" : undefined),
    });

    if (status) {
      await saveStatus(id, { status });
    }
  };

  const handlePasswordChange = async (id) => {
    const { value: password } = await Swal.fire({
      title: "Alterar Senha",
      input: "password",
      inputLabel: "Nova senha",
      inputPlaceholder: "Digite a nova senha",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Salvar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => (!value ? "Você precisa digitar uma senha!" : undefined),
    });

    if (password) {
      await savePassword(id, { password });
    }
  };

  const handleRefresh = () => {
    fetchUsers();
    showSnackbar("Lista de usuários atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Nome de Usuário", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Cargo", width: 150 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => handleStatusChange(params.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Status
          </Button>
          <Button
            onClick={() => handlePasswordChange(params.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Senha
          </Button>
          <Button onClick={() => handleClickOpen(params.row)}>
            <EditIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "8px", width: "95%" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
          Atualizar Lista
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fileExporters.exportToExcel("Usuários", "usuarios.xlsx", rows)}
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
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome de Usuário"
            type="text"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserList;
