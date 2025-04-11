const express = require('express');
const userRoutes = require('./routes/user.routes.js');
const asignaturaRoutes = require('./routes/asignatura.routes.js');
const colegioRoutes = require('./routes/colegio.routes.js');
const cursoRoutes = require('./routes/curso.routes.js');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Configuración para las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'imagenes')));
app.use('/styles', express.static(path.join(__dirname, 'views', 'styles')));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'imagenes')));
app.use(express.static("imagenes"))
// Middleware para decodificar datos de formularios
app.use(express.urlencoded({ extended: false }));

// Rutas 
app.use("", userRoutes);
app.use("/asignatura", asignaturaRoutes);
app.use("/colegio", colegioRoutes);
app.use("/curso", cursoRoutes);

app.listen(3000, () => {
    console.log('Servidor funcionando en el puerto', 3000);
});
