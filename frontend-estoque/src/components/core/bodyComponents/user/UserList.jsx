import React, { useState, useEffect } from "react";
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
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
import api from '../../../../api';

const UserList = () => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);

  const userStatusMap = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo"
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      const formattedUsers = response.data.map(user => ({
        ...user,
        role: user.role === "ADMIN" ? "Administrador" : "Usuário Comum",
        status: user.status === "ACTIVE" ? "Ativo" : "Inativo"
      }));

      setRows(formattedUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
      setSnackbarMessage("Erro ao carregar usuários.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleClickOpen = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setPassword(user.password);
    setOpen(true);
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };


  const handleSave = async () => {
    const updatedUserData = {
      username,
      email,
      password,
    };

    try {
      await api.put(`/auth/users/${selectedUser.id}`, updatedUserData);
      setRows(rows.map(row =>
        row.id === selectedUser.id ? { ...row, username, email } : row
      ));
      setSnackbarMessage("Usuário atualizado com sucesso!");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Erro ao atualizar usuário: ", error);
      setSnackbarMessage("Erro ao atualizar usuário.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      handleClose();
    }
  };

  const handleStatusChange = async (id) => {
    const { value: status } = await Swal.fire({
      title: 'Alterar Status',
      input: 'select',
      inputOptions: userStatusMap,
      inputPlaceholder: 'Selecione um status',
      showCancelButton: true,
      confirmButtonText: "Editar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa selecionar um status!';
        }
      }
    });

    if (status) {
      try {
        await api.patch(`/auth/users/${id}/status`, { status: status });
        setSnackbarMessage('Status atualizado com sucesso!');
        setSnackbarSeverity('success');
        fetchUsers();
      } catch (error) {
        setSnackbarMessage(`Erro ao atualizar o status: ${error.response?.data?.message}`);
        setSnackbarSeverity('error');
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handlePasswordChange = async (id) => {
    const { value: password } = await Swal.fire({
      title: 'Alterar Senha',
      input: 'password',
      inputLabel: 'Nova senha',
      inputPlaceholder: 'Digite a nova senha',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa digitar uma senha!';
        }
      }
    });
  
    if (password) {
      try {
        await api.patch(`/auth/users/${id}/password`, { password });
  
        setSnackbarMessage('Senha alterada com sucesso!');
        setSnackbarSeverity('success');
        fetchUsers();
      } catch (error) {
        setSnackbarMessage(`Erro ao alterar a senha: ${error.response?.data?.message || error.message}`);
        setSnackbarSeverity('error');
      } finally {
        setSnackbarOpen(true);
      }
    }
  };
  
  const handleRefresh = () => {
    fetchUsers();
    setSnackbarMessage("Lista de usuários atualizada!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Nome de Usuário", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "password", headerName: "Password", width: 200, hide: true },
    { field: "role", headerName: "Cargo", width: 150 },
    { field: "status", headerName: "Status", width: 100 },
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
          <Button
            onClick={() => handlePasswordChange(cellData.row.id)}
            variant="outlined"
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            Senha
          </Button>
          <Button onClick={() => handleClickOpen(cellData.row)}>
            <EditIcon />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', width: '95%' }}>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        sx={{ mb: 2 }}
      >
        Atualizar Lista
      </Button>
      <div style={{ height: 400, width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEditing ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
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

          {/* <TextField
            margin="dense"
            label="Senha"
            type={showPassword ? "text" : "password"}
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <Button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</Button>
              )
            }}
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserList;
