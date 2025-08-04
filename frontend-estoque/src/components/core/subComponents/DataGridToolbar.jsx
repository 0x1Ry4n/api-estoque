import { Box, Button, MenuItem } from "@mui/material";
import {
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridCsvExportMenuItem,
    GridPrintExportMenuItem,
    GridToolbarExportContainer,
    useGridApiContext,
} from "@mui/x-data-grid";
import {
    Refresh as RefreshIcon
} from "@mui/icons-material";
import { fileExporters } from "../../../utils/utils";

export const DataGridToolbar = ({ onReload }) => {
    const apiRef = useGridApiContext();

    const getData = () => {
        const rows = Array.from(apiRef.current.getRowModels().values());
        const columns = apiRef.current.getVisibleColumns();
        return { rows, columns };
    };

    const handleExportExcel = () => {
        const { rows } = getData();
        fileExporters.exportToExcel("Relatório", "dados.xlsx", rows);
        handleCloseMenu();
    };

    const handleExportPdf = () => {
        const { rows, columns } = getData();
        const header = columns.map(col => col.headerName || col.field);
        const data = rows.map(row => columns.map(col => formatCell(row[col.field])));
        fileExporters.exportToPdf("Relatório", "dados.pdf", "pdf", header, data);
        handleCloseMenu();
    };

    const formatCell = (value) => {
        if (value instanceof Date) return value.toLocaleDateString();
        if (typeof value === "boolean") return value ? "Sim" : "Não";
        return value != null ? String(value) : "";
    };

    return (
        <Box
            sx={{
                p: 1,
                pb: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
            }}
        >
            <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onReload}
            >
                Recarregar
            </Button>

            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExportContainer>
                <GridCsvExportMenuItem options={{ fileName: "dados" }} />
                <MenuItem onClick={handleExportExcel}>Baixar como Excel</MenuItem>
                <MenuItem onClick={handleExportPdf}>Baixar como PDF</MenuItem>
                <GridPrintExportMenuItem options={{ fileName: "dados" }} />
            </GridToolbarExportContainer>
        </Box>
    );
};
