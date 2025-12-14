# Claude Code Project Rules

## Pre-commit Checklist (MANDATORY)

Before ANY commit, ALWAYS run these commands and fix all issues:

```bash
npm run test:xo    # XO linter - must pass with 0 errors
npm test           # Jest tests - all must pass
npm run build      # Next.js build - must succeed
```

Do NOT commit if any of these fail. Fix all issues first.

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

## Builder.io Models

When creating Builder.io models:
- Use v2 admin API (`https://builder.io/api/v2/admin`), NOT v1 graphql
- Always add `@type: '@builder.io/core:Field'` to field definitions
- Always verify the model exists after creation by listing models
- Include `helperText` (description) for all models and fields

## Common Mistakes to Avoid

1. Committing without running linter first
2. Forgetting to update test imports after moving files
3. Using `||` instead of `??` for optional values
4. Adding parentheses around single arrow function parameters
5. Not escaping `()` in jest glob patterns
6. Assuming Builder.io models exist without verifying
7. Forgetting helperText/description on Builder.io models
