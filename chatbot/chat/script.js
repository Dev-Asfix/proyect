// Verifica si el navegador soporta reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'es-ES'; // Idioma español
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const audioButton = document.getElementById('audio-button');
const audioIcon = document.getElementById('audio-icon');
// Botón para silenciar/reanudar el habla
const muteButton = document.getElementById('mute-button');
const muteIcon = document.getElementById('mute-icon');
// Botón para detener todo (reconocimiento y síntesis de voz)
const stopButton = document.getElementById('stop-button');

let isMuted = false; // Estado inicial: no está silenciado

// Detener todo lo que esté activo (reconocimiento y síntesis de voz)
stopButton.addEventListener('click', () => {
  stopAllProcesses();
});

// Función para detener todo
function stopAllProcesses() {
  // Detener el reconocimiento de voz si está activo
  if (recognition) {
    recognition.abort(); // Detiene el reconocimiento de voz
  }

  // Detener cualquier síntesis de voz en curso
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel(); // Detiene la voz que se esté reproduciendo
  }

  // Limpiar cualquier animación o texto
  $('.message-input').val(''); // Limpiar el cuadro de texto
  removeLoadingAnimation(); // Eliminar cualquier animación de "escribiendo"
  
  console.log("Todos los procesos han sido detenidos.");
}

// Cambiar icono y activar reconocimiento de voz
audioButton.addEventListener('click', () => {
  recognition.start();
  audioButton.classList.add('audio-listening');
  audioIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245-mic-listening.png"; // Cambia el ícono mientras escucha
});

// Cambiar el estado de silenciado y el ícono
muteButton.addEventListener('click', () => {
  isMuted = !isMuted; // Cambiar el estado
  if (isMuted) {
    muteIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245-muted.png"; // Ícono de silenciado
  } else {
    muteIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // Ícono de micrófono normal
  }
});



// Procesar el resultado de la voz reconocida
recognition.onresult = (event) => {
  const speechResult = event.results[0][0].transcript.toLowerCase(); // Convertir en minúsculas
  $('.message-input').val(speechResult); // Insertar el texto en el cuadro de mensaje
  handleVoiceCommand(speechResult); // Manejar comandos de voz
  stopAudioRecognition();
};


recognition.onerror = (event) => {
  stopAudioRecognition();
  console.error('Error al reconocer:', event.error);
};


// Manejar comandos de voz específicos
// Manejar comandos de voz específicos
function handleVoiceCommand(command) {
  if (command.includes('dime el nivel.')) {
    // Llamar a la API del servidor para obtener el nivel del tacho
    fetch('/estado')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json(); // Asegúrate de que la respuesta sea JSON válida
      })
      .then(data => {
        const nivel = data.estado || 'No disponible';
        displayBotResponse(`El nivel actual del tacho es: ${nivel}`);
      })
      .catch(error => {
        console.error('Error al obtener el nivel:', error);
        displayBotResponse('Lo siento, no puedo obtener el nivel en este momento.');
      });
  } else {
    // Si no es un comando específico, enviar el mensaje al chatbot
    sendMessageToServer(command);
  }
}



// Reiniciar el estado después de terminar el reconocimiento
recognition.onspeechend = () => {
  stopAudioRecognition();
};



// Función para detener la animación y restaurar el icono
function stopAudioRecognition() {
  audioButton.classList.remove('audio-listening');
  audioIcon.src = "https://cdn-icons-png.flaticon.com/512/727/727245.png"; // Vuelve al icono de micrófono
}



var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
  $messages.mCustomScrollbar();
  setTimeout(function() {
   
  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

function setDate() {
  d = new Date();
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();

  // Mostrar la animación de "escribiendo"
  displayLoadingAnimation();

  // Simulate server response (replace this with actual server call)
  sendMessageToServer(msg);
}

$('.message-submit').click(function() {
  insertMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

// Function to send message to the server
function sendMessageToServer(message) {
  $.ajax({
    url: 'http://localhost:3000/api/chat',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ message: message }),
    success: function(data) {
      // Remove the loading animation once response arrives
      removeLoadingAnimation();
      // Display formatted response
      displayBotResponse(formatBotResponse(data.response));
    },
    error: function() {
      removeLoadingAnimation();
      displayBotResponse("I'm sorry, something went wrong.");
    }
  });
}

// Function to display the bot's response
// Función para mostrar la respuesta del bot y hablarla
function displayBotResponse(response) {
  $('<div class="message new"><figure class="avatar"><img src="http://algom.x10host.com/chat/img/icon-oracle.gif" /></figure>' + response + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  updateScrollbar();
  
  // Reproduce la respuesta como audio
  speak(response); 
}

// Función para usar la síntesis de voz y reproducir el audio solo si no está silenciado
function speak(text) {
  if (!isMuted) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';  // Ajustar al idioma alemán (de-DE)

    // Seleccionar la voz específica si está disponible
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.name === 'Microsoft SeraphinaMultilingual Online (Natural) - German (Germany) (de-DE)');

    if (selectedVoice) {
      utterance.voice = selectedVoice;  // Establecer la voz seleccionada
    } else {
      console.warn('La voz deseada no está disponible. Usando la voz por defecto.');
    }

    // Reproducir el texto
    synth.speak(utterance);
  }
}

// Display loading animation
function displayLoadingAnimation() {
  $('<div class="message loading new"><figure class="avatar"><img src="http://algom.x10host.com/chat/img/icon-oracle.gif" /></figure><span class="loading-dots">Escribiendo<span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();
}

// Remove loading animation
function removeLoadingAnimation() {
  $('.message.loading').remove();
  updateScrollbar();
}

// Format the bot response to display code and text styles
function formatBotResponse(response) {
  // Use regex to identify code blocks and wrap them with <pre><code> for syntax highlighting
  let formattedResponse = response
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code block
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold text
    .replace(/\*([^*]+)\*/g, '<em>$1</em>'); // Italics

  return formattedResponse;
}
