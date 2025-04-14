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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Pagination,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DataGrid } from "@mui/x-data-grid";
import api from '../../../../api';

const Customers = () => {
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [rows, setRows] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchCustomers();
    }, [page, pageSize]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get(`/customer?page=${page}&size=${pageSize}`);
            setRows(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Erro ao buscar clientes: ", error);
            setSnackbarMessage("Erro ao carregar clientes.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleClickOpen = (customer) => {
        setSelectedCustomer({
            ...customer,
            preferredPaymentMethod: customer.preferredPaymentMethod || "ANY", 
            communicationPreference: customer.communicationPreference || "EMAIL" 
        });
        setOpen(true);
        setIsEditing(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCustomer(null);
        setIsEditing(false);
    };

    const handleDelete = async (ids) => {
        try {
            await Promise.all(ids.map((id) => api.delete(`/customer/${id}`)));
            setRows(rows.filter((row) => !ids.includes(row.id)));
            setSnackbarMessage("Cliente deletado com sucesso!");
            setSnackbarSeverity("success");
        } catch (error) {
            setSnackbarMessage("Erro ao deletar cliente.");
            setSnackbarSeverity("error");
        } finally {
            setSnackbarOpen(true);
        }
    };

    const handleSave = async () => {
        if (!selectedCustomer.fullname || !selectedCustomer.email || !selectedCustomer.phone) {
            setSnackbarMessage("Por favor, preencha todos os campos obrigatórios!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const validPaymentMethods = ["CREDIT_CARD", "DEBIT_CARD", "MONEY", "ANY"];
        const validCommunicationPreferences = ["EMAIL", "PHONE", "SMS", "ANY"];

        if (!validPaymentMethods.includes(selectedCustomer.preferredPaymentMethod)) {
            setSnackbarMessage("Método de pagamento inválido.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!validCommunicationPreferences.includes(selectedCustomer.communicationPreference)) {
            setSnackbarMessage("Preferência de comunicação inválida.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            if (isEditing) {
                await api.patch(`/customer/${selectedCustomer.id}`, {
                    fullname: selectedCustomer.fullname,
                    email: selectedCustomer.email,
                    phone: selectedCustomer.phone,
                    cpf: selectedCustomer.cpf,
                    cep: selectedCustomer.cep,
                    notes: selectedCustomer.notes,
                    preferredPaymentMethod: selectedCustomer.preferredPaymentMethod,
                    communicationPreference: selectedCustomer.communicationPreference,
                });
                setRows(rows.map((row) => (row.id === selectedCustomer.id ? selectedCustomer : row)));
                setSnackbarMessage("Cliente atualizado com sucesso!");
            } else {
                const response = await api.post('/customer', selectedCustomer);
                setRows([...rows, response.data.content]);
                setSnackbarMessage("Cliente adicionado com sucesso!");
            }
            setSnackbarSeverity("success");
        } catch (error) {
            setSnackbarMessage("Erro ao salvar cliente.");
            setSnackbarSeverity("error");
        } finally {
            handleClose();
            setSnackbarOpen(true);
        }
    };

    const handleRefresh = () => {
        fetchCustomers();
        setSnackbarMessage("Lista de clientes atualizada!");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
    };

    const paymentMethods = {
        CREDIT_CARD: "Cartão de Crédito",
        DEBIT_CARD: "Cartão de Débito",
        MONEY: "Dinheiro",
        ANY: "Qualquer um"
    };

    const communicationPreferences = {
        EMAIL: "E-mail",
        PHONE: "Telefone",
        SMS: "SMS", 
        ANY: "Qualquer um"
    };

    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "fullname", headerName: "Nome Completo", width: 200, editable: true },
        { field: "email", headerName: "E-mail", width: 200, editable: true },
        { field: "phone", headerName: "Telefone", width: 150, editable: true },
        { field: "cpf", headerName: "CPF", width: 150, editable: true },
        { field: "cep", headerName: "CEP", width: 150, editable: true },
        { field: "notes", headerName: "Notas", width: 200, editable: true },
        {
            field: "preferredPaymentMethod",
            headerName: "Método de Pagamento Preferido",
            width: 200,
            renderCell: (params) => paymentMethods[params.value] || params.value,
        },
        {
            field: "communicationPreference",
            headerName: "Preferência de Comunicação",
            width: 200,
            renderCell: (params) => communicationPreferences[params.value] || params.value,
        },
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
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
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
                    page={page}
                    pageSize={pageSize}
                    rowCount={totalPages * pageSize}
                    paginationMode="server"
                    onPageChange={(newPage) => setPage(newPage)}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                />
            </div>
            <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(event, value) => setPage(value - 1)}
                color="primary"
                sx={{ mt: 2 }}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nome Completo"
                        fullWidth
                        margin="normal"
                        value={selectedCustomer?.fullname || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, fullname: e.target.value })}
                    />
                    <TextField
                        label="E-mail"
                        fullWidth
                        margin="normal"
                        value={selectedCustomer?.email || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                    />
                    <TextField
                        label="Telefone"
                        fullWidth
                        margin="normal"
                        value={selectedCustomer?.phone || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                    />
                    <TextField
                        label="CPF"
                        fullWidth
                        margin="normal"
                        value={selectedCustomer?.cpf || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, cpf: e.target.value })}
                    />
                    <TextField
                        label="CEP"
                        fullWidth
                        margin="normal"
                        value={selectedCustomer?.cep || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, cep: e.target.value })}
                    />
                    <TextField
                        label="Notas"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        value={selectedCustomer?.notes || ""}
                        onChange={(e) => setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Método de Pagamento Preferido</InputLabel>
                        <Select
                            value={selectedCustomer?.preferredPaymentMethod || "ANY"}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, preferredPaymentMethod: e.target.value })}
                        >
                            {Object.entries(paymentMethods).map(([key, value]) => (
                                <MenuItem key={key} value={key}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Preferência de Comunicação</InputLabel>
                        <Select
                            value={selectedCustomer?.communicationPreference || "EMAIL"} // Valor padrão
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, communicationPreference: e.target.value })}
                        >
                            {Object.entries(communicationPreferences).map(([key, value]) => (
                                <MenuItem key={key} value={key}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave}>{isEditing ? "Confirmar" : "Adicionar"}</Button>
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

export default Customers;
