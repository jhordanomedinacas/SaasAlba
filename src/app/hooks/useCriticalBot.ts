// Bot simulador de cliente crítico — migrado desde Varian Assist (java.js)

type ScenarioKey =
  | 'orden_cancelada_sin_aviso'
  | 'rider_no_se_mueve'
  | 'rider_malcriado'
  | 'demora_extrema_cupon'
  | 'orden_marcada_entregada'
  | 'error_pickup_delivery';

// Mapeo de perfil de cliente → escenario del bot
const SCENARIO_BY_PROFILE: Record<string, ScenarioKey> = {
  'Cliente Agresivo':    'rider_malcriado',
  'Cliente Ansioso':     'rider_no_se_mueve',
  'Cliente Confundido':  'error_pickup_delivery',
  'Cliente Exigente':    'demora_extrema_cupon',
  'Cliente Pasivo':      'orden_marcada_entregada',
  'Cliente Manipulador': 'orden_cancelada_sin_aviso',
};

const RANDOM_NAMES = [
  'María', 'Carlos', 'Ana', 'Roberto', 'Patricia', 'Luis',
  'Carmen', 'Diego', 'Sofía', 'Miguel', 'Valentina', 'Alejandro',
];

const ESCALATION_RESPONSES: Record<ScenarioKey, Record<number, string[]>> = {
  orden_cancelada_sin_aviso: {
    1: [
      '¿Cómo que CANCELADA? ¡Nadie me avisó NADA! ¡Estuve esperando 2 HORAS!',
      '¡Esto es increíble! ¿Por qué cancelaron mi orden sin decirme?',
      '¡No entiendo NADA! ¿Quién canceló mi pedido? ¡Yo no autoricé eso!',
      '¿En serio? ¿Cancelada? ¡Pero si yo seguía viendo que estaba "en preparación"!',
      '¡Qué falta de respeto! ¿Cómo pueden cancelar sin avisar al cliente?',
    ],
    2: [
      '¡NO me vengan con que "el sistema"! ¡Son USTEDES los que manejan el sistema!',
      '¿"Otra área"? ¡Me vale quién haya sido! ¡YO soy el cliente y merezco respeto!',
      '¡Basta de excusas! ¡Quiero que me expliquen POR QUÉ pasó esto!',
      '¡Esta empresa está DESORGANIZADA! ¡La mano derecha no sabe qué hace la izquierda!',
      '¿"Verificar"? ¡Ya verifica que me devuelvan mi dinero AHORA!',
    ],
    3: [
      '¡Su empresa es un CAOS! ¡No saben ni lo que hacen!',
      '¡Voy a reportar esta INCOMPETENCIA en redes sociales!',
      '¡Quiero hablar con el GERENTE! ¡Ustedes no resuelven NADA!',
      '¡Esto es FRAUDE! ¡Me cobraron y cancelaron sin avisar!',
      '¡JAMÁS vuelvo a usar esta app! ¡Son unos IRRESPONSABLES!',
    ],
    4: [
      '¡YA LLAMÉ A DEFENSA AL CONSUMIDOR! ¡Esto es ABUSO!',
      '¡Mi abogado ya está preparando la denuncia! ¡Se van a arrepentir!',
      '¡Son una empresa de MENTIROSOS! ¡Ojalá los clausuren!',
      '¡El supervisor también es un INÚTIL! ¡Nadie resuelve aquí!',
    ],
    5: [
      '¡BASTA! ¡NO SIRVEN PARA NADA! ¡CIERREN SU EMPRESA!',
      '¡ESTAFADORES! ¡ESO ES LO QUE SON! ¡LADRONES!',
      '¡YA NO LES HABLO MÁS! ¡Nos vemos en los TRIBUNALES!',
      '¡OJALÁ SE HUNDAN! ¡EMPRESA DE BASURA!',
    ],
  },
  rider_no_se_mueve: {
    1: [
      '¡Mi repartidor lleva 45 MINUTOS en el mismo lugar! ¿Qué está pasando?',
      '¿Por qué el GPS muestra que no se ha movido? ¡Algo anda mal!',
      '¡El tipo está PARADO! ¿Se quedó sin gasolina o qué?',
      '¡Ya van 30 minutos y sigue en la misma esquina! ¡Necesito respuestas!',
      '¿El repartidor tuvo un accidente? ¡Por favor confirmen!',
    ],
    2: [
      '¡NO me digan que "están verificando"! ¡Es obvio que algo pasó!',
      '¿"Contactar al repartidor"? ¡Ya deberían haberlo hecho hace rato!',
      '¡Mi comida se está PUDRIENDO ahí! ¡Hagan algo YA!',
      '¡Si tuvo un accidente, asígnenme otro repartidor!',
      '¡Están perdiendo el tiempo mientras mi pedido se echa a perder!',
    ],
    3: [
      '¡UNA HORA sin moverse! ¡Esto es RIDÍCULO!',
      '¡Cancelen todo! ¡Obviamente ese repartidor no va a venir!',
      '¡Su sistema de seguimiento es una MENTIRA!',
      '¡Ya no me importa si tuvo un accidente! ¡Quiero mi dinero!',
      '¡Esta empresa no sirve para EMERGENCIAS!',
    ],
    4: [
      '¡DOS HORAS esperando! ¡Y ustedes "verificando"! ¡INÚTILES!',
      '¡Ya ordené en otro lado! ¡Cuando llegue su rider lo voy a rechazar!',
      '¡Voy a reportar esto como NEGLIGENCIA!',
      '¡NUNCA más uso esta app! ¡Son IRRESPONSABLES!',
    ],
    5: [
      '¡SE ACABÓ! ¡Su empresa es una PORQUERÍA!',
      '¡CRIMINALES! ¡No les importa ni sus empleados ni sus clientes!',
      '¡NO ME ESCRIBAN MÁS! ¡Ya reporté todo!',
      '¡QUE SE JODAN! ¡EMPRESA NEGLIGENTE!',
    ],
  },
  rider_malcriado: {
    1: [
      '¡El repartidor se NIEGA a subir a mi departamento! ¡Dice que tengo que bajar!',
      '¡Qué grosero! ¡Me dijo que la zona es "muy peligrosa" para él!',
      '¡El delivery llegó con la bolsa ROTA y el repartidor se molestó cuando le reclamé!',
      '¡Falta la mitad de mi pedido y el repartidor dice que "así se lo dieron"!',
      '¡El tipo me está gritando porque no quiero recibir la comida maltratada!',
    ],
    2: [
      '¡NO es MI problema que tenga miedo! ¡Para eso le pagan!',
      '¿"Hablar con el repartidor"? ¡Ya hablé! ¡Está siendo un GROSERO!',
      '¡Yo PAGUÉ por un servicio completo! ¡No por que me griten!',
      '¡El empaque está DESTRUÍDO y él se enoja conmigo!',
      '¡Estoy HARTA de estos repartidores malcriados!',
    ],
    3: [
      '¡Su repartidor es un PATÁN! ¡Deberían despedirlo!',
      '¡ME ESTÁ INSULTANDO! ¡Esto es INACEPTABLE!',
      '¡Ya subí el video a TikTok! ¡Todo mundo va a ver qué clase de gente contratan!',
      '¡Llamen a la POLICÍA! ¡Este tipo me está amenazando!',
      '¡Su empleado es un DELINCUENTE! ¡No puede trabajar en servicio al cliente!',
    ],
    4: [
      '¡El video ya tiene 50,000 views! ¡Su empresa es trending por MALA!',
      '¡Ya reporté al rider por ACOSO! ¡Espero que lo arresten!',
      '¡Contrata CRIMINALES! ¡Son un peligro para la sociedad!',
      '¡TERRORISTAS! ¡Así son sus empleados!',
    ],
    5: [
      '¡LACRAS! ¡Su empresa está llena de LACRAS!',
      '¡Espero que LOS METAN PRESOS a todos!',
      '¡YA NO LES DIRIJO LA PALABRA! ¡CRIMINALES!',
      '¡QUE SE JODAN TODOS! ¡EMPRESA DE DELINCUENTES!',
    ],
  },
  demora_extrema_cupon: {
    1: [
      '¡TRES HORAS esperando! ¡Quiero un cupón de descuento por esta HUMILLACIÓN!',
      '¡Esto es INACEPTABLE! ¡Deberían darme mi próximo pedido GRATIS!',
      '¡Mi familia está con HAMBRE! ¡Lo mínimo es un cupón por las molestias!',
      '¡Perdí toda mi tarde! ¡Compénsenme con algo!',
      '¡Llevo 4 HORAS! ¡Merezco una compensación!',
    ],
    2: [
      '¿"No pueden dar cupones"? ¡Eso es MENTIRA! ¡Otras veces me han dado!',
      '¡NO me vengan con excusas! ¡Ustedes TIENEN que compensarme!',
      '¿"El sistema no permite"? ¡Entonces su sistema está MAL!',
      '¡Busquen la FORMA! ¡Para eso son ASESORES!',
      '¡Si no pueden dar cupones para QUÉ sirven!',
    ],
    3: [
      '¡Su SISTEMA es una BASURA! ¡Todo está mal programado!',
      '¡En Uber Eats SÍ me compensan! ¡Ustedes son unos TACAÑOS!',
      '¡Voy a cambiarme de app! ¡Esta no sirve!',
      '¡EXIJO hablar con un SUPERVISOR que SÍ pueda dar cupones!',
      '¡Están PERDIENDO un cliente por ser MISERABLES!',
    ],
    4: [
      '¡Ya ordené en RAPPI! ¡Me llegó en 30 minutos y con descuento!',
      '¡Su competencia SÍ sabe tratar a los clientes!',
      '¡NUNCA más uso esta app! ¡Son AVAROS!',
      '¡Le voy a decir a TODOS que cambien de app!',
    ],
    5: [
      '¡BASURA DE EMPRESA! ¡No dan ni las gracias!',
      '¡MISERABLES! ¡Ojalá los demanden hasta cerrarlos!',
      '¡SE JODAN! ¡Ya me borré la app!',
      '¡QUE SE HUNDAN! ¡APP DE RATAS!',
    ],
  },
  orden_marcada_entregada: {
    1: [
      '¡Mi orden dice "ENTREGADA" pero aquí NO llegó NADA! ¡Esto es ROBO!',
      '¡El repartidor marcó como entregado y ni siquiera tocó mi puerta!',
      '¡SE ROBARON mi comida! ¡Quiero mi dinero AHORA MISMO!',
      '¡Esto es FRAUDE! ¡Cobraron y no entregaron!',
      '¡Vi al repartidor irse sin bajar de la moto! ¡ES UN LADRÓN!',
    ],
    2: [
      '¡NO quiero esperar 7 días! ¡Quiero mi dinero HOY!',
      '¿"Depende del banco"? ¡ESE no es MI problema! ¡Es problema de USTEDES!',
      '¡Ustedes me ROBARON! ¡Deben devolver INMEDIATAMENTE!',
      '¡No me importa su proceso! ¡Ustedes me estafaron!',
      '¡Tengo HAMBRE AHORA! ¡No en una semana!',
    ],
    3: [
      '¡LADRONES! ¡Su empresa es una BANDA de ladrones!',
      '¡Voy a reportar esto como ESTAFA MASIVA!',
      '¡Ya llamé al banco! ¡Van a investigar su empresa!',
      '¡NUNCA había visto tanto descaro! ¡ROBAN y se hacen los tontos!',
    ],
    4: [
      '¡El banco ya inició la investigación! ¡Se van a joder!',
      '¡Ya está en Facebook! ¡Todo mundo sabe que son LADRONES!',
      '¡Mi abogado dice que es FRAUDE AGRAVADO!',
      '¡Van a CERRAR su empresa por estafadores!',
    ],
    5: [
      '¡BANDA DE CRIMINALES! ¡Eso son!',
      '¡Que los ARRESTEN! ¡DELINCUENTES!',
      '¡SE ACABÓ! ¡Ya no les hablo! ¡ESTAFADORES!',
      '¡QUE SE PUDRAN EN LA CÁRCEL!',
    ],
  },
  error_pickup_delivery: {
    1: [
      '¡Yo NO elegí PICKUP! ¡Yo quería que me trajeran la comida!',
      '¡Esto está MAL! ¿Por qué tengo que ir YO a buscar mi pedido?',
      '¡No entiendo! ¡Siempre me traen la comida a casa!',
      '¡Su app está FALLANDO! ¡Yo marqué DELIVERY!',
      '¡No puedo salir de casa! ¡Por eso pedí delivery!',
    ],
    2: [
      '¡NO fue MI error! ¡Su app confunde a la gente!',
      '¿"Elegí pickup"? ¡Eso es IMPOSIBLE! ¡Yo no soy idiota!',
      '¡Basta de echarme la culpa! ¡Su aplicación está MAL diseñada!',
      '¡Si fuera pickup, ¿para qué puse mi DIRECCIÓN?',
      '¡No voy a ir a buscar NADA! ¡Cumplan con su trabajo!',
    ],
    3: [
      '¡Su app es una BASURA! ¡Confunde a los clientes!',
      '¡NO voy a hacer una nueva orden! ¡Arreglen ESTA!',
      '¡En las otras apps NO pasa esto! ¡Su tecnología apesta!',
      '¡EXIJO que me traigan mi comida! ¡NO voy a salir!',
    ],
    4: [
      '¡Ya descargué Uber Eats! ¡Allá SÍ funciona bien!',
      '¡Su app es un ENGAÑO! ¡Confunde a propósito!',
      '¡BORREN su aplicación! ¡No sirve para NADA!',
      '¡Voy a demandarlos por PUBLICIDAD ENGAÑOSA!',
    ],
    5: [
      '¡APP DE MIERDA! ¡No sirve para nada!',
      '¡ESTAFADORES! ¡Engañan con sus opciones!',
      '¡SE JODAN! ¡Ya me cambié de aplicación!',
      '¡BASURA DE EMPRESA! ¡Ojalá los cierren!',
    ],
  },
};

