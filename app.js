const STORAGE_KEY = "ege-open-access-progress-v1";
const APP_VERSION = "20260915-2";
const ACCESS_KEY = "ege-access-session-v1";
const DEVICE_KEY = "ege-device-id-v1";
const CONTROL_MODE_KEY = "ege-control-mode-v1";
const SUBMISSIONS_KEY = "ege-submissions-v1";
const ACCESS_CODES = Array.from({ length: 30 }, (_, index) => `EGE-${String(index + 1).padStart(3, "0")}`);
const TEACHER_CODE = "TEACHER-2026";

const subjects = {
  social: {
    title: "Обществознание",
    subtitle: "16 заданий первой части",
    sources: [
      {
        id: "kotova-liskova-personal-2026-social",
        title: "Котова-Лискова · личный импорт",
        year: "2026",
        description: "Черновик из загруженного PDF: тестовый вариант, часть 1",
        variants: [
          {
            id: "kotova-liskova-personal-2026-social-v1",
            title: "Тестовый вариант",
            questions: personalKotovaLiskovaFirstScan()
          }
        ]
      },
      source("fipi-open-2026-social", "ФИПИ · открытый вариант", "2026", "Открытый вариант КИМ 2026", socialQuestions()),
      source("fipi-demo-2026-social", "ФИПИ · демоверсия", "2026", "Демоверсия, спецификация и кодификатор", rotate(socialQuestions(), 3)),
      source("fipi-bank-social", "ФИПИ · открытый банк", "актуальный", "Банк заданий для сборки тренировок", rotate(socialQuestions(), 7))
    ]
  },
  history: {
    title: "История",
    subtitle: "12 заданий первой части",
    sources: [
      source("fipi-open-2026-history", "ФИПИ · открытый вариант", "2026", "Открытый вариант КИМ 2026", historyQuestions()),
      source("fipi-demo-2026-history", "ФИПИ · демоверсия", "2026", "Демоверсия, спецификация и кодификатор", rotate(historyQuestions(), 2)),
      source("fipi-bank-history", "ФИПИ · открытый банк", "актуальный", "Банк заданий для сборки тренировок", rotate(historyQuestions(), 5))
    ]
  }
};

installLocalSources();

const state = {
  screen: "subjects",
  subjectId: null,
  sourceId: null,
  variantIndex: 0,
  questionIndex: 0,
  selected: null,
  matching: {},
  progress: loadProgress(),
  access: null,
  controlMode: false
};

