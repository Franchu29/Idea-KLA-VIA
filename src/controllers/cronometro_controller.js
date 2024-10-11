const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

exports.mostrarCronometro = (req, res) => {
    const { id } = req.params;
    res.render('cronometro', { id });
};

exports.registrarCorredor = async (req, res) => {
    const { eventoId, numeroCorredor, tiempo } = req.body;
    console.log('Datos recibidos:', req.body);

    try {
        // Encuentra la inscripción correspondiente al número del corredor
        const inscripcion = await prisma.inscripcion.findFirst({
            where: {
                numeroCorredor: parseInt(numeroCorredor), // Asegúrate de que el campo 'numeroCorredor' existe en Inscripcion
                eventoId: parseInt(eventoId), // Asegúrate de que corresponde al evento actual
            },
        });

        if (!inscripcion) {
            return res.status(404).json({ error: 'Corredor no encontrado en la inscripción' });
        }

        // Obtener el id del usuario desde la inscripción
        const usuarioId = inscripcion.usuarioId;

        // Guardar el resultado en la tabla Resultados
        const resultado = await prisma.resultados.create({
            data: {
                usuarioId: usuarioId,
                eventoId: parseInt(eventoId),
                tiempo: parseInt(tiempo), // Convertir el tiempo a un número entero
                lugarGeneral: 0, // Inicialmente puedes establecerlo en 0
                lugarCategoria: 0, // Inicialmente puedes establecerlo en 0
            },
        });

        // Redirigir a la vista "cronometro" (ajusta la ruta según sea necesario)
        res.redirect('/cronometro/cronometro'); // Cambia esto a la ruta correcta de tu vista de cronómetro
    } catch (error) {
        console.error('Error al registrar el corredor:', error);
        return res.status(500).json({ error: 'Error al registrar el corredor' });
    }
};

