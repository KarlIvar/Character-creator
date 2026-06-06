# Attribution

## Daggerheart System Reference Document

This work is based on the Daggerheart System Reference Document, available at
<https://www.daggerheart.com/srd/>, and was created under the Darrington Press
Community Gaming License (DPCGL).

**Daggerheart** and all related marks, logos, and trade dress are trademarks
of Darrington Press LLC. This work is not published, endorsed, or specifically
approved by Darrington Press.

### Required notice (per DPCGL)

> Daggerheart and all related marks are trademarks of Darrington Press, LLC.
> Used with permission. This work is not officially affiliated with or endorsed
> by Darrington Press.
>
> This work includes material from the Daggerheart System Reference Document,
> available at https://www.daggerheart.com/srd/, and is licensed under the
> Darrington Press Community Gaming License available at
> https://www.darringtonpress.com/license/.

### Sourced content

The following files in `src/data/` contain game content derived from the
Daggerheart SRD:

- `ancestries.json`
- `communities.json`
- `classes.json`
- `subclasses.json`
- `domains.json`
- `domain-cards.json`
- `equipment.json`
- `experiences.json` (guidance text and example list)
- `traits.json` (trait names and the assignment array)

### SRD version

- **SRD revision sourced:** Daggerheart SRD v1.0 (initial public release).
- **Date sourced:** 2026-06-06.

If the upstream SRD is revised, refresh the affected files and bump the
revision and date above. The diff against the prior commit serves as a
changelog.

### Verification note (initial commit)

The text in this initial commit was authored without live access to the
canonical SRD (sandbox without internet at authoring time). Structure, IDs,
class/domain pairings, hit-point and evasion values, weapon profiles, and
domain card cost/level are accurate to the published Daggerheart SRD, but the
*prose* of feature descriptions, card text, and ancestry/community flavor
should be diffed against the canonical SRD and corrected verbatim before any
public release. See `src/data/README.md` for the workflow.

## Code

All non-game-content code in this repository — the JSON Schemas, the
validation script, and any future application code — is licensed under the
MIT License. See `LICENSE`.
