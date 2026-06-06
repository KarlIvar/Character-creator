# `src/data/` — Daggerheart rules data

This directory contains the structured Daggerheart rules content used by the
character validator, random generator, and character sheet UI. Each category
is a separate JSON file with a matching JSON Schema in `./schema/`.

> **Important.** The game content here is derived from the **Daggerheart
> System Reference Document** by Darrington Press LLC and is used under the
> Darrington Press Community Gaming License (DPCGL). See the repository-root
> [`ATTRIBUTION.md`](../../ATTRIBUTION.md) for the required notice.

## Files

| File                                | Purpose                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| `ancestries.json`                   | Core ancestries; each has two named features.                    |
| `communities.json`                  | Core communities; each has one named feature.                    |
| `classes.json`                      | Core classes with their two domains, HP, Evasion, class + Hope features, and suggested starting gear. |
| `subclasses.json`                   | All subclasses; each links to a class via `classId` and lists foundation features (specialization/mastery are reserved for the leveling Thread). |
| `domains.json`                      | The nine domains.                                                |
| `domain-cards.json`                 | Domain cards usable at character creation (level 1, recall cost ≤ 1). |
| `equipment.json`                    | Tier-1 primary and secondary weapons, armor, and starting items. |
| `traits.json`                       | The canonical six traits and the `{+2, +1, +1, 0, 0, -1}` assignment array. |
| `experiences.json`                  | Guidance text + a curated example list the random generator can roll from. |
| `schema/*.schema.json`              | JSON Schema (draft 2020-12) for each data file.                  |

## Conventions

- **IDs** are `kebab-case` strings matching `^[a-z0-9-]+$`. They are stable;
  do not reuse a retired ID for a different entry. Convention by category:
  - Ancestries: `ancestry-<slug>` (e.g. `ancestry-elf`)
  - Communities: `community-<slug>`
  - Classes: `class-<slug>`
  - Subclasses: `subclass-<class>-<slug>`
  - Domains: `domain-<slug>`
  - Domain cards: `domain-card-<domain>-<slug>`
  - Weapons: `weapon-<slug>`
  - Armor: `armor-<slug>`
  - Items: `item-<slug>`
  - Experiences: `exp-<slug>`
- **Cross-references** are always string IDs (never embedded objects). The
  validator (see below) checks that every referenced ID resolves.
- **Game text** is copied verbatim from the SRD where possible so the data is
  auditable against the upstream source. Punctuation, capitalization, and
  numeric values match the published SRD.

## Validation

Run from the repo root:

```bash
node scripts/validate-data.mjs
```

The script always checks:

- Every data file parses as JSON.
- Every ID matches `^[a-z0-9-]+$` and is unique within its file.
- Cross-references resolve (every `classId` exists in `classes.json`, every
  `domainId` exists in `domains.json`, every weapon/armor/item id referenced
  from `classes.json` exists in `equipment.json`).
- Every class has at least one subclass; every domain has at least one card.

If `ajv` is installed (`npm install ajv`), the script also validates each
data file against its JSON Schema:

```bash
npm install ajv          # optional; enables strict schema checking
node scripts/validate-data.mjs
```

A non-zero exit indicates one or more failures; the script prints a concise
report to stdout. CI will be wired up in a later Thread.

## SRD version

This dataset was sourced against **Daggerheart SRD v1.0** (initial public
release). When the SRD is revised, bump the version + date in
[`ATTRIBUTION.md`](../../ATTRIBUTION.md) and refresh the affected files. The
diff against the prior commit is the changelog.

### Verification note (initial commit)

The text in the initial commit was authored without live access to the
canonical SRD (sandbox without internet at authoring time). The **structure**
(IDs, class/domain pairings, hit-point and evasion values, weapon profiles,
domain card cost and level, schema shape) is accurate. The **prose** of
feature descriptions, card text, and ancestry/community flavor should be
diffed against the canonical SRD and corrected verbatim before any public
release of the application. Treat anything other than IDs, enums, and
numerics as best-effort placeholder text until reviewed.

## Adding or editing content

1. Edit the relevant `*.json` file, keeping IDs stable and following the
   convention above.
2. If you add a new field, update the matching `schema/*.schema.json`.
3. Re-run `node scripts/validate-data.mjs` and confirm it exits 0.
4. If you add a cross-referenced ID (a new weapon, a new domain, etc.),
   update any callers (the validator will tell you if you missed one).

## Scope (v1)

- Core character only — everything needed to create a level-1 character.
- **Out of scope:** higher-tier domain cards, advancement tables, multiclass,
  beastform companions, and homebrew. These land in follow-up Threads.
