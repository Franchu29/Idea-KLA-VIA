const nodemailer = require('nodemailer');

//Configuración del servicio de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Función para enviar el correo de recuperación
const enviarCorreoRecuperacion = async (correoDestino, tokenRecuperacion) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correoDestino,
        subject: 'Recuperación de Contraseña',
        html: `<p>Para recuperar tu contraseña, haz clic en el siguiente enlace:</p>
               <a href="http://localhost:3000/recuperar/${tokenRecuperacion}">Recuperar Contraseña</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de recuperación enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

const enviarCorreoActualizacionRol = async (correoDestino, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correoDestino,
        subject: 'Actualización de Rol',
        html: `<p>Para actualizar tu rol en el sistema, haz clic en el siguiente enlace:</p>
               <a href="http://localhost:3000/actualizar_rol/${token}">Actualizar Rol</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de actualización de rol enviado');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

// Exporta la función o funciones que necesitas
module.exports = { enviarCorreoRecuperacion, enviarCorreoActualizacionRol };