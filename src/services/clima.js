const axios = require('axios');

// Función para obtener el pronóstico del clima solo usando coordenadas
const obtenerPronostico = async (lat, lon, dias = 3) => {
    try {
        const apiKey = '391a60b09db04dfb837221412242011';
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${dias}&lang=es`;

        const respuesta = await axios.get(url);

        // Si la ciudad no se encuentra, la API devolverá un error o mensaje que se puede capturar
        if (respuesta.status !== 200) {
            console.error('Error con la respuesta de WeatherAPI:', respuesta.statusText);
            return null;
        }

        return respuesta.data;
    } catch (error) {
        console.error('Error al obtener el pronóstico del clima:', error.message);
        return null;
    }
};

// Función para buscar el lugar solamente en Chile y obtener coordenadas
async function buscarLugar(lugar) {
  try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}&countrycodes=CL`;
      const response = await axios.get(url, {
          headers: {
              'User-Agent': 'TestingDev/1.0 (miemail@dominio.com)',
          },
      });

      if (response.data.length === 0) {
          console.log('Lugar no encontrado en Chile.');
          return null;
      }

      const lugarEncontrado = response.data[0];
      return { lat: lugarEncontrado.lat, lon: lugarEncontrado.lon };
  } catch (error) {
      console.error('Error al buscar el lugar:', error);
      return null;
  }
}

// Función para obtener el pronóstico del clima usando coordenadas
const obtenerPronosticoPorCoordenadas = async (lat, lon, dias = 3) => {
  try {
      const apiKey = '391a60b09db04dfb837221412242011';
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${dias}&lang=es`;

      const respuesta = await axios.get(url);
      return respuesta.data;
  } catch (error) {
      console.error('Error al obtener el pronóstico del clima:', error.message);
      return null;
  }
};

module.exports = { obtenerPronostico, buscarLugar, obtenerPronosticoPorCoordenadas };
