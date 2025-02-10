import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Container, Button, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Estructura del programa (Push, Pull, Legs)
const defaultProgram = [
  {
    dayName: "Push",
    exercises: [
      { name: "Press Banca", series: ["12", "10", "8"] },
      { name: "Banca Inclinada Manc.", series: ["12", "10", "10", "8"] },
      { name: "Mariposa Máquina", series: ["15", "15", "15", "15"] },
      { name: "Flexiones de Brazo", series: ["Fallo", "Fallo", "Fallo", "Fallo"] },
      { name: "Press Militar Sentado", series: ["15", "12", "10", "8"] },
      { name: "Vuelos Laterales", series: ["15", "15", "15 (+1DS)"] }
    ]
  },
  {
    dayName: "Pull",
    exercises: [
      { name: "Jalón al Pecho Prono", series: ["15", "12", "12", "10"] },
      { name: "Pull Over Soga", series: ["15", "15", "15"] },
      { name: "Remo con Barra", series: ["10", "10", "8", "8"] },
      { name: "Remo Bajo Polea", series: ["12", "12", "10", "8 (+1RP)"] },
      { name: "Curl Bíceps Barra W", series: ["12", "12", "12", "12"] },
      { name: "Press Francés Barra W", series: ["15", "15", "15", "15"] },
      { name: "Bíceps Martillo Soga", series: ["15", "15", "12", "10"] },
      { name: "Tríceps Soga", series: ["15", "15", "15", "15"] }
    ]
  },
  {
    dayName: "Legs",
    exercises: [
      { name: "Sentadilla Barra Libre", series: ["12", "10", "8"] },
      { name: "Estocadas con Peso", series: ["12", "12", "12", "12"] },
      { name: "Sillón de Cuádriceps", series: ["18", "15", "15", "12", "10"] },
      { name: "Peso Muerto Rumano Manc.", series: ["10", "10", "10"] },
      { name: "Sillón Femorales", series: ["15", "12", "12", "10"] },
      { name: "Sillón Cuádriceps (lentas)", series: ["10", "10", "10"] }
    ]
  }
];

