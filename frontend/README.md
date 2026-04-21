# Frontend - Dashboard de Desocupacion (React + Plotly)

Este README explica solo el funcionamiento del frontend y, en particular, como ver el cambio de graficos por trimestre.

## 1. Requisitos

- Node.js 18 o superior
- npm

## 2. Como levantar el frontend

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

Luego abrir la URL que muestra Vite (normalmente `http://localhost:5173`).

## 3. Como cambiar los graficos por trimestre

En la parte superior del dashboard hay un selector llamado **"Trimestre de analisis territorial"**.

- Al elegir una fecha (por ejemplo `2019-10-01`), se actualizan los graficos que dependen de ese corte temporal.
- Si elegis otra fecha (por ejemplo `2023-04-01`), esos graficos se recalculan automaticamente con los datos de ese trimestre.

### Graficos que cambian con el trimestre

- KPIs superiores (tasa nacional del trimestre, provincia con mayor tasa, media provincial)
- Top 8 provincias con mayor desocupacion
- Mapa de desocupacion por provincia

### Graficos que no dependen del trimestre seleccionado

- Evolucion temporal de la tasa nacional (usa toda la serie)
- Brecha educativa
- Estado laboral real
- Otras visualizaciones agregadas con datos agregados

## 4. Logica del frontend (resumen)

- Fuente principal para el mapa y ranking: `src/data/datos_limpios.json`
- Estado React clave: `fechaSeleccionada`
- Filtro principal:
  - Se toman registros donde `fecha === fechaSeleccionada`
  - Se excluye `Nacional` para el analisis provincial
- Para el mapa y barras, `tasa_desocupacion` se multiplica por `100` para mostrar porcentaje.

## 5. Nota importante sobre valores 0,00%

Si una provincia muestra `0,00%`, puede ser correcto para ese trimestre.

Ejemplo real:

- Formosa en `2019-10-01`: `0.031` => `3.10%`
- Formosa en `2023-04-01`: `0` => `0.00%`

Por eso, siempre validar el valor contra el trimestre seleccionado.

## 6. Scripts utiles

```bash
npm run dev      # entorno de desarrollo
npm run build    # build de produccion
npm run preview  # previsualizar build
```
