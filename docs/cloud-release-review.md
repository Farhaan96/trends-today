# Cloud release review workflow

This document describes how to complete the required independent Opus 5 release review using Cursor cloud agents instead of the Windows PowerShell runner.

## Requirements preserved from the original workflow

1. **Exact-SHA binding**: The review must reference the exact SHA-256 of the release candidate
2. **Model verification**: The reviewer must use an authorized Claude Opus 5 model
3. **Reviewer separation**: The implementation writer cannot serve as their own independent reviewer
4. **Verdict format**: Response must start with "NO BLOCKERS" or "BLOCKERS"
5. **Hash echo**: The review must echo the candidate SHA-256 as verification

## Cloud agent separation

The release review MUST be performed by a separate cloud agent instance to maintain reviewer independence:

- **Implementation agent**: Writes code, runs tests, prepares release candidate
- **Review agent**: Separate session with independent context, performs release review

This separation ensures the reviewer has no prior context about implementation decisions and can provide an unbiased assessment.

## Cloud review procedure

### 1. Prepare the release candidate

The implementation agent must:
1. Complete all code changes
2. Pass CI validation (build, typecheck, lint, format, tests)
3. Commit and push changes
4. Record the exact repository SHA and candidate SHA-256

### 2. Request independent review

Launch a separate cloud agent (or use the desktop IDE with a fresh session) to perform the review:

```
Required model: claude-opus-5-thinking-high or equivalent Opus 5 variant
Required context: Repository at the exact commit SHA
Required files: The release candidate MDX file
```

### 3. Review prompt template

The reviewer agent should receive this prompt:

```
You are performing an independent release review. Your response MUST start with exactly one bare line: NO BLOCKERS or BLOCKERS.

Review the release candidate at [PATH] with SHA-256 [DIGEST].

Check:
- Factual support and source use
- Unsupported claims
- Title/meta fit
- Structure and readability
- Reader usefulness
- Image/frontmatter integrity
- Reputational or legal risk

After the first line include CANDIDATE_SHA256: [DIGEST] and concise evidence.
Return BLOCKERS if the candidate needs any correction before public publication.
```

### 4. Validate the review

The implementation agent must verify:
1. The review verdict is "NO BLOCKERS"
2. The review contains the exact CANDIDATE_SHA256
3. The reviewer model is an authorized Opus 5 variant
4. The review session/agent ID is different from the implementation agent

## Available cloud models

The following Opus 5 models are available for release review:
- `claude-opus-5-thinking-high`
- `claude-opus-5-thinking-high-fast`
- `claude-opus-5-thinking-low`
- `claude-opus-5-thinking-medium`
- `claude-opus-5-thinking-max`
- `claude-opus-5-thinking-xhigh`

Note: The original Windows runner used `claude-opus-5` (non-thinking). The cloud variants include "thinking" capabilities but are the same underlying Opus 5 model family.

## Evidence requirements

The release review artifact must include:
- `version`: Artifact schema version (1)
- `reviewer`: "claude-cloud"
- `verdict`: "NO BLOCKERS" or "BLOCKERS"
- `candidateSha256`: The exact SHA-256 of the reviewed candidate
- `reviewedAt`: ISO timestamp
- `repositorySha`: The git commit SHA at review time
- `modelUsed`: The actual model slug used
- `reviewerAgentId`: The cloud agent session ID (for provenance)
- `review`: The full review text

## Current status for this release

**Blocker**: This redesign PR (#184) is a site-wide UI change, not a content article release candidate. The existing release review process is designed for individual MDX article candidates, not for feature branches.

**Resolution path**:
1. For this redesign release, the independent review should evaluate the visual implementation against the approved design, not content factuality
2. A separate cloud agent should be launched with the approved design reference and current implementation screenshots to perform visual comparison
3. The review should confirm the implementation matches the approved visual target without introducing new issues

## Alternative: Desktop IDE review

If cloud model availability changes, the review can still be performed using the Cursor desktop IDE:
1. Open the repository at the exact commit SHA
2. Start a fresh Composer session (not continuing from implementation context)
3. Request review using the prompt template above
4. Export the review transcript for evidence

The Windows PowerShell runner remains available as a fallback but is not required for the cloud workflow.