const SCENARIO_ORDER_DATA: Record<ScenarioKey, {
  partnerName: string; vertical: string; deliveryType: string;
  paymentMethod: string; tags: string[];
}> = {
  orden_cancelada_sin_aviso: { partnerName: 'Burger Palace',  vertical: 'Restaurantes', deliveryType: 'Platform delivery', paymentMethod: 'Visa débito',         tags: ['cancelado'] },
  rider_no_se_mueve:         { partnerName: 'PizzaTime',      vertical: 'Restaurantes', deliveryType: 'Platform delivery', paymentMethod: 'Mastercard crédito',   tags: ['demora extrema'] },
  rider_malcriado:           { partnerName: 'SushiGo',        vertical: 'Restaurantes', deliveryType: 'Platform delivery', paymentMethod: 'Yape',                 tags: ['reclamo rider'] },
  demora_extrema_cupon:      { partnerName: 'McDonald\'s',    vertical: 'Restaurantes', deliveryType: 'Platform delivery', paymentMethod: 'Efectivo',             tags: ['demora', 'cupón'] },
  orden_marcada_entregada:   { partnerName: 'KFC',            vertical: 'Restaurantes', deliveryType: 'Platform delivery', paymentMethod: 'Visa crédito',         tags: ['no entregado'] },
  error_pickup_delivery:     { partnerName: 'Bembos',         vertical: 'Restaurantes', deliveryType: 'Pickup',           paymentMethod: 'Mastercard débito',     tags: ['pickup', 'error'] },
};

