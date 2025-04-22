import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const fileExporters = {
  exportToExcel: (title, filename, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, filename);
  }, 
  exportToPDF: (filename, rows) => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Categoria"];
    const tableRows = rows.map((row) => [row.id, row.name]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });
    
    doc.save(filename);
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1])); 
  const currentTime = Date.now() / 1000;

  return payload.exp < currentTime; 
};