# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project uses release tags for versioning.

## [0.1.0] - 2026-02-09

### Added

- Full milestone implementation from `M0` to `M10`.
- Core calculators for estate, thresholds, trust charges, and quick succession relief.
- HMRC/synthetic fixture integration suites for milestones `M1` through `M10`.
- Global fixture validation harness in `tests/integration/hmrc-fixtures/m10.test.ts` validating all `23` fixture files.
- GitHub Actions CI workflow enforcing build and coverage checks on every push and PR.
- GitHub Actions Claude Code PR review workflow aligned with `premeet-advisor` pattern.

### Changed

- Estate output/breakdown now includes QSR-specific apportionment breakdown fields.
- Fixture loader expanded to normalize mixed fixture schemas used across HMRC and synthetic datasets.
- Tax year configuration expanded to include historical year support required by fixtures.

### Quality

- Automated checks passing:
  - `npm test`
  - `npm run build`
  - `npm run test:coverage`
- Coverage gate status:
  - Statements: `98.07%`
  - Branches: `91.84%`
  - Functions: `100%`
  - Lines: `98.06%`

[0.1.0]: https://github.com/trlxo9/inheritance-tax-calculator/releases/tag/v0.1.0