const nodes = {
  backButton: document.querySelector("#backButton"),
  resetAllButton: document.querySelector("#resetAllButton"),
  eyebrow: document.querySelector("#eyebrow"),
  screenTitle: document.querySelector("#screenTitle"),
  hero: document.querySelector("#hero"),
  screens: {
    access: document.querySelector("#accessScreen"),
    subjects: document.querySelector("#subjectScreen"),
    sources: document.querySelector("#sourceScreen"),
    variants: document.querySelector("#variantScreen"),
    exam: document.querySelector("#examScreen"),
    result: document.querySelector("#resultScreen"),
    scan: document.querySelector("#scanScreen"),
    image: document.querySelector("#imageScreen"),
    teacher: document.querySelector("#teacherScreen")
  },
  subjectList: document.querySelector("#subjectList"),
  sourceList: document.querySelector("#sourceList"),
  variantList: document.querySelector("#variantList"),
  variantMeta: document.querySelector("#variantMeta"),
  questionCount: document.querySelector("#questionCount"),
  questionNav: document.querySelector("#questionNav"),
  variantProgress: document.querySelector("#variantProgress"),
  taskType: document.querySelector("#taskType"),
  questionTitle: document.querySelector("#questionTitle"),
  options: document.querySelector("#options"),
  nextButton: document.querySelector("#nextButton"),
  skipButton: document.querySelector("#skipButton"),
  restartVariantButton: document.querySelector("#restartVariantButton"),
  resultMeta: document.querySelector("#resultMeta"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  reviewList: document.querySelector("#reviewList"),
  scanMeta: document.querySelector("#scanMeta"),
  scanCount: document.querySelector("#scanCount"),
  scanPages: document.querySelector("#scanPages"),
  completeScanVariantButton: document.querySelector("#completeScanVariantButton"),
  repeatButton: document.querySelector("#repeatButton"),
  nextVariantButton: document.querySelector("#nextVariantButton"),
  viewerImage: document.querySelector("#viewerImage"),
  doneValue: document.querySelector("#doneValue"),
  accuracyValue: document.querySelector("#accuracyValue"),
  sourceNote: document.querySelector("#sourceNote"),
  studentNameInput: document.querySelector("#studentNameInput"),
  accessCodeInput: document.querySelector("#accessCodeInput"),
  accessSubmitButton: document.querySelector("#accessSubmitButton"),
  accessError: document.querySelector("#accessError"),
  controlModeToggle: document.querySelector("#controlModeToggle"),
  teacherReport: document.querySelector("#teacherReport")
};

function source(id, title, year, description, questions) {
  return {
    id,
    title,
    year,
    description,
    variants: [1, 2, 3].map((number) => ({
      id: `${id}-v${number}`,
      title: `Вариант ${number}`,
      questions: rotate(questions, number - 1).map((question) => ({ ...question }))
    }))
  };
}

function installLocalSources() {
  const localSources = [
    ...(window.localInteractiveSources || [])
  ];
  localSources.forEach((sourceItem) => {
    const exists = subjects.social.sources.some((existing) => existing.id === sourceItem.id);
    if (!exists) subjects.social.sources.unshift(sourceItem);
  });
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function loadAccess() {
  try {
    return JSON.parse(localStorage.getItem(ACCESS_KEY)) || null;
  } catch {
    return null;
  }
}

function saveAccess(access) {
  state.access = access;
  localStorage.setItem(ACCESS_KEY, JSON.stringify(access));
}

function loadControlMode() {
  return localStorage.getItem(CONTROL_MODE_KEY) === "on";
}

function saveControlMode(value) {
  state.controlMode = Boolean(value);
  localStorage.setItem(CONTROL_MODE_KEY, state.controlMode ? "on" : "off");
}

function loadSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSubmissions(submissions) {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}

function isTeacher() {
  return state.access?.role === "teacher";
}

function isControlLocked(variant) {
  return state.controlMode && !isTeacher() && Boolean(variantProgress(variant).completed);
}

function loginWithAccess() {
  const name = nodes.studentNameInput.value.trim();
  const code = nodes.accessCodeInput.value.trim().toUpperCase();
  nodes.accessError.textContent = "";
  if (code === TEACHER_CODE) {
    saveAccess({ role: "teacher", name: name || "Учитель", code, deviceId: getDeviceId(), createdAt: new Date().toISOString() });
    show("subjects");
    return;
  }
  if (!ACCESS_CODES.includes(code)) {
    nodes.accessError.textContent = "Код не найден. Для теста используйте EGE-001 ... EGE-030.";
    return;
  }
  if (!name) {
    nodes.accessError.textContent = "Введите имя ученика.";
    return;
  }
  saveAccess({ role: "student", name, code, deviceId: getDeviceId(), createdAt: new Date().toISOString() });
  show("subjects");
}

function single(text, options, correct, explanation) {
  return { type: "single", text, options, correct, explanation };
}

function multi(text, options, correct, explanation) {
  return { type: "multi", text, options, correct, explanation };
}

function match(text, left, right, correct, explanation) {
  return { type: "match", text, left, right, correct, explanation };
}

function short(text, correct, explanation) {
  return { type: "short", text, correct, explanation };
}

function digits(text, correct, explanation) {
  return { type: "digits", text, correct, explanation };
}

function withImage(question, image, alt) {
  return { ...question, image, alt };
}

function assetUrl(src) {
  if (!src || src.startsWith("data:") || /^https?:\/\//.test(src)) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${APP_VERSION}`;
}

function socialQuestions() {
  return [
    multi("Ниже приведен перечень действий. Все они, за исключением двух, относятся к правам налогоплательщика в РФ. Найдите два лишних действия.", ["Получать информацию о налогах", "Использовать налоговые льготы", "Вести учет доходов и расходов", "Требовать соблюдения налоговой тайны", "Уплачивать законно установленные налоги"], [2, 4], "Права налогоплательщика не совпадают с его обязанностями: учет и уплата налогов относятся к обязанностям."),
    multi("Выберите верные суждения о человеке.", ["Становление человека как личности связано с социализацией", "Человек наследует моральные нормы генетически", "Биологические предпосылки могут проявиться в социальных условиях", "Индивидом называют отдельного представителя человеческого рода", "Все способности человека формируются только биологически"], [0, 2, 3], "Личность формируется в обществе, но человек имеет и биологические предпосылки развития."),
    match("Установите соответствие между примерами и видами потребностей человека.", ["В общении", "В приобретении новых знаний", "В пище", "В общественном признании", "В художественном творчестве"], ["Духовные", "Социальные", "Биологические"], [1, 0, 2, 1, 0], "Пища относится к биологическим потребностям, общение и признание к социальным, знания и творчество к духовным."),
    multi("Какие признаки свидетельствуют о развитии страны как постиндустриального общества?", ["Развитие наукоемких технологий", "Переход к электронным производственным процессам", "Влияние природных факторов на общество", "Регулирование отношений моралью", "Высокая доля среднего класса"], [0, 1, 4], "Постиндустриальное общество связано с информацией, технологиями, услугами и сложной социальной структурой."),
    multi("Выберите верные суждения о ценных бумагах.", ["Акция закрепляет долю в капитале компании", "Обращение ценных бумаг может осуществляться на фондовом рынке", "К ценным бумагам относят акцию, вексель и облигацию", "Все ценные бумаги являются долговыми", "Выпуск ценных бумаг называется девальвацией"], [0, 1, 2], "Акции и облигации обращаются на фондовом рынке, но не все бумаги долговые; девальвация относится к валюте."),
    match("Установите соответствие между характеристиками и факторами производства.", ["Физические и интеллектуальные усилия людей", "Все виды природных ресурсов", "Факторный доход - рента", "Факторный доход - заработная плата", "Факторный доход - прибыль"], ["Труд", "Земля", "Предпринимательские способности"], [0, 1, 1, 0, 2], "Труд приносит заработную плату, земля - ренту, предпринимательские способности - прибыль."),
    single("Какой пример иллюстрирует социальный институт образования?", ["Проведение урока в школе", "Заключение договора купли-продажи", "Выпуск облигаций", "Назначение административного штрафа"], 0, "Школа и учебный процесс относятся к институту образования."),
    multi("Выберите верные суждения о семье.", ["Семья является агентом первичной социализации", "Семья выполняет воспитательную функцию", "Семья всегда создается только религиозным обрядом", "Семья может быть малой социальной группой", "Нуклеарная семья обязательно включает три-четыре поколения"], [0, 1, 3], "Семья социализирует, воспитывает и может быть малой группой; остальные утверждения неверны."),
    multi("Какие выводы можно сделать по диаграмме: 31% выбрали стабильность общества, 27% - долгосрочные планы, 19% - комфорт граждан, 18% - нарушители норм, 5% - другое?", ["Каждый третий указал стабильность общества", "Доля ответа «другое» наименьшая", "Сторонников стабильности больше, чем сторонников комфорта", "Более половины выбрали стабильность и долгосрочные планы вместе", "Нарушителей норм выбрали больше, чем комфорт граждан"], [0, 1, 2, 3], "31% примерно каждый третий; 5% - минимум; 31 больше 19; 31+27=58%."),
    multi("Какие признаки позволяют сделать вывод о демократическом политическом режиме?", ["Права и свободы гарантированы законом", "Ветви власти независимы и уравновешивают друг друга", "Меньшинство имеет право на оппозицию", "Президент обладает неограниченными полномочиями", "Правительство разрабатывает бюджет"], [0, 1, 2], "Демократия предполагает гарантии прав, разделение властей и политический плюрализм."),
    multi("Что относится к политическим правам гражданина РФ?", ["Участвовать в управлении делами государства", "Обращаться в органы государственной власти", "Избирать и быть избранным", "На личную неприкосновенность", "На охрану здоровья"], [0, 1, 2], "Политические права связаны с участием в публичной власти; личная неприкосновенность и охрана здоровья относятся к другим группам прав."),
    match("Установите соответствие между вопросами ведения и субъектами власти РФ.", ["Оборона и безопасность", "Государственные награды", "Воспитание и образование", "Охрана окружающей среды", "Федеральная собственность"], ["Только федеральный центр", "Федеральный центр и субъекты РФ"], [0, 0, 1, 1, 0], "Оборона, награды и федеральная собственность находятся в ведении РФ; образование и экология - совместное ведение."),
    multi("Выберите верные суждения о системе права.", ["Система права строится по объективным критериям", "Нормы права различаются только по содержанию", "Отрасль права объединяет однородные нормы", "Правовой институт регулирует участок однородных отношений", "Гражданское право относится к публичному праву"], [0, 2, 3], "Отрасль и институт права выделяются по предмету регулирования; гражданское право относится к частному праву."),
    match("Соотнесите организационно-правовые формы и виды юридических лиц.", ["Хозяйственные товарищества", "Государственные унитарные предприятия", "Потребительские кооперативы", "Благотворительные фонды", "Религиозные организации"], ["Коммерческие", "Некоммерческие"], [0, 0, 1, 1, 1], "Коммерческие организации создаются для извлечения прибыли; фонды, кооперативы и религиозные организации в этих примерах некоммерческие."),
    multi("Гражданину России 12 лет. Какие действия он может совершать самостоятельно?", ["Совершать мелкие бытовые сделки", "Распоряжаться предоставленными родителями средствами", "Вносить вклады и распоряжаться ими", "Заключать трудовой договор курьером", "Зарегистрировать юридическое лицо"], [0, 1], "Малолетние 6-14 лет могут совершать мелкие бытовые сделки и распоряжаться средствами, предоставленными законными представителями."),
    single("Что является признаком юридической ответственности?", ["Государственное принуждение", "Только моральное осуждение", "Добровольная похвала", "Отсутствие санкций"], 0, "Юридическая ответственность обеспечивается государственным принуждением и наступает за правонарушение.")
  ];
}

function personalKotovaLiskovaFirstScan() {
  return [
    multi("Найдите два действия, которые выпадают из перечня прав налогоплательщика в РФ.", ["Уплачивать законно установленные налоги", "Вести учет доходов и расходов", "Получать от налоговых органов бесплатную информацию о действующих налогах", "Получать своевременный зачет или возврат излишне уплаченных сумм", "Использовать налоговые льготы", "Требовать соблюдения налоговой тайны"], [0, 1], "Два лишних пункта являются обязанностями налогоплательщика. Остальные пункты относятся к его правам."),
    multi("Выберите верные суждения о человеке.", ["Последовательность основных стадий жизни человека биологически обусловлена", "Становление человека как личности связано с приобретением социальных черт и качеств", "Человек генетически наследует моральные нормы", "Влияние генетических факторов на способности выражает социальную сущность человека", "Природная предрасположенность человека может проявиться в социальных обстоятельствах"], [0, 1, 4], "Биологическое развитие задает возрастные стадии, личность формируется в обществе, а природные задатки раскрываются в социальных условиях. Моральные нормы не наследуются генетически."),
    match("Установите соответствие между примерами и видами потребностей человека.", ["В общении", "В приобретении новых знаний", "В пище", "В общественном признании", "В художественном творчестве"], ["Духовные", "Социальные", "Биологические"], [1, 0, 2, 1, 0], "Общение и признание относятся к социальным потребностям, знания и творчество - к духовным, пища - к биологическим.")
    ,
    multi("Какие признаки свидетельствуют о развитии страны как постиндустриального общества?", ["Развитие получают наукоемкие, ресурсосберегающие технологии", "Осуществляется переход к электронным технологиям на всех уровнях производства", "Природные факторы оказывают влияние на развитие общества", "Общественные отношения регулируются правовыми и моральными нормами", "В структуре населения высок удельный вес среднего класса", "Преобладают экстенсивные методы ведения хозяйства"], [0, 1, 4], "Постиндустриальное общество связано с наукоемкими технологиями, информатизацией и развитым средним классом."),
    multi("Выберите верные суждения о ценных бумагах.", ["Облигация дает владельцу право на долю в имуществе компании и дивиденды", "Обращение ценных бумаг осуществляется на фондовом рынке", "К ценным бумагам относят акцию, вексель, облигацию", "Различают долевые и долговые ценные бумаги", "Выпуск ценных бумаг называется девальвацией"], [1, 2, 3], "Первое утверждение описывает акцию, а девальвация связана со снижением курса валюты. Остальные суждения верны."),
    match("Установите соответствие между характеристиками и факторами производства.", ["Деятельность людей по производству товаров и услуг с использованием физических и интеллектуальных возможностей", "Все виды природных ресурсов, пригодных для производства экономических благ", "Факторный доход - рента", "Факторный доход - заработная плата", "Факторный доход - прибыль"], ["Труд", "Земля", "Предпринимательские способности"], [0, 1, 1, 0, 2], "Труд приносит заработную плату, земля - ренту, предпринимательские способности - прибыль."),
    multi("Какие признаки подтверждают наличие в стране рыночной экономики?", ["Каждый собственник факторов производства свободно распоряжается ими", "Производится широкий ассортимент товаров народного потребления", "Собственниками земли и предприятий являются частные лица и организации", "Правительство вкладывает значительные средства в строительство дорог", "В столице открыт новый международный аэропорт", "Наблюдается конкуренция производителей"], [0, 1, 2, 5], "Рыночную экономику показывают свобода распоряжения ресурсами, частная собственность, ассортимент товаров и конкуренция."),
    multi("Выберите верные суждения о семье.", ["Рекреационная функция семьи проявляется в предоставлении социального статуса", "Члены семьи связаны взаимной моральной и правовой ответственностью", "Семья является основным агентом первичной социализации", "Семья создает условия для физического, психического, эмоционального и интеллектуального развития ребенка", "Нуклеарные семьи включают три-четыре поколения родственников"], [1, 2, 3], "Рекреационная функция связана с отдыхом и восстановлением, а нуклеарная семья обычно включает родителей и детей."),
    withImage(multi("Найдите выводы, которые можно сделать на основе диаграммы об отношении подростков к социальным нормам.", ["Каждый третий опрошенный считает, что соблюдение норм обеспечивает комфорт граждан", "Тех, кто считает, что нарушителей норм всегда будет меньше, чем выбравших стабильность общества", "Сторонников комфорта больше, чем сторонников долгосрочных планов", "Более половины опрошенных выбрали стабильность общества и долгосрочные планы развития", "Наименьшая доля опрошенных ответила «Другое»"], [1, 3, 4], "По диаграмме: 31% - стабильность, 27% - долгосрочные планы, 19% - комфорт, 18% - нарушители, 5% - другое."), "./assets/social-diagram-q9.png", "Диаграмма с результатами опроса подростков о причинах соблюдения социальных норм."),
    multi("Выберите верные суждения о государстве и его функциях.", ["К внешним функциям государства относится определение общего направления экономического развития", "Государство обладает монопольным правом законно применять принуждение", "Природоохранные требования государства составляют основу экологической безопасности", "Государство создает нормативную и организационную основу деятельности органов власти и местного самоуправления", "Основополагающим признаком государства любого типа является разделение властей"], [1, 2, 3], "Экономическое развитие относится к внутренним функциям, а разделение властей характерно не для любого государства."),
    multi("Какие признаки позволяют сделать вывод о демократическом политическом режиме?", ["Президент обладает широкими полномочиями", "Меньшинство имеет право на оппозицию при подчинении решениям большинства", "Правительство разрабатывает и исполняет бюджет", "В стране действует конституция", "Права и свободы граждан гарантированы и защищены законом", "Ветви государственной власти независимы и уравновешивают друг друга"], [1, 4, 5], "Демократию показывают права оппозиции, гарантии прав человека и разделение властей."),
    multi("Что относится к политическим правам гражданина РФ?", ["Право участвовать в управлении делами государства", "Право на свободу и личную неприкосновенность", "Право на личную и семейную тайну", "Право свободно передвигаться и выбирать место пребывания", "Право обращаться в органы государственной власти"], [0, 4], "Участие в управлении государством и обращения в органы власти относятся к политическим правам."),
    match("Установите соответствие между вопросами и субъектами власти РФ, к ведению которых они относятся.", ["Охрана окружающей среды и обеспечение экологической безопасности", "Вопросы войны и мира", "Государственные награды и почетные звания РФ", "Оборона и безопасность", "Осуществление мер по борьбе с природными и техногенными катастрофами"], ["Только федеральный центр", "Федеральный центр и субъекты РФ"], [1, 0, 0, 0, 1], "Экология и борьба с катастрофами относятся к совместному ведению; война, награды и оборона - к федеральному."),
    multi("Выберите верные суждения о системе права.", ["Система права строится по объективным критериям", "Нормы права различаются только по содержанию", "Отрасль права - совокупность однородных правовых норм", "Правовой институт - совокупность норм, регулирующих определенный участок однородных отношений", "Гражданское право относят к публичному праву"], [0, 2, 3], "Гражданское право относится к частному праву, а нормы различаются не только по содержанию."),
    match("Установите соответствие между организационно-правовыми формами и видами юридических лиц.", ["Хозяйственные товарищества", "Государственные унитарные предприятия", "Потребительские кооперативы", "Благотворительные фонды", "Религиозные организации"], ["Коммерческие", "Некоммерческие"], [0, 0, 1, 1, 1], "Хозяйственные товарищества и унитарные предприятия являются коммерческими, остальные позиции здесь относятся к некоммерческим."),
    multi("Гражданину России 12 лет. Какие действия соответствуют его правовому статусу?", ["Заключать трудовой договор курьером с согласия родителей", "Распоряжаться предоставленными родителями средствами", "Быть заслушанным в суде по определению места жительства при разводе родителей", "Вносить вклады в кредитные учреждения и распоряжаться ими", "Зарегистрировать на свое имя юридическое лицо", "Совершать мелкие бытовые сделки"], [1, 5], "В 12 лет ребенок может распоряжаться предоставленными средствами и совершать мелкие бытовые сделки. Остальные действия либо наступают позже, либо требуют иных условий.")
  ];
}

function historyQuestions() {
  return [
    match("Установите соответствие между событиями и годами.", ["Крещение Руси", "Невская битва", "Куликовская битва", "Стояние на реке Угре"], ["988", "1240", "1380", "1480"], [0, 1, 2, 3], "В первой части истории часто проверяется хронология ключевых событий."),
    match("Установите соответствие между правителем и событием.", ["Ярослав Мудрый", "Иван III", "Иван IV", "Петр I"], ["Русская Правда", "Стояние на Угре", "Опричнина", "Северная война"], [0, 1, 2, 3], "Каждый правитель связан с указанным событием или процессом."),
    multi("Выберите события XVII века.", ["Соборное уложение", "Церковный раскол", "Смутное время", "Отмена крепостного права", "НЭП"], [0, 1, 2], "Смутное время, Соборное уложение и церковный раскол относятся к XVII веку."),
    short("Запишите термин: высший орган управления, учрежденный Петром I в 1711 году.", ["сенат", "правительствующий сенат"], "Петр I учредил Правительствующий сенат в 1711 году."),
    match("Расположите события в хронологической последовательности.", ["Ледовое побоище", "Куликовская битва", "Принятие Соборного уложения", "Отмена крепостного права"], ["1", "2", "3", "4"], [0, 1, 2, 3], "1242, 1380, 1649, 1861 - правильная последовательность."),
    short("Запишите название мирного договора, завершившего Северную войну.", ["ништадтский", "ништадтский мир"], "Ништадтский мир 1721 года закрепил победу России в Северной войне."),
    multi("Выберите реформы Петра I.", ["Учреждение Сената", "Введение Табели о рангах", "Создание коллегий", "Отмена крепостного права", "Земская реформа"], [0, 1, 2], "Сенат, Табель о рангах и коллегии относятся к петровским преобразованиям."),
    single("Февральская революция привела к...", ["Падению монархии", "Созданию СССР", "Началу НЭПа", "Победе в Великой Отечественной войне"], 0, "В феврале 1917 года монархия в России была свергнута."),
    match("Соотнесите термин и период.", ["НЭП", "Индустриализация", "Оттепель", "Перестройка"], ["1920-е", "1930-е", "1950-е-1960-е", "1980-е"], [0, 1, 2, 3], "Термины связаны с разными этапами советской истории."),
    short("Запишите год распада СССР.", ["1991"], "СССР прекратил существование в декабре 1991 года."),
    multi("Выберите события периода правления Александра II.", ["Отмена крепостного права", "Судебная реформа", "Земская реформа", "Учреждение Сената", "Введение НЭПа"], [0, 1, 2], "К реформам Александра II относятся крестьянская, судебная и земская реформы."),
    match("Установите соответствие между войной и мирным договором.", ["Северная война", "Крымская война", "Русско-турецкая война 1877-1878 гг.", "Первая мировая война"], ["Ништадтский мир", "Парижский мир", "Берлинский трактат", "Брестский мир"], [0, 1, 2, 3], "Каждый договор завершал или фиксировал итоги соответствующей войны для России.")
  ];
}

function rotate(items, amount) {
  const shift = amount % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
}

function currentSubject() {
  return subjects[state.subjectId];
}

function currentSource() {
  return currentSubject().sources.find((item) => item.id === state.sourceId);
}

function currentVariant() {
  return currentSource().variants[state.variantIndex];
}

function currentQuestion() {
  return currentVariant().questions[state.questionIndex];
}

function isScanVariant(variant = currentVariant()) {
  return Array.isArray(variant.pages);
}

function variantLength(variant) {
  return isScanVariant(variant) ? variant.pages.length : variant.questions.length;
}

function variantProgress(variant = currentVariant()) {
  if (!state.progress[variant.id]) {
    state.progress[variant.id] = { completed: false, best: 0, answers: {}, skipped: {} };
  }
  if (!state.progress[variant.id].skipped) state.progress[variant.id].skipped = {};
  return state.progress[variant.id];
}

function show(screen) {
  state.screen = screen;
  Object.entries(nodes.screens).forEach(([name, node]) => node.classList.toggle("is-hidden", name !== screen));
  nodes.backButton.classList.toggle("is-hidden", screen === "access" || screen === "subjects");
  nodes.hero.classList.toggle("is-hidden", screen === "access" || screen === "exam" || screen === "result" || screen === "scan" || screen === "image" || screen === "teacher");
  render();
}

function render() {
  renderStats();
  renderSourceNote();
  if (state.screen === "access") renderAccess();
  if (state.screen === "subjects") renderSubjects();
  if (state.screen === "sources") renderSources();
  if (state.screen === "variants") renderVariants();
  if (state.screen === "exam") renderExam();
  if (state.screen === "result") renderResult();
  if (state.screen === "scan") renderScan();
  if (state.screen === "teacher") renderTeacher();
}

function renderAccess() {
  nodes.eyebrow.textContent = "ЕГЭ · закрытая тренировка";
  nodes.screenTitle.textContent = "Вход";
  nodes.resetAllButton.classList.add("is-hidden");
}

function renderSubjects() {
  nodes.eyebrow.textContent = "ЕГЭ · первая часть";
  nodes.screenTitle.textContent = "Выбор предмета";
  nodes.resetAllButton.classList.toggle("is-hidden", state.controlMode && !isTeacher());
  nodes.subjectList.innerHTML = "";
  if (isTeacher()) {
    const teacherCard = document.createElement("button");
    teacherCard.className = "card teacher-entry";
    teacherCard.type = "button";
    teacherCard.innerHTML = `<div><strong>Режим учителя</strong><span>Контрольный режим и журнал результатов на этом устройстве</span><div class="badge-line"><b class="badge">${state.controlMode ? "контроль включен" : "свободная тренировка"}</b></div></div><i>›</i>`;
    teacherCard.addEventListener("click", () => show("teacher"));
    nodes.subjectList.appendChild(teacherCard);
  }
  Object.entries(subjects).forEach(([id, subject]) => {
    const completed = subject.sources.flatMap((sourceItem) => sourceItem.variants).filter((variant) => variantProgress(variant).completed).length;
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.innerHTML = `<div><strong>${subject.title}</strong><span>${subject.subtitle}</span><div class="badge-line"><b class="badge">${completed} завершено</b><b class="badge">ФИПИ</b></div></div><i>›</i>`;
    card.addEventListener("click", () => {
      state.subjectId = id;
      show("sources");
    });
    nodes.subjectList.appendChild(card);
  });
}

function renderSources() {
  nodes.eyebrow.textContent = currentSubject().title;
  nodes.screenTitle.textContent = "Источник";
  nodes.resetAllButton.classList.toggle("is-hidden", state.controlMode && !isTeacher());
  nodes.sourceList.innerHTML = "";
  currentSubject().sources.forEach((sourceItem) => {
    const completed = sourceItem.variants.filter((variant) => variantProgress(variant).completed).length;
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";
    card.innerHTML = `<div><strong>${sourceItem.title}</strong><span>${sourceItem.description}</span><div class="badge-line"><b class="badge">${sourceItem.year}</b><b class="badge">${completed}/${sourceItem.variants.length}</b></div></div><i>›</i>`;
    card.addEventListener("click", () => {
      state.sourceId = sourceItem.id;
      state.variantIndex = 0;
      show("variants");
    });
    nodes.sourceList.appendChild(card);
  });
}

function renderVariants() {
  nodes.eyebrow.textContent = currentSource().title;
  nodes.screenTitle.textContent = "Варианты";
  nodes.resetAllButton.classList.toggle("is-hidden", state.controlMode && !isTeacher());
  nodes.variantList.innerHTML = "";
  currentSource().variants.forEach((variant, index) => {
    const progress = variantProgress(variant);
    const answered = Object.keys(progress.answers).length;
    const length = variantLength(variant);
    const statusText = isScanVariant(variant) ? `${length} ${pageWord(length)} первой части` : `${answered}/${length} заданий`;
    const locked = isControlLocked(variant);
    const card = document.createElement("button");
    card.className = `variant-card${locked ? " is-locked" : ""}`;
    card.type = "button";
    card.disabled = locked;
    card.innerHTML = `<div><strong>${variant.title}</strong><span>${statusText}</span><div class="progress-track"><div class="progress-fill" style="width:${isScanVariant(variant) ? (progress.completed ? 100 : 0) : answered / length * 100}%"></div></div><div class="badge-line"><b class="badge">${locked ? "попытка завершена" : progress.completed ? (isScanVariant(variant) ? "решен" : `лучший ${progress.best}`) : "не завершен"}</b></div></div><i>${locked ? "✓" : "›"}</i>`;
    card.addEventListener("click", () => {
      if (locked) return;
      state.variantIndex = index;
      if (isScanVariant(variant)) {
        show("scan");
        return;
      }
      const next = variant.questions.findIndex((_, questionIndex) => !progress.answers[questionIndex]);
      state.questionIndex = next === -1 ? 0 : next;
      clearDraft();
      show(progress.completed && next === -1 ? "result" : "exam");
    });
    nodes.variantList.appendChild(card);
  });
}

function pageWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "страница";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "страницы";
  return "страниц";
}

function renderScan() {
  const variant = currentVariant();
  const progress = variantProgress();
  nodes.eyebrow.textContent = currentSource().title;
  nodes.screenTitle.textContent = variant.title;
  nodes.scanMeta.textContent = progress.completed ? "Отмечен как решенный" : "Первая часть, страницы варианта";
  nodes.scanCount.textContent = `${variant.pages.length} стр.`;
  nodes.scanPages.innerHTML = "";
  variant.pages.forEach((page, index) => {
    const figure = document.createElement("figure");
    figure.className = "scan-page";
    figure.innerHTML = `<figcaption>${variant.title} · стр. ${index + 1}</figcaption><img src="${page}" alt="${variant.title}, страница ${index + 1}" loading="lazy">`;
    nodes.scanPages.appendChild(figure);
  });
}

function renderExam() {
  const variant = currentVariant();
  const progress = variantProgress();
  const question = currentQuestion();
  const answered = Object.keys(progress.answers).length;
  const skipped = Object.keys(progress.skipped).filter((index) => !progress.answers[index]).length;
  loadDraftFromSaved();
  nodes.eyebrow.textContent = currentSource().title;
  nodes.screenTitle.textContent = variant.title;
  nodes.variantMeta.textContent = skipped ? `Ответы не проверяются до конца · пропущено ${skipped}` : "Ответы не проверяются до конца варианта";
  nodes.questionCount.textContent = `${state.questionIndex + 1}/${variant.questions.length}`;
  nodes.variantProgress.style.width = `${answered / variant.questions.length * 100}%`;
  nodes.taskType.textContent = taskTypeLabel(question);
  nodes.questionTitle.textContent = question.text;
  nodes.nextButton.textContent = state.questionIndex === variant.questions.length - 1 ? "Завершить" : "Дальше";
  nodes.nextButton.disabled = !hasAnswer(question);
  nodes.restartVariantButton.disabled = state.controlMode && !isTeacher();
  renderQuestionNav(variant, progress);
  renderQuestionInput(question);
}

function renderQuestionNav(variant, progress) {
  nodes.questionNav.innerHTML = "";
  variant.questions.forEach((_, index) => {
    const button = document.createElement("button");
    const answered = Boolean(progress.answers[index]);
    const skipped = Boolean(progress.skipped[index]) && !answered;
    button.className = [
      "question-pill",
      index === state.questionIndex ? "is-current" : "",
      answered ? "is-done" : "",
      skipped ? "is-skipped" : ""
    ].filter(Boolean).join(" ");
    button.type = "button";
    button.textContent = index + 1;
    button.setAttribute("aria-label", `Задание ${index + 1}`);
    button.addEventListener("click", () => goToQuestion(index));
    nodes.questionNav.appendChild(button);
  });
}

function renderQuestionInput(question) {
  nodes.options.innerHTML = "";
  if (question.image) {
    const imageSrc = assetUrl(question.image);
    const figure = document.createElement("figure");
    figure.className = "task-media";
    figure.setAttribute("role", "button");
    figure.setAttribute("tabindex", "0");
    figure.setAttribute("aria-label", "Открыть материал крупно");
    figure.innerHTML = `<img src="${imageSrc}" alt="${question.alt || ""}">`;
    const openImage = () => {
      nodes.viewerImage.src = imageSrc;
      nodes.viewerImage.alt = question.alt || "";
      nodes.eyebrow.textContent = `Задание ${state.questionIndex + 1}`;
      nodes.screenTitle.textContent = "Материал";
      show("image");
    };
    figure.addEventListener("click", openImage);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") openImage();
    });
    nodes.options.appendChild(figure);
  }
  if (question.type === "match") {
    question.left.forEach((left, index) => {
      const row = document.createElement("label");
      row.className = "match-row";
      const select = document.createElement("select");
      select.innerHTML = `<option value="">Выбрать цифру</option>${question.right.map((right, rightIndex) => `<option value="${rightIndex}">${rightIndex + 1}. ${right}</option>`).join("")}`;
      select.value = state.matching[index] ?? "";
      select.addEventListener("change", () => {
        state.matching[index] = select.value === "" ? "" : Number(select.value);
        renderExam();
      });
      row.innerHTML = `<span>${letter(index)}) ${left}</span>`;
      row.appendChild(select);
      nodes.options.appendChild(row);
    });
    return;
  }

  if (question.type === "short") {
    const label = document.createElement("label");
    label.className = "short-row";
    label.innerHTML = "<span>Ответ</span>";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Введите слово или цифры";
    input.value = typeof state.selected === "string" ? state.selected : "";
    input.addEventListener("input", () => {
      state.selected = input.value;
      renderExam();
    });
    label.appendChild(input);
    nodes.options.appendChild(label);
    return;
  }

  if (question.type === "digits") {
    const panel = document.createElement("div");
    panel.className = "digit-answer";
    const value = typeof state.selected === "string" ? state.selected : "";
    panel.innerHTML = `<div class="digit-display" aria-label="Текущий ответ">${value || "Нажмите цифры"}</div>`;
    const grid = document.createElement("div");
    grid.className = "digit-grid";
    "123456789".split("").forEach((digitValue) => {
      const button = document.createElement("button");
      button.className = "digit-button";
      button.type = "button";
      button.textContent = digitValue;
      button.addEventListener("click", () => {
        state.selected = `${typeof state.selected === "string" ? state.selected : ""}${digitValue}`;
        renderExam();
      });
      grid.appendChild(button);
    });
    const backspace = document.createElement("button");
    backspace.className = "ghost-button";
    backspace.type = "button";
    backspace.textContent = "Стереть";
    backspace.addEventListener("click", () => {
      state.selected = value.slice(0, -1);
      renderExam();
    });
    const clear = document.createElement("button");
    clear.className = "ghost-button";
    clear.type = "button";
    clear.textContent = "Очистить";
    clear.addEventListener("click", () => {
      state.selected = "";
      renderExam();
    });
    const tools = document.createElement("div");
    tools.className = "digit-tools";
    tools.append(backspace, clear);
    panel.append(grid, tools);
    nodes.options.appendChild(panel);
    return;
  }

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    const selected = question.type === "multi" ? state.selected.includes(index) : state.selected === index;
    const numericOnly = question.image && /^\d+$/.test(String(option).trim());
    button.className = `option${numericOnly ? " is-number-only" : ""}${selected ? " is-selected" : ""}`;
    button.type = "button";
    button.innerHTML = numericOnly
      ? `<span class="option-marker">${index + 1}</span>`
      : `<span class="option-marker">${index + 1}</span><span>${option}</span>`;
    button.addEventListener("click", () => {
      if (question.type === "multi") {
        const set = new Set(state.selected);
        set.has(index) ? set.delete(index) : set.add(index);
        state.selected = [...set].sort((a, b) => a - b);
      } else {
        state.selected = index;
      }
      renderExam();
    });
    nodes.options.appendChild(button);
  });
}

