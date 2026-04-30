import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IN_FILE = path.join(__dirname, '../data/raw/eph_personas.txt');
const OUT_ESTADO = path.join(__dirname, '../data/estado_laboral_real.json');
const OUT_EDADES = path.join(__dirname, '../data/edades_jefas.json');
const OUT_OCUPACION = path.join(__dirname, '../data/ocupacion_jefas.json');
const AÑOS = ['2019', '2020', '2021', '2022', '2023'];

async function calcularTodo() {
    console.log("🚀 Extrayendo insights profundos del INDEC...");
    // Nuestros 3 contadores
    let contadoresEstado = { "Ocupadas": 0, "Desocupadas": 0, "Inactivas": 0 };
    let contadoresEdad = { "14 a 29 años": 0, "30 a 45 años": 0, "46 a 60 años": 0, "Más de 60 años": 0 };
    let contadoresOcupacion = { "Patrona / Empleadora": 0, "Cuenta Propia (Autoempleo)": 0, "Obrera / Empleada": 0, "Familiar sin remuneración": 0 };

    for (const año of AÑOS) {
        const inputPath = path.join(__dirname, `../data/raw/eph_personas_${año}.txt`);
        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️ Archivo de ${año} no encontrado. Se omite.`);
            continue;
        }

        const fileStream = fs.createReadStream(inputPath);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let headers = [];
        let isFirstLine = true;
        let separador = ',';

        for await (const line of rl) {
            if (isFirstLine) {
                separador = line.includes(';') ? ';' : (line.includes('\t') ? '\t' : ',');
                headers = line.split(separador).map(h => h.trim().replace(/"/g, ''));
                isFirstLine = false;
                continue;
            }

            let row = line.split(separador);

            // Ubicamos las columnas
            const idxCH03 = headers.indexOf('CH03'); // Parentesco
            const idxCH04 = headers.indexOf('CH04'); // Sexo
            const idxPONDERA = headers.indexOf('PONDERA'); // Multiplicador
            const idxESTADO = headers.indexOf('ESTADO');
            const idxCH06 = headers.indexOf('CH06'); // Edad
            const idxCAT_OCUP = headers.indexOf('CAT_OCUP'); // Categoría Ocupacional

            const ch03 = row[idxCH03]?.trim().replace(/"/g, '');
            const ch04 = row[idxCH04]?.trim().replace(/"/g, '');

            // FILTRO: Solo Jefas (1) y Mujeres (2)
            if (ch03 === '1' && ch04 === '2') {
                let pesoStr = row[idxPONDERA]?.trim().replace(/"/g, '').replace(',', '.') || '0';
                let peso = Math.round(parseFloat(pesoStr));

                // 1. Estado Laboral
                let estado = row[idxESTADO]?.trim().replace(/"/g, '');
                if (estado === '1') contadoresEstado["Ocupadas"] += peso;
                else if (estado === '2') contadoresEstado["Desocupadas"] += peso;
                else if (estado === '3') contadoresEstado["Inactivas"] += peso;

                // 2. Rango Etario
                let edad = parseInt(row[idxCH06]?.trim().replace(/"/g, '')) || 0;
                if (edad >= 14 && edad <= 29) contadoresEdad["14 a 29 años"] += peso;
                else if (edad >= 30 && edad <= 45) contadoresEdad["30 a 45 años"] += peso;
                else if (edad >= 46 && edad <= 60) contadoresEdad["46 a 60 años"] += peso;
                else if (edad > 60) contadoresEdad["Más de 60 años"] += peso;

                // 3. Categoría Ocupacional (Solo aplicable a las que trabajan)
                if (estado === '1') {
                    let cat = row[idxCAT_OCUP]?.trim().replace(/"/g, '');
                    if (cat === '1') contadoresOcupacion["Patrona / Empleadora"] += peso;
                    else if (cat === '2') contadoresOcupacion["Cuenta Propia (Autoempleo)"] += peso;
                    else if (cat === '3') contadoresOcupacion["Obrera / Empleada"] += peso;
                    else if (cat === '4') contadoresOcupacion["Familiar sin remuneración"] += peso;
                }
            }
        }
    }

    // Convertir a JSON y Guardar
    const generarArray = (obj, keyName) => Object.keys(obj).map(k => ({ [keyName]: k, cantidad: obj[k] }));

    fs.writeFileSync(OUT_ESTADO, JSON.stringify(generarArray(contadoresEstado, 'condicion'), null, 2));
    fs.writeFileSync(OUT_EDADES, JSON.stringify(generarArray(contadoresEdad, 'rango'), null, 2));
    fs.writeFileSync(OUT_OCUPACION, JSON.stringify(generarArray(contadoresOcupacion, 'categoria'), null, 2));
    
    console.log("✅ ¡Magia completada! Se crearon 3 archivos JSON en tu carpeta data/ con los números reales.");
}

calcularTodo();