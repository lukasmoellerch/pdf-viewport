const inserted = new Set<string>();
export function ensureStylesheetRule(
  id: string,
  selector: string,
  properties: [string, string, string?][]
) {
  if (inserted.has(id)) return;
  addStylesheetRule(selector, properties);
  inserted.add(id);
}

export function addStylesheetRule(
  selector: string,
  properties: [string, string, string?][]
) {
  var styleEl = document.createElement("style");

  styleEl.appendChild(document.createTextNode(""));

  // Append <style> element to <head>
  document.head.appendChild(styleEl);
  // Grab style element's sheet
  var styleSheet = styleEl.sheet;

  let propStr = "";

  for (let j = 0; j < properties.length; j++) {
    let prop = properties[j];
    propStr +=
      prop[0] + ": " + prop[1] + (prop[2] ? " !important" : "") + ";\n";
  }
  const rule = selector + "{" + propStr + "}";

  // Insert CSS Rule
  styleSheet!.insertRule(rule);
}
