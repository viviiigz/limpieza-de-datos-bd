import { useMemo, useState } from "react";
import Plot from "react-plotly.js";

import argentinaGeo from "./argentina.json";
import datosLimpios from "./data/datos_limpios.json";
import brechaEducativa from "./data/brecha_educativa.json";
import informalidad from "./data/informalidad.json";
import estadoLaboral from "./data/estado_laboral_real.json";
import edadesJefas from "./data/edades_jefas.json";
import ocupacionJefas from "./data/ocupacion_jefas.json";
import usoDelTiempo from "./data/uso_del_tiempo.json";

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return "N/D";
  return `${(value * 100).toFixed(2)}%`;
}

function normalizeEstadoData(items) {
  return items.map((item) => ({
    condicion: item.condicion,
    cantidad: item.cantidad_real ?? item.cantidad ?? 0,
  }));
}

function App() {
  const fechas = useMemo(() => {
    const allDates = new Set(datosLimpios.map((d) => d.fecha));
    return Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
  }, []);

  const anios = useMemo(() => {
    const years = new Set(fechas.map((fecha) => fecha.slice(0, 4)));
    return Array.from(years).sort((a, b) => Number(a) - Number(b));
  }, [fechas]);

  const [modoTemporal, setModoTemporal] = useState("anio");
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    anios[anios.length - 1],
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    fechas[fechas.length - 1],
  );

  const serieNacional = useMemo(() => {
    return datosLimpios
      .filter((d) => d.provincia === "Nacional")
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, []);

  const provinciasPeriodo = useMemo(() => {
    if (modoTemporal === "trimestre") {
      return datosLimpios
        .filter(
          (d) => d.fecha === fechaSeleccionada && d.provincia !== "Nacional",
        )
        .sort(
          (a, b) => (b.tasa_desocupacion ?? 0) - (a.tasa_desocupacion ?? 0),
        );
    }

    const porProvincia = new Map();

    datosLimpios
      .filter(
        (d) =>
          d.provincia !== "Nacional" && d.fecha.startsWith(anioSeleccionado),
      )
      .forEach((d) => {
        const tasa = Number(d.tasa_desocupacion);
        if (Number.isNaN(tasa)) return;

        const actual = porProvincia.get(d.provincia) ?? {
          suma: 0,
          cantidad: 0,
        };
        porProvincia.set(d.provincia, {
          suma: actual.suma + tasa,
          cantidad: actual.cantidad + 1,
        });
      });

    return Array.from(porProvincia.entries())
      .map(([provincia, agg]) => ({
        provincia,
        tasa_desocupacion: agg.cantidad ? agg.suma / agg.cantidad : null,
      }))
      .sort((a, b) => (b.tasa_desocupacion ?? 0) - (a.tasa_desocupacion ?? 0));
  }, [anioSeleccionado, fechaSeleccionada, modoTemporal]);

  const tasaNacionalPeriodo = useMemo(() => {
    if (modoTemporal === "trimestre") {
      return (
        serieNacional.find((d) => d.fecha === fechaSeleccionada)
          ?.tasa_desocupacion ?? null
      );
    }

    const valoresAnio = serieNacional
      .filter((d) => d.fecha.startsWith(anioSeleccionado))
      .map((d) => Number(d.tasa_desocupacion))
      .filter((v) => !Number.isNaN(v));

    if (!valoresAnio.length) return null;
    return (
      valoresAnio.reduce((acc, value) => acc + value, 0) / valoresAnio.length
    );
  }, [anioSeleccionado, fechaSeleccionada, modoTemporal, serieNacional]);

  const etiquetaPeriodo =
    modoTemporal === "trimestre" ? fechaSeleccionada : anioSeleccionado;

  const topProvincias = useMemo(
    () => provinciasPeriodo.slice(0, 8),
    [provinciasPeriodo],
  );

  const mediaFecha = useMemo(() => {
    const valid = provinciasPeriodo
      .map((d) => d.tasa_desocupacion)
      .filter((v) => v != null && !Number.isNaN(v));

    if (!valid.length) return null;
    return valid.reduce((acc, value) => acc + value, 0) / valid.length;
  }, [provinciasPeriodo]);

  const maxFecha = useMemo(() => {
    if (!provinciasPeriodo.length) return null;
    return provinciasPeriodo[0];
  }, [provinciasPeriodo]);

  const estadoData = useMemo(() => normalizeEstadoData(estadoLaboral), []);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Trabajo Practico 1 · Big Data II</p>
        <h1>Desocupacion y Condiciones Laborales de Mujeres en Argentina</h1>
        <p className="lead">
          Dashboard interactivo construido con React + Plotly para analizar
          desocupacion femenina y condiciones de las jefas de hogar a partir de
          datos del INDEC y la EPH.
        </p>
        <div className="meta-grid">
          <article>
            <h3>Fuente principal</h3>
            <p>
              INDEC - EPH (microdatos) y serie provincial de tasa de
              desocupacion femenina.
            </p>
          </article>
          <article>
            <h3>Herramienta de visualizacion</h3>
            <p>
              Plotly.js integrado en React para interactividad, comparacion y
              lectura exploratoria.
            </p>
          </article>
          <article>
            <h3>Objetivo analitico</h3>
            <p>
              Detectar desigualdades territoriales, educativas y ocupacionales
              en mujeres jefas de hogar.
            </p>
          </article>
        </div>
      </header>

      <section className="controls-panel">
        <label>Escala temporal de analisis territorial</label>
        <div
          className="time-mode-row"
          role="radiogroup"
          aria-label="Escala temporal"
        >
          <label>
            <input
              type="radio"
              name="modoTemporal"
              value="anio"
              checked={modoTemporal === "anio"}
              onChange={(e) => setModoTemporal(e.target.value)}
            />
            Año
          </label>
          <label>
            <input
              type="radio"
              name="modoTemporal"
              value="trimestre"
              checked={modoTemporal === "trimestre"}
              onChange={(e) => setModoTemporal(e.target.value)}
            />
            Trimestre
          </label>
        </div>

        {modoTemporal === "anio" ? (
          <>
            <label htmlFor="anio">Año de analisis territorial</label>
            <select
              id="anio"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(e.target.value)}
            >
              {anios.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label htmlFor="fecha">Trimestre de analisis territorial</label>
            <select
              id="fecha"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            >
              {fechas.map((fecha) => (
                <option key={fecha} value={fecha}>
                  {fecha}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="kpi-row">
          <article>
            <span>Tasa nacional ({etiquetaPeriodo})</span>
            <strong>{formatPercent(tasaNacionalPeriodo)}</strong>
          </article>
          <article>
            <span>Provincia con mayor tasa ({etiquetaPeriodo})</span>
            <strong>
              {maxFecha
                ? `${maxFecha.provincia} · ${formatPercent(maxFecha.tasa_desocupacion)}`
                : "N/D"}
            </strong>
          </article>
          <article>
            <span>Media provincial ({etiquetaPeriodo})</span>
            <strong>{formatPercent(mediaFecha)}</strong>
          </article>
        </div>
      </section>

      <section className="charts-grid">
        <article className="chart-card wide">
          <h2>Evolucion temporal de la tasa nacional</h2>
          <Plot
            data={[
              {
                type: "scatter",
                mode: "lines+markers",
                x: serieNacional.map((d) => d.fecha),
                y: serieNacional.map((d) => (d.tasa_desocupacion ?? 0) * 100),
                line: { color: "#0f766e", width: 4 },
                marker: { color: "#ea580c", size: 8 },
                fill: "tozeroy",
                fillcolor: "rgba(15,118,110,0.1)",
                name: "Nacional",
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 52, r: 22, t: 16, b: 48 },
              xaxis: { title: "Fecha" },
              yaxis: { title: "Tasa (%)" },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "380px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Top 8 provincias con mayor desocupacion ({etiquetaPeriodo})</h2>
          <Plot
            data={[
              {
                type: "bar",
                x: topProvincias.map((d) => d.provincia),
                y: topProvincias.map((d) => (d.tasa_desocupacion ?? 0) * 100),
                marker: {
                  color: topProvincias.map((_, i) =>
                    i < 3 ? "#ea580c" : "#0f766e",
                  ),
                },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 50, r: 16, t: 16, b: 92 },
              yaxis: { title: "Tasa (%)" },
              xaxis: { tickangle: -30 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "370px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Mapa de desocupacion por provincia</h2>
          <Plot
            data={[
              {
                type: "choropleth",
                geojson: argentinaGeo,
                featureidkey: "properties.nombre",
                locations: provinciasPeriodo.map((d) =>
                  (d.provincia ?? "").trim(),
                ),
                z: provinciasPeriodo.map((d) => {
                  const tasa = Number(d.tasa_desocupacion);
                  return Number.isNaN(tasa) ? null : tasa * 100;
                }),
                customdata: provinciasPeriodo.map((d) => {
                  const tasa = Number(d.tasa_desocupacion);
                  return Number.isNaN(tasa)
                    ? "Sin dato"
                    : `${(tasa * 100).toFixed(2)}%`;
                }),
                hovertemplate:
                  "%{location}<br>Tasa: %{customdata}<extra></extra>",
                colorscale: [
                  [0, "#dbeafe"],
                  [0.5, "#14b8a6"],
                  [1, "#ea580c"],
                ],
                marker: { line: { color: "#f8fafc", width: 0.6 } },
                colorbar: { title: "Tasa (%)" },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 0, r: 0, t: 8, b: 0 },
              geo: {
                fitbounds: "locations",
                bgcolor: "rgba(0,0,0,0)",
                showframe: false,
                showcoastlines: false,
                projection: { type: "mercator" },
              },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "370px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Brecha educativa en jefas de hogar</h2>
          <Plot
            data={[
              {
                type: "pie",
                labels: Object.keys(brechaEducativa),
                values: Object.values(brechaEducativa),
                hole: 0.45,
                marker: { colors: ["#0f766e", "#f59e0b", "#ea580c"] },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 8, r: 8, t: 8, b: 8 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Estado laboral real (ponderado)</h2>
          <Plot
            data={[
              {
                type: "bar",
                x: estadoData.map((d) => d.condicion),
                y: estadoData.map((d) => d.cantidad),
                marker: { color: ["#0f766e", "#ea580c", "#64748b"] },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 58, r: 18, t: 16, b: 86 },
              yaxis: { title: "Cantidad estimada" },
              xaxis: { tickangle: -20 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Formalidad e informalidad</h2>
          <Plot
            data={[
              {
                type: "pie",
                labels: Object.keys(informalidad),
                values: Object.values(informalidad),
                marker: { colors: ["#0f766e", "#ea580c"] },
                textinfo: "label+percent",
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 8, r: 8, t: 8, b: 8 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Distribucion por edades</h2>
          <Plot
            data={[
              {
                type: "bar",
                x: edadesJefas.map((d) => d.rango),
                y: edadesJefas.map((d) => d.cantidad),
                marker: { color: "#0f766e" },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 58, r: 16, t: 16, b: 86 },
              yaxis: { title: "Cantidad estimada" },
              xaxis: { tickangle: -20 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Categoria ocupacional de jefas ocupadas</h2>
          <Plot
            data={[
              {
                type: "bar",
                x: ocupacionJefas.map((d) => d.categoria),
                y: ocupacionJefas.map((d) => d.cantidad),
                marker: { color: "#ea580c" },
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 58, r: 16, t: 16, b: 110 },
              yaxis: { title: "Cantidad estimada" },
              xaxis: { tickangle: -25 },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>

        <article className="chart-card">
          <h2>Uso del tiempo por genero</h2>
          <Plot
            data={[
              {
                type: "bar",
                x: usoDelTiempo.map((d) => d.genero),
                y: usoDelTiempo.map((d) => d.horas_trabajo_no_remunerado),
                name: "No remunerado",
                marker: { color: "#ea580c" },
              },
              {
                type: "bar",
                x: usoDelTiempo.map((d) => d.genero),
                y: usoDelTiempo.map((d) => d.horas_trabajo_ocupacion),
                name: "Ocupacion",
                marker: { color: "#0f766e" },
              },
            ]}
            layout={{
              barmode: "group",
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 58, r: 16, t: 16, b: 64 },
              yaxis: { title: "Horas promedio por dia" },
              font: { family: "Space Grotesk, sans-serif" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "360px" }}
          />
        </article>
      </section>

      <section className="report">
        <h2>Cumplimiento de consignas del trabajo practico</h2>

        <article>
          <h3>1) Seleccion del dataset</h3>
          <p>
            Para el presente proyecto de Big Data, se desestimó el uso de
            datasets pre-procesados o simplificados (como los disponibles en
            Kaggle) para trabajar directamente con microdatos crudos de alcance
            nacional y datos abiertos gubernamentales. Las fuentes seleccionadas
            fueron trianguladas para lograr un análisis exhaustivo:
            <li>
              <strong>Fuente Inicial (Geoespacial):</strong> Dataset de "Tasa de
              desocupación de jefas mujeres en hogares urbanos" extraído del
              portal oficial
              <br />
              <strong>datos.argentina.gob.ar.</strong> Esta base fue fundamental
              para establecer la línea base territorial y alimentar el mapa
              coroplético original.
            </li>
            <li>
              <strong>Base Principal (Laboral y Demográfica):</strong> Encuesta
              Permanente de Hogares (EPH) - 3er Trimestre de 2023. Base Personas
              (Población Urbana), provista por el Instituto Nacional de
              Estadística y Censos (INDEC).
            </li>
            <li>
              <strong>Base Complementaria (Socio-cultural):</strong> Encuesta
              Nacional de Uso del Tiempo (ENUT) - 2021, del INDEC.
            </li>
          </p>
        </article>

        <article>
          <h3>2) Representaciones visuales seleccionadas y justificacion</h3>
          <ul>
            <li>
              <strong>
                1. Evolución temporal de la tasa nacional (Gráfico de línea con
                marcadores):
              </strong>
              <br />
              Justificación: Es la representación estándar para series
              temporales continuas, preservando el orden cronológico de manera
              natural. Permite detectar la tendencia de la desocupación femenina
              nacional entre 2019 y 2023.
            </li>
            <li>
              <strong>
                2. Top 8 provincias con mayor desocupación (Gráfico de barras):
              </strong>
              <br />
              Justificación: Es el formato más robusto para comparar magnitudes
              entre categorías discretas (provincias). El orden descendente
              facilita identificar rápidamente extremos altos de vulnerabilidad.
            </li>
            <li>
              <strong>
                3. Mapa coroplético por provincia (Mapa geoespacial):
              </strong>
              <br />
              Justificación: Al tener los datos un componente geográfico
              explícito, el color por territorio es la forma más eficiente de
              detectar patrones espaciales. Responde a la pregunta de dónde se
              concentra el problema en el territorio nacional.
            </li>
            <li>
              <strong>
                4. Brecha educativa en jefas de hogar (Gráfico de dona):
              </strong>
              <br />
              Justificación: Muestra la composición porcentual del grupo por
              nivel educativo. Con pocas categorías, la dona ofrece una lectura
              inmediata del peso relativo y mejora la legibilidad frente a una
              torta tradicional en interfaces densas.
            </li>
            <li>
              <strong>
                5. Estado laboral real ponderado (Gráfico de barras):
              </strong>
              <br />
              Justificación: Compara cantidades estimadas entre estados
              laborales (ocupada, desocupada, inactiva). Soporta bien las
              escalas de volumen y el uso de ponderadores poblacionales,
              distinguiendo desocupación de inactividad.
            </li>
            <li>
              <strong>6. Formalidad e informalidad (Gráfico de torta):</strong>
              <br />
              Justificación: Al ser una partición dicotómica (formal/informal),
              la torta facilita la lectura de la proporción dominante. Introduce
              visualmente la dimensión de precariedad laboral.
            </li>
            <li>
              <strong>
                7. Perfil demográfico y ocupacional (Distribución por edades y
                Categoría ocupacional):
              </strong>
              <br />
              Justificación: Se utilizaron barras secuenciales y nominales para
              comparar las frecuencias. Ayuda a contextualizar las políticas
              laborales por ciclo de vida y a interpretar la exposición a la
              segmentación ocupacional manteniendo la legibilidad de etiquetas
              largas.
            </li>
            <li>
              <strong>8. Uso del tiempo por género (Barras agrupadas):</strong>
              <br />
              Justificación: Se comparan horas de trabajo remunerado y no
              remunerado entre mujer/hombre. Las barras agrupadas exponen
              técnicamente la doble jornada y su relación con la vulnerabilidad
              laboral femenina mediante comparación cruzada.
            </li>
          </ul>
        </article>

        <article>
          <h3>3) Preparacion de datos y problemas comunes detectados</h3>
          <ul>
            <li>
              <strong>Extracción:</strong> Se descargaron archivos masivos en
              formato .txt y .csv con cientos de miles de registros.
            </li>
            <li>
              <strong>Transformación:</strong> Se procesaron los datos
              eficientemente en memoria usando Streams de Node.js. Se filtró la
              información y se aplicó el factor de expansión (PONDERA) para
              proyectar la muestra a nivel nacional.
            </li>
            <li>
              <strong>Carga:</strong> Los datos procesados se exportaron a un
              formato JSON optimizado para su uso en el Frontend.
            </li>
          </ul>
          <p>Problemas comunes resueltos:</p>
          <li>
            <strong>Delimitadores mixtos:</strong> Se programó un detector
            dinámico para interpretar correctamente archivos que mezclaban comas
            y puntos y comas.
          </li>
          <li>
            <strong>Limpieza tipográfica:</strong> Se utilizaron expresiones
            regulares (RegEx) para eliminar comillas residuales y espacios en
            los datos numéricos.
          </li>
          <li>
            <strong>Formatos decimales:</strong> Se estandarizó el uso de puntos
            y comas en los números ponderadores mediante parseo y redondeo
            matemático.
          </li>
          <li>
            <strong>Corrección geoespacial:</strong> Se invirtieron las
            coordenadas del estándar GeoJSON ([Longitud, Latitud]) al formato
            del motor del mapa ([Latitud, Longitud]) para que el mapa del país
            se renderizara en la orientación correcta.
          </li>
        </article>

        <article>
          <h3>4) Seleccion de Herramientas</h3>
          <p>
            Para el desarrollo del dashboard, se adoptó un ecosistema
            tecnológico orientado al alto rendimiento para manejar grandes
            volúmenes de datos:
          </p>
          <li>
            <strong>Plotly.js (Visualización):</strong> Seleccionada por ofrecer
            todos los gráficos necesarios en una sola librería, incluir soporte
            nativo para mapas coropléticos (GeoJSON) y contar con alta
            interactividad (zoom, tooltips).
          </li>
          <li>
            <strong>React (Interfaz):</strong> Elegida para construir una
            arquitectura escalable y modular basada en componentes o tarjetas
            reutilizables.
          </li>
          <li>
            <strong>Herramienta de Build (Vite):</strong> Orientada a la
            velocidad, permite recarga en caliente y menor fricción para iterar
            sobre los gráficos.
          </li>
          <li>
            <strong>Pipeline Backend (Node.js):</strong> Genera archivos JSON
            compatibles de forma nativa con el consumo en frontend, asegurando
            consistencia metodológica y reproducibilidad
          </li>
        </article>

        <article>
          <h3>5) Elementos del reporte </h3>
          <p>
            La interfaz se estructuró bajo el enfoque de "Scrollytelling"
            (narrativa guiada por el desplazamiento del usuario), integrando los
            siguientes aspectos:
          </p>
          <ul>
            <li>
              <strong>Estructura Narrativa:</strong> La información se presenta
              en una secuencia lógica dividida en tres actos: El Problema - La
              Causa Oculta - Las Consecuencias Laborales.
            </li>
            <li>
              <strong>Jerarquía Visual:</strong> Se priorizan tarjetas de
              indicadores clave (KPIs) en la cabecera para destacar las
              magnitudes más impactantes, respaldadas por gráficos detallados a
              continuación.
            </li>
            <li>
              <strong>Estética y Usabilidad:</strong> Se implementó un "Dark
              Mode" (modo oscuro) con colores de alto contraste (morado y verde
              esmeralda) para resaltar los datos y reducir la fatiga visual.
            </li>
            <li>
              <strong>Beneficio Principal:</strong> Democratiza el acceso a los
              datos, transformando estadísticas complejas y crudas en
              información clara y procesable para la formulación de políticas
              públicas y la toma de decisiones.
            </li>
          </ul>
        </article>

        <article>
          <h3>7) Por que estas visualizaciones son efectivas</h3>
          <p>
            Son efectivas porque combinan lectura temporal, espacial y
            estructural en un mismo tablero. Esto permite pasar de una vision
            macro (tendencia nacional) a focos puntuales (provincia, educacion,
            formalidad, edad, ocupacion) sin perder coherencia analitica.
          </p>
        </article>
      </section>
        <section className="conclusion">
        <div className="conclusion-inner">
          <p className="eyebrow">Conclusión</p>
          <h2>Una crisis invisible de tiempo y oportunidades</h2>
          <p className="conclusion-lead">
            La Encuesta Permanente de Hogares (EPH) expone una{" "}
            <strong>crisis de tiempo</strong>. Los datos revelan una realidad
            contundente: mientras que{" "}
            <span className="conclusion-highlight">143.915 mujeres</span> se
            encuentran desocupadas buscando empleo, el verdadero problema es
            invisible.
          </p>
          <div className="conclusion-stats">
            <article>
              <strong>+2,8 millones</strong>
              <span>
                de mujeres inactivas, fuera del mercado laboral, por pura carga
                horaria
              </span>
            </article>
            <article>
              <strong>6,5 hs</strong>
              <span>
                diarias de trabajo no remunerado que dedican las mujeres, frente
                a las 3,4 hs de los varones
              </span>
            </article>
            <article>
              <strong>Primaria</strong>
              <span>
                es el nivel educativo predominante en el grupo, explicando la
                persistencia de la informalidad
              </span>
            </article>
          </div>
          <p className="conclusion-closing">
            Al sumar la desproporcionada carga de trabajo no remunerado al bajo
            nivel educativo del grupo mayoritario, comprendemos por qué la
            informalidad laboral sigue siendo tan alta. La tecnología nos permite
            visualizar estos datos para entender que{" "}
            <strong>la brecha de género es un desafío estructural</strong>, no
            individual, que requiere políticas públicas de fondo.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
