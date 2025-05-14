import fs from 'fs';
import path from 'path';
import { OverpassService } from '../services/overpass.service';

async function validateCategory(categoryPath: string) {
  try {
    // Leer el archivo de categoría
    const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));
    const overpassService = new OverpassService();

    console.log(`Validando categoría: ${categoryData.name}`);
    console.log('----------------------------------------');

    // Validar cada pregunta
    for (const question of categoryData.questions) {
      console.log(`\nValidando pregunta: ${question.title}`);
      
      if (question.type === 'position' && question.osmQuery) {
        const result = await overpassService.validateAndGetArea(question.osmQuery);
        
        if (!result.isValid) {
          console.error(`❌ Query inválida para ${question.title}`);
          console.error(`Query: ${question.osmQuery}`);
          continue;
        }

        if (!result.center) {
          console.error(`❌ No se pudo obtener el centro para ${question.title}`);
          continue;
        }

        // Actualizar la posición en el archivo si es necesario
        if (!question.answer?.position || 
            question.answer.position.lat !== result.center.lat || 
            question.answer.position.lng !== result.center.lng) {
          question.answer = {
            ...question.answer,
            position: result.center
          };
          console.log(`✅ Posición actualizada para ${question.title}`);
          console.log(`   Lat: ${result.center.lat}, Lng: ${result.center.lng}`);
        } else {
          console.log(`✅ Posición válida para ${question.title}`);
        }
      } else {
        console.log(`⚠️ Pregunta no es de tipo posición o no tiene query OSM`);
      }
    }

    // Guardar el archivo actualizado
    fs.writeFileSync(
      categoryPath,
      JSON.stringify(categoryData, null, 2),
      'utf-8'
    );

    console.log('\n----------------------------------------');
    console.log('Validación completada');
  } catch (error) {
    console.error('Error validando categoría:', error);
  }
}

// Ejecutar la validación si se llama directamente
if (require.main === module) {
  const categoryPath = process.argv[2];
  if (!categoryPath) {
    console.error('Por favor, proporciona la ruta al archivo de categoría');
    process.exit(1);
  }

  validateCategory(categoryPath)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { validateCategory }; 