const SCENARIO_TRIGGERS: Record<ScenarioKey, string[]> = {
  orden_cancelada_sin_aviso: ['otra área', 'sistema', 'verificar', 'no sabía'],
  rider_no_se_mueve:         ['contactar', 'verificar', 'accidente', 'esperar'],
  rider_malcriado:           ['hablar con el repartidor', 'política', 'no es culpa nuestra'],
  demora_extrema_cupon:      ['sistema no permite', 'no puedo dar', 'política'],
  orden_marcada_entregada:   ['proceso del banco', '7 días', 'devolver'],
  error_pickup_delivery:     ['elegiste pickup', 'nueva orden', 'error suyo'],
};

const GENERAL_TRIGGERS = {
  positive:   ['disculpa', 'lamento', 'entiendo', 'ayudar', 'solución', 'compensar', 'reembolso', 'perdón'],
  procedural: ['procedimiento', 'proceso', 'verificar', 'investigar', 'revisar', 'consultar', 'protocolo', 'política'],
  time:       ['esperar', 'minutos', 'tiempo', 'paciencia', 'momento', 'pronto'],
  dismissive: ['normal', 'común', 'usual', 'sistema', 'automático', 'típico', 'frecuente', 'otra área'],
  escalating: ['calma', 'tranquilo', 'relájate', 'no es para tanto', 'exagera', 'error suyo', 'elegiste'],
};

