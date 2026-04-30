import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Acordate de agregar el '2019' acá si finalmente decidieron incluir ese año
const años = ['2020', '2021', '2022', '2023']; 
const OUT_FILE = path.join(__dirname, '../data/processed/ocupacion_historica.json');

async function procesarOcupacion() {
    console.log("🚀 Procesando Categoría Ocupacional...");
    let resultadosFinales = [];

    for (const año of años) {
        const IN_FILE = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);
        if (!fs.existsSync(IN_FILE)) continue;

        const fileStream = fs.createReadStream(IN_FILE);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';
        let cOcup = { "Patrona / Empleadora": 0, "Cuenta Propia (Autoempleo)": 0, "Obrera / Empleada": 0, "Familiar sin remuneración": 0 };

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
                let cat = row[headers.indexOf('CAT_OCUP')]?.trim().replace(/"/g, '');

                if (cat === '1') cOcup["Patrona / Empleadora"] += peso;
                else if (cat === '2') cOcup["Cuenta Propia (Autoempleo)"] += peso;
                else if (cat === '3') cOcup["Obrera / Empleada"] += peso;
                else if (cat === '4') cOcup["Familiar sin remuneración"] += peso;
            }
        }

        resultadosFinales.push({ año: parseInt(año), categoria: "Patrona / Empleadora", cantidad_real: cOcup["Patrona / Empleadora"] });
        resultadosFinales.push({ año: parseInt(año), categoria: "Cuenta Propia (Autoempleo)", cantidad_real: cOcup["Cuenta Propia (Autoempleo)"] });
        resultadosFinales.push({ año: parseInt(año), categoria: "Obrera / Empleada", cantidad_real: cOcup["Obrera / Empleada"] });
        resultadosFinales.push({ año: parseInt(año), categoria: "Familiar sin remuneración", cantidad_real: cOcup["Familiar sin remuneración"] });
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(resultadosFinales, null, 2));
    console.log("✅ JSON guardado: ocupacion_historica.json");
}

procesarOcupacion();