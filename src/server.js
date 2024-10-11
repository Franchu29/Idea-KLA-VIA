//git checkout -b nombre_de_rama
//git add .
//git commit -m "Mensaje"
//git push origin nombre_de_rama

const express = require('express');
const userRoutes = require('./routes/user.routes.js');
const eventRoutes = require('./routes/eventos.routes.js');
const cronometroRoutes = require('./routes/cronometro.routes.js');
const path = require('path');

const app = express();

// Configuración para las vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'views', 'styles')));
app.use(express.static("public"));

// Middleware para decodificar datos de formularios
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use("", userRoutes);
app.use("/events", eventRoutes);
app.use("/cronometro", cronometroRoutes);


app.listen(3000, () => {
    console.log('Servidor funcionando en el puerto', 3000);
});
