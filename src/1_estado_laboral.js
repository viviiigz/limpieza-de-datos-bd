import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const años = ['2019', '2020', '2021', '2022', '2023'];
const OUT_FILE = path.join(__dirname, '../data/processed/estado_laboral_historico.json');

async function procesarEstadoLaboral() {
    console.log("🚀 Iniciando procesamiento de Estado Laboral (2019-2023)...");
    let resultadosFinales = []; // Array donde vamos a pushear todo

    for (const año of años) {
        console.log(`⏳ Analizando año ${año}...`);
        const IN_FILE = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);

        if (!fs.existsSync(IN_FILE)) {
            console.log(`⚠️ Archivo de ${año} no encontrado. Se omite.`);
            continue;
        }

        const fileStream = fs.createReadStream(IN_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';
        let cEstado = { "Ocupadas": 0, "Desocupadas": 0, "Inactivas": 0 };

        for await (const line of rl) {
            if (isFirstLine) {
                separador = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
                headers = line.split(separador).map(h => h.trim().replace(/"/g, ''));
                isFirstLine = false; continue;
            }

            let row = line.split(separador);
            const ch03 = row[headers.indexOf('CH03')]?.trim().replace(/"/g, '');
            const ch04 = row[headers.indexOf('CH04')]?.trim().replace(/"/g, '');

            // Filtro: Mujeres Jefas de Hogar
            if (ch03 === '1' && ch04 === '2') {
                let peso = Math.round(parseFloat(row[headers.indexOf('PONDERA')]?.trim().replace(/"/g, '').replace(',', '.') || '0'));
                let estado = row[headers.indexOf('ESTADO')]?.trim().replace(/"/g, '');

                if (estado === '1') cEstado["Ocupadas"] += peso;
                else if (estado === '2') cEstado["Desocupadas"] += peso;
                else if (estado === '3') cEstado["Inactivas"] += peso;
            }
        }

        // ACÁ ARMAMOS LA ESTRUCTURA EXACTA QUE PEDISTE (Formato Largo)
        resultadosFinales.push({ año: parseInt(año), condicion: "Ocupadas", cantidad_real: cEstado["Ocupadas"] });
        resultadosFinales.push({ año: parseInt(año), condicion: "Desocupadas (Buscan y no consiguen)", cantidad_real: cEstado["Desocupadas"] });
        resultadosFinales.push({ año: parseInt(año), condicion: "Inactivas (No buscan por carga horaria)", cantidad_real: cEstado["Inactivas"] });
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resultadosFinales, null, 2));
    console.log("✅ ¡Listo! JSON guardado como estado_laboral_historico.json");
}

procesarEstadoLaboral();