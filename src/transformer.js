
import { MAPA_PROVINCIAS } from './constants.js';

/**
 * Función que despivota una fila cruda del CSV.
 * Pasa de Formato Ancho (24 columnas) a Formato Largo (1 columna por provincia).
 */
export function despivotarFila(filaCruda) {
  const objetosLimpios = [];
  
  // Guardamos la fecha de ese trimestre (Ej: "2019-10-01")
  const fechaTrimestre = filaCruda['indice_tiempo'];

  // Recorremos TODAS las propiedades (columnas) que tiene esta fila
  for (const columna in filaCruda) {
    
    // Preguntamos: ¿Esta columna existe en nuestro diccionario de provincias?
    if (MAPA_PROVINCIAS[columna]) {
      
      // Transformamos el texto del CSV a un número decimal real
      const valorDecimal = parseFloat(filaCruda[columna]);
      
      // Creamos nuestro objeto limpio y lo agregamos a la lista
      objetosLimpios.push({
        fecha: fechaTrimestre,
        provincia: MAPA_PROVINCIAS[columna],
        // Operador ternario: si el valor es un NaN (no es un número), le pasamos null. Si no, pasamos el número.
        tasa_desocupacion: isNaN(valorDecimal) ? null : valorDecimal 
      });
    }
  }

  return objetosLimpios; // Devolvemos la lista de objetos listos
}