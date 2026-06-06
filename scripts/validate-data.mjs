#!/usr/bin/env node
// Validates Daggerheart data files in src/data/.
//
// Always runs:
//   - JSON parse check on every data file and schema file
//   - ID format (kebab-case) + uniqueness checks
//   - Cross-reference resolution (classes -> domains, subclasses -> classes, ...)
//
// If `ajv` is available (e.g. `npm install ajv` has been run), the script
// additionally validates each data file against its JSON Schema. This is
// optional so the script works on a clean checkout with no package.json.
//
// Exits 0 on success, 1 on any failure. Prints a concise report to stdout.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dataDir = path.join(repoRoot, "src", "data");
const schemaDir = path.join(dataDir, "schema");

const ID_PATTERN = /^[a-z0-9-]+$/;

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    err(`${path.relative(repoRoot, p)}: failed to parse JSON — ${e.message}`);
    return null;
  }
}

// 1. Load every data file.
const files = {
  ancestries: "ancestries.json",
  communities: "communities.json",
  classes: "classes.json",
  subclasses: "subclasses.json",
  domains: "domains.json",
  domainCards: "domain-cards.json",
  equipment: "equipment.json",
  traits: "traits.json",
  experiences: "experiences.json",
};

const data = {};
for (const [k, name] of Object.entries(files)) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) {
    err(`missing data file: src/data/${name}`);
    continue;
  }
  data[k] = loadJson(p);
}

// 2. Load every schema file.
const schemaFiles = {
  ancestries: "ancestries.schema.json",
  communities: "communities.schema.json",
  classes: "classes.schema.json",
  subclasses: "subclasses.schema.json",
  domains: "domains.schema.json",
  domainCards: "domain-cards.schema.json",
  equipment: "equipment.schema.json",
  traits: "traits.schema.json",
  experiences: "experiences.schema.json",
};

const schemas = {};
for (const [k, name] of Object.entries(schemaFiles)) {
  const p = path.join(schemaDir, name);
  if (!fs.existsSync(p)) {
    err(`missing schema file: src/data/schema/${name}`);
    continue;
  }
  schemas[k] = loadJson(p);
}

// 3. Structural checks: id format + uniqueness within each collection.
function checkIds(collection, items, getId = (x) => x.id) {
  if (!Array.isArray(items)) return;
  const seen = new Map();
  for (const item of items) {
    const id = getId(item);
    if (id === undefined || id === null) {
      err(`${collection}: entry missing id (${JSON.stringify(item).slice(0, 80)}...)`);
      continue;
    }
    if (!ID_PATTERN.test(id)) {
      err(`${collection}: id "${id}" does not match ${ID_PATTERN}`);
    }
    if (seen.has(id)) {
      err(`${collection}: duplicate id "${id}"`);
    }
    seen.set(id, item);
  }
}

if (data.ancestries) checkIds("ancestries", data.ancestries);
if (data.communities) checkIds("communities", data.communities);
if (data.classes) checkIds("classes", data.classes);
if (data.subclasses) checkIds("subclasses", data.subclasses);
if (data.domains) checkIds("domains", data.domains);
if (data.domainCards) checkIds("domain-cards", data.domainCards);
if (data.equipment) {
  checkIds("equipment.primaryWeapons", data.equipment.primaryWeapons);
  checkIds("equipment.secondaryWeapons", data.equipment.secondaryWeapons);
  checkIds("equipment.armor", data.equipment.armor);
  checkIds("equipment.items", data.equipment.items);
}
if (data.experiences && Array.isArray(data.experiences.examples)) {
  checkIds("experiences.examples", data.experiences.examples);
}

// 4. Build lookup sets for cross-reference checks.
const classIds = new Set((data.classes ?? []).map((c) => c.id));
const domainIds = new Set((data.domains ?? []).map((d) => d.id));
const weaponIds = new Set();
const armorIds = new Set();
const itemIds = new Set();
if (data.equipment) {
  for (const w of data.equipment.primaryWeapons ?? []) weaponIds.add(w.id);
  for (const w of data.equipment.secondaryWeapons ?? []) weaponIds.add(w.id);
  for (const a of data.equipment.armor ?? []) armorIds.add(a.id);
  for (const i of data.equipment.items ?? []) itemIds.add(i.id);
}

