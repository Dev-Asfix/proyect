const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { trainModel, predictFillTime } = require('./ml/ml'); // Importar la red neuronal
const { sendWhatsAppMessage } = require('./api/wpp');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let lastData = {};
let states = [];
let fullTimes = [];
let averageFillTime = 0;

wss.on('connection', ws => {
  ws.on('message', message => {
    const data = JSON.parse(message);
    lastData = { ...data, timestamp: new Date().toLocaleString() };

    // Guardar el tiempo de llenado si el estado es "Lleno"
    if (data.estado === 'Lleno') {
      fullTimes.push(data.timestamp);
      calculateAverageFillTime();
      
      // Enviar un mensaje de WhatsApp cuando el estado sea "Lleno"
      /*  sendWhatsAppMessage('whatsapp:+51925418808', 'El tacho está lleno.')
      .then(() => console.log('Mensaje de WhatsApp enviado.'))
      .catch(error => console.error('Error al enviar el mensaje de WhatsApp:', error)); */
  
    }

    // Guardar el estado para entrenar la red neuronal
    if (data.estado !== 'Lleno') {
      states.push({ distancia: data.distancia, tiempoParaLlenar: averageFillTime });
    }

    // Entrenar la red neuronal
    if (states.length > 5) {
      trainModel(states);
    }

    // Hacer predicción si la red ha sido entrenada y el estado no es "Lleno"
    if (data.estado !== 'Lleno' && states.length > 5) {
      try {
        const predictedTime = predictFillTime(data.distancia);
        lastData.predictedFillTime = predictedTime;
      } catch (error) {
        console.error(error.message);
      }
    }

    states.push(lastData);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ ...lastData, averageFillTime }));
      }
    });
  });
});

function calculateAverageFillTime() {
  if (fullTimes.length >= 2) {
    const totalFillTime = new Date(fullTimes[fullTimes.length - 1]) - new Date(fullTimes[0]);
    averageFillTime = totalFillTime / (fullTimes.length - 1);
  }
}
 
// Servir la carpeta principal 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir la carpeta secundaria 'asistente' bajo la ruta '/asistente'
app.use('/asistente', express.static(path.join(__dirname, 'asistente')));

// Nueva ruta para obtener el estado actual
app.get('/estado', (req, res) => {
  if (lastData.estado) {
    res.json({ estado: lastData.estado });
  } else {
    res.json({ estado: 'No disponible' });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
