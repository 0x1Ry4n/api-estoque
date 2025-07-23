import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  Paper,
  Grid,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { AddCircleOutline, Delete, Add, ShoppingBag, Construction, CardGiftcard, Stars, ShoppingCartOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { CustomerService } from '../../../../services/customerService';
import { ProductService } from '../../../../services/productService';
import { OrderService } from '../../../../services/orderService';

const OrderForm = ({ onOrderAdded }) => {
  const { control, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm({
    defaultValues: {
      items: [],
      status: 'PENDING',
      paymentMethod: 'CREDIT_CARD'
    }
  });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    productId: null,
    inventoryCode: '',
    quantity: 1,
    unitPrice: 0,
    unit: '',
    orderItemType: 'PRODUCT'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          CustomerService.getCustomer(false, 0, 0),
          ProductService.product.getProducts(false, 0, 0)
        ]);
        setCustomers(customersResponse.data);
        setProducts(productsResponse.data);
      } catch (error) {
        setErrorMessage(`Erro ao buscar os dados: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductChange = async (event, newValue) => {
    if (newValue) {
      setCurrentItem(prev => ({
        ...prev,
        productId: newValue,
        unitPrice: newValue.price || 0,
        unit: newValue.unit || '',
        inventoryCode: ''
      }));

      try {
        const response = await ProductService.inventory.getInventoriesByProduct(newValue.id);
        setInventories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(`Erro ao buscar inventário: ${error}`);
        setInventories([]);
      }
    }
  };

  const handleInventoryChange = (_, value) => {
    if (value) {
      setCurrentItem(prev => ({
        ...prev,
        inventoryCode: value.inventoryCode,
        unitPrice: value.unitPrice || prev.unitPrice,
        unit: value.unit || prev.unit
      }));
    }
  };

  const handleAddItem = () => {
    const items = getValues('items') || [];
    const newItem = {
      productId: currentItem.productId.id,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      unit: currentItem.unit,
      inventoryCode: currentItem.inventoryCode,
      orderItemType: currentItem.orderItemType
    };

    setValue('items', [...items, newItem]);
    resetItemDialog();
  };

  const resetItemDialog = () => {
    setOpenItemDialog(false);
    setCurrentItem({
      productId: null,
      inventoryCode: '',
      quantity: 1,
      unitPrice: 0,
      unit: '',
      orderItemType: 'PRODUCT'
    });
    setInventories([]);
  };

  const handleRemoveItem = (index) => {
    const items = [...getValues('items')];
    items.splice(index, 1);
    setValue('items', items);
  };

  const onSubmit = async (data) => {
    if (!data.items || data.items.length === 0) {
      setErrorMessage('Adicione pelo menos um item ao pedido.');
      return;
    }

    const orderData = {
      customerId: data.customerId?.id,
      items: data.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity)
      })),
      status: data.status,
      paymentMethod: data.paymentMethod,
      deliveryDate: data.deliveryDate,
      observation: data.observation,
    };

    try {
      setLoading(true);
      const response = await OrderService.createOrder(orderData);
      if (response.status === 201) {
        setSuccessMessage('Pedido cadastrado com sucesso!');
        if (typeof onOrderAdded === 'function') {
          onOrderAdded(response.data.content);
        }
        reset({
          items: [],
          status: 'PENDING',
          paymentMethod: 'CREDIT_CARD'
        });
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.response?.data.error || 'Erro ao cadastrar pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const formatDocument = (doc) => {
    if (!doc) return '';
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  return (
    <Box>
      <Paper
        elevation={4}
        sx={{ padding: 6, borderRadius: 2, backgroundColor: "#f5f5f5", width: "95%" }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <AddCircleOutline sx={{ mr: 1 }} />
          Cadastrar Pedido
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name="customerId"
                control={control}
                rules={{ required: 'O cliente é obrigatório.' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={customers}
                    getOptionLabel={(option) => {
                      const doc = option.cpf ? `CPF: ${formatDocument(option.cpf)}` :
                        option.cnpj ? `CNPJ: ${formatDocument(option.cnpj)}` : '';
                      return `${option.name || 'Sem nome'} ${doc ? `(${doc})` : ''}`;
                    }}
                    onChange={(event, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        variant="outlined"
                        error={!!errors.customerId}
                        helperText={errors.customerId?.message}
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                  mb: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Itens do Pedido
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setOpenItemDialog(true)}
                >
                  Adicionar Item
                </Button>
              </Box>

              <TableContainer
                component={Paper}
                sx={{
                  overflowX: 'auto',
                  width: '100%',
                  '& .MuiTableCell-root': {
                    padding: { xs: '8px', sm: '16px' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              >
                <Table sx={{ minWidth: 650 }} size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell align="right">Qtd</TableCell>
                      <TableCell align="right">Preço Unit.</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Unidade</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Inventário</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getValues('items')?.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      const total = item.quantity * item.unitPrice;

                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.name}</TableCell>

                          <TableCell align="right">{item.quantity}</TableCell>

                          <TableCell align="right">
                            {item.unitPrice.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>

                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {total.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>

                          <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            {item.unit}
                          </TableCell>

                          <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, fontFamily: 'monospace' }}>
                            {item.inventoryCode}
                          </TableCell>

                          <TableCell align="center">
                            <Tooltip title="Remover item">
                              <IconButton onClick={() => handleRemoveItem(index)} size="small">
                                <Delete fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {(!getValues('items') || getValues('items').length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              color: 'text.secondary'
                            }}
                          >
                            <ShoppingCartOutlined sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="body1">Nenhum item adicionado</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>


            <Grid item md={6} xs={12}>
              <FormControl fullWidth variant="outlined">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pagamento</Typography>
                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: 'Método de pagamento é obrigatório' }}
                  render={({ field }) => (
                    <Select {...field} variant="outlined" required>
                      <MenuItem value="MONEY">Dinheiro</MenuItem>
                      <MenuItem value="PIX">PIX</MenuItem>
                      <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
                      <MenuItem value="DEBIT_CARD">Cartão de Débito</MenuItem>
                      <MenuItem value="BANK_SLIP">Boleto</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item md={6} xs={12}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Status do Pedido</Typography>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status é obrigatório' }}
                  render={({ field }) => (
                    <Select {...field} variant="outlined" required>
                      <MenuItem value="PENDING">Pendente</MenuItem>
                      <MenuItem value="IN_TRANSIT">Em Trânsito</MenuItem>
                      <MenuItem value="DELIVERED">Entregue</MenuItem>
                      <MenuItem value="CANCELED">Cancelado</MenuItem>
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="deliveryDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data de Entrega"
                    type="datetime-local"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item md={6} xs={12}>
              <Controller
                name="observation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observação"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 4 }}>
            <AddCircleOutline sx={{ mr: 1 }} />
            Cadastrar Pedido
          </Button>
        </Box>

        <Dialog open={openItemDialog} onClose={resetItemDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#00796b', color: 'white' }}>
            <Box display="flex" alignItems="center">
              <Add sx={{ mr: 1 }} />
              Adicionar Item ao Pedido
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Seleão de Produto */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name || ''}
                  value={currentItem.productId}
                  onChange={handleProductChange}
                  sx={{ mb: 2 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Produto"
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                  noOptionsText="Nenhum produto encontrado"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={inventories}
                  getOptionLabel={(option) =>
                    `${option.inventoryCode} - ${option.unitPrice?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }) || 'Preço não definido'} (${option.quantity} disponíveis)`
                  }
                  sx={{ mb: 2 }}
                  value={inventories.find(inv => inv.inventoryCode === currentItem.inventoryCode) || null}
                  onChange={handleInventoryChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Inventário"
                      variant="outlined"
                      required
                      fullWidth
                    />
                  )}
                  disabled={!currentItem.productId}
                  noOptionsText="Nenhum inventário disponível"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Quantidade"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem(prev => ({
                    ...prev,
                    quantity: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  required
                  sx={{ mb: 2 }}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Preço Unitário"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={currentItem.unitPrice}
                  onChange={(e) => setCurrentItem(prev => ({
                    ...prev,
                    unitPrice: parseFloat(e.target.value) || 0
                  }))}
                  required
                  sx={{ mb: 2 }}
                  inputProps={{ step: "0.01", min: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Select
                          value={currentItem.currency || 'BRL'}
                          onChange={(e) => setCurrentItem(prev => ({
                            ...prev,
                            currency: e.target.value
                          }))}
                          sx={{
                            '& .MuiSelect-select': {
                              padding: '8px 16px 8px 8px',
                              fontSize: '0.875rem'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            }
                          }}
                        >
                          <MenuItem value="BRL">R$</MenuItem>
                          <MenuItem value="USD">US$</MenuItem>
                          <MenuItem value="EUR">€</MenuItem>
                          <MenuItem value="GBP">£</MenuItem>
                        </Select>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Unidade de Medida"
                  fullWidth
                  variant="outlined"
                  value={currentItem.unit}
                  onChange={(e) => setCurrentItem(prev => ({
                    ...prev,
                    unit: e.target.value
                  }))}
                  select
                >
                  <MenuItem value="UN">Unidade (UN)</MenuItem>
                  <MenuItem value="KG">Quilograma (KG)</MenuItem>
                  <MenuItem value="G">Grama (G)</MenuItem>
                  <MenuItem value="L">Litro (L)</MenuItem>
                  <MenuItem value="ML">Mililitro (ML)</MenuItem>
                  <MenuItem value="M">Metro (M)</MenuItem>
                  <MenuItem value="CM">Centímetro (CM)</MenuItem>
                  <MenuItem value="CX">Caixa (CX)</MenuItem>
                  <MenuItem value="PC">Peça (PC)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Tipo do Item</Typography>
                  <Select
                    value={currentItem.orderItemType}
                    onChange={(e) => setCurrentItem(prev => ({
                      ...prev,
                      orderItemType: e.target.value
                    }))}
                    variant="outlined"
                    required
                  >
                    <MenuItem value="PRODUCT">
                      <Box display="flex" alignItems="center">
                        <ShoppingBag sx={{ mr: 1, fontSize: '1rem' }} /> Produto
                      </Box>
                    </MenuItem>
                    <MenuItem value="SERVICE">
                      <Box display="flex" alignItems="center">
                        <Construction sx={{ mr: 1, fontSize: '1rem' }} /> Serviço
                      </Box>
                    </MenuItem>
                    <MenuItem value="GIFT">
                      <Box display="flex" alignItems="center">
                        <CardGiftcard sx={{ mr: 1, fontSize: '1rem' }} /> Brinde
                      </Box>
                    </MenuItem>
                    <MenuItem value="BONUS">
                      <Box display="flex" alignItems="center">
                        <Stars sx={{ mr: 1, fontSize: '1rem' }} /> Bonificação
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Button
              onClick={resetItemDialog}
              variant="outlined"
              color="secondary"
              sx={{ mr: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddItem}
              variant="contained"
              color="primary"
              disabled={!currentItem.productId || !currentItem.inventoryCode}
              startIcon={<Add />}
              sx={{ minWidth: 120 }}
            >
              Adicionar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!errorMessage || !!successMessage}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={errorMessage ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {errorMessage || successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default OrderForm;