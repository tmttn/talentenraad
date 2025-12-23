# Claude Code Project Rules

## Pre-commit Checklist (MANDATORY)

Before ANY commit, ALWAYS run these commands and fix all issues:

```bash
npm run test:xo    # XO linter - must pass with 0 errors
npm test           # Jest tests - all must pass
npm run build      # Next.js build - must succeed
```

Do NOT commit if any of these fail. Fix all issues first.

## Workflow

After completing a working unit of code:
1. Run the pre-commit checklist (linter, tests, build)
2. Commit the changes with a descriptive message
3. Push to origin

Always commit and push after finishing a task, don't wait for the user to ask.

## XO Linter Rules

This project uses XO with strict TypeScript settings:

- **No parentheses around single arrow function params**: Use `item => item.id` not `(item) => item.id`
- **Use nullish coalescing**: Use `value ?? fallback` not `value || fallback`
- **No unsafe any**: Always type API responses with `as TypeName`
- **camelCase variables**: Use `builderApiKey` not `BUILDER_API_KEY`

## Jest Configuration

- **Escape special chars in glob patterns**: Route groups like `(main)` must be escaped as `\\(main\\)` in jest.config.ts
- **Update test imports after moving files**: When files move to route groups, update all test import paths

## Project Structure

- `app/(main)/` - Main site pages with header/footer layout
- `app/(builder-preview)/` - Isolated Builder.io preview pages (no header/footer)
- `__tests__/` - Jest test files mirroring app structure

## After Refactoring

When moving files or creating route groups:
1. Update ALL related test import paths
2. Update jest.config.ts coverage exclusions (escape parentheses)
3. Run full test suite before committing

## Builder.io API Usage

### API Keys
- **Public API Key**: `NEXT_PUBLIC_BUILDER_API_KEY` - For reading content (CDN)
- **Private Write Key**: `BUILDER_PRIVATE_KEY` - For writing/updating content (starts with `bpk-`)

### Read API (CDN)
Use the CDN endpoint for reading published content:
```bash
# List content entries
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&limit=10"

# Get single entry by ID
curl "https://cdn.builder.io/api/v3/content/{model}/{entryId}?apiKey={PUBLIC_KEY}"

# Query by field (e.g., URL)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&query.data.url=/"

# Filter by date (use $gte, $lte, $gt, $lt)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&query.data.datum.\$gte=2025-01-01"

# Bypass CDN cache (for debugging only)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&noCache=true"
```

### Write API
Use the Write API to create or update content:
```bash
# Create new entry (POST)
curl -X POST "https://builder.io/api/v1/write/{model}" \
  -H "Authorization: Bearer {PRIVATE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"data": {"blocks": [...]}}'

# Update existing entry by ID (PUT)
curl -X PUT "https://builder.io/api/v1/write/{model}/{entryId}" \
  -H "Authorization: Bearer {PRIVATE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"data": {"blocks": [...]}}'
```

### Important Notes
1. **Always find entry ID first** before updating - use Read API to get the ID
2. **CDN caching**: Changes may take 1-5 minutes to propagate on CDN
3. **Use `noCache=true`** to verify updates immediately (debugging only)
4. **POST creates new entries**, PUT updates existing ones
5. **Query uses `$eq`, `$gte`, `$lte`** - escape the `$` in bash with `\$`

### Builder.io Models
When creating Builder.io models:
- Use v2 admin API (`https://builder.io/api/v2/admin`), NOT v1 graphql
- Always add `@type: '@builder.io/core:Field'` to field definitions
- Always verify the model exists after creation by listing models
- Include `helperText` (description) for all models and fields

## Configuration Restrictions (CRITICAL)

**DO NOT modify the following files without explicit user permission:**

- `jest.config.ts` - Test configuration including coverage thresholds
- `xo.config.cjs` or `.xo-config.json` - ESLint/XO linter configuration
- `.eslintrc.*` - Any ESLint configuration files
- `tsconfig.json` - TypeScript configuration

**Coverage thresholds are set to 50% and must NOT be lowered.** If tests fail due to coverage:
1. Write additional tests to increase coverage
2. Do NOT reduce the threshold values
3. Ask the user for guidance if coverage cannot be reasonably achieved

This rule exists to maintain code quality standards. Circumventing these rules by modifying configuration is strictly prohibited.

## Common Mistakes to Avoid

1. Committing without running linter first
2. Forgetting to update test imports after moving files
3. Using `||` instead of `??` for optional values
4. Adding parentheses around single arrow function parameters
5. Not escaping `()` in jest glob patterns
6. Assuming Builder.io models exist without verifying
7. Forgetting helperText/description on Builder.io models
8. Modifying test/linter configuration to bypass failing checks