const GOOD_PHRASES = [
  'voy a resolver esto ahora mismo',
  'entiendo perfectamente su frustración',
  'esto no debería haber pasado',
  'voy a escalar esto inmediatamente',
  'le voy a dar una solución',
  'esto es inaceptable de nuestra parte',
  'voy a compensarle por esto',
  'permíteme solucionarlo',
  'tiene toda la razón',
];

const SOLUTION_WORDS = ['reembolso', 'devolver', 'compensar', 'descuento', 'gratis', 'cancelar', 'credito', 'cupón', 'nueva orden'];

const EXTRAS = [
  ' ¡Esto es el colmo!',
  ' ¡No puede ser!',
  ' ¡Increíble!',
  ' ¡Mi paciencia tiene límites!',
  ' ¡Estoy grabando esta conversación!',
  ' ¡Esto no se queda así!',
];

export interface OrderInfo {
  customerName: string;
  orderNumber: string;
  partnerName: string;
  vertical: string;
  deliveryType: string;
  paymentMethod: string;
  orderAmount: string;
  tags: string[];
  phone: string;
  email: string;
  deliveryPin: string;
}

export interface BotState {
  escalationLevel: number;   // 1-5
  advisorScore: number;      // 0-100
  responseCount: number;
  customerName: string;
  orderNumber: string;
  scenarioKey: ScenarioKey;
}

