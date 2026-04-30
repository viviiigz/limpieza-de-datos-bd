import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const años = ['2019', '2020', '2021', '2022', '2023'];
const OUT_FILE = path.join(__dirname, '../data/processed/brecha_educativa_historica.json');

async function procesarEducacion() {
    console.log("🚀 Iniciando procesamiento de Brecha Educativa (2019-2023)...");
    let resultadosFinales = [];

    for (const año of años) {
        console.log(`⏳ Analizando año ${año}...`);
        const IN_FILE = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);

        if (!fs.existsSync(IN_FILE)) continue;

        const fileStream = fs.createReadStream(IN_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';
        let cEduc = { "Primaria/Menos": 0, "Secundaria": 0, "Superior": 0 };

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
                let nivel = parseInt(row[headers.indexOf('NIVEL_ED')]?.trim().replace(/"/g, ''));

                if (nivel >= 1 && nivel <= 3) cEduc["Primaria/Menos"] += peso;
                else if (nivel === 4 || nivel === 5) cEduc["Secundaria"] += peso;
                else if (nivel === 6 || nivel === 7) cEduc["Superior"] += peso;
            }
        }

        // Armamos el array combinando Año + Categoría + Cantidad Real
        resultadosFinales.push({ año: parseInt(año), nivel_educativo: "Primaria/Menos", cantidad_real: cEduc["Primaria/Menos"] });
        resultadosFinales.push({ año: parseInt(año), nivel_educativo: "Secundaria", cantidad_real: cEduc["Secundaria"] });
        resultadosFinales.push({ año: parseInt(año), nivel_educativo: "Superior", cantidad_real: cEduc["Superior"] });
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resultadosFinales, null, 2));
    console.log("✅ ¡Listo! JSON guardado como brecha_educativa_historica.json");
}

procesarEducacion();