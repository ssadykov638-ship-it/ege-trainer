function replaceTextLabels(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const replacements = [
    ["Входная диагностика", "Тестовый вариант"],
    ["входная диагностика", "тестовый вариант"]
  ];

  while (walker.nextNode()) {
    let value = walker.currentNode.nodeValue;
    replacements.forEach(([from, to]) => {
      value = value.replaceAll(from, to);
    });
    walker.currentNode.nodeValue = value;
  }
}

replaceTextLabels();

new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = node.nodeValue
          .replaceAll("Входная диагностика", "Тестовый вариант")
          .replaceAll("входная диагностика", "тестовый вариант");
      }
      if (node.nodeType === Node.ELEMENT_NODE) replaceTextLabels(node);
    });
  });
}).observe(document.body, { childList: true, subtree: true });

const PERSONAL_IMPORTS_KEY = "ege-personal-imports-v1";

function readPersonalImports() {
  try {
    return JSON.parse(localStorage.getItem(PERSONAL_IMPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writePersonalImports(imports) {
  localStorage.setItem(PERSONAL_IMPORTS_KEY, JSON.stringify(imports));
}

function normalizeImport(payload) {
  const items = Array.isArray(payload) ? payload : payload.imports || [payload];
  return items.map((item, index) => {
    const subjectId = item.subjectId || item.subject || "social";
    const sourceItem = item.source || item;
    const variants = sourceItem.variants || item.variants || [];
    return {
      subjectId,
      source: {
        id: sourceItem.id || `personal-import-${Date.now()}-${index}`,
        title: sourceItem.title || "Личный импорт",
        year: sourceItem.year || "личный",
        description: sourceItem.description || "Файл загружен только в этот браузер",
        variants: variants.map((variant, variantIndex) => ({
          id: variant.id || `${sourceItem.id || "personal"}-v${variantIndex + 1}`,
          title: variant.title || `Вариант ${variantIndex + 1}`,
          questions: variant.questions || []
        })).filter((variant) => variant.questions.length)
      }
    };
  }).filter((item) => subjects[item.subjectId] && item.source.variants.length);
}

function installPersonalImports() {
  readPersonalImports().forEach((item) => {
    const subject = subjects[item.subjectId];
    if (!subject) return;
    const exists = subject.sources.some((sourceItem) => sourceItem.id === item.source.id);
    if (!exists) subject.sources.unshift(item.source);
  });
}

function handlePersonalImportFile(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const incoming = normalizeImport(JSON.parse(reader.result));
      if (!incoming.length) throw new Error("empty");
      const existing = readPersonalImports().filter((item) => !incoming.some((next) => next.source.id === item.source.id));
      writePersonalImports([...incoming, ...existing]);
      installPersonalImports();
      show("sources");
      alert(`Импортировано источников: ${incoming.length}`);
    } catch {
      alert("Не получилось прочитать файл. Нужен JSON с variants и questions.");
    }
  });
  reader.readAsText(file, "utf-8");
}

function appendPersonalImportCard() {
  if ((window.localInteractiveSources || []).length) return;
  if (!nodes.sourceList || !state.subjectId || nodes.sourceList.querySelector(".personal-import-card")) return;
  const card = document.createElement("button");
  card.className = "card personal-import-card";
  card.type = "button";
  card.innerHTML = `<div><strong>Загрузить личный файл</strong><span>Добавить варианты на этом устройстве без публикации в GitHub</span><div class="badge-line"><b class="badge">JSON</b><b class="badge">хранится в браузере</b></div></div><i>+</i>`;
  card.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => {
      if (input.files && input.files[0]) handlePersonalImportFile(input.files[0]);
    });
    input.click();
  });
  nodes.sourceList.prepend(card);
}

installPersonalImports();

const originalRenderSources = renderSources;
renderSources = function patchedRenderSources() {
  originalRenderSources();
  appendPersonalImportCard();
};

show(state.screen);