exports.calcularResultados = async (req, res) => {
    const { eventoId } = req.params;

    try {
        const resultados5k = await obtenerResultados5k(eventoId);
        const resultados10k = await obtenerResultados10k(eventoId);

        // Crear la subcarpeta para el evento
        const dirPath = path.join(__dirname, '../uploads/evento_' + eventoId);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Generar el PDF para resultados de 5km
        const doc5k = new PDFDocument();
        const filePath5k = path.join(dirPath, `resultados_5k_evento_${eventoId}.pdf`);
        doc5k.pipe(fs.createWriteStream(filePath5k));

        doc5k.fontSize(25).text(`Resultados del Evento ${eventoId} - 5 km`, { align: 'center' });
        doc5k.moveDown();

        // Calcular y mostrar los puestos generales
        const puestosGenerales5k = resultados5k.map((resultado, index) => ({
            puestoGeneral: index + 1,
            nombreCorredor: resultado.usuario.nombre,
            tiempo: resultado.tiempo,
            categoria: resultado.usuario.inscripciones[0].categoria.nombre,
        }));

        // Mostrar resultados generales
        doc5k.fontSize(18).text('Resultados Generales:', { underline: true });
        puestosGenerales5k.forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
            doc5k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${tiempo} segundos`);
        });

        // Agrupar por categoría y ordenar
        const resultadosPorCategoria5k = {};
        puestosGenerales5k.forEach(({ puestoGeneral, nombreCorredor, tiempo, categoria }) => {
            if (!resultadosPorCategoria5k[categoria]) {
                resultadosPorCategoria5k[categoria] = [];
            }
            resultadosPorCategoria5k[categoria].push({ puestoGeneral, nombreCorredor, tiempo });
        });

        // Ordenar los resultados por categoría y tiempo
        Object.keys(resultadosPorCategoria5k).forEach(categoria => {
            resultadosPorCategoria5k[categoria].sort((a, b) => a.tiempo - b.tiempo);
            doc5k.moveDown();
            doc5k.fontSize(18).text(`Categoría: ${categoria}`, { underline: true });
            resultadosPorCategoria5k[categoria].forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
                doc5k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${tiempo} segundos`);
            });
        });

        doc5k.end();
        console.log('PDF de 5 km generado correctamente');

        // Generar el PDF para resultados de 10km
        const doc10k = new PDFDocument();
        const filePath10k = path.join(dirPath, `resultados_10k_evento_${eventoId}.pdf`);
        doc10k.pipe(fs.createWriteStream(filePath10k));

        doc10k.fontSize(25).text(`Resultados del Evento ${eventoId} - 10 km`, { align: 'center' });
        doc10k.moveDown();

        // Calcular y mostrar los puestos generales
        const puestosGenerales10k = resultados10k.map((resultado, index) => ({
            puestoGeneral: index + 1,
            nombreCorredor: resultado.usuario.nombre,
            tiempo: resultado.tiempo,
            categoria: resultado.usuario.inscripciones[0].categoria.nombre,
        }));

        // Mostrar resultados generales
        doc10k.fontSize(18).text('Resultados Generales:', { underline: true });
        puestosGenerales10k.forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
            doc10k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${tiempo} segundos`);
        });

        // Agrupar por categoría y ordenar
        const resultadosPorCategoria10k = {};
        puestosGenerales10k.forEach(({ puestoGeneral, nombreCorredor, tiempo, categoria }) => {
            if (!resultadosPorCategoria10k[categoria]) {
                resultadosPorCategoria10k[categoria] = [];
            }
            resultadosPorCategoria10k[categoria].push({ puestoGeneral, nombreCorredor, tiempo });
        });

        // Ordenar los resultados por categoría y tiempo
        Object.keys(resultadosPorCategoria10k).forEach(categoria => {
            resultadosPorCategoria10k[categoria].sort((a, b) => a.tiempo - b.tiempo);
            doc10k.moveDown();
            doc10k.fontSize(18).text(`Categoría: ${categoria}`, { underline: true });
            resultadosPorCategoria10k[categoria].forEach(({ puestoGeneral, nombreCorredor, tiempo }) => {
                doc10k.fontSize(12).text(`Posición: ${puestoGeneral} - Corredor: ${nombreCorredor} - Tiempo: ${tiempo} segundos`);
            });
        });

        doc10k.end();
        console.log('PDF de 10 km generado correctamente');

        // Enviar los archivos PDF como respuesta
        res.zip([filePath5k, filePath10k], (err) => {
            if (err) {
                console.error('Error al enviar los archivos:', err);
                return res.status(500).send('Error al generar los PDFs');
            }

            // Eliminar los archivos después de ser enviados
            fs.unlinkSync(filePath5k);
            fs.unlinkSync(filePath10k);
        });
    } catch (error) {
        console.error('Error al calcular resultados:', error);
        res.status(500).send('Error al calcular resultados');
    }
};

  async function obtenerResultados5k(eventoId) {
    try {
        const resultados5k = await prisma.resultados.findMany({
            where: {
                eventoId: Number(eventoId), // Asegúrate de que el eventoId sea un número
                usuario: {
                    inscripciones: {
                        some: {
                            distanciaId: 1 // Suponiendo que 1 es el ID para 5 km
                        }
                    }
                }
            },
            orderBy: {
                tiempo: 'asc'
            },
            select: {
                usuarioId: true,
                tiempo: true,
                lugarGeneral: true,
                lugarCategoria: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        inscripciones: {
                            where: {
                                eventoId: Number(eventoId)
                            },
                            select: {
                                categoria: {
                                    select: {
                                        nombre: true
                                    }
                                },
                                distancia: {
                                    select: {
                                        nombre: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return resultados5k; // Retornar los resultados obtenidos
    } catch (error) {
        console.error('Error al obtener resultados de 5km:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
}

async function obtenerResultados10k(eventoId) {
    try {
        const resultados10k = await prisma.resultados.findMany({
            where: {
                eventoId: Number(eventoId), // Asegúrate de que el eventoId sea un número
                usuario: {
                    inscripciones: {
                        some: {
                            distanciaId: 2 // Suponiendo que 2 es el ID para 10 km
                        }
                    }
                }
            },
            orderBy: {
                tiempo: 'asc'
            },
            select: {
                usuarioId: true,
                tiempo: true,
                lugarGeneral: true,
                lugarCategoria: true,
                usuario: {
                    select: {
                        nombre: true,
                        apellido: true,
                        inscripciones: {
                            where: {
                                eventoId: Number(eventoId)
                            },
                            select: {
                                categoria: {
                                    select: {
                                        nombre: true
                                    }
                                },
                                distancia: {
                                    select: {
                                        nombre: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return resultados10k; // Retornar los resultados obtenidos
    } catch (error) {
        console.error('Error al obtener resultados de 10km:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }
}