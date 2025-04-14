import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, Typography, Button, TextField, Modal, Grid, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download'; 
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import DescriptionIcon from '@mui/icons-material/Description'; 

const CalendarWithNotes = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [currentNote, setCurrentNote] = useState({ title: '', note: '', priority: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [calendarView, setCalendarView] = useState('dayGridMonth');

  const calendarRef = useRef(); 

  useEffect(() => {
    const savedNotes = localStorage.getItem('calendarNotes');
    if (savedNotes) {
      const loadedNotes = JSON.parse(savedNotes);
      setNotes(loadedNotes);
      const loadedEvents = Object.keys(loadedNotes).map((date) => ({
        title: loadedNotes[date].title,
        start: date,
        allDay: true,
        extendedProps: loadedNotes[date],
      }));
      setEvents(loadedEvents);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
  }, [notes]);

  const handleDateClick = (info) => {
    setSelectedDate(info.date);
    const note = notes[format(info.date, 'yyyy-MM-dd')] || { title: '', note: '', priority: '' };
    setCurrentNote(note);
    setIsEditing(!!note.title);
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    const eventNote = info.event.extendedProps;
    setSelectedDate(info.event.start);
    setCurrentNote(eventNote);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveNote = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const updatedNotes = {
      ...notes,
      [formattedDate]: currentNote,
    };
    setNotes(updatedNotes);

    const updatedEvents = Object.keys(updatedNotes).map((date) => ({
      title: updatedNotes[date].title,
      start: date,
      allDay: true,
      extendedProps: updatedNotes[date],
    }));
    setEvents(updatedEvents);

    setModalOpen(false);
    setSnackbarMessage(isEditing ? 'Nota editada com sucesso!' : 'Nota salva com sucesso!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteNote = () => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const updatedNotes = { ...notes };
    delete updatedNotes[formattedDate];
    setNotes(updatedNotes);

    const updatedEvents = Object.keys(updatedNotes).map((date) => ({
      title: updatedNotes[date].title,
      start: date,
      allDay: true,
      extendedProps: updatedNotes[date],
    }));
    setEvents(updatedEvents);

    setModalOpen(false);
    setSnackbarMessage('Nota excluída com sucesso!');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleInputChange = (field, value) => {
    setCurrentNote((prevNote) => ({
      ...prevNote,
      [field]: value,
    }));
  };

  const exportEventsToCSV = () => {
    const csvContent = [
      ['Data', 'Título', 'Nota', 'Prioridade'].join(','),
      ...Object.keys(notes).map((date) =>
        [
          format(new Date(date), 'dd/MM/yyyy'),
          `"${notes[date].title.replace(/"/g, '""')}"`,
          `"${notes[date].note.replace(/"/g, '""')}"`,
          notes[date].priority,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'calendario_notas.csv');
  };

  const exportCalendarToPDF = () => {
    html2canvas(calendarRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; 
      const pageHeight = pdf.internal.pageSize.height; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width; 
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('calendario_notas.pdf');
    });
  };

  const exportNotesToPDF = () => {
    const doc = new jsPDF();
    doc.text('Notas do Calendário', 10, 10);
    Object.keys(notes).forEach((date, index) => {
      const note = notes[date];
      doc.text(`${format(new Date(date), 'dd/MM/yyyy')}: ${note.title} - ${note.note} (Prioridade: ${note.priority})`, 10, 20 + index * 10);
    });
    doc.save('notas_do_calendario.pdf');
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Calendário de Notas
        </Typography>

        <div ref={calendarRef}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={calendarView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            height="auto"
            contentHeight="800px" // Aumentando a altura do calendário
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            locale="pt-br"
            selectable={true}
          />
        </div>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={exportEventsToCSV} startIcon={<DownloadIcon />}>
              Exportar para CSV
            </Button>
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary" onClick={exportNotesToPDF} startIcon={<DescriptionIcon />}>
              Exportar Notas para PDF
            </Button>
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary" onClick={exportCalendarToPDF} startIcon={<PictureAsPdfIcon />} sx={{ ml: 2 }}>
              Exportar Calendário para PDF
            </Button>
          </Grid>
        </Grid>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Nota para {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}
            </Typography>

            <TextField
              label="Título"
              fullWidth
              value={currentNote.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Nota"
              multiline
              fullWidth
              rows={4}
              value={currentNote.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={currentNote.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Prioridade"
              >
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" color="success" onClick={handleSaveNote}>
              {isEditing ? 'Salvar Alterações' : 'Salvar Nota'}
            </Button>
            {isEditing && (
              <Button variant="outlined" color="error" onClick={handleDeleteNote} sx={{ ml: 2 }}>
                Excluir Nota
              </Button>
            )}
          </Box>
        </Modal>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default CalendarWithNotes;
