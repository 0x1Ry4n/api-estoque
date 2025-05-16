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
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { useState } from "react";

export default function TopSellingProducts({ receivements, exits }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filter, setFilter] = useState("exits");

  const receivementsMap = {};
  const exitsMap = {};

  receivements.forEach(receivement => {
    const { productId, productName, unitPrice, totalPrice, quantity } = receivement;

    if (productId && productName && unitPrice !== undefined && quantity !== undefined) {
      if (!receivementsMap[productId]) {
        receivementsMap[productId] = {
          name: productName,
          price: unitPrice,
          quantity: 0,
          amount: 0,
        };
      }

      receivementsMap[productId].quantity += quantity;
      receivementsMap[productId].amount += totalPrice;
    }
  });

  exits.forEach(exit => {
    const { productId, productName, unitPrice, totalPrice, quantity } = exit;

    if (productId && productName && unitPrice !== undefined && quantity !== undefined) {
      if (!exitsMap[productId]) {
        exitsMap[productId] = {
          name: productName,
          price: unitPrice,
          quantity: 0,
          amount: 0,
        };
      }

      exitsMap[productId].quantity += quantity;
      exitsMap[productId].amount += totalPrice;
    }
  });

  const topReceivements = Object.values(receivementsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const topExits = Object.values(exitsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const dataToShow = filter === "receivements" ? topReceivements : topExits;

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 'bold',
            fontSize: {
              xs: '1rem',
              sm: '1.5rem',
              md: '1.5rem'
            },
            mb: { xs: 2, sm: 3 },
            ml: { xs: 1, sm: 4 },
            mt: { xs: 2, sm: 6, md: 10 },
            lineHeight: 1.2,
          }}
        >
          {filter === "receivements" ? "Produtos com mais Recebimentos" : "Produtos com mais Saídas"}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 180, mt: { xs: 1, sm: 6 }, mr: { xs: 1, sm: 4 } }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filter}
            label="Tipo"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="exits">Saídas</MenuItem>
            <MenuItem value="receivements">Recebimentos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

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
            {dataToShow.map((product, id) => (
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
