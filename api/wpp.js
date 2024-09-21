const twilio = require('twilio');

// Configuración de Twilio

const accountSid = 'AC7cf64306366f0817700af0d61fa356e9'; // SID de tu cuenta Twilio

const authToken = 'c0940ab8997be59b85b6c049de059d9c'; // Reemplaza con tu Auth Token

const client = twilio(accountSid, authToken);

function sendWhatsAppMessage(to, body) {
    return client.messages
        .create({
            body: body,
            from: 'whatsapp:+14155238886', // El número de Twilio para WhatsApp
            to: to
        })
        .then(message => {
            console.log(`Mensaje enviado con SID: ${message.sid}`);
            return message;
        })
        .catch(error => {
            console.error('Error al enviar el mensaje:', error);
            throw error;
        });
}

module.exports = { sendWhatsAppMessage };
