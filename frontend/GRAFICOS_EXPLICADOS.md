# Dashboard de Desocupación de Mujeres en Argentina - Guía Detallada de Gráficos

Este documento explica en detalle cada gráfico que forma parte del dashboard interactivo, incluyendo qué son, qué demuestran y una descripción de lo que representa cada visualización. También la justificación de la herramienta Ploty.

---

## 🛠️ ¿Por qué Plotly? Justificación de la Herramienta

### ¿Qué es Plotly?

**Plotly** es una librería de visualización de datos interactiva y moderna, disponible en múltiples lenguajes (JavaScript, Python, R, etc.). En este proyecto usamos **Plotly.js** integrado en React para crear gráficos web interactivos.

Plotly no es solo un "dibujador de gráficos" estático: es un framework que permite crear visualizaciones dinámicas, interactivas y profesionales directamente en el navegador, sin necesidad de generar imágenes estáticas.

### Características principales de Plotly

1. **Interactividad nativa**
   - Zoom y paneo: Los usuarios pueden hacer zoom en áreas específicas
   - Hover tooltips: Al pasar el mouse, muestra valores exactos
   - Leyendas clickeables: Se pueden ocultar/mostrar series con un click
   - Descarga: Botón nativo para descargar el gráfico como PNG

2. **Múltiples tipos de gráficos**
   - Soporta 30+ tipos de gráficos: líneas, barras, dona, torta, mapas, dispersión, histogramas, cajas, etc.
   - En este proyecto usamos: líneas, barras, dona, torta, barras agrupadas y mapas coropléticos
   - Todos con la misma filosofía y coherencia visual

3. **Mapas geográficos**
   - Soporte nativo para mapas coropléticos
   - Integración con GeoJSON para datos territoriales
   - Proyecciones cartográficas automáticas
   - En nuestro caso: mapa de Argentina con colores según tasas de desocupación

4. **Integración con React**
   - Librería `react-plotly.js` es un wrapper simple que integra Plotly en componentes React
   - Actualización reactiva: Cambios en datos se reflejan automáticamente en el gráfico
   - Gestión eficiente de renderizado

5. **Personalización visual**
   - Temas y colores personalizables
   - Fuentes consistentes (Space Grotesk en nuestro caso)
   - Márgenes, tamaños y estilos ajustables por gráfico
   - Fondo transparente para integración web

### Por qué elegimos Plotly (vs. otras alternativas)

#### vs. Chart.js
- **Chart.js**: Más simple, pero muy limitado en tipos de gráficos
- **Plotly**: Mucho más versátil; soporta mapas, dona con agujero, etc.
- **Decisión**: Plotly porque necesitábamos mapas coropléticos

#### vs. D3.js
- **D3.js**: Muy poderoso pero requiere mucho código manual
- **Plotly**: Gráficos complejos con pocas líneas de código
- **Decisión**: Plotly por productividad; D3 sería overkill para nuestras necesidades

#### vs. Apache ECharts
- **ECharts**: Excelente, pero menos intuitiva y más compleja de configurar
- **Plotly**: Más accesible, documentación clara, API simple
- **Decisión**: Plotly por curva de aprendizaje y documentación

#### vs. Tableau / Power BI
- **Tableau/Power BI**: Herramientas de BI empresariales, cerradas y caras
- **Plotly**: Open source (parcialmente), integrado en el código web
- **Decisión**: Plotly porque el proyecto es académico y web-native

### Ventajas específicas de Plotly para este proyecto

1. **Mapas coropléticos nativos**
   - Otros frameworks requieren plugins o configuración extra
   - Plotly: Una línea de código con `type: 'choropleth'`

2. **Escala de colores automática**
   - Escala de azul → turquesa → naranja se genera automáticamente según rango de datos
   - Sin necesidad de normalización manual

3. **Responsividad**
   - Plotly escala automáticamente a diferentes tamaños de pantalla
   - Sin código extra: `responsive: true`

4. **Consistencia visual**
   - Todos los gráficos usan el mismo motor: fuentes, márgenes, estilos
   - Aspecto profesional uniforme

5. **Facilidad de modificación**
   - Si queremos cambiar tipo de gráfico: 1 línea de código
   - Si queremos agregar una nueva serie: 1 array más en `data`
   - Mantenibilidad alta

