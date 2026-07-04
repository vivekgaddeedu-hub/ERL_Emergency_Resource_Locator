# Contributing to ERL

Thanks for your interest in making ERL better! 🚨

## Development

```bash
npm install
npm run dev
```

## Workflow

1. Fork the repo and create your branch from `main`
2. Run `npm run verify` locally before pushing (lint + typecheck + tests + build)
3. Open a Pull Request with a clear description of the change
4. Ensure CI is green

## Coding style

- TypeScript strict mode
- Tailwind for styling (utility-first; promote repeated patterns to `components/ui/`)
- File names match component names
- Public functions in `lib/` and `utils/` have JSDoc comments
- Tests live next to the area they cover (`tests/unit/*.test.ts`)

## Pull request checklist

- [ ] Lint passes (`npm run lint`)
- [ ] Type-check passes (`npm run type-check`)
- [ ] All tests pass (`npm run test`)
- [ ] New code has test coverage
- [ ] Public APIs are documented
