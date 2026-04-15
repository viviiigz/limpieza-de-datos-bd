

# Proyecto: Desocupación de Mujeres en Argentina

Este proyecto analiza datos de desocupación de mujeres en Argentina usando información del INDEC y la EPH. El objetivo es limpiar, transformar y procesar los datos para obtener estadísticas útiles y visualizarlas.

## Estructura de carpetas

- **data/raw/**: Archivos originales descargados, sin modificar. Ejemplo: `eph_personas.txt`, `pshhogurb_mujer_tasadesocup.csv`.
- **data/processed/**: Archivos ya procesados y limpios, listos para analizar o graficar. Ejemplo: `datos_limpios.json`, `brecha_educativa.json`.
- **src/**: Código fuente en JavaScript para limpiar, transformar y procesar los datos.
- **frontend/**: (Si existe) Archivos para visualización o uso web.

## Explicación de los archivos principales (en lenguaje simple)

### constants.js
Guarda rutas de archivos y un diccionario que traduce los nombres raros de provincias del INDEC a nombres más entendibles. Si cambiás el nombre de un archivo, solo lo cambiás acá y listo.

### transformer.js
Tiene una función que “despivotar” los datos, o sea, los pasa de formato ancho (muchas columnas, una por provincia) a formato largo (una fila por provincia y fecha). Así es mucho más fácil trabajar y graficar los datos.

### index.js
Es el script principal para limpiar y normalizar el dataset. Lee el CSV crudo, lo transforma usando transformer.js, normaliza nombres de provincias y guarda el resultado en `datos_limpios.json`. Deja los datos listos para analizar o visualizar.

### limpiar_eph.js
Procesa el archivo EPH para calcular estadísticas sobre educación e informalidad de las jefas de hogar. Filtra solo mujeres jefas y cuenta cuántas hay en cada grupo. Así podés saber, por ejemplo, cuántas jefas de hogar tienen educación primaria, secundaria, etc.

### procesar_reales.js
Procesa el archivo EPH para calcular estadísticas reales de estado laboral, edad y ocupación de las jefas de hogar. Filtra solo mujeres jefas y cuenta cuántas hay en cada grupo. Así obtenés datos concretos sobre la situación laboral y social de las jefas de hogar.

---

## ¿Cómo funciona todo?

1. En raw se encuentran los datos crudos.
2. Con los scripts de src limpiamos y procesamos los datos.
3. Los resultados aparecen en processed listos para analizar o graficar.

