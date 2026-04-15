import fs from 'fs'; 
import csv from 'csv-parser'; 
import { RUTAS } from './constants.js'; 
import { despivotarFila } from './transformer.js'; 

// 1. Creamos el diccionario de normalización arriba de todo (Las reglas del juego)
const normalizarProvincias = {
  "CABA": "Ciudad Autónoma de Buenos Aires",
  "Tierra del Fuego": "Tierra del Fuego, Antártida e Islas del Atlántico Sur"
  // Si luego notás que falta otra, la sumás a esta lista
};

async function procesarDataset() {
  console.log('⏳ Iniciando la limpieza y normalización de datos...');
  const baseDeDatosLimpia = [];

  return new Promise((resolve, reject) => {
    
    fs.createReadStream(RUTAS.entrada)
      .pipe(csv()) 
      .on('data', (fila) => {
        // A. Transformamos del formato "Ancho" al "Largo"
        const datosTransformados = despivotarFila(fila);
        
        // B. ¡ACÁ APLICAMOS LA TRADUCCIÓN!
        // Recorremos los datos que salieron y les pasamos el filtro del diccionario
        const datosConNombresOficiales = datosTransformados.map(dato => {
           return {
               fecha: dato.fecha,
               // Si existe en el diccionario lo cambia, sino lo deja igual
               provincia: normalizarProvincias[dato.provincia] || dato.provincia, 
               tasa_desocupacion: dato.tasa_desocupacion
           };
        });

        // C. Guardamos la versión perfecta y traducida
        baseDeDatosLimpia.push(...datosConNombresOficiales);
      })
      .on('end', () => {
        const jsonString = JSON.stringify(baseDeDatosLimpia, null, 2);
        fs.writeFileSync(RUTAS.salida, jsonString);
        
        console.log(`✅ ¡Éxito total! Datos traducidos y guardados en: ${RUTAS.salida}`);
        resolve(); 
      })
      .on('error', (error) => {
        console.error('❌ Hubo un error al procesar el archivo:', error);
        reject(error); 
      });
  });
}

procesarDataset();