type TemplateValue = string | number | boolean | null | undefined | Date;

type TemplateValueMap = Record<string, TemplateValue>;

function toReplacementValue(value: TemplateValue) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function personalizeTemplate(template: string, values: TemplateValueMap) {
  const normalizedValues = Object.entries(values).reduce<Record<string, string>>((accumulator, [key, value]) => {
    accumulator[key.trim().toLowerCase()] = toReplacementValue(value);
    return accumulator;
  }, {});

  return template.replace(/\{\s*([^{}]+?)\s*\}/g, (match, token) => {
    const normalizedToken = String(token).trim().toLowerCase();

    return Object.prototype.hasOwnProperty.call(normalizedValues, normalizedToken)
      ? normalizedValues[normalizedToken]
      : match;
  });
}