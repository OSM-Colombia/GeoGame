import { z } from "zod";

// Esquema para Option (opción de pregunta)
const OptionSchema = z.object({
  text: z.string()
    .min(1, "El texto de la opción no puede estar vacío")
    .max(200, "El texto de la opción no puede tener más de 200 caracteres")
    .transform(val => val.trim()),
  isCorrect: z.boolean()
});

// Esquema para Hint (pista)
const HintSchema = z.object({
  _id: z.string()
    .min(1, "El id no puede estar vacío")
    .max(50, "El id no puede tener más de 50 caracteres"),
  text: z.string()
    .min(5, "El texto de la pista debe tener al menos 5 caracteres")
    .max(500, "El texto de la pista no puede tener más de 500 caracteres")
    .transform(val => val.trim()),
  penalty: z.number()
    .int("La penalización debe ser un número entero")
    .min(0, "La penalización no puede ser negativa")
    .max(50, "La penalización no puede ser mayor a 50 puntos")
});

// Esquema para OsmTag (etiqueta de OSM)
const OsmTagSchema = z.object({
  key: z.string()
    .min(1, "La clave no puede estar vacía")
    .max(100, "La clave no puede tener más de 100 caracteres")
    .regex(/^[a-zA-Z0-9_:]+$/, "La clave solo puede contener letras, números, guiones bajos y dos puntos")
    .transform(val => val.trim()),
  value: z.string()
    .min(1, "El valor no puede estar vacío")
    .max(255, "El valor no puede tener más de 255 caracteres")
    .transform(val => val.trim())
});

// Esquema para Question (pregunta)
const QuestionSchema = z.object({
  questionId: z.string()
    .min(1, "El id no puede estar vacío")
    .max(50, "El id no puede tener más de 50 caracteres"),
  type: z.enum(["position", "multiple", "text"]),
  title: z.string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(200, "El título no puede tener más de 200 caracteres")
    .transform(val => val.trim()),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede tener más de 1000 caracteres")
    .transform(val => val.trim()),
  image: z.string()
    .url("La imagen debe ser una URL válida")
    .startsWith("http", "La URL de la imagen debe usar HTTPS")
    .optional(),
  options: z.array(OptionSchema)
    .min(2, "Debe haber al menos 2 opciones")
    .max(6, "No puede haber más de 6 opciones")
    .refine(options => options.some(opt => opt.isCorrect), "Debe haber al menos una opción correcta")
    .optional()
    .superRefine((options, ctx) => {
      const questionType = (ctx.path[0] === 'options' ? ctx.path[1] : ctx.path[0]) as string;
      if (questionType === "multiple" && !options) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Las preguntas de opción múltiple deben tener opciones"
        });
      }
    }),
  answer: z.object({
    position: z.object({
      lat: z.number()
        .min(-90, "La latitud debe estar entre -90 y 90")
        .max(90, "La latitud debe estar entre -90 y 90"),
      lng: z.number()
        .min(-180, "La longitud debe estar entre -180 y 180")
        .max(180, "La longitud debe estar entre -180 y 180"),
      radius: z.number()
        .min(0, "El radio debe ser positivo")
        .max(100000, "El radio no puede ser mayor a 100km")
        .optional()
    }).optional(),
    text: z.string()
      .min(1, "La respuesta de texto no puede estar vacía")
      .max(200, "La respuesta de texto no puede tener más de 200 caracteres")
      .transform(val => val.trim())
      .optional(),
    multipleChoice: z.number()
      .int("La opción seleccionada debe ser un número entero")
      .min(0, "La opción seleccionada debe ser un índice válido")
      .optional()
  }).superRefine((answer, ctx) => {
    let questionTypePath = ctx.path;
    let questionObjectCandidate = answer;
    
    let questionType;

    if (questionType === "text" && !answer.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las preguntas de texto deben tener una respuesta de texto"
      });
    }
    if (questionType === "multiple" && answer.multipleChoice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las preguntas de opción múltiple deben tener una opción seleccionada"
      });
    }
  }),
  source: z.string()
    .min(1, "La fuente no puede estar vacía")
    .max(200, "La fuente no puede tener más de 200 caracteres")
    .transform(val => val.trim()),
  difficulty: z.enum(["easy", "medium", "hard"]),
  duration: z.number()
    .int("La duración debe ser un número entero")
    .min(10, "La duración mínima es 10 segundos")
    .max(300, "La duración máxima es 5 minutos"),
  hints: z.array(HintSchema)
    .max(3, "No puede haber más de 3 pistas")
    .refine(hints => hints.every(hint => hint.penalty >= 0), "Las penalizaciones no pueden ser negativas"),
  osmTags: z.array(OsmTagSchema)
    .min(1, "Debe haber al menos una etiqueta OSM")
    .max(10, "No puede haber más de 10 etiquetas OSM")
});

// Esquema para Category (categoría)
const CategorySchema = z.object({
  categoryId: z.string()
    .min(1, "El id no puede estar vacío")
    .max(50, "El id no puede tener más de 50 caracteres")
    .regex(/^[a-zA-Z0-9]+$/, "El id solo puede contener letras y números")
    .refine(val => !val.includes('-'), {
      message: "El id de la categoría no debe contener guiones (-)"
    }),
  name: z.string()
    .min(1, "El nombre no puede estar vacío")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .transform(val => val.trim()),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .transform(val => val.trim()),
  image: z.string()
    .url("La imagen debe ser una URL válida")
    .startsWith("http", "La URL de la imagen debe usar HTTPS"),
  questions: z.array(QuestionSchema)
    .min(1, "La categoría debe tener al menos una pregunta")
    .max(50, "La categoría no puede tener más de 50 preguntas"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimit: z.number()
    .int("El tiempo límite debe ser un número entero")
    .min(30, "El tiempo límite mínimo es 30 segundos")
    .max(3600, "El tiempo límite máximo es 1 hora (3600 segundos)"),
  minScore: z.number()
    .int("La puntuación mínima debe ser un número entero")
    .min(0, "La puntuación mínima no puede ser negativa")
    .max(100, "La puntuación mínima no puede ser mayor a 100"),
  osmArea: z.object({
    type: z.enum(["Polygon", "MultiPolygon"]),
    coordinates: z.array(z.array(z.array(z.number())))
      .refine(coords => coords.length > 0, "El área debe tener al menos un polígono")
      .refine(coords => coords.every(polygon => polygon.length >= 3), "Cada polígono debe tener al menos 3 puntos")
      .refine(coords => coords.every(polygon => polygon.every(point => point.length === 2)), "Cada punto debe tener latitud y longitud")
      .refine(coords => coords.every(polygon => polygon.every(point => 
        point[0] >= -90 && point[0] <= 90 && point[1] >= -180 && point[1] <= 180
      )), "Las coordenadas deben ser válidas (lat: -90 a 90, lng: -180 a 180)")
  }),
  tags: z.array(z.string())
    .min(1, "Debe haber al menos una etiqueta")
    .max(10, "No puede haber más de 10 etiquetas")
    .transform(tags => tags.map(tag => tag.trim().toLowerCase())),
  isActive: z.boolean()
});

export { CategorySchema, QuestionSchema, HintSchema, OsmTagSchema, OptionSchema }; 