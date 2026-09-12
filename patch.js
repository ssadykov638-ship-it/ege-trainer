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
