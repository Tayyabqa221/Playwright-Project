const fs = require("fs");
const s = fs.readFileSync(".tmp-trace-latest/0-trace.trace", "utf8");
const start = s.indexOf("btmpl_5c9a2372");
const chunk = s.substring(start, start + 500000);
for (const p of ["text-neutral", "font-medium", "click to edit", "share-template", ">Save<", "ph-no-capture"]) {
  console.log(p, (chunk.split(p).length - 1));
}
const snaps = s.split("\n").filter((l) => l.includes("btmpl_5c9a") && l.includes("frame-snapshot"));
console.log("snapshots on editor", snaps.length);
const last = snaps[snaps.length - 1] || "";
console.log("section title", last.includes("click to edit"));
console.log("save button", /"Save"/.test(last));
console.log("text inputs", (last.match(/"type":"text"/g) || []).length);
const wIdx = last.indexOf("w-full");
console.log("w-full ctx", last.substring(wIdx - 50, wIdx + 200));
const h2 = last.indexOf("Section title");
console.log("h2 ctx", last.substring(h2 - 200, h2 + 200));
const saveMatches = [...last.matchAll(/save/gi)].slice(0, 5);
saveMatches.forEach((m) => console.log("save@", m.index, last.substring(m.index - 60, m.index + 80)));
const mp = last.indexOf("Meeting Prep");
if (mp > 0) console.log("meeting prep ctx", last.substring(mp - 150, mp + 200));
const pv = [...last.matchAll(/__playwright_value_/g)];
console.log("playwright values count", pv.length);
