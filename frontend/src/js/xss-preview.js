const xssPreviewAllowedTags = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "CODE",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "LI",
]);

const xssPreviewBlockedTags = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "SVG",
  "MATH",
  "TEMPLATE",
]);

function createSafeXssPreview(input) {
  const preview = document.createDocumentFragment();
  const tokens = String(input ?? "").match(/<[^>]*>|[^<]+|</g) || [];
  const elementStack = [preview];
  const blockedTagStack = [];

  for (const token of tokens) {
    const tag = token.match(/^<\s*(\/?)\s*([a-z][a-z0-9-]*)\b([^>]*)>$/i);

    if (!tag) {
      if (blockedTagStack.length === 0) {
        elementStack[elementStack.length - 1].appendChild(
          document.createTextNode(token),
        );
      }
      continue;
    }

    const [, closing, rawTagName, attributes] = tag;
    const tagName = rawTagName.toUpperCase();
    const isClosing = closing === "/";

    if (blockedTagStack.length > 0) {
      if (xssPreviewBlockedTags.has(tagName)) {
        if (isClosing) {
          const blockedIndex = blockedTagStack.lastIndexOf(tagName);
          if (blockedIndex !== -1) {
            blockedTagStack.length = blockedIndex;
          }
        } else if (!attributes.trim().endsWith("/")) {
          blockedTagStack.push(tagName);
        }
      }
      continue;
    }

    if (xssPreviewBlockedTags.has(tagName)) {
      if (!isClosing && !attributes.trim().endsWith("/")) {
        blockedTagStack.push(tagName);
      }
      continue;
    }

    if (!xssPreviewAllowedTags.has(tagName)) {
      elementStack[elementStack.length - 1].appendChild(
        document.createTextNode(token),
      );
      continue;
    }

    if (isClosing) {
      for (let index = elementStack.length - 1; index > 0; index -= 1) {
        if (elementStack[index].nodeName === tagName) {
          elementStack.length = index;
          break;
        }
      }
      continue;
    }

    const element = document.createElement(tagName.toLowerCase());
    elementStack[elementStack.length - 1].appendChild(element);

    if (tagName !== "BR" && !attributes.trim().endsWith("/")) {
      elementStack.push(element);
    }
  }

  return preview;
}
