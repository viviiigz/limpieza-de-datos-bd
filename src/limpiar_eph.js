import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IN_FILE = path.join(__dirname, '../data/raw/eph_personas.txt');
const OUT_EDUCACION = path.join(__dirname, '../data/brecha_educativa.json');
const OUT_INFORMALIDAD = path.join(__dirname, '../data/informalidad.json');

async function procesarEPH() {
    console.log("🚀 Iniciando el procesamiento...");

    const fileStream = fs.createReadStream(IN_FILE);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = [];
    let isFirstLine = true;
    let contadoresEducacion = { "Primaria/Menos": 0, "Secundaria": 0, "Superior": 0 };
    let contadoresInformalidad = { "Formal": 0, "Informal": 0 };
    let totalJefas = 0;

    for await (const line of rl) {
        // Probamos con tabulación primero, si no, con punto y coma
        let row = line.includes('\t') ? line.split('\t') : line.split(';');

        if (isFirstLine) {
            headers = row.map(h => h.trim().replace(/"/g, ''));
            console.log("📍 Columnas detectadas:", headers.slice(0, 10)); // Vemos las primeras 10
            isFirstLine = false;
            continue;
        }

        const idxCH03 = headers.indexOf('CH03'); 
        const idxCH04 = headers.indexOf('CH04'); 
        const idxNIVEL_ED = headers.indexOf('NIVEL_ED'); 
        const idxPP07H = headers.indexOf('PP07H'); 

        // Limpiamos los datos de espacios o comillas
        const ch03 = row[idxCH03]?.trim().replace(/"/g, '');
        const ch04 = row[idxCH04]?.trim().replace(/"/g, '');

        // FILTRO: Jefa (1) y Mujer (2)
        if (ch03 === '1' && ch04 === '2') {
            totalJefas++;

            let nivel = parseInt(row[idxNIVEL_ED]);
            if (nivel >= 1 && nivel <= 3) contadoresEducacion["Primaria/Menos"]++;
            else if (nivel === 4 || nivel === 5) contadoresEducacion["Secundaria"]++;
            else if (nivel === 6 || nivel === 7) contadoresEducacion["Superior"]++;

            let jubilacion = row[idxPP07H]?.trim().replace(/"/g, '');
            if (jubilacion === '1') contadoresInformalidad["Formal"]++;
            else if (jubilacion === '2') contadoresInformalidad["Informal"]++;
        }
    }

    console.log(`📊 Resultado: Se encontraron ${totalJefas} Jefas de Hogar.`);

    fs.writeFileSync(OUT_EDUCACION, JSON.stringify(contadoresEducacion, null, 2));
    fs.writeFileSync(OUT_INFORMALIDAD, JSON.stringify(contadoresInformalidad, null, 2));
}

procesarEPH();