import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Autocomplete,
  IconButton,
  Avatar,
  Badge,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Tooltip,
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip
} from "@mui/material";
import { DataGridToolbar } from "../../subComponents/DataGridToolbar";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { DataGrid, ptBR } from "@mui/x-data-grid";
import { addDays, format } from "date-fns";
import { useProductListStore } from "./stores/useProductListStore";
import { ProductService } from "../../../../services/productService";
import Swal from "sweetalert2";

const Products = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    rows,
    pagination,
    categories,
    suppliers,
    selectedProduct,
    detailedProduct,
    imagePreviewEdit,
    open,
    detailDialogOpen,
    snackbar,
    setPagination,
    showSnackbar,
    closeSnackbar,
    setImageEdit,
    fetchProducts,
    fetchCategoriesAndSuppliers,
    openModal,
    closeModal,
    openDetailDialog,
    closeDetailDialog,
    saveProduct,
    deleteProduct
  } = useProductListStore();

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchCategoriesAndSuppliers();
    fetchProducts(pagination.page, pagination.pageSize);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageEdit(file);
    }
  };

  const handleClickOpen = (product) => {
    openModal(product);
  };

  const handleDetailOpen = (id) => {
    openDetailDialog(id);
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
      await deleteProduct(ids);
    }
  };

  const handleSave = async () => {
    await saveProduct();
  };

  const handleRefresh = () => {
    fetchProducts(pagination.page, pagination.pageSize);
    showSnackbar("Lista de produtos atualizada!", "info");
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "image",
      headerName: "Imagem",
      width: 100,
      renderCell: (params) => {
        const { id, name } = params.row;

        const ImageCell = () => {
          const [imageUrl, setImageUrl] = useState(null);

          useEffect(() => {
            let objectUrl;

            const fetchImage = async () => {
              try {
                if (id) {
                  const res = await ProductService.product.getImage(id);
                  objectUrl = URL.createObjectURL(res.data);
                  setImageUrl(objectUrl);
                }
              } catch (error) {
                console.error("Erro ao carregar imagem:", error);
              }
            };

            fetchImage();

            return () => {
              if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
              }
            };
          }, [id]);

          return imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
            />
          ) : null;
        };

        return <ImageCell />;
      }
    },
    {
      field: "name",
      headerName: "Produto",
      width: 300,
      editable: true,
    },
    {
      field: "categoryName",
      headerName: "Categoria",
      width: 200,
      editable: false,
    },
    {
      field: "supplierNames",
      headerName: "Fornecedores",
      width: 200,
      editable: false,
      valueGetter: (params) => {
        return params.row.supplierNames?.join(", ") || "";
      },
    },
    {
      field: "description",
      headerName: "Descrição",
      width: 300,
      editable: true,
    },
    {
      field: "productCode",
      headerName: "Cod. Produto",
      width: 200,
      editable: true,
    },
    {
      field: "unitPrice",
      headerName: "Preço Unitário",
      width: 150,
      editable: true,
    },
    {
      field: "stockQuantity",
      headerName: "Quantidade em Estoque",
      width: 150,
      editable: false,
    },
    {
      field: "totalPrice",
      headerName: "Valor Total",
      width: 150,
      valueGetter: (params) => {
        const totalPrice = params.row.unitPrice * params.row.stockQuantity;
        return totalPrice.toFixed(2);
      },
    },
    {
      field: "expirationDate",
      headerName: "Data de Expiração",
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
      editable: true,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 200,
      renderCell: (cellData) => (
        <div>
          <Tooltip title="Editar">
            <Button onClick={() => handleClickOpen(cellData.row)}>
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Excluir">
            <Button onClick={() => handleDelete([cellData.row.id])}>
              <DeleteIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Visualizar">
            <Button
              onClick={() => handleDetailOpen(cellData.row.id)}
              color="primary"
            >
              <VisibilityIcon />
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
    >
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
            fetchProducts(page, pageSize);
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
        <DialogTitle>
          Editar Produto
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={4} sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <label htmlFor="upload-image2">
                    <input
                      accept="image/*"
                      id="upload-image2"
                      type="file"
                      hidden
                      onChange={handleImageChange}
                    />
                    <IconButton
                      component="span"
                      sx={{
                        backgroundColor: '#979797ff',
                        boxShadow: 2,
                        '&:hover': { bgcolor: '#004d40' },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                }
              >
                <Avatar
                  src={imagePreviewEdit}
                  alt="Preview"
                  sx={{
                    width: 110,
                    height: 110,
                    boxShadow: 3,
                    border: '2px solid #ccc',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  {!imagePreviewEdit && <CategoryIcon fontSize="large" sx={{ color: '#888' }} />}
                </Avatar>
              </Badge>

              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Clique no ícone para alterar a imagem
              </Typography>
            </Box>

            <TextField
              label="Nome do Produto"
              fullWidth
              value={selectedProduct?.name || ""}
              onChange={(e) =>
                useProductListStore.setState({ selectedProduct: { ...selectedProduct, name: e.target.value } })
              }
            />

            <Controller
              name="suppliers"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={suppliers || []}
                  getOptionLabel={(option) => option.socialReason || ""}
                  value={suppliers?.filter((sup) =>
                    (selectedProduct?.supplierIds || []).includes(sup.id))
                  }
                  onChange={(_, value) => {
                    const ids = value.map((v) => v.id);
                    field.onChange(ids);
                    useProductListStore.setState({ selectedProduct: { ...selectedProduct, supplierIds: ids } });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Fornecedores" />
                  )}
                />
              )}
            />

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.name || ""}
                  value={
                    categories.find(cat => cat.id === (field.value ?? selectedProduct?.categoryId)) || null
                  }
                  onChange={(_, value) => {
                    const categoryId = value?.id || null;
                    field.onChange(categoryId)
                    useProductListStore.setState({ selectedProduct: { ...selectedProduct, categoryId } });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Categoria" />
                  )}
                />
              )}
            />

            <TextField
              label="Descrição"
              fullWidth
              value={selectedProduct?.description || ""}
              onChange={(e) =>
                useProductListStore.setState({ selectedProduct: { ...selectedProduct, description: e.target.value } })
              }
            />

            <TextField
              label="Preço Unitário"
              fullWidth
              type="number"
              value={selectedProduct?.unitPrice || ""}
              onChange={(e) =>
                useProductListStore.setState({
                  selectedProduct: {
                    ...selectedProduct,
                    unitPrice: parseFloat(e.target.value)
                  }
                })
              }
            />

            <TextField
              label="Data de Expiração"
              type="date"
              variant="outlined"
              fullWidth
              value={
                selectedProduct?.expirationDate
                  ? selectedProduct.expirationDate.split("T")[0]
                  : ""
              }
              onChange={(e) =>
                useProductListStore.setState({
                  selectedProduct: {
                    ...selectedProduct,
                    expirationDate: e.target.value
                  }
                })
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSave} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={closeDetailDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            p: isMobile ? 2 : 4,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" gutterBottom>
              Detalhes do Produto
            </Typography>
            <IconButton onClick={closeDetailDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {detailedProduct && (
            <Box>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>ID:</strong></TableCell>
                      <TableCell>{detailedProduct.id.slice(0, 8)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Nome:</strong></TableCell>
                      <TableCell>{detailedProduct.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Descrição:</strong></TableCell>
                      <TableCell>{detailedProduct.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Quantidade:</strong></TableCell>
                      <TableCell>{detailedProduct.stockQuantity}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Preço Unitário:</strong></TableCell>
                      <TableCell>{detailedProduct.unitPrice.toFixed(2)} BRL</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Valor Total:</strong></TableCell>
                      <TableCell>
                        {(detailedProduct.unitPrice * detailedProduct.stockQuantity).toFixed(2)} BRL
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Data de Expiração:</strong></TableCell>
                      <TableCell>{detailedProduct.expirationDate ? detailedProduct.expirationDate : "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Categoria:</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={detailedProduct.category?.name}
                          sx={{
                            fontWeight: 'bold',
                            color: 'gainsboro',
                            bgcolor: '#524c4cff',
                            height: 25,
                            maxWidth: 150,
                            p: 2,
                            '& .MuiChip-label': {
                              paddingLeft: 1,
                              paddingRight: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>Inventário</Typography>
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableBody>
                    {detailedProduct.inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell><strong>ID:</strong> {item.id.slice(0, 8)}</TableCell>
                        <TableCell><strong>Localização:</strong> {item.location ? item.location : "N/A"}</TableCell>
                        <TableCell><strong>Quantidade:</strong> {item.quantity}</TableCell>
                        <TableCell><strong>Recebimento:</strong> {item.receivementQuantity}</TableCell>
                        <TableCell><strong>Saída:</strong> {item.exitQuantity}</TableCell>
                        <TableCell><strong>Preço:</strong> {item.unitPrice.toFixed(2)} BRL</TableCell>
                        <TableCell><strong>Desconto:</strong> {item.discount} BRL</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Fornecedores</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {detailedProduct.suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell><strong>ID:</strong> {supplier.id.slice(0, 8)}</TableCell>
                        <TableCell><strong>Nome:</strong> {supplier.socialReason}</TableCell>
                        <TableCell><strong>Email:</strong> {supplier.email}</TableCell>
                        <TableCell><strong>Telefone:</strong> {supplier.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
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

export default Products;