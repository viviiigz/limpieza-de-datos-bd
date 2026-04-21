import { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';

import argentinaGeo from './argentina.json';
import datosLimpios from './data/datos_limpios.json';
import brechaEducativa from './data/brecha_educativa.json';
import informalidad from './data/informalidad.json';
import estadoLaboral from './data/estado_laboral_real.json';
import edadesJefas from './data/edades_jefas.json';
import ocupacionJefas from './data/ocupacion_jefas.json';
import usoDelTiempo from './data/uso_del_tiempo.json';

function formatPercent(value) {
  if (value == null || Number.isNaN(value)) return 'N/D';
  return `${(value * 100).toFixed(2)}%`;
}

function normalizeEstadoData(items) {
  return items.map((item) => ({
    condicion: item.condicion,
    cantidad: item.cantidad_real ?? item.cantidad ?? 0
  }));
}

function App() {
  const fechas = useMemo(() => {
    const allDates = new Set(datosLimpios.map((d) => d.fecha));
    return Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));
  }, []);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(fechas[fechas.length - 1]);

  const serieNacional = useMemo(() => {
    return datosLimpios
      .filter((d) => d.provincia === 'Nacional')
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, []);

  const provinciasFecha = useMemo(() => {
    return datosLimpios
      .filter((d) => d.fecha === fechaSeleccionada && d.provincia !== 'Nacional')
      .sort((a, b) => (b.tasa_desocupacion ?? 0) - (a.tasa_desocupacion ?? 0));
  }, [fechaSeleccionada]);

  const topProvincias = useMemo(() => provinciasFecha.slice(0, 8), [provinciasFecha]);

  const mediaFecha = useMemo(() => {
    const valid = provinciasFecha
      .map((d) => d.tasa_desocupacion)
      .filter((v) => v != null && !Number.isNaN(v));

    if (!valid.length) return null;
    return valid.reduce((acc, value) => acc + value, 0) / valid.length;
  }, [provinciasFecha]);

  const maxFecha = useMemo(() => {
    if (!provinciasFecha.length) return null;
    return provinciasFecha[0];
  }, [provinciasFecha]);

  const estadoData = useMemo(() => normalizeEstadoData(estadoLaboral), []);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Trabajo Practico 1 · Big Data II</p>
        <h1>Desocupacion y Condiciones Laborales de Mujeres en Argentina</h1>
        <p className="lead">
          Dashboard interactivo construido con React + Plotly para analizar desocupacion femenina y
          condiciones de las jefas de hogar a partir de datos del INDEC y la EPH.
        </p>
        <div className="meta-grid">
          <article>
            <h3>Fuente principal</h3>
            <p>INDEC - EPH (microdatos) y serie provincial de tasa de desocupacion femenina.</p>
          </article>
          <article>
            <h3>Herramienta de visualizacion</h3>
            <p>Plotly.js integrado en React para interactividad, comparacion y lectura exploratoria.</p>
          </article>
          <article>
            <h3>Objetivo analitico</h3>
            <p>Detectar desigualdades territoriales, educativas y ocupacionales en mujeres jefas de hogar.</p>
          </article>
        </div>
      </header>

      <section className="controls-panel">
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

        <div className="kpi-row">
          <article>
            <span>Tasa nacional</span>
            <strong>
              {formatPercent(
                serieNacional.find((d) => d.fecha === fechaSeleccionada)?.tasa_desocupacion ?? null
              )}
            </strong>
          </article>
          <article>
            <span>Provincia con mayor tasa</span>
            <strong>{maxFecha ? `${maxFecha.provincia} · ${formatPercent(maxFecha.tasa_desocupacion)}` : 'N/D'}</strong>
          </article>
          <article>
            <span>Media provincial</span>
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
                type: 'scatter',
                mode: 'lines+markers',
                x: serieNacional.map((d) => d.fecha),
                y: serieNacional.map((d) => (d.tasa_desocupacion ?? 0) * 100),
                line: { color: '#0f766e', width: 4 },
                marker: { color: '#ea580c', size: 8 },
                fill: 'tozeroy',
                fillcolor: 'rgba(15,118,110,0.1)',
                name: 'Nacional'
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 52, r: 22, t: 16, b: 48 },
              xaxis: { title: 'Fecha' },
              yaxis: { title: 'Tasa (%)' },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '380px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Top 8 provincias con mayor desocupacion ({fechaSeleccionada})</h2>
          <Plot
            data={[
              {
                type: 'bar',
                x: topProvincias.map((d) => d.provincia),
                y: topProvincias.map((d) => (d.tasa_desocupacion ?? 0) * 100),
                marker: {
                  color: topProvincias.map((_, i) => (i < 3 ? '#ea580c' : '#0f766e'))
                }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 50, r: 16, t: 16, b: 92 },
              yaxis: { title: 'Tasa (%)' },
              xaxis: { tickangle: -30 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '370px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Mapa de desocupacion por provincia</h2>
          <Plot
            data={[
              {
                type: 'choropleth',
                geojson: argentinaGeo,
                featureidkey: 'properties.nombre',
                locations: provinciasFecha.map((d) => (d.provincia ?? '').trim()),
                z: provinciasFecha.map((d) => {
                  const tasa = Number(d.tasa_desocupacion);
                  return Number.isNaN(tasa) ? null : tasa * 100;
                }),
                customdata: provinciasFecha.map((d) => {
                  const tasa = Number(d.tasa_desocupacion);
                  return Number.isNaN(tasa) ? 'Sin dato' : `${(tasa * 100).toFixed(2)}%`;
                }),
                hovertemplate: '%{location}<br>Tasa: %{customdata}<extra></extra>',
                colorscale: [
                  [0, '#dbeafe'],
                  [0.5, '#14b8a6'],
                  [1, '#ea580c']
                ],
                marker: { line: { color: '#f8fafc', width: 0.6 } },
                colorbar: { title: 'Tasa (%)' }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 0, r: 0, t: 8, b: 0 },
              geo: {
                fitbounds: 'locations',
                bgcolor: 'rgba(0,0,0,0)',
                showframe: false,
                showcoastlines: false,
                projection: { type: 'mercator' }
              },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '370px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Brecha educativa en jefas de hogar</h2>
          <Plot
            data={[
              {
                type: 'pie',
                labels: Object.keys(brechaEducativa),
                values: Object.values(brechaEducativa),
                hole: 0.45,
                marker: { colors: ['#0f766e', '#f59e0b', '#ea580c'] }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 8, r: 8, t: 8, b: 8 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Estado laboral real (ponderado)</h2>
          <Plot
            data={[
              {
                type: 'bar',
                x: estadoData.map((d) => d.condicion),
                y: estadoData.map((d) => d.cantidad),
                marker: { color: ['#0f766e', '#ea580c', '#64748b'] }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 58, r: 18, t: 16, b: 86 },
              yaxis: { title: 'Cantidad estimada' },
              xaxis: { tickangle: -20 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Formalidad e informalidad</h2>
          <Plot
            data={[
              {
                type: 'pie',
                labels: Object.keys(informalidad),
                values: Object.values(informalidad),
                marker: { colors: ['#0f766e', '#ea580c'] },
                textinfo: 'label+percent'
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 8, r: 8, t: 8, b: 8 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Distribucion por edades</h2>
          <Plot
            data={[
              {
                type: 'bar',
                x: edadesJefas.map((d) => d.rango),
                y: edadesJefas.map((d) => d.cantidad),
                marker: { color: '#0f766e' }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 58, r: 16, t: 16, b: 86 },
              yaxis: { title: 'Cantidad estimada' },
              xaxis: { tickangle: -20 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Categoria ocupacional de jefas ocupadas</h2>
          <Plot
            data={[
              {
                type: 'bar',
                x: ocupacionJefas.map((d) => d.categoria),
                y: ocupacionJefas.map((d) => d.cantidad),
                marker: { color: '#ea580c' }
              }
            ]}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 58, r: 16, t: 16, b: 110 },
              yaxis: { title: 'Cantidad estimada' },
              xaxis: { tickangle: -25 },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>

        <article className="chart-card">
          <h2>Uso del tiempo por genero</h2>
          <Plot
            data={[
              {
                type: 'bar',
                x: usoDelTiempo.map((d) => d.genero),
                y: usoDelTiempo.map((d) => d.horas_trabajo_no_remunerado),
                name: 'No remunerado',
                marker: { color: '#ea580c' }
              },
              {
                type: 'bar',
                x: usoDelTiempo.map((d) => d.genero),
                y: usoDelTiempo.map((d) => d.horas_trabajo_ocupacion),
                name: 'Ocupacion',
                marker: { color: '#0f766e' }
              }
            ]}
            layout={{
              barmode: 'group',
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 58, r: 16, t: 16, b: 64 },
              yaxis: { title: 'Horas promedio por dia' },
              font: { family: 'Space Grotesk, sans-serif' }
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '360px' }}
          />
        </article>
      </section>

      <section className="report">
        <h2>Cumplimiento de consignas del trabajo practico</h2>

        <article>
          <h3>1) Seleccion del dataset</h3>
          <p>
            Se trabajo con datos publicos oficiales del INDEC: serie de tasa de desocupacion de mujeres
            por provincia y microdatos EPH de personas. La eleccion se justifico por calidad,
            trazabilidad metodologica y pertinencia para estudiar brecha laboral femenina.
          </p>
        </article>

        <article>
          <h3>2) Representaciones visuales seleccionadas y justificacion</h3>
          <ul>
            <li>Linea temporal: adecuada para observar tendencia y variacion en el tiempo.</li>
            <li>Barras comparativas: utiles para comparar provincias, rangos etarios y categorias.</li>
            <li>Mapa coropletico: representa diferencias espaciales de forma inmediata.</li>
            <li>Torta y dona: sintetizan composiciones (educacion e informalidad) en un vistazo.</li>
            <li>Barras agrupadas: permiten contrastar dos medidas por grupo (uso del tiempo).</li>
          </ul>
        </article>

        <article>
          <h3>3) Preparacion de datos y problemas comunes detectados</h3>
          <ul>
            <li>Despivoteo de formato ancho a largo para facilitar analisis y graficos.</li>
            <li>Normalizacion de nombres de provincias para consistencia geografica.</li>
            <li>Conversión de texto numerico a decimal y control de valores faltantes.</li>
            <li>Filtrado tematico: jefas de hogar mujeres en microdatos EPH.</li>
            <li>Aplicacion de ponderadores para estimar cantidades reales de poblacion.</li>
          </ul>
          <p>
            Problemas comunes: separadores inconsistentes, codificaciones diferentes por variable,
            valores ausentes o no numericos y necesidad de homologar etiquetas entre fuentes.
          </p>
        </article>

        <article>
          <h3>4) Herramienta elegida para generar graficos</h3>
          <p>
            Se eligio Plotly.js sobre React por su interactividad nativa, buena calidad visual,
            soporte de multiples tipos de grafico y facilidad para integrar exploracion en una landing.
          </p>
        </article>

        <article>
          <h3>5) Elementos considerados para el dashboard</h3>
          <ul>
            <li>Jerarquia visual clara: KPIs, tendencia general y desagregados.</li>
            <li>Contexto y narrativa: cada grafico responde una pregunta concreta.</li>
            <li>Comparabilidad: misma codificacion de color y ejes consistentes.</li>
            <li>Interaccion simple: selector temporal para lectura territorial.</li>
            <li>Beneficio: mejora comprension y acelera deteccion de patrones.</li>
          </ul>
        </article>

        <article>
          <h3>7) Por que estas visualizaciones son efectivas</h3>
          <p>
            Son efectivas porque combinan lectura temporal, espacial y estructural en un mismo tablero.
            Esto permite pasar de una vision macro (tendencia nacional) a focos puntuales (provincia,
            educacion, formalidad, edad, ocupacion) sin perder coherencia analitica.
          </p>
        </article>
      </section>
    </div>
  );
}

export default App;
