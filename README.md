# Trends Today content business engine

Trends Today is an owned-media system for researching, producing, measuring, and improving useful general-interest content. Its job is to grow qualified attention, build a returning audience, create attributable discovery for Farhaan's apps, and develop audience revenue over time.

The engine does not optimize for a fixed number of articles. It optimizes the measured loop:

`demand signal -> research -> opportunity score -> brief -> draft -> QA -> release candidate -> review -> publish -> measure -> keep / repair / stop`

The operating model, constraints, experiment, portfolio, and scorecard are documented in [docs/content-business-operating-system.md](docs/content-business-operating-system.md) and configured in [config/content-business.json](config/content-business.json).

## Safety and release model

Research, scoring, drafting, QA, image work, SEO validation, and repair can run autonomously. The default output is a release candidate under `artifacts/editorial/release-candidates/`, outside the live Next.js content tree.

Public promotion is a single final gate. Production mode requires `--approved-by` and writes to `content/<category>/`, the directory consumed by `src/lib/article-utils.ts`. Scheduled GitHub workflows only produce research and scorecard artifacts; they do not push content or trigger a deployment.

## Setup

Requirements:

- Node.js 20+
- Python 3.10+
- `requests` and `python-dotenv` for the research pipeline
- the API keys needed by the selected research providers
- a signed-in local Claude CLI for the configured drafting and independent-review paths

```powershell
npm ci
python -m pip install requests python-dotenv
```

## Operating commands

Create an unscored research queue. Discovery output is never silently treated as proof:

```powershell
python apps/pipeline/runner.py research --limit 15 --output reports/editorial/research-queue.json
```

After enriching candidates with demand, audience, source, angle, lane, CTA, and rating evidence, rank them:

```powershell
python apps/pipeline/strategy.py research/candidates.json --output reports/editorial/ranked-candidates.json
```

Generate autonomous release candidates only from rows with `decision=brief`:

```powershell
python apps/pipeline/runner.py candidate --candidate-file reports/editorial/ranked-candidates.json --limit 1
```

Promote the exact reviewed and approved candidate into the live content tree:

```powershell
python apps/pipeline/runner.py promote --release-candidate artifacts/editorial/release-candidates/science/example.mdx --approved-by Farhaan
```

Promotion records the candidate SHA-256 and changes only release metadata. It is not deployment; merge, deploy, and public publication remain part of the same final authorized release.

Build the weekly repository scorecard. Supplying no analytics produces an explicit measurement-gap result rather than fake zeroes:

```powershell
python apps/pipeline/scorecard.py --output reports/editorial/weekly-scorecard.json
```

## Validation

```powershell
python -m unittest discover apps/pipeline/tests
python -m compileall apps/pipeline
npm run typecheck
npm run build
```

A release candidate is blocked when it has fewer than three valid source URLs, uncited sources, unsupported length or structure, more than two em dashes, no SEO slug, or a placeholder image.

## Active project structure

- `src/`: Next.js application.
- `content/<category>/`: public MDX source of truth.
- `public/images/`: active image assets.
- `apps/pipeline/`: research, scoring, drafting, QA, staging, and scorecard tools.
- `artifacts/editorial/release-candidates/`: non-public candidate output.
- `config/content-business.json`: current business and scoring hypothesis.
- `docs/content-business-operating-system.md`: operator runbook and scoreboard.

The older `apps/web/content/posts` implementation is not the active site content source and must not be used for new publication.
