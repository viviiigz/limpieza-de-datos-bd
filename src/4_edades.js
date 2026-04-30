import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const años = ['2019', '2020', '2021', '2022', '2023'];
const OUT_FILE = path.join(__dirname, '../data/processed/edades_historicas.json');

async function procesarEdades() {
    console.log("🚀 Procesando Rangos Etarios (2019-2023)...");
    let resultadosFinales = [];

    for (const año of años) {
        const IN_FILE = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);
        if (!fs.existsSync(IN_FILE)) continue;

        const fileStream = fs.createReadStream(IN_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';
        let cEdad = { "14 a 29 años": 0, "30 a 45 años": 0, "46 a 60 años": 0, "Más de 60 años": 0 };

        for await (const line of rl) {
            if (isFirstLine) {
                separador = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
                headers = line.split(separador).map(h => h.trim().replace(/"/g, ''));
                isFirstLine = false; continue;
            }

            let row = line.split(separador);
            const ch03 = row[headers.indexOf('CH03')]?.trim().replace(/"/g, '');
            const ch04 = row[headers.indexOf('CH04')]?.trim().replace(/"/g, '');

            if (ch03 === '1' && ch04 === '2') {
                let peso = Math.round(parseFloat(row[headers.indexOf('PONDERA')]?.trim().replace(/"/g, '').replace(',', '.') || '0'));
                let edad = parseInt(row[headers.indexOf('CH06')]?.trim().replace(/"/g, '')) || 0;

                if (edad >= 14 && edad <= 29) cEdad["14 a 29 años"] += peso;
                else if (edad >= 30 && edad <= 45) cEdad["30 a 45 años"] += peso;
                else if (edad >= 46 && edad <= 60) cEdad["46 a 60 años"] += peso;
                else if (edad > 60) cEdad["Más de 60 años"] += peso;
            }
        }

        resultadosFinales.push({ año: parseInt(año), rango: "14 a 29 años", cantidad_real: cEdad["14 a 29 años"] });
        resultadosFinales.push({ año: parseInt(año), rango: "30 a 45 años", cantidad_real: cEdad["30 a 45 años"] });
        resultadosFinales.push({ año: parseInt(año), rango: "46 a 60 años", cantidad_real: cEdad["46 a 60 años"] });
        resultadosFinales.push({ año: parseInt(año), rango: "Más de 60 años", cantidad_real: cEdad["Más de 60 años"] });
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resultadosFinales, null, 2));
    console.log("✅ JSON guardado: edades_historicas.json");
}

procesarEdades();