export interface BotResponse {
  text: string;
  escalationChange: number;
  state: BotState;
  shouldTerminate: boolean;
}

export class CriticalCustomerBot {
  private escalationLevel = 1;
  private advisorScore = 100;
  private responseCount = 0;
  private lastResponses: string[] = [];
  readonly customerName: string;
  readonly orderNumber: string;
  readonly orderAmount: string;
  readonly phone: string;
  readonly email: string;
  readonly deliveryPin: string;
  readonly scenarioKey: ScenarioKey;

  constructor(profileName: string) {
    this.scenarioKey = SCENARIO_BY_PROFILE[profileName] ?? 'orden_cancelada_sin_aviso';
    this.customerName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    this.orderNumber = `PY${Math.floor(Math.random() * 900000) + 100000}`;
    this.orderAmount = `S/ ${(Math.random() * 70 + 20).toFixed(2)}`;
    this.phone = `+51 9${Math.floor(Math.random() * 80 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`;
    this.email = `${this.customerName.toLowerCase().replace(' ', '.')}@email.com`;
    this.deliveryPin = String(Math.floor(Math.random() * 9000 + 1000));
  }

  getOrderInfo(): OrderInfo {
    const data = SCENARIO_ORDER_DATA[this.scenarioKey];
    return {
      customerName: this.customerName,
      orderNumber: this.orderNumber,
      partnerName: data.partnerName,
      vertical: data.vertical,
      deliveryType: data.deliveryType,
      paymentMethod: data.paymentMethod,
      orderAmount: this.orderAmount,
      tags: data.tags,
      phone: this.phone,
      email: this.email,
      deliveryPin: this.deliveryPin,
    };
  }

  getInitialComplaint(): string {
    const waitTime = Math.floor(Math.random() * 3) + 2;
    const map: Record<ScenarioKey, string> = {
      orden_cancelada_sin_aviso: `¡¿QUÉ PASÓ CON MI ORDEN?! Acabo de ver que dice "CANCELADA" en la app. ¡Nadie me avisó NADA! Orden #${this.orderNumber}. ¡Estuve esperando ${waitTime} horas! ¿Quién autorizó esta cancelación?`,
      rider_no_se_mueve:         `¡El repartidor de mi orden #${this.orderNumber} lleva 45 MINUTOS en el mismo lugar! No se ha movido NI UN METRO. ¿Qué está pasando? ¿Tuvo un accidente? ¡Mi comida se está pudriendo ahí!`,
      rider_malcriado:           `¡El repartidor de mi orden #${this.orderNumber} es un GROSERO! Se NIEGA a subir a mi apartamento. ¡Además llegó con la bolsa ROTA y se molesta cuando le reclamo! ¡Esto es INACEPTABLE!`,
      demora_extrema_cupon:      `¡MI ORDEN #${this.orderNumber} lleva ${waitTime + 1} HORAS de retraso! ¡Esto es una HUMILLACIÓN! ¡Quiero un cupón de descuento o mi próximo pedido GRATIS! ¡Mi familia está muriéndose de hambre!`,
      orden_marcada_entregada:   `¡ESTO ES ROBO! Mi orden #${this.orderNumber} aparece como "ENTREGADA" pero aquí NO llegó NADA. ¡Vi al repartidor irse sin bajar de la moto! ¡Quiero mi dinero INMEDIATAMENTE!`,
      error_pickup_delivery:     `¡NO ENTIENDO! ¿Por qué mi orden #${this.orderNumber} dice "PICKUP"? ¡Yo NUNCA elegí eso! ¡Yo quería DELIVERY! ¡Su app está MAL! ¡No puedo salir de casa!`,
    };
    return map[this.scenarioKey];
  }

