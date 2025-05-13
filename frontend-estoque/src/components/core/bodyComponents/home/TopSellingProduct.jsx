import {
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";

export default function TopSellingProducts({ exits }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const productMap = {};

  exits.forEach(exit => {
    const { productId, productName, unitPrice, totalPrice, quantity } = exit;

    if (productId && productName && unitPrice !== undefined && quantity !== undefined) {
      if (!productMap[productId]) {
        productMap[productId] = {
          name: productName,
          price: unitPrice,
          quantity: 0,
          amount: 0,
        };
      }

      productMap[productId].quantity += quantity;
      productMap[productId].amount += totalPrice;
    }
  });

  const topProducts = Object.values(productMap);

  return (
    <Box
      sx={{
        margin: { xs: 1, sm: 3 },
        bgcolor: "white",
        borderRadius: 2,
        padding: { xs: 1, sm: 3 },
        height: "95%",
        overflowX: "auto"
      }}
    >
      <Box sx={{}}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: '1rem',
              sm: '1.5rem',
              md: '1.5rem'
            },
            mb: { xs: 2, sm: 3, md: 4 },
            ml: { xs: 4, sm: 4, md: 5 },
            mt: { xs: 2, sm: 6, md: 10 },
            lineHeight: 1.2,
          }}
        >
          Produtos com mais Saídas
        </Typography>
        <Divider />
      </Box>
      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Nome Produto</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Preço Unitário</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Quantidade</TableCell>
              <TableCell sx={{ fontWeight: "bolder", whiteSpace: "nowrap" }}>Valor Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topProducts.map((product, id) => (
              <TableRow key={id}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{product.name}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {product.price !== undefined ? `$${product.price.toFixed(2)}` : "N/A"}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{product.quantity}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {product.amount !== undefined ? `$${product.amount.toFixed(2)}` : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}