import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const años = ['2019', '2020', '2021', '2022', '2023'];
const OUT_FILE = path.join(__dirname, '../data/processed/informalidad_historica.json');

async function procesarInformalidad() {
    console.log("🚀 Procesando Informalidad Laboral (2019-2023)...");
    let resultadosFinales = [];

    for (const año of años) {
        const IN_FILE = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);
        if (!fs.existsSync(IN_FILE)) continue;

        const fileStream = fs.createReadStream(IN_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';
        let cInfo = { "Formal": 0, "Informal": 0 };

        for await (const line of rl) {
            if (isFirstLine) {
                separador = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
                headers = line.split(separador).map(h => h.trim().replace(/"/g, ''));
                isFirstLine = false; continue;
            }

            let row = line.split(separador);
            const ch03 = row[headers.indexOf('CH03')]?.trim().replace(/"/g, '');
            const ch04 = row[headers.indexOf('CH04')]?.trim().replace(/"/g, '');
            const estado = row[headers.indexOf('ESTADO')]?.trim().replace(/"/g, '');

            // Filtro: Jefas, Mujeres y OCUPADAS (ESTADO == 1)
            if (ch03 === '1' && ch04 === '2' && estado === '1') {
                let peso = Math.round(parseFloat(row[headers.indexOf('PONDERA')]?.trim().replace(/"/g, '').replace(',', '.') || '0'));
                let jubilacion = row[headers.indexOf('PP07H')]?.trim().replace(/"/g, '');

                if (jubilacion === '1') cInfo["Formal"] += peso;
                else if (jubilacion === '2') cInfo["Informal"] += peso;
            }
        }

        resultadosFinales.push({ año: parseInt(año), condicion: "Formal", cantidad_real: cInfo["Formal"] });
        resultadosFinales.push({ año: parseInt(año), condicion: "Informal", cantidad_real: cInfo["Informal"] });
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resultadosFinales, null, 2));
    console.log("✅ JSON guardado: informalidad_historica.json");
}

procesarInformalidad();