// 5. Cross-references.
for (const c of data.classes ?? []) {
  for (const d of c.domains ?? []) {
    if (!domainIds.has(d)) err(`classes: class "${c.id}" references unknown domain "${d}"`);
  }
  for (const w of c.suggestedPrimaryWeapons ?? []) {
    if (!weaponIds.has(w)) err(`classes: class "${c.id}" references unknown primary weapon "${w}"`);
  }
  for (const w of c.suggestedSecondaryWeapons ?? []) {
    if (!weaponIds.has(w)) err(`classes: class "${c.id}" references unknown secondary weapon "${w}"`);
  }
  for (const a of c.suggestedArmor ?? []) {
    if (!armorIds.has(a)) err(`classes: class "${c.id}" references unknown armor "${a}"`);
  }
  for (const i of c.startingInventory ?? []) {
    if (!itemIds.has(i)) err(`classes: class "${c.id}" references unknown item "${i}"`);
  }
}

for (const s of data.subclasses ?? []) {
  if (!classIds.has(s.classId)) {
    err(`subclasses: subclass "${s.id}" references unknown classId "${s.classId}"`);
  }
}

for (const card of data.domainCards ?? []) {
  if (!domainIds.has(card.domainId)) {
    err(`domain-cards: card "${card.id}" references unknown domainId "${card.domainId}"`);
  }
}

// Every class should have at least one subclass.
const subclassesByClass = new Map();
for (const s of data.subclasses ?? []) {
  const list = subclassesByClass.get(s.classId) ?? [];
  list.push(s.id);
  subclassesByClass.set(s.classId, list);
}
for (const c of data.classes ?? []) {
  if (!subclassesByClass.has(c.id)) {
    err(`classes: class "${c.id}" has no subclass in subclasses.json`);
  }
}

// Every domain should have at least one card.
const cardsByDomain = new Map();
for (const card of data.domainCards ?? []) {
  cardsByDomain.set(card.domainId, (cardsByDomain.get(card.domainId) ?? 0) + 1);
}
for (const d of data.domains ?? []) {
  if (!cardsByDomain.has(d.id)) {
    warn(`domains: domain "${d.id}" has no domain cards in domain-cards.json`);
  }
}

// 6. Optional: ajv schema validation if installed.
let ajvUsed = false;
try {
  const { default: Ajv2020 } = await import("ajv/dist/2020.js");
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajvUsed = true;
  const validators = {};
  for (const [k, s] of Object.entries(schemas)) {
    if (s) validators[k] = ajv.compile(s);
  }
  for (const [k, validate] of Object.entries(validators)) {
    if (!data[k]) continue;
    if (!validate(data[k])) {
      for (const e of validate.errors ?? []) {
        err(`schema ${k}: ${e.instancePath || "(root)"} ${e.message}`);
      }
    }
  }
} catch (e) {
  if (e.code === "ERR_MODULE_NOT_FOUND") {
    warn(
      "ajv not installed; skipping JSON Schema validation. " +
        "Run `npm install ajv` for full schema validation.",
    );
  } else {
    err(`ajv failure: ${e.message}`);
  }
}

// 7. Report.
const counts = {
  ancestries: data.ancestries?.length ?? 0,
  communities: data.communities?.length ?? 0,
  classes: data.classes?.length ?? 0,
  subclasses: data.subclasses?.length ?? 0,
  domains: data.domains?.length ?? 0,
  domainCards: data.domainCards?.length ?? 0,
  weapons: weaponIds.size,
  armor: armorIds.size,
  items: itemIds.size,
};

console.log("Daggerheart data validation");
console.log("==========================");
for (const [k, v] of Object.entries(counts)) {
  console.log(`  ${k.padEnd(14)} ${v}`);
}
console.log(`  ajv schema check: ${ajvUsed ? "yes" : "skipped (ajv not installed)"}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length) {
  console.log("\nErrors:");
  for (const e of errors) console.log(`  - ${e}`);
  console.log(`\nFAIL: ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log("\nOK: data is valid.");
  process.exit(0);
}
