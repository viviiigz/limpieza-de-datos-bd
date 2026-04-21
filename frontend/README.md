# Frontend - Dashboard de Desocupacion (React + Plotly)

Este README explica solo el funcionamiento del frontend y, en particular, como cambiar la vista temporal entre anio y trimestre.

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

## 3. Como cambiar los graficos por anio o trimestre

En la parte superior del dashboard hay un bloque de controles con dos opciones:

- **Anio** (modo por defecto)
- **Trimestre**

### Modo Anio

- Se selecciona un anio (`2019`, `2020`, `2021`, `2022`, `2023`).
- Los graficos territoriales se calculan con **promedio anual** por provincia (promedio de los trimestres disponibles de ese anio).

### Modo Trimestre

- Se selecciona una fecha trimestral (por ejemplo `2019-10-01`).
- Los graficos territoriales usan solo ese trimestre exacto.

### Graficos que cambian con el periodo seleccionado

- KPIs superiores (tasa nacional del periodo, provincia con mayor tasa, media provincial)
- Top 8 provincias con mayor desocupacion
- Mapa de desocupacion por provincia

### Graficos que no dependen del trimestre seleccionado

- Evolucion temporal de la tasa nacional (usa toda la serie)
- Brecha educativa
- Estado laboral real
- Otras visualizaciones agregadas con datos agregados

## 4. Logica del frontend (resumen)

- Fuente principal para el mapa y ranking: `src/data/datos_limpios.json`
- Estados React clave: `modoTemporal`, `anioSeleccionado`, `fechaSeleccionada`
- Filtro principal segun modo:
  - Modo anio: registros del anio seleccionado y promedio por provincia
  - Modo trimestre: registros donde `fecha === fechaSeleccionada`
  - En ambos casos se excluye `Nacional` para el analisis provincial
- Para el mapa y barras, `tasa_desocupacion` se multiplica por `100` para mostrar porcentaje.

## 5. Nota importante sobre valores 0,00%

Si una provincia muestra `0,00%`, puede ser correcto para ese periodo.

Ejemplo real:

- Formosa en `2019-10-01`: `0.031` => `3.10%`
- Formosa en `2023-04-01`: `0` => `0.00%`

Por eso, siempre validar el valor contra el anio o trimestre seleccionado.

## 6. Scripts utiles

```bash
npm run dev      # entorno de desarrollo
npm run build    # build de produccion
npm run preview  # previsualizar build
```