function renderResult() {
  const variant = currentVariant();
  const progress = variantProgress();
  const correct = countCorrect(variant, progress);
  const mistakes = variantLength(variant) - correct;
  nodes.eyebrow.textContent = currentSource().title;
  nodes.screenTitle.textContent = "Итог";
  nodes.resultMeta.textContent = `${currentSubject().title} · ${currentSource().year} · ${variant.title}`;
  nodes.resultTitle.textContent = `${correct}/${variantLength(variant)}`;
  nodes.resultText.textContent = mistakes === 0 ? "Вариант закрыт идеально." : `Ошибок: ${mistakes}. Ниже разбор только проблемных заданий.`;
  nodes.repeatButton.disabled = state.controlMode && !isTeacher();
  nodes.repeatButton.textContent = state.controlMode && !isTeacher() ? "Попытка закрыта" : "Повторить";
  nodes.reviewList.innerHTML = "";
  variant.questions.forEach((question, index) => {
    const answer = progress.answers[index];
    if (isCorrect(question, answer)) return;
    const item = document.createElement("article");
    item.className = "review-item";
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${question.text}`;
    const userAnswer = document.createElement("span");
    userAnswer.textContent = `Ответ: ${formatAnswer(question, answer)}`;
    const correctAnswer = document.createElement("span");
    correctAnswer.textContent = `Правильно: ${formatCorrect(question)}`;
    const explanation = document.createElement("p");
    explanation.textContent = question.explanation;
    item.append(title, userAnswer, correctAnswer, explanation);
    nodes.reviewList.appendChild(item);
  });
  if (!nodes.reviewList.children.length) {
    const item = document.createElement("article");
    item.className = "review-item";
    item.innerHTML = "<strong>Ошибок нет</strong><p>Разбор пустой, потому что все ответы верные.</p>";
    nodes.reviewList.appendChild(item);
  }
}

function renderStats() {
  const values = Object.entries(state.progress).reduce((acc, [variantId, progress]) => {
    const variant = findVariant(variantId);
    if (!variant || !progress.completed) return acc;
    if (isScanVariant(variant)) {
      acc.done += 1;
      return acc;
    }
    const correct = countCorrect(variant, progress);
    acc.done += 1;
    acc.correct += correct;
    acc.total += variantLength(variant);
    return acc;
  }, { done: 0, correct: 0, total: 0 });
  nodes.doneValue.textContent = String(values.done);
  nodes.accuracyValue.textContent = values.total ? `${Math.round(values.correct / values.total * 100)}%` : "0%";
}

function renderSourceNote() {
  if (!state.access) {
    nodes.sourceNote.textContent = "Открытый режим: прогресс пока сохраняется в этом браузере. Регистрация и общий кабинет учителя требуют сервер.";
    return;
  }
  const mode = state.controlMode ? "контрольный режим" : "свободная тренировка";
  nodes.sourceNote.textContent = `${state.access.name} · ${mode} · данные этого прототипа хранятся в браузере.`;
}

function renderTeacher() {
  nodes.eyebrow.textContent = "ЕГЭ · админ";
  nodes.screenTitle.textContent = "Учитель";
  nodes.resetAllButton.classList.remove("is-hidden");
  nodes.controlModeToggle.checked = state.controlMode;
  const submissions = loadSubmissions();
  nodes.teacherReport.innerHTML = "";
  if (!submissions.length) {
    const empty = document.createElement("article");
    empty.className = "review-item";
    empty.innerHTML = "<strong>Пока нет завершенных работ</strong><p>Когда ученик закончит вариант на этом устройстве, запись появится здесь.</p>";
    nodes.teacherReport.appendChild(empty);
    return;
  }
  submissions.slice().reverse().forEach((submission) => {
    const item = document.createElement("article");
    item.className = "review-item";
    const date = new Date(submission.at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
    item.innerHTML = `<strong>${submission.studentName} · ${submission.variantTitle}</strong><span>${submission.subjectTitle} · ${submission.sourceTitle}</span><span>${submission.score}/${submission.total} · ${date}</span><p>Код: ${submission.code}. Устройство: ${submission.deviceId.slice(0, 18)}...</p>`;
    nodes.teacherReport.appendChild(item);
  });
}

function taskTypeLabel(question) {
  if (question.type === "match") return "Сопоставление: заполните таблицу цифрами";
  if (question.type === "short") return "Краткий ответ: введите слово или число";
  if (question.type === "digits") return "Ответ цифрами: нажмите цифры";
  if (question.type === "multi") return "Несколько ответов: выберите цифры";
  return "Один ответ";
}

function letter(index) {
  return "АБВГДЕЖЗ"[index] || String(index + 1);
}

function clearDraft() {
  if (isScanVariant()) return;
  const question = currentQuestion();
  state.selected = question.type === "multi" ? [] : question.type === "short" || question.type === "digits" ? "" : null;
  state.matching = {};
}

function loadDraftFromSaved() {
  const question = currentQuestion();
  const saved = variantProgress().answers[state.questionIndex];
  if (saved?.matching) {
    state.matching = { ...saved.matching };
    return;
  }
  if (saved?.selected !== undefined) {
    state.selected = Array.isArray(saved.selected) ? [...saved.selected] : saved.selected;
    return;
  }
  if (state.selected === null && question.type === "multi") state.selected = [];
  if (state.selected === null && question.type === "digits") state.selected = "";
}

function hasAnswer(question) {
  if (question.type === "match") {
    return question.left.every((_, index) => state.matching[index] !== undefined && state.matching[index] !== "");
  }
  if (question.type === "multi") return Array.isArray(state.selected) && state.selected.length > 0;
  if (question.type === "short" || question.type === "digits") return typeof state.selected === "string" && state.selected.trim().length > 0;
  return state.selected !== null;
}

function saveCurrentAnswer() {
  const question = currentQuestion();
  const progress = variantProgress();
  progress.answers[state.questionIndex] = question.type === "match" ? { matching: { ...state.matching } } : { selected: state.selected };
  delete progress.skipped[state.questionIndex];
  saveProgress();
}

function markCurrentSkipped() {
  const progress = variantProgress();
  delete progress.answers[state.questionIndex];
  progress.skipped[state.questionIndex] = true;
  saveProgress();
}

function leaveCurrentQuestion() {
  if (hasAnswer(currentQuestion())) saveCurrentAnswer();
  else markCurrentSkipped();
}

function goToQuestion(index) {
  if (index === state.questionIndex) return;
  leaveCurrentQuestion();
  state.questionIndex = index;
  clearDraft();
  renderExam();
}

function goNext() {
  saveCurrentAnswer();
  const variant = currentVariant();
  if (state.questionIndex < variant.questions.length - 1) {
    state.questionIndex += 1;
    clearDraft();
    renderExam();
    return;
  }
  const progress = variantProgress();
  progress.completed = true;
  progress.best = Math.max(progress.best, countCorrect(variant, progress));
  saveProgress();
  recordSubmission(variant, progress);
  show("result");
}

function skipCurrentQuestion() {
  markCurrentSkipped();
  const variant = currentVariant();
  if (state.questionIndex < variant.questions.length - 1) {
    state.questionIndex += 1;
    clearDraft();
    renderExam();
    return;
  }
  const progress = variantProgress();
  progress.completed = true;
  progress.best = Math.max(progress.best, countCorrect(variant, progress));
  saveProgress();
  recordSubmission(variant, progress);
  show("result");
}

function restartCurrentVariant() {
  if (state.controlMode && !isTeacher()) {
    alert("В контрольном режиме повторная попытка закрыта.");
    return;
  }
  state.progress[currentVariant().id] = { completed: false, best: 0, answers: {}, skipped: {} };
  state.questionIndex = 0;
  clearDraft();
  saveProgress();
  show(isScanVariant() ? "scan" : "exam");
}

function recordSubmission(variant, progress) {
  if (!state.access || state.access.role !== "student") return;
  const submissions = loadSubmissions();
  const existing = submissions.find((item) => item.variantId === variant.id && item.code === state.access.code && item.deviceId === state.access.deviceId);
  const entry = {
    studentName: state.access.name,
    code: state.access.code,
    deviceId: state.access.deviceId,
    subjectTitle: currentSubject().title,
    sourceTitle: currentSource().title,
    variantId: variant.id,
    variantTitle: variant.title,
    score: countCorrect(variant, progress),
    total: variantLength(variant),
    controlMode: state.controlMode,
    at: new Date().toISOString()
  };
  if (existing) Object.assign(existing, entry);
  else submissions.push(entry);
  saveSubmissions(submissions);
}

function isCorrect(question, answer) {
  if (!answer) return false;
  if (question.type === "match") return question.correct.every((value, index) => Number(answer.matching?.[index]) === value);
  if (question.type === "short" || question.type === "digits") return question.correct.map(normalizeShort).includes(normalizeShort(answer.selected));
  if (question.type === "multi") return sameSet(answer.selected, question.correct);
  return answer.selected === question.correct;
}

function sameSet(a, b) {
  return Array.isArray(a) && a.length === b.length && [...a].sort((x, y) => x - y).every((value, index) => value === [...b].sort((x, y) => x - y)[index]);
}

function countCorrect(variant, progress) {
  if (isScanVariant(variant)) return 0;
  return variant.questions.reduce((sum, question, index) => sum + (isCorrect(question, progress.answers[index]) ? 1 : 0), 0);
}

function formatAnswer(question, answer) {
  if (!answer) return "нет ответа";
  if (question.type === "match") return question.left.map((_, index) => answer.matching?.[index] === undefined ? "-" : Number(answer.matching[index]) + 1).join("");
  if (question.type === "short" || question.type === "digits") return answer.selected || "нет ответа";
  const selected = Array.isArray(answer.selected) ? answer.selected : [answer.selected];
  return selected.map((index) => index + 1).join("");
}

function formatCorrect(question) {
  if (question.type === "match") return question.correct.map((index) => index + 1).join("");
  if (question.type === "short" || question.type === "digits") return question.correct[0];
  const selected = Array.isArray(question.correct) ? question.correct : [question.correct];
  return selected.map((index) => index + 1).join("");
}

function normalizeShort(value) {
  return String(value || "").trim().toLowerCase().replaceAll("ё", "е");
}

function findVariant(variantId) {
  return Object.values(subjects).flatMap((subject) => subject.sources).flatMap((sourceItem) => sourceItem.variants).find((variant) => variant.id === variantId);
}

function goBack() {
  if (state.screen === "sources") show("subjects");
  else if (state.screen === "variants") show("sources");
  else if (state.screen === "exam") show("variants");
  else if (state.screen === "scan") show("variants");
  else if (state.screen === "result") show("variants");
  else if (state.screen === "image") show("exam");
  else if (state.screen === "teacher") show("subjects");
}

function completeCurrentScanVariant() {
  const progress = variantProgress();
  progress.completed = true;
  progress.best = 0;
  saveProgress();
  renderScan();
}

nodes.backButton.addEventListener("click", goBack);
nodes.accessSubmitButton.addEventListener("click", loginWithAccess);
nodes.accessCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginWithAccess();
});
nodes.studentNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") nodes.accessCodeInput.focus();
});
nodes.controlModeToggle.addEventListener("change", () => {
  saveControlMode(nodes.controlModeToggle.checked);
  renderSourceNote();
  renderTeacher();
});
nodes.nextButton.addEventListener("click", goNext);
nodes.skipButton.addEventListener("click", skipCurrentQuestion);
nodes.restartVariantButton.addEventListener("click", restartCurrentVariant);
nodes.completeScanVariantButton.addEventListener("click", completeCurrentScanVariant);
nodes.repeatButton.addEventListener("click", restartCurrentVariant);
nodes.nextVariantButton.addEventListener("click", () => {
  state.variantIndex = (state.variantIndex + 1) % currentSource().variants.length;
  restartCurrentVariant();
});
nodes.resetAllButton.addEventListener("click", () => {
  if (state.controlMode && !isTeacher()) {
    alert("В контрольном режиме ученик не может сбросить результат.");
    return;
  }
  state.progress = {};
  localStorage.removeItem(STORAGE_KEY);
  if (isTeacher()) {
    localStorage.removeItem(SUBMISSIONS_KEY);
    renderTeacher();
    return;
  }
  show("subjects");
});

show(state.screen);
