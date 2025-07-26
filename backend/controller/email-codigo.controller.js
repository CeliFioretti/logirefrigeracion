const { enviarCorreo } = require('../services/emailService');

const sendCodeByEmail = async (req, res) => {
    const { para, codigo, rol } = req.body;

    if (!para || !codigo || !rol) {
        return res.status(400).json({ message: 'Se requiere la dirección de correo, el código y el rol.' });
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(para)) {
        return res.status(400).json({ message: 'El formato del correo electrónico es inválido.' });
    }

    const subject = `Tu código de registro para LogiRefrigeración como ${rol}`;

    // Uso de HTML para el mensaje
    const htmlMessage = `
        <p>Hola,</p>
        <p>Aquí tienes tu código de registro para la aplicación LogiRefrigeración como <strong>${rol}</strong>:</p>
        <div style="
            background-color: #f2f2f2; 
            border: 1px solid #ddd;
            padding: 15px; 
            margin: 20px auto; 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold;
            color: #333;
            letter-spacing: 2px; 
            max-width: 400px;
            border-radius: 8px;
        ">
            ${codigo}
        </div>
        <p>Por favor, úsalo para completar tu registro. Ten en cuenta que este código tiene una validez de <strong>48 horas</strong>.</p>
        <p>Saludos,<br/>El equipo de LogiRefrigeración</p>
        <p style="font-size: 10px; color: #888;">Este correo es generado automáticamente, por favor no lo respondas.</p>
    `;

    try {
        await enviarCorreo({ para, asunto: subject, html: htmlMessage }); 
        res.status(200).json({ message: 'Correo enviado exitosamente.' });
    } catch (error) {
        console.error(`Error al enviar el correo a ${para}:`, error);
        res.status(500).json({ message: 'Error al enviar el correo. Por favor, inténtelo de nuevo más tarde.' });
    }
};

module.exports = { sendCodeByEmail };
