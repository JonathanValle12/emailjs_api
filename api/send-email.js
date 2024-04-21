const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Configuración del transporte SMTP
    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.USER_EMAIL, // Debe estar configurado en las variables de entorno de Vercel
            pass: process.env.USER_PASS   // Debe estar configurado en las variables de entorno de Vercel
        }
    });

    // Lectura de plantillas HTML
    const adminTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'adminEmailTemplate.html'), 'utf8');
    const userTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'userEmailTemplate.html'), 'utf8');

    const { email, nombre, message } = req.body.templateParams;

    // Reemplazo de variables en las plantillas
    const adminHtml = adminTemplate.replace(/{{nombre}}/g, nombre).replace(/{{email}}/g, email).replace(/{{message}}/g, message);
    const userHtml = userTemplate.replace(/{{nombre}}/g, nombre);

    let adminMailOptions = {
        from: process.env.USER_EMAIL,
        to: process.env.USER_EMAIL,
        subject: `Nuevo mensaje de ${nombre}`,
        html: adminHtml
    };

    let userMailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Confirmación de recepción de mensaje',
        html: userHtml
    };

    try {
        // Envío del correo al administrador
        await transporter.sendMail(adminMailOptions);
        // Envío del correo de confirmación al usuario
        await transporter.sendMail(userMailOptions);

        res.status(200).send({
            status: "success",
            message: "Correo enviado correctamente y confirmación enviada al usuario."
        });
    } catch (error) {
        res.status(500).send({
            status: "error", 
            message: "Error al enviar el correo",
            error: error.message
        });
    }
};
