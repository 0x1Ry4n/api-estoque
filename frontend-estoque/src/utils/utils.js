import * as XLSX from "xlsx";

export const fileExporters = {
  exportToExcel: (title, filename, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, filename);
  },
}

export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Date.now() / 1000;

  return payload.exp < currentTime;
};

export const formatDocument = (doc) => {
  if (!doc) return '';
  if (doc.length === 11) {
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (doc.length === 14) {
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
};