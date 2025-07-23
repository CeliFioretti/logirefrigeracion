const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const enviarCorreo = async ({ para, asunto, mensaje, html }) => {
    const mailOptions = {
        from: `"LogiRefrigeración" <${process.env.EMAIL_USER}>`,
        to: para,
        subject: asunto,
        text: mensaje, 
        html: html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo enviado a:', para);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error; 
    }
};

module.exports = { enviarCorreo };
