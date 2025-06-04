const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarCorreo = async ({ para, asunto, mensaje }) => {
  try {
    await transporter.sendMail({
      from: `"LogiRefrigeración" <${process.env.EMAIL_USER}>`,
      to: para,
      subject: asunto,
      text: mensaje
    });
    console.log(`📧 Correo enviado a ${para}`);
  } catch (err) {
    console.error(`❌ Error al enviar correo:`, err);
  }
};

module.exports = { enviarCorreo };
