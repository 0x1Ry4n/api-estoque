import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Modal, 
  Grid, 
  Snackbar, 
  Alert, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  ButtonGroup
} from '@mui/material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

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
        backgroundColor: getPriorityColor(loadedNotes[date].priority),
        borderColor: getPriorityColor(loadedNotes[date].priority),
        extendedProps: loadedNotes[date],
      }));
      setEvents(loadedEvents);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
  }, [notes]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return '#f44336';
      case 'Média': return '#ff9800';
      case 'Baixa': return '#4caf50';
      default: return '#2196f3';
    }
  };

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
    if (!currentNote.title || !currentNote.priority) {
      setSnackbarMessage('Título e prioridade são obrigatórios!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

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
      backgroundColor: getPriorityColor(updatedNotes[date].priority),
      borderColor: getPriorityColor(updatedNotes[date].priority),
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
      backgroundColor: getPriorityColor(updatedNotes[date].priority),
      borderColor: getPriorityColor(updatedNotes[date].priority),
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
    if (Object.keys(notes).length === 0) {
      setSnackbarMessage('Nenhuma nota para exportar!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const headers = ['Data', 'Título', 'Descrição', 'Prioridade'];
    const csvRows = [
      headers.join(';'),
      ...Object.keys(notes).map(date => {
        const note = notes[date];
        return [
          format(new Date(date), 'dd/MM/yyyy'),
          `"${note.title.replace(/"/g, '""')}"`,
          `"${note.note.replace(/"/g, '""')}"`,
          note.priority
        ].join(';');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `notas_calendario_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
  };

  const exportCalendarToPDF = () => {
    html2canvas(calendarRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgWidth = 280;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage('landscape');
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`calendario_notas_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
    });
  };

  const exportNotesToPDF = () => {
    if (Object.keys(notes).length === 0) {
      setSnackbarMessage('Nenhuma nota para exportar!');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Notas do Calendário', 105, 15, null, null, 'center');
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 25, null, null, 'center');
    
    doc.line(10, 30, 200, 30);
    
    let y = 40;
    Object.keys(notes).forEach(date => {
      const note = notes[date];
      
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(format(new Date(date), 'dd/MM/yyyy (eeee)'), 10, y);
      
      const priorityColor = {
        'Baixa': '#4CAF50',
        'Média': '#FFC107',
        'Alta': '#F44336'
      }[note.priority] || '#000000';
      
      doc.setTextColor(priorityColor);
      doc.text(`Prioridade: ${note.priority}`, 180, y, null, null, 'right');
      doc.setTextColor('#000000');
      
      doc.setFont(undefined, 'normal');
      doc.text(`Título: ${note.title}`, 10, y + 8);
      
      const splitNote = doc.splitTextToSize(note.note, 180);
      doc.text('Descrição:', 10, y + 16);
      doc.text(splitNote, 10, y + 24);
      
      doc.line(10, y + 32 + (splitNote.length * 5), 200, y + 32 + (splitNote.length * 5));
      
      y += 40 + (splitNote.length * 5);
    });
    
    doc.save(`notas_calendario_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper elevation={4} sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
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
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              list: 'Lista'
            }}
            locale={ptBrLocale}
            height="auto"
            contentHeight="700px"
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            selectable={true}
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false
            }}
          />
        </div>

        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={exportEventsToCSV} 
              startIcon={<DownloadIcon />}
              disabled={Object.keys(notes).length === 0}
            >
              Exportar CSV
            </Button>
          </Grid>

          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={exportNotesToPDF} 
              startIcon={<DescriptionIcon />}
              disabled={Object.keys(notes).length === 0}
            >
              Exportar Notas PDF
            </Button>
          </Grid>

          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={exportCalendarToPDF} 
              startIcon={<PictureAsPdfIcon />}
            >
              Exportar Calendário PDF
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
              width: { xs: '90%', sm: 500 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isEditing ? 'Editar Nota' : 'Nova Nota'} - {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
            </Typography>

            <TextField
              label="Título"
              fullWidth
              value={currentNote.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            
            <TextField
              label="Descrição"
              multiline
              fullWidth
              rows={4}
              value={currentNote.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Prioridade *</InputLabel>
              <Select
                value={currentNote.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Prioridade"
                required
              >
                <MenuItem value="Baixa">Baixa</MenuItem>
                <MenuItem value="Média">Média</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Box>
                {isEditing && (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleDeleteNote}
                    sx={{ mr: 2 }}
                  >
                    Excluir
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleSaveNote}
                  disabled={!currentNote.title || !currentNote.priority}
                >
                  {isEditing ? 'Salvar' : 'Criar'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default CalendarWithNotes;