6. **Sin dependencias de servidores**
   - Todo se ejecuta en el navegador del cliente
   - No requiere backend para generar gráficos
   - Escalabilidad horizontal gratis

### Cómo funciona Plotly en nuestro código

```javascript
<Plot
  data={[
    {
      type: 'scatter',              // Tipo de gráfico
      mode: 'lines+markers',        // Líneas y puntos
      x: serieNacional.map(...),    // Eje X: fechas
      y: serieNacional.map(...),    // Eje Y: tasas
      line: { color: '#0f766e', width: 4 },
      marker: { color: '#ea580c', size: 8 }
    }
  ]}
  layout={{
    xaxis: { title: 'Fecha' },
    yaxis: { title: 'Tasa (%)' },
    margin: { l: 52, r: 22, t: 16, b: 48 }
  }}
  config={{ responsive: true, displayModeBar: false }}
/>
```

**Desglose:**
- **`data`**: Array de series (cada gráfico puede tener múltiples series)
- **`layout`**: Configuración de ejes, título, márgenes, temas
- **`config`**: Opciones de comportamiento (responsive, mostrar/ocultar toolbar)
- **`react-plotly.js`**: Wrapper que convierte esto en un componente React

### Alternativa que no usamos: generar imágenes estáticas

Algunos podrían preguntarse: ¿Por qué no generar PNG/SVG estáticos?
- **Razón 1**: Pérdida de interactividad
- **Razón 2**: Más difícil de mantener (cambios = regenerar todas las imágenes)
- **Razón 3**: Mayor tamaño de archivos (imágenes grandes)
- **Razón 4**: Sin zoom, sin tooltips, experiencia de usuario pobre

### Conclusión

**Plotly fue elegido porque es la mejor relación entre:**
- ✅ Capacidad técnica (soporta todos nuestros casos de uso)
- ✅ Facilidad de uso (código limpio, mantenible)
- ✅ Experiencia de usuario (interactividad, responsividad)
- ✅ Costo (open source, sin licencias)
- ✅ Integración (nativa con React)

Para un dashboard académico con múltiples tipos de gráficos y necesidad de mapas geográficos, **Plotly es la opción más práctica y profesional del mercado**.

---
## 📊 Índice de Gráficos

