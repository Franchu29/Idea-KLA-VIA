const express = require('express');
const userRoutes = require('./routes/user.routes.js');
const eventRoutes = require('./routes/eventos.routes.js');
const cronometroRoutes = require('./routes/cronometro.routes.js');
const clubRoutes = require('./routes/club.routes.js');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// Configuración para las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'views', 'styles')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());

// Middleware para decodificar datos de formularios
app.use(express.urlencoded({ extended: false }));

// Rutas 
app.use("", userRoutes);
app.use("/events", eventRoutes);
app.use("/cronometro", cronometroRoutes);
app.use("/club", clubRoutes);

app.listen(3000, () => {
    console.log('Servidor funcionando en el puerto', 3000);
});
