import { stat as fsStat, mkdir, readdir, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path"; // Añadir dirname

const SRC_DIRECTORY = "src";
const OUTPUT_FILE = "output.txt";
const DELIMITER = "\n---\n";

async function getAllFilePaths(baseDirPath: string): Promise<string[]> {
  console.log(
    `[getAllFilePaths] Iniciando búsqueda recursiva en: ${baseDirPath}`
  );
  const allAbsoluteFilePaths: string[] = [];

  async function findFilesRecursively(currentDirPath: string) {
    // console.log(`  [findFilesRecursively] Explorando: ${currentDirPath}`);
    let dirents;
    try {
      dirents = await readdir(currentDirPath, { withFileTypes: true });
    } catch (err: any) {
      console.warn(
        `  [findFilesRecursively] No se pudo leer el directorio ${currentDirPath}: ${err.message}. Omitiendo.`
      );
      return;
    }

    for (const dirent of dirents) {
      const fullPath = join(currentDirPath, dirent.name); // Ruta absoluta al elemento actual

      if (dirent.isFile()) {
        // console.log(`    [findFilesRecursively] Archivo encontrado: ${fullPath}`);
        allAbsoluteFilePaths.push(fullPath);
      } else if (dirent.isDirectory()) {
        // console.log(`    [findFilesRecursively] Directorio encontrado, recursando en: ${fullPath}`);
        await findFilesRecursively(fullPath); // Llamada recursiva para subdirectorios
      } else {
        // console.log(`    [findFilesRecursively] Omitiendo (no es archivo ni directorio): ${fullPath}`);
      }
    }
  }

  // Manejar el caso donde el directorio base no existe
  try {
    await fsStat(baseDirPath); // Chequear si el directorio base existe
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.warn(
        `[getAllFilePaths] El directorio fuente ${baseDirPath} no existe. Intentando crearlo.`
      );
      try {
        await mkdir(baseDirPath, { recursive: true });
        console.log(
          `[getAllFilePaths] Directorio ${baseDirPath} creado. Estará vacío.`
        );
        return []; // Devuelve vacío ya que el directorio acaba de ser creado
      } catch (mkdirError: any) {
        console.error(
          `[getAllFilePaths] CRÍTICO: No se pudo crear ${baseDirPath}: ${mkdirError.message}`
        );
        throw error; // Relanza el error original si mkdir también falla
      }
    }
    console.error(
      `[getAllFilePaths] CRÍTICO: Error al estatificar el directorio base ${baseDirPath}:`,
      error
    );
    throw error; // Relanza otros errores de stat
  }

  await findFilesRecursively(baseDirPath);
  console.log(
    `[getAllFilePaths] Finalizado. Total de rutas de archivos absolutas encontradas: ${allAbsoluteFilePaths.length}`
  );
  return allAbsoluteFilePaths;
}

async function main() {
  try {
    const absoluteSrcPath = resolve(SRC_DIRECTORY);
    console.log(
      `\nIniciando 'main'. Base para leer archivos: ${absoluteSrcPath}`
    );

    const filePaths = await getAllFilePaths(absoluteSrcPath);

    if (filePaths.length === 0) {
      console.log(
        `No se encontraron archivos que procesar en '${SRC_DIRECTORY}'.`
      );
      await Bun.write(
        OUTPUT_FILE,
        `No se encontraron archivos que procesar en '${SRC_DIRECTORY}'.`
      );
      return;
    }

    console.log(
      `\nArchivos listados por getAllFilePaths (${filePaths.length}). Revisando cada uno:`
    );

    let combinedContent = "";
    let filesSuccessfullyProcessed = 0;

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i]; // Esta ya es una ruta absoluta
      console.log(
        `\n--- (${i + 1}/${filePaths.length}) Procesando: ${filePath} ---`
      );

      let nodeStats;
      try {
        nodeStats = await fsStat(filePath);
        console.log(
          `  [node:fs.stat] ÉXITO. Es Archivo: ${nodeStats.isFile()}, Tamaño: ${
            nodeStats.size
          } bytes.`
        );
        if (!nodeStats.isFile()) {
          console.warn(
            `  [node:fs.stat] ADVERTENCIA: '${filePath}' NO es un archivo regular según fs.stat. Omitiendo.`
          );
          continue;
        }
      } catch (statError: any) {
        console.warn(
          `  [node:fs.stat] ERROR al acceder/estatificar '${filePath}': ${statError.message}. Omitiendo.`
        );
        continue;
      }

      const file = Bun.file(filePath);
      const bunExists = await file.exists();
      console.log(
        `  [Bun.file.exists()] Resultado para '${filePath}': ${bunExists}`
      );

      if (!bunExists) {
        console.warn(
          `  [Bun] ADVERTENCIA: '${filePath}' fue verificado por fs.stat, pero Bun.file.exists() devuelve 'false'. Omitiendo.`
        );
        continue;
      }

      try {
        const content = await file.text();

        if (filesSuccessfullyProcessed > 0) {
          combinedContent += DELIMITER;
        }
        const displayPath = relative(resolve("."), filePath);
        combinedContent += `RUTA: ${displayPath}\n`;
        combinedContent += content;
        filesSuccessfullyProcessed++;
        console.log(`  [Bun] ÉXITO: Archivo '${filePath}' leído y añadido.`);
      } catch (readError: any) {
        console.warn(
          `  [Bun.file.text()] ERROR al leer contenido de '${filePath}': ${readError.message}. Omitiendo.`
        );
        continue;
      }
    }

    if (filesSuccessfullyProcessed > 0) {
      await Bun.write(OUTPUT_FILE, combinedContent);
      console.log(`\n--- FINALIZADO ---`);
      console.log(
        `Contenido de ${filesSuccessfullyProcessed} archivo(s) guardado en '${OUTPUT_FILE}'`
      );
      const outputFile = Bun.file(OUTPUT_FILE);
      if (await outputFile.exists()) {
        console.log(`Tamaño del archivo de salida: ${outputFile.size} bytes.`);
      } else {
        console.warn(
          `ADVERTENCIA: El archivo de salida ${OUTPUT_FILE} no se pudo crear/verificar.`
        );
      }
    } else {
      console.log(`\n--- FINALIZADO ---`);
      console.log(
        `No se procesó con éxito ningún archivo para escribir en ${OUTPUT_FILE}.`
      );
      await Bun.write(
        OUTPUT_FILE,
        `No se pudo procesar con éxito ningún archivo de '${SRC_DIRECTORY}'.`
      );
    }
  } catch (error) {
    console.error(
      "\nOCURRIÓ UN ERROR FATAL DURANTE LA EJECUCIÓN PRINCIPAL:",
      error
    );
    process.exit(1);
  }
}

async function prepareEnvironment() {
  const absoluteSrcPath = resolve(SRC_DIRECTORY);
  console.log(`[prepareEnvironment] Directorio de origen: ${absoluteSrcPath}`);
  console.log(
    `[prepareEnvironment] Limpiando ${OUTPUT_FILE} anterior (si existe).`
  );
  try {
    await rm(OUTPUT_FILE, { force: true });
  } catch (e) {
    /* No importa */
  }

  try {
    await mkdir(absoluteSrcPath, { recursive: true });
    console.log(
      `[prepareEnvironment] Directorio '${SRC_DIRECTORY}' (${absoluteSrcPath}) asegurado/creado.`
    );
  } catch (error) {
    console.error(
      `[prepareEnvironment] Error al crear/asegurar '${SRC_DIRECTORY}':`,
      error
    );
    process.exit(1);
  }
}

(async () => {
  await prepareEnvironment();
  await main();
})();