  getState(): BotState {
    return {
      escalationLevel: this.escalationLevel,
      advisorScore: this.advisorScore,
      responseCount: this.responseCount,
      customerName: this.customerName,
      orderNumber: this.orderNumber,
      scenarioKey: this.scenarioKey,
    };
  }

  respond(advisorText: string): BotResponse {
    this.responseCount++;
    const escalationChange = this.analyze(advisorText);

    const pool = ESCALATION_RESPONSES[this.scenarioKey][this.escalationLevel] ?? [
      '¡No sé qué más decirles! ¡Esto es increíble!',
      '¡Ya no puedo más con esta situación!',
    ];

    const unused = pool.filter(r => !this.lastResponses.includes(r));
    let text = unused.length > 0
      ? unused[Math.floor(Math.random() * unused.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    this.lastResponses.push(text);
    if (this.lastResponses.length > 3) this.lastResponses.shift();

    // Extra aleatorio (~40% de las veces)
    if (Math.random() < 0.4) {
      text += EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
    }

    const shouldTerminate =
      (this.escalationLevel === 5 && this.responseCount > 6) ||
      (this.advisorScore <= 10 && this.responseCount > 4);

    return { text, escalationChange, state: this.getState(), shouldTerminate };
  }

  private analyze(text: string): number {
    const lower = text.toLowerCase();
    let delta = 0;

    // Triggers específicos del escenario
    SCENARIO_TRIGGERS[this.scenarioKey].forEach(trigger => {
      if (lower.includes(trigger)) delta += 2;
    });

    // Triggers generales
    GENERAL_TRIGGERS.dismissive.forEach(t => { if (lower.includes(t)) delta += 3; });
    GENERAL_TRIGGERS.escalating.forEach(t => { if (lower.includes(t)) delta += 2; });
    GENERAL_TRIGGERS.procedural.forEach(t => { if (lower.includes(t)) delta += 1; });
    GENERAL_TRIGGERS.time.forEach(t =>       { if (lower.includes(t)) delta += 1; });
    GENERAL_TRIGGERS.positive.forEach(t =>   { if (lower.includes(t)) delta -= 1; });

    // Frases buenas
    GOOD_PHRASES.forEach(p => { if (lower.includes(p)) delta -= 2; });

    // Penalizar respuestas muy cortas o muy largas
    const wordCount = text.split(' ').length;
    if (wordCount < 10) delta += 2;
    if (wordCount > 60) delta += 1;

    // Sin solución concreta después de 3 respuestas
    if (this.responseCount > 2 && !SOLUTION_WORDS.some(w => lower.includes(w))) delta += 3;

    // Mencionar supervisor cuando el nivel es alto
    if (this.escalationLevel >= 3 && (lower.includes('supervisor') || lower.includes('gerente'))) delta -= 1;

    // Penalizaciones especiales por escenario
    if (this.scenarioKey === 'demora_extrema_cupon' && (lower.includes('no puedo') || lower.includes('sistema'))) delta += 2;
    if (this.scenarioKey === 'orden_marcada_entregada' && lower.includes('banco')) delta += 2;

    this.escalationLevel = Math.min(5, Math.max(1, this.escalationLevel + delta));

    if (delta > 2)      this.advisorScore -= 25;
    else if (delta > 1) this.advisorScore -= 15;
    else if (delta === 1) this.advisorScore -= 8;
    else if (delta === 0) this.advisorScore -= 3;
    else                  this.advisorScore += 10;

    this.advisorScore = Math.max(0, Math.min(100, this.advisorScore));
    return delta;
  }
}
