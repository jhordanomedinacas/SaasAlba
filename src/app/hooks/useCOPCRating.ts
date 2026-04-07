// Sistema de Calificaciones COPC — migrado desde Varian Assist (JAK 1.0)

export interface COPCEvaluation {
  scores: Record<string, number>;
  totalScore: number;
  rating: string;
  feedback: string;
  recommendations: string[];
  details: Record<string, string>;
  spellErrors: { wrong: string; count: number }[];
  foundPenalties: { type: string; phrase: string }[];
}

interface Message {
  sender: 'customer' | 'agent';
  text: string;
  timestamp?: number;
}

const criteria = {
  cortesia: {
    name: 'Cortesía y Profesionalismo',
    weight: 20,
    indicators: {
      saludo: {
        phrases: ['hola', 'buenos días', 'buenas tardes', 'buenas tardes, estoy aqui para ayudarte', 'buenas noches', 'bienvenido', 'gracias por contactarnos'],
        points: 5,
      },
      despedida: {
        phrases: ['gracias', 'que tenga buen día', 'espero haber ayudado', 'quedamos a su disposición', 'hasta pronto'],
        points: 5,
      },
      disculpas: {
        phrases: ['disculpe', 'lamento', 'lo lamento', 'lamento realmente la situación', 'perdón', 'sentimos', 'me disculpo', 'disculpas por', 'lamentamos'],
        points: 10,
      },
    },
  },
  contencion: {
    name: 'Técnicas de Contención',
    weight: 25,
    indicators: {
      empatia: {
        phrases: ['entiendo', 'lamento lo que me comentas', 'lamento la demora presentada', 'las disculpas por el mal rato que has pasado', 'estoy aqui para ayudarle', 'lamento realmente lo sucedido', 'comprendo', 'me imagino', 'sé como se siente', 'puedo entender', 'entiendo su frustración', 'comprendo su molestia'],
        points: 10,
      },
      validacion: {
        phrases: ['tiene razón', 'es comprensible', 'esto es algo que no sucede', 'me pongo en tu lugar', 'entiendo tu molestia', 'es entendible', 'es válido', 'efectivamente', 'ciertamente'],
        points: 8,
      },
      tranquilizar: {
        phrases: ['vamos a solucionarlo', 'mi intención es ayudarte', 'me haré cargo', 'voy a ayudarle', 'podemos resolver esto', 'encontraremos una solución'],
        points: 7,
      },
    },
  },
  resolucion: {
    name: 'Orientación a la Resolución',
    weight: 30,
    indicators: {
      solucion_directa: {
        phrases: ['voy a', 'puedo hacer', 'le ofrezco', 'la solución es', 'procederé a', 'realizaré', 'gestionaré'],
        points: 15,
      },
      alternativas: {
        phrases: ['otra opción', 'también podemos', 'se podría', 'alternativamente', 'como alternativa', 'otra posibilidad'],
        points: 10,
      },
      seguimiento: {
        phrases: ['le daré seguimiento', 'estaré pendiente', 'le confirmaré', 'le informaré', 'mantendré contacto'],
        points: 5,
      },
    },
  },
  comunicacion: {
    name: 'Calidad de Comunicación',
    weight: 15,
    indicators: {
      claridad: {
        phrases: ['es decir', 'quiero explicarle', 'esto significa', 'para aclarar', 'específicamente', 'en otras palabras'],
        points: 5,
      },
      confirmacion: {
        phrases: ['confirmó', 'verificó', 'entendí que', 'para confirmar', 'correcto', 'exacto'],
        points: 5,
      },
      informacion: {
        phrases: ['le explico', 'le informo', 'debe saber', 'es importante', 'tenga en cuenta'],
        points: 5,
      },
    },
  },
  eficiencia: {
    name: 'Eficiencia y Tiempo',
    weight: 10,
    indicators: {
      tiempo_respuesta: {
        threshold: 50,
        points: 10,
      },
    },
  },
} as const;

type CriteriaKey = keyof typeof criteria;

const penalizaciones = {
  frases_negativas: {
    phrases: ['no puedo', 'delivery', 'pickup', 'no me figura en el sistema', 'no se', 'issue', 'partner', 'vendor', 'feedback', 'es imposible', 'no se puede', 'está prohibido', 'no está permitido', 'es política', 'no tengo autorización'],
    penalty: -5,
  },
  falta_empatia: {
    phrases: ['es normal', 'lamentablemente', 'desafortunadamente', 'tristemente', 'penosamente', 'lastimosamente', 'es común', 'siempre pasa', 'no es para tanto', 'cálmese', 'tranquilo'],
    penalty: -8,
  },
  derivacion_innecesaria: {
    phrases: ['otra área', 'no es mi departamento', 'no tengo sistema', 'debo transferirte', 'debe llamar a', 'no corresponde'],
    penalty: -10,
  },
};

