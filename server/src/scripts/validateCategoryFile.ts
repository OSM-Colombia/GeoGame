import { CategorySchema } from '../schemas/categorySchema';
import * as fs from 'fs';
import * as path from 'path';

const validateCategoryFile = (filePath: string) => {
  try {
    // Leer el archivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const categoryData = JSON.parse(fileContent);

    // Validar usando el esquema
    const result = CategorySchema.safeParse(categoryData);

    if (result.success) {
      console.log('✅ El archivo es válido');
      return true;
    } else {
      console.error('❌ El archivo no es válido:');
      result.error.errors.forEach((err, index) => {
        console.error(`\nError ${index + 1}:`);
        console.error(`  Campo: ${err.path.join('.')}`);
        console.error(`  Mensaje: ${err.message}`);
      });
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error al validar el archivo:', error.message);
    } else {
      console.error('❌ Error desconocido al validar el archivo');
    }
    return false;
  }
};

// Si se ejecuta directamente
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Por favor, proporciona la ruta del archivo a validar');
    process.exit(1);
  }

  const isValid = validateCategoryFile(filePath);
  process.exit(isValid ? 0 : 1);
}

export { validateCategoryFile }; 