function App() {
  // Estados para la pestaña actual, dayNumber, historial y datos del formulario
  const [tab, setTab] = useState(0); // 0: Programa, 1: Progreso, 2: Historial
  const [dayNumber, setDayNumber] = useState(1);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [formData, setFormData] = useState({});

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const storedDayNumber = localStorage.getItem("dayNumber");
    const storedHistory = localStorage.getItem("historyRecords");
    if (storedDayNumber) setDayNumber(parseInt(storedDayNumber, 10));
    if (storedHistory) setHistoryRecords(JSON.parse(storedHistory));
  }, []);

  // Guardar en localStorage cada vez que cambian dayNumber o historyRecords
  useEffect(() => {
    localStorage.setItem("dayNumber", dayNumber);
    localStorage.setItem("historyRecords", JSON.stringify(historyRecords));
  }, [dayNumber, historyRecords]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const currentProgram = defaultProgram[(dayNumber - 1) % 3];

  const handleInputChange = (e, exerciseName, serieIndex, type) => {
    const key = `${exerciseName}-${serieIndex}-${type}`;
    setFormData({
      ...formData,
      [key]: e.target.value
    });
  };

  const completeDay = () => {
    let totalWeight = 0;
    let totalReps = 0;
    const recordExercises = currentProgram.exercises.map(ex => {
      const sets = ex.series.map((serie, i) => {
        const weight = parseFloat(formData[`${ex.name}-${i}-weight`]) || 0;
        const reps = parseInt(formData[`${ex.name}-${i}-reps`]) || 0;
        totalWeight += weight * reps;
        totalReps += reps;
        return { weight, reps };
      });
      return { name: ex.name, sets };
    });
    const record = {
      dayNumber,
      dayName: currentProgram.dayName,
      dateStr: new Date().toLocaleString(),
      exercises: recordExercises,
      totalWeight,
      totalReps,
      expanded: false
    };
    setHistoryRecords([...historyRecords, record]);
    setDayNumber(dayNumber + 1);
    setFormData({});
    alert("Día completado. Datos guardados.");
  };

  // Función para generar los datos de cada gráfica
  const getChartData = (filterDayName) => {
    const data = historyRecords.filter(record => record.dayName === filterDayName);
    return {
      labels: data.map(record => record.dateStr),
      datasets: [
        {
          label: 'Peso Total (kg)',
          data: data.map(record => record.totalWeight),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'y'
        },
        {
          label: 'Repeticiones',
          data: data.map(record => record.totalReps),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Funciones de exportar e importar datos
  const exportData = () => {
    const data = {
      dayNumber: localStorage.getItem("dayNumber"),
      historyRecords: localStorage.getItem("historyRecords")
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datos_entrenamientos.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.dayNumber && importedData.historyRecords) {
          localStorage.setItem("dayNumber", importedData.dayNumber);
          localStorage.setItem("historyRecords", importedData.historyRecords);
          alert("Datos importados correctamente. Recarga la página para aplicar los cambios.");
          window.location.reload();
        } else {
          alert("El archivo no tiene el formato esperado.");
        }
      } catch (err) {
        alert("Error al importar datos: " + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: 2 }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6">
            Registro de Ejercicios (PPL)
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ marginTop: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Programa" />
          <Tab label="Progreso" />
          <Tab label="Historial" />
        </Tabs>
      </Box>
      <Box sx={{ marginTop: 2 }}>
        {tab === 0 && (
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
              Día {dayNumber}: {currentProgram.dayName}
            </Typography>
            {currentProgram.exercises.map((ex, exIndex) => (
              <Box key={exIndex} sx={{ marginBottom: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6">{ex.name}</Typography>
                {ex.series.map((serie, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ width: 100 }}>Serie: {serie}</Typography>
                    <input
                      type="number"
                      placeholder="Peso"
                      value={formData[`${ex.name}-${i}-weight`] || ''}
                      onChange={(e) => handleInputChange(e, ex.name, i, 'weight')}
                      style={{ marginRight: 8, padding: '4px', width: '80px' }}
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={formData[`${ex.name}-${i}-reps`] || ''}
                      onChange={(e) => handleInputChange(e, ex.name, i, 'reps')}
                      style={{ padding: '4px', width: '80px' }}
                    />
                  </Box>
                ))}
              </Box>
            ))}
            <Button variant="contained" color="primary" onClick={completeDay}>
              Completar Día y Guardar
            </Button>
          </Paper>
        )}
        {tab === 1 && (
          <Box>
            {['Push', 'Pull', 'Legs'].map((day, idx) => (
              <Paper key={idx} sx={{ marginBottom: 2, padding: 2 }}>
                <Typography variant="h6">{day}</Typography>
                <Line
                  data={getChartData(day)}
                  options={{
                    responsive: true,
                    scales: {
                      y: { type: 'linear', position: 'left' },
                      y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
                    }
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
        {tab === 2 && (
          <Box>
            {historyRecords.slice().reverse().map((rec, idx) => (
              <Paper key={idx} sx={{ marginBottom: 2, padding: 2 }}>
                <Typography variant="h6">
                  Día {rec.dayNumber} ({rec.dayName}) - {rec.dateStr}
                </Typography>
                <Typography variant="subtitle1">
                  Peso Total: {rec.totalWeight.toFixed(2)} kg | Reps Totales: {rec.totalReps}
                </Typography>
                {rec.exercises.map((ex, exIdx) => (
                  <Box key={exIdx} sx={{ marginTop: 1, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle2">{ex.name}</Typography>
                    {ex.sets.map((set, setIdx) => (
                      <Typography key={setIdx} variant="body2">
                        Serie {setIdx + 1}: Peso = {set.weight} kg, Reps = {set.reps}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
      <Box sx={{ marginTop: 2, textAlign: 'center' }}>
        <Button variant="outlined" onClick={exportData} sx={{ mr: 1 }}>
          Exportar Datos
        </Button>
        <Button variant="outlined" component="label">
          Importar Datos
          <input type="file" hidden accept="application/json" onChange={importData} />
        </Button>
      </Box>
    </Container>
  );
}

export default App;
