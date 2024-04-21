const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
});

// Leer plantillas HTML de antemano
const adminTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'adminEmailTemplate.html'), 'utf8');
const userTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'userEmailTemplate.html'), 'utf8');

app.post('/send-email', async(req, res) => {
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

    // Envío del correo al administrador
    transporter.sendMail(adminMailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({
                status: "error", 
                message: "Error al enviar el correo al administrador",
                error: error.message
            });
        }
        // Envío del correo de confirmación al usuario
        transporter.sendMail(userMailOptions, (confirmError, confirmInfo) => {
            if (confirmError) {
                return res.status(500).send({
                    status: "error", 
                    message: "Error al enviar el correo de confirmación al usuario",
                    error: confirmError.message
                });
            }
            res.status(200).send({
                status: "success",
                message: "Correo enviado correctamente y confirmación enviada al usuario."
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
});
