import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const fileExporters = {
  exportToExcel: (title, filename, rows) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, filename);
  },
  exportToPdf: (title = "", filename = "export.pdf", type = "pdf", header = [], data = [], content = "") => {
    const doc = new jsPDF();
    let startY = 10;

    if (title) {
      doc.setFontSize(14);
      doc.text(title, 14, startY);
      startY += 10;
    }

    if (type === "pdf" && header.length && data.length) {
      autoTable(doc, {
        head: [header],
        body: data,
        startY,
      });
      doc.save(filename);
    } else if (type === "html" && content) {
      let element = null;

      if (typeof content === "string") {
        if (content.trim().startsWith("<")) {
          doc.html(content, {
            x: 10,
            y: startY,
            callback: () => doc.save(filename),
          });
          return;
        } else {
          element = document.querySelector(content);
        }
      } else if (content instanceof HTMLElement) {
        element = content;
      }

      if (element) {
        doc.html(element, {
          x: 10,
          y: startY,
          callback: () => doc.save(filename),
        });
      } else {
        throw new Error("Elemento HTML não encontrado.");
      }
    } else if (type === "text" && content) {
      const lines = doc.splitTextToSize(String(content), 180);
      doc.text(lines, 14, startY);
      doc.save(filename);
    } else {
      throw new Error("Parâmetros inválidos para exportação PDF.");
    }
  }
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