const spellErrorsList = [
  'dia', 'dias', 'solucion', 'soluciones', 'informacion', 'informaciones',
  'numero', 'numeros', 'gestion', 'gestiones', 'perdon', 'entendio',
  'nesecito', 'nesesito', 'recibio', 'recibimos', 'demas',
  'accion', 'atencion', 'comunicacion', 'resolucion',
];

function getSpellErrors(messages: Message[]) {
  const fullText = messages
    .filter(m => m.sender === 'agent')
    .map(m => m.text.toLowerCase())
    .join(' ');

  return spellErrorsList
    .map(wrong => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      const matches = fullText.match(regex) || [];
      return matches.length > 0 ? { wrong, count: matches.length } : null;
    })
    .filter(Boolean) as { wrong: string; count: number }[];
}

function getFoundPenalties(messages: Message[]) {
  const fullText = messages
    .filter(m => m.sender === 'agent')
    .map(m => m.text.toLowerCase())
    .join(' ');

  const found: { type: string; phrase: string }[] = [];
  Object.entries(penalizaciones).forEach(([type, pen]) => {
    pen.phrases.forEach(phrase => {
      if (fullText.includes(phrase.toLowerCase())) {
        found.push({ type, phrase });
      }
    });
  });
  return found;
}

function evaluateCriteria(key: CriteriaKey, messages: Message[], responseTimes?: number[]): number {
  if (key === 'eficiencia') {
    if (!responseTimes || responseTimes.length === 0) return 0;
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const avgSeconds = avg / 1000;
    const threshold = 50;
    if (avgSeconds <= threshold) return 100;
    if (avgSeconds <= threshold * 2) return 75;
    if (avgSeconds <= threshold * 3) return 50;
    if (avgSeconds <= threshold * 4) return 25;
    return 0;
  }

  const c = criteria[key] as { name: string; weight: number; indicators: Record<string, { phrases: readonly string[]; points: number }> };
  const fullText = messages
    .filter(m => m.sender === 'agent')
    .map(m => m.text.toLowerCase())
    .join(' ');

  let score = 0;
  let maxScore = 0;

  Object.values(c.indicators).forEach(indicator => {
    maxScore += indicator.points;
    const found = indicator.phrases.some(phrase => fullText.includes(phrase.toLowerCase()));
    if (found) score += indicator.points;
  });

  // Apply penalties
  Object.values(penalizaciones).forEach(pen => {
    pen.phrases.forEach(phrase => {
      if (fullText.includes(phrase.toLowerCase())) {
        score += pen.penalty;
      }
    });
  });

  if (maxScore === 0) return 0;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

function calculateWeightedScore(scores: Record<string, number>): number {
  let totalWeighted = 0;
  let totalWeight = 0;
  Object.entries(scores).forEach(([key, score]) => {
    const weight = criteria[key as CriteriaKey].weight;
    totalWeighted += score * weight;
    totalWeight += weight;
  });
  return Math.round(totalWeighted / totalWeight);
}

function getRating(score: number): string {
  if (score >= 90) return 'EXCELENTE';
  if (score >= 80) return 'BUENO';
  if (score >= 70) return 'SATISFACTORIO';
  if (score >= 60) return 'NECESITA MEJORA';
  return 'INSATISFACTORIO';
}

function generateFeedback(
  totalScore: number,
  scores: Record<string, number>,
  spellErrors: { wrong: string; count: number }[],
  foundPenalties: { type: string; phrase: string }[]
): string {
  let feedback = '';

  if (totalScore >= 90) {
    feedback = 'Excelente gestión, continúa así. Demostraste excelente dominio de las competencias de atención al cliente, no olvides realizar la revisión de tu knowledge.';
  } else if (totalScore >= 80) {
    feedback = 'Buen desempeño general. Cumple con los estándares COPC con oportunidades menores de mejora.';
  } else if (totalScore >= 70) {
    feedback = 'Desempeño satisfactorio. Cumple parcialmente con los lineamientos COPC pero requiere refuerzo en áreas específicas.';
  } else if (totalScore >= 60) {
    feedback = 'Desempeño por debajo del estándar. Necesita entrenamiento adicional en competencias COPC fundamentales.';
  } else {
    feedback = 'Desempeño insatisfactorio. Requiere entrenamiento intensivo y seguimiento cercano para cumplir estándares COPC. Recuerda que este bot está entrenado para reaccionar de forma molesta a cada frase que escribas, por lo que debemos seguir practicando en nuestras técnicas de contención. Confiamos que con práctica constante lo lograrás.';
  }

  const strongAreas = Object.keys(scores).filter(k => scores[k] >= 80);
  const weakAreas = Object.keys(scores).filter(k => scores[k] < 60);

  if (strongAreas.length > 0) {
    feedback += `\n\nFortalezas: ${strongAreas.map(k => criteria[k as CriteriaKey].name).join(', ')}.`;
  }

  if (weakAreas.length > 0) {
    feedback += `\n\nÁreas de mejora críticas: ${weakAreas.map(k => criteria[k as CriteriaKey].name).join(', ')}.`;
  }

  const totalSpellCount = spellErrors.reduce((sum, e) => sum + e.count, 0);
  if (totalSpellCount > 0) {
    feedback += `\n\nErrores ortográficos detectados (${totalSpellCount}): ${spellErrors.map(e => `${e.wrong} (${e.count})`).join(', ')}.`;
  }

  if (foundPenalties.length > 0) {
    feedback += `\n\nPenalizaciones detectadas: ${foundPenalties.map(f => `"${f.phrase}"`).join(', ')}.`;
  }

  return feedback;
}

function generateRecommendations(
  scores: Record<string, number>,
  spellErrors: { wrong: string; count: number }[],
  foundPenalties: { type: string; phrase: string }[]
): string[] {
  const recs: string[] = [];

  Object.entries(scores).forEach(([key, score]) => {
    if (score < 60) {
      switch (key) {
        case 'cortesia':
          recs.push('Entrenamiento en protocolo de cortesía: saludo inicial, agradecer al retomar el chat y despedirse apropiadamente.');
          recs.push('Practicar uso de disculpas sinceras y oportunas.');
          break;
        case 'contencion':
          recs.push('Curso y prácticas de técnicas de empatía y contención emocional.');
          recs.push('Entrenamiento en validación de emociones del cliente.');
          break;
        case 'resolucion':
          recs.push('Capacitación en resolución proactiva de problemas; siempre ofrecer diferentes opciones al cliente.');
          recs.push('Entrenamiento en generación de alternativas de solución.');
          break;
        case 'comunicacion':
          recs.push('Taller de comunicación clara y confirmación de entendimiento. Las tildes y comas también son evaluadas.');
          recs.push('Práctica en técnicas de explicación y clarificación.');
          break;
        case 'eficiencia':
          recs.push('Entrenamiento en gestión de tiempo y respuesta ágil.');
          recs.push('Optimización de procesos de atención.');
          break;
      }
    } else if (score >= 80) {
      recs.push(`Mantener excelente nivel en ${criteria[key as CriteriaKey].name}.`);
    }
  });

  const totalSpellCount = spellErrors.reduce((sum, e) => sum + e.count, 0);
  if (totalSpellCount > 0) {
    recs.push('Práctica de ortografía y uso de acentos en comunicaciones escritas.');
  }

  if (foundPenalties.length > 0) {
    recs.push('Evitar las frases penalizadas detectadas para mejorar la puntuación.');
  }

  const totalScore = calculateWeightedScore(scores);
  if (totalScore < 70) {
    recs.push('Reentrenamiento integral en estándares COPC.');
    recs.push('Asignación de mentor senior para coaching directo.');
    recs.push('Seguimiento semanal de mejora.');
  }

  return recs;
}

export function evaluateConversation(messages: Message[], responseTimes?: number[]): COPCEvaluation {
  const scores: Record<string, number> = {};
  const details: Record<string, string> = {};

  (Object.keys(criteria) as CriteriaKey[]).forEach(key => {
    const score = evaluateCriteria(key, messages, responseTimes);
    scores[key] = score;
    const name = criteria[key].name;
    if (score >= 80) details[key] = `Excelente desempeño en ${name}`;
    else if (score >= 60) details[key] = `Desempeño aceptable en ${name} con oportunidades de mejora`;
    else details[key] = `Requiere mejora significativa en ${name}`;
  });

  const spellErrors = getSpellErrors(messages);
  const foundPenalties = getFoundPenalties(messages);

  // Penalizar comunicación por errores ortográficos
  const totalSpellCount = spellErrors.reduce((sum, e) => sum + e.count, 0);
  scores.comunicacion = Math.max(0, scores.comunicacion - totalSpellCount * 3);

  const totalScore = calculateWeightedScore(scores);
  const rating = getRating(totalScore);
  const feedback = generateFeedback(totalScore, scores, spellErrors, foundPenalties);
  const recommendations = generateRecommendations(scores, spellErrors, foundPenalties);

  return { scores, totalScore, rating, feedback, recommendations, details, spellErrors, foundPenalties };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#f59e0b';
  if (score >= 60) return '#ef4444';
  return '#dc2626';
}

export { criteria };
