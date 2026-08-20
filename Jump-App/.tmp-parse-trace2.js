const fs = require("fs");
const lines = fs.readFileSync(".tmp-trace-latest/0-trace.trace", "utf8").split("\n");
const snaps = lines.filter((l) => l.includes("btmpl_5c9a") && l.includes("frame-snapshot"));
const first = snaps[0] || "";
console.log("first snap len", first.length);
const inputs = [...first.matchAll(/\["INPUT",\{[^\]]+\]/g)].map((m) => m[0].slice(0, 350));
console.log("inputs", inputs.length);
inputs.forEach((x, i) => console.log(i, x));
const buttons = [...first.matchAll(/\["BUTTON",\{[^\]]{0,200}/g)].slice(0, 15);
console.log("buttons sample", buttons.length);
buttons.forEach((m) => {
  if (/save|done|template/i.test(m[0])) console.log(m[0]);
});
const nm = first.indexOf("New Meeting");
console.log("New Meeting occurrences", (first.match(/New Meeting/g) || []).length);
if (nm > 0) console.log(first.substring(nm - 200, nm + 300));
const editable = first.indexOf("contenteditable");
console.log("contenteditable count", (first.match(/contenteditable/g) || []).length);
for (const p of ["template name", "Template name", "display name", "Rename", "title input", "text-lg font-medium", "neutral-800"]) {
  console.log(p, first.includes(p));
}
const clicks = [...first.matchAll(/phx-click="[^"]{0,80}/g)].map((m) => m[0]).filter((x) => /name|title|rename|template/i.test(x));
console.log("phx-click name related", clicks.slice(0, 20));
const pm = [...first.matchAll(/ProseMirror[^"]{0,120}/g)].slice(0, 8);
pm.forEach((m, i) => console.log("pm", i, m[0]));