1. [Evolución Temporal de la Tasa Nacional](#1-evolución-temporal-de-la-tasa-nacional)
2. [Top 8 Provincias con Mayor Desocupación](#2-top-8-provincias-con-mayor-desocupación)
3. [Mapa de Desocupación por Provincia](#3-mapa-de-desocupación-por-provincia)
4. [Brecha Educativa en Jefas de Hogar](#4-brecha-educativa-en-jefas-de-hogar)
5. [Estado Laboral Real (Ponderado)](#5-estado-laboral-real-ponderado)
6. [Formalidad e Informalidad](#6-formalidad-e-informalidad)
7. [Distribución por Edades](#7-distribución-por-edades)
8. [Categoría Ocupacional de Jefas Ocupadas](#8-categoría-ocupacional-de-jefas-ocupadas)
9. [Uso del Tiempo por Género](#9-uso-del-tiempo-por-género)

---

## 1. Evolución Temporal de la Tasa Nacional

### Tipo de gráfico
**Gráfico de línea con marcadores** (Line chart with markers)

### Por qué este gráfico es oportuno
Un **gráfico de línea es ideal para mostrar datos en series temporales** porque permite observar tendencias, patrones y cambios a lo largo del tiempo de forma clara. La línea continua ayuda a visualizar la dirección general (hacia arriba, abajo o estable), mientras que los marcadores individuales destacan cada punto de dato específico. El área rellena bajo la línea facilita la lectura visual y enfatiza magnitud. Este es el gráfico estándar en análisis económico y laboral para mostrar evoluciones.

### Qué demuestra
Este gráfico visualiza la tendencia de la **tasa de desocupación de mujeres en Argentina a nivel nacional** desde 2019 hasta 2023. Muestra cómo la desocupación ha variado trimestre a trimestre durante este período.

### Descripción detallada
- **Eje X**: Fechas trimestrales (formato YYYY-MM-DD)
- **Eje Y**: Porcentaje de tasa de desocupación (%)
- **Línea verde oscuro**: Representa la tendencia continua de la tasa nacional
- **Marcadores naranjas**: Puntos de datos específicos para cada trimestre
- **Área rellena**: Sombreado bajo la línea para facilitar la lectura visual

### Información que se obtiene
- Identificar períodos de mayor y menor desocupación femenina
- Detectar cambios significativos en la tasa de desocupación
- Observar si hay patrones estacionales o tendencias a largo plazo
- Evaluar el impacto de eventos externos (como la pandemia) en el empleo femenino

### Datos utilizados
- Serie nacional completa del dataset `datos_limpios.json`
- Cubre todos los trimestres disponibles (no depende de los controles de año/trimestre)

---

## 2. Top 8 Provincias con Mayor Desocupación

### Tipo de gráfico
**Gráfico de barras horizontales** (Bar chart)
### Por qué este gráfico es oportuno
**Los gráficos de barras son excelentes para comparar valores cuantitativos entre categorías discretas**. En este caso, cada provincia es una categoría y queremos comparar sus tasas de desocupación. Las barras hacen fácil identificar cuál es mayor/menor, y el código de colores (naranja para top 3, verde para el resto) enfatiza cuáles son más críticas. El ordenamiento descendente guía el ojo hacia los mayores problemas primero.
### Qué demuestra
Este gráfico identifica y compara las **8 provincias argentinas con las tasas de desocupación femenina más altas** en el período seleccionado. Permite identificar desigualdades territoriales en el mercado laboral para mujeres.

### Descripción detallada
- **Eje X**: Nombres de provincias
- **Eje Y**: Porcentaje de tasa de desocupación (%)
- **Colores**: 
  - Naranja oscuro para las 3 provincias con mayor desocupación (más críticas)
  - Verde azulado para las provincias 4-8 (desocupación elevada pero menor que las top 3)
- **Ordenamiento**: Las provincias se ordenan de mayor a menor desocupación

### Información que se obtiene
- Identificar regiones con mayor problema de desempleo femenino
- Comparar desigualdades territoriales en oportunidades laborales para mujeres
- Reconocer provincias que requieren mayor atención de políticas públicas
- Evaluar si hay patrones regionales (norte vs. sur, litoral vs. interior)

### Datos utilizados
- Varía según el período seleccionado:
  - **Modo Año**: Promedio anual de cada provincia en el año seleccionado
  - **Modo Trimestre**: Datos del trimestre específico seleccionado

---

## 3. Mapa de Desocupación por Provincia

### Tipo de gráfico
**Mapa coroplético** (Choropleth map)

### Por qué este gráfico es oportuno
**Los mapas coropléticos son ideales para mostrar datos geográficos o distribuidos espacialmente**. Cuando los datos tienen una dimensión territorial (como provincias), un mapa permite captar patrones espaciales de forma inmediata e intuitiva. Es mucho más rápido identificar "dónde hay problema" viendo colores en un mapa que leyendo nombres de lugares. Además, permite identificar patrones regionales que no serían evidentes en una lista (ej: si todo el norte es naranja, eso salta a la vista en un mapa).

### Qué demuestra
Este gráfico muestra **la distribución geográfica de la desocupación femenina en Argentina** mediante un mapa que colorea cada provincia según su tasa de desocupación. Ofrece una visualización intuitiva de desigualdades espaciales.

### Descripción detallada
- **Mapa**: Mapa político de Argentina con todas sus provincias
- **Escala de colores**:
  - Azul claro: Tasas de desocupación más bajas
  - Turquesa/Verde azulado: Tasas intermedias
  - Naranja oscuro: Tasas de desocupación más altas
- **Interactividad**: Pasar el mouse sobre una provincia muestra su nombre y porcentaje exacto
- **Barra de color**: Escala visual que indica el rango de porcentajes representados

### Información que se obtiene
- Identificar "regiones de riesgo" o "puntos calientes" de desocupación femenina
- Observar patrones geográficos (ex: si hay mayor desocupación en el norte, sur, etc.)
- Comparar visualmente la situación entre provincias vecinas
- Evaluar si hay correlaciones con otras variables geográficas o económicas

### Datos utilizados
- Todas las provincias del dataset `datos_limpios.json`
- Utiliza GeoJSON de Argentina para la representación cartográfica
- Varía según período seleccionado (igual que el gráfico anterior)

---

## 4. Brecha Educativa en Jefas de Hogar

### Tipo de gráfico
**Gráfico de dona** (Donut chart / Pie chart with hole)

### Por qué este gráfico es oportuno
**Los gráficos de dona/torta son perfectos para mostrar composiciones o partes de un todo**. Cuando tienes una variable categórica con pocas categorías y necesitas mostrar qué porcentaje corresponde a cada una, un dona es inmediato: de un vistazo ves si algo es dominante o si está bien distribuido. El agujero central en la dona lo hace menos denso visualmente que una torta tradicional, mejorando legibilidad. Es especialmente útil para mostrar "brecha" (diferencia notable entre categorías).

### Qué demuestra
Este gráfico muestra la **distribución del nivel educativo entre las jefas de hogar mujeres** en Argentina. Permite identificar qué proporción de jefas de hogar tiene educación primaria, secundaria, superior o ninguna.

### Descripción detallada
- **Tipo**: Gráfico de torta con un agujero en el centro (dona)
- **Segmentos**: Cada segmento representa un nivel educativo diferente
- **Colores**:
  - Verde azulado: Nivel educativo 1
  - Amarillo ámbar: Nivel educativo 2
  - Naranja oscuro: Nivel educativo 3
- **Proporción**: El tamaño de cada segmento refleja el porcentaje de jefas en ese nivel educativo

### Información que se obtiene
- Identificar cuál es el nivel educativo más común entre jefas de hogar
- Detectar brecha educativa: qué porcentaje tiene educación superior vs. educación básica
- Evaluar cómo la educación puede estar relacionada con oportunidades laborales
- Reconocer poblaciones potencialmente vulnerables (bajos niveles de educación)

### Datos utilizados
- Dataset procesado: `brecha_educativa.json`
- Datos agregados de la EPH (microdatos de personas)
- Filtrado a jefas de hogar mujeres únicamente

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**, ya que presenta datos agregados del conjunto completo de la EPH.

---

## 5. Estado Laboral Real (Ponderado)

### Tipo de gráfico
**Gráfico de barras verticales** (Bar chart)

### Por qué este gráfico es oportuno
**Las barras son la mejor opción para mostrar volúmenes o cantidades entre categorías no-ordenables**. Aquí necesitamos comparar cantidad de personas en cada estado laboral. Las barras hacen inmediata la comparación visual: de un vistazo ves cuál categoría tiene más/menos gente. Es mejor que dona/torta porque no estamos mostrando "proporción del total" sino cantidades potencialmente independientes. El eje Y permite leer valores precisos.

### Qué demuestra
Este gráfico muestra la **distribución de jefas de hogar según su estado laboral actual** (ocupada, desocupada, inactiva, etc.). Utiliza ponderadores para estimar cantidades reales de población.

### Descripción detallada
- **Eje X**: Categorías de estado laboral (Ocupada, Desocupada, Inactiva, etc.)
- **Eje Y**: Cantidad estimada de jefas de hogar (en miles o unidades ponderadas)
- **Colores**:
  - Verde azulado: Ocupadas
  - Naranja oscuro: Desocupadas
  - Gris: Otras categorías (inactivas, etc.)
- **Altura de barras**: Refleja la cantidad relativa en cada categoría

### Información que se obtiene
- Entender la composición general del mercado laboral para jefas de hogar
- Identificar cuántas mujeres están desocupadas versus ocupadas
- Evaluar magnitud de población en cada estado laboral
- Detectar si hay un "problema" de desocupación versus inactividad

### Datos utilizados
- Dataset: `estado_laboral_real.json`
- Procesado de microdatos EPH con aplicación de ponderadores
- Representa la situación agregada sin variación temporal

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**; muestra el estado general agregado.

---

## 6. Formalidad e Informalidad

### Tipo de gráfico
**Gráfico de torta** (Pie chart)

### Por qué este gráfico es oportuno
**Un gráfico de torta es ideal para mostrar una dicotomía clara o proporción de dos o tres categorías**. Cuando tienes solo dos opciones mutuamente excluyentes (formal vs. informal), una torta es perfecta porque visualmente muestra de inmediato cuál es dominante. Si 80% es formal y 20% informal, el tamaño visual del segmento comunica esto al instante. Con solo dos categorías, una torta es más impactante que barras o dona.

### Qué demuestra
Este gráfico visualiza la **proporción de jefas de hogar ocupadas que trabajan en el sector formal versus informal**. Es un indicador clave de la calidad del empleo femenino.

### Descripción detallada
- **Dos segmentos principales**:
  - Verde azulado: Trabajo formal (con cobertura de seguridad social)
  - Naranja: Trabajo informal (sin protección laboral)
- **Etiquetas**: Muestran el nombre de la categoría y el porcentaje correspondiente
- **Proporciones**: El tamaño de cada segmento es proporcional al número de jefas en cada sector

### Información que se obtiene
- Identificar qué porcentaje de jefas trabaja en condiciones precarias (informalidad)
- Evaluar vulnerabilidad laboral: proporción sin acceso a derechos y beneficios laborales
- Detectar si hay una mayoría formal o informal entre jefas ocupadas
- Entender calidad del empleo más allá de solo la desocupación

### Datos utilizados
- Dataset: `informalidad.json`
- Filtrado a jefas de hogar mujeres ocupadas
- Datos agregados de la EPH

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**; muestra datos agregados.

---

## 7. Distribución por Edades

### Tipo de gráfico
**Gráfico de barras verticales** (Bar chart)

### Por qué este gráfico es oportuno
**Las barras son ideales para mostrar distribuciones en categorías ordenadas (como rangos de edad)**. Cuando los datos tienen un orden natural (18-25, 26-35, etc.), las barras colocadas secuencialmente muestran la forma de la distribución: si está concentrada en el medio, desplazada, etc. Un analista puede ver de inmediato si la distribución de edad es uniforme o si hay un pico particular. Es mejor que torta o dona porque el orden importa aquí.

### Qué demuestra
Este gráfico muestra la **distribución de edades entre las jefas de hogar mujeres**, dividida en rangos etarios. Permite identificar si jefas de hogar son más jóvenes, adultas o adultas mayores.

### Descripción detallada
- **Eje X**: Rangos de edad (ej: 18-25, 26-35, 36-45, 46-55, 56-65, 65+)
- **Eje Y**: Cantidad estimada de jefas de hogar en ese rango
- **Color**: Verde azulado uniforme en todas las barras
- **Altura**: Refleja cuántas jefas hay en cada rango etario

### Información que se obtiene
- Identificar la edad modal (rango etario con más jefas de hogar)
- Detectar si hay concentración en edades productivas o si hay jefas adultas mayores
- Evaluar cómo la edad puede estar relacionada con estado laboral y educación
- Entender estructura demográfica del grupo de jefas de hogar

### Datos utilizados
- Dataset: `edades_jefas.json`
- Datos agregados de la EPH
- Jefas de hogar mujeres

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**; presenta datos agregados.

---

## 8. Categoría Ocupacional de Jefas Ocupadas

### Tipo de gráfico
**Gráfico de barras verticales** (Bar chart)

### Por qué este gráfico es oportuno
**Las barras permiten comparar fácilmente cantidades entre múltiples categorías no-ordenadas**. Aquí hay varias ocupaciones diferentes sin jerarquía natural, y necesitamos ver cuáles tienen más jefas. Las barras hacen obvio cuál ocupa es predominante vs. minoritaria. Un código de color uniforme (naranja) enfatiza que todas son ocupaciones legítimas, sin jerarquía visual. Si los nombres son largos (como "Empleada de hogar"), las barras verticales con ángulo en el eje X son eficientes para legibilidad.

### Qué demuestra
Este gráfico muestra la **composición ocupacional de las jefas de hogar mujeres que están empleadas**, clasificadas por categoría ocupacional (trabajadora autónoma, empleada de hogar, empleada privada, empleada pública, empleadora, etc.).

### Descripción detallada
- **Eje X**: Categorías ocupacionales (Autónoma, Empleada de hogar, Empleada privada, Empleada pública, Empleadora, etc.)
- **Eje Y**: Cantidad estimada de jefas en cada categoría
- **Color**: Naranja oscuro uniforme en todas las barras
- **Distribución**: Muestra qué tipo de empleos predominan entre jefas ocupadas

### Información que se obtiene
- Identificar en qué sectores/tipos de trabajo se concentran las jefas de hogar
- Detectar si hay predominio de trabajo autónomo (más precario) versus empleo
- Evaluar acceso a empleos de calidad (empleada privada/pública) versus vulnerables
- Reconocer presencia de mujeres empresarias/empleadoras
- Identificar concentración en empleadas de hogar (trabajo doméstico)

### Datos utilizados
- Dataset: `ocupacion_jefas.json`
- Filtrado a jefas de hogar mujeres ocupadas
- Datos agregados de la EPH

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**; muestra datos agregados.

---

## 9. Uso del Tiempo por Género

### Tipo de gráfico
**Gráfico de barras agrupadas** (Grouped bar chart)

### Por qué este gráfico es oportuno
**Los gráficos de barras agrupadas son perfectos para comparar múltiples variables (series) entre categorías**. Aquí tenemos dos series (trabajo no remunerado y ocupación) y dos categorías (hombre/mujer). Agrupar las barras lado a lado permite comparación directa: ves inmediatamente si la mujer naranja es más alta que el hombre naranja, y luego compara con los verdes. Es más efectivo que barras apiladas para este tipo de comparación porque los valores base están alineados. Ideal para mostrar brechas.

### Qué demuestra
Este gráfico compara el **promedio de horas diarias dedicadas a trabajo remunerado versus trabajo no remunerado entre hombres y mujeres**. Visualiza la brecha de género en carga de trabajo doméstico y de cuidado.

### Descripción detallada
- **Eje X**: Género (Mujer, Hombre)
- **Eje Y**: Horas promedio por día
- **Dos series de barras**:
  - Naranja oscuro: Horas de trabajo no remunerado (doméstico, cuidado, etc.)
  - Verde azulado: Horas de trabajo remunerado (ocupación)
- **Agrupamiento**: Las barras se presentan lado a lado para comparación directa

### Información que se obtiene
- Identificar si mujeres dedican más horas a trabajo no remunerado que hombres
- Cuantificar la brecha de género en carga doméstica y de cuidado
- Comparar total de horas de trabajo (remunerado + no remunerado) entre géneros
- Evaluar inequidad en distribución de tareas domésticas y cuidado
- Reconocer cómo la doble jornada afecta especialmente a las mujeres

### Datos utilizados
- Dataset: `uso_del_tiempo.json`
- Datos agregados de la EPH (módulo de uso del tiempo)
- Comparación entre hombres y mujeres

### Nota importante
Este gráfico **NO depende de los controles de año/trimestre**; muestra datos comparativos agregados.

---

## 🎯 Resumen y Relaciones entre Gráficos

### Gráficos que varían según período (Año/Trimestre):
- ✅ Evolución temporal de la tasa nacional
- ✅ Top 8 provincias con mayor desocupación
- ✅ Mapa de desocupación por provincia

### Gráficos que no dependen del período seleccionado:
- ⚠️ Brecha educativa en jefas de hogar
- ⚠️ Estado laboral real (ponderado)
- ⚠️ Formalidad e informalidad
- ⚠️ Distribución por edades
- ⚠️ Categoría ocupacional de jefas ocupadas
- ⚠️ Uso del tiempo por género

### Narrativa general del dashboard
El dashboard cuenta una historia de **desigualdad laboral de género en Argentina**:
1. Los primeros 3 gráficos muestran el **contexto macroeconómico** de desocupación nacional y territorial
2. Los gráficos siguientes profundizan en **quiénes son las jefas de hogar** (edades, educación)
3. Los últimos 3 gráficos revelan **problemas estructurales**: falta de formalidad, concentración ocupacional y carga desigual del trabajo no remunerado

---

## 📌 Notas Metodológicas

- **Ponderadores**: Muchos gráficos utilizan ponderadores de la EPH para estimar cantidades reales de población
- **Filtrado de datos**: Se trabaja específicamente con jefas de hogar mujeres para análisis de vulnerabilidad
- **Fuentes**: Datos del INDEC (serie provincial de tasa de desocupación) y EPH (microdatos)
- **Período cubierto**: 2019-2023 para datos territoriales; datos agregados para perfil de jefas

---


**Versión**: 1.0  
**Última actualización**: 2026  
**Herramienta de visualización**: React + Plotly.js
