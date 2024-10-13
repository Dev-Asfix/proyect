const twilio = require('twilio');

// Configuración de Twilio

const accountSid = 'AC7cf64306366f0817700af0d61fa356e9'; // SID de tu cuenta Twilio

const authToken = '7682ad3f1114e718e4972f7ea7e7f2b2'; // Reemplaza con tu Auth Token

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
