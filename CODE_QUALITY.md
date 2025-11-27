# Code Quality & Linting Setup

This project enforces code quality using ESLint and Prettier with pre-commit hooks powered by Husky.

## 🛠️ Tools Configured

### ESLint

- **Version**: 8.57.1
- **Configuration**: [.eslintrc.json](.eslintrc.json)
- **Plugins**:
  - `@typescript-eslint` - TypeScript linting rules
  - `eslint-plugin-react` - React best practices
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-config-prettier` - Disables conflicting ESLint rules

### Prettier

- **Version**: 3.6.2
- **Configuration**: [.prettierrc](.prettierrc)
- **Settings**:
  - Single quotes
  - No semicolons
  - 2-space indentation
  - 100 character line width
  - Trailing commas in ES5

### Husky & lint-staged

- **Pre-commit hook**: Automatically runs linting and formatting on staged files
- **Pre-push hook**: Runs TypeScript type checking before pushing

## 📋 Available Scripts

### Linting

```bash
# Check for lint errors
pnpm lint

# Automatically fix lint errors
pnpm lint:fix
```

### Formatting

```bash
# Format all files
pnpm format

# Check if files are formatted correctly
pnpm format:check
```

### Type Checking

```bash
# Run TypeScript compiler without emitting files
pnpm type-check
```

### All Checks

```bash
# Run all checks: type-check, lint, and format check
pnpm check-all
```

## 🔧 Pre-commit Hook

The pre-commit hook automatically runs on `git commit` and performs:

1. **ESLint** - Lints and auto-fixes staged `.js`, `.jsx`, `.ts`, `.tsx` files
2. **Prettier** - Formats staged files including JSON, CSS, and Markdown

If any errors are found:

- The commit will be blocked
- Files will be automatically fixed where possible
- You'll need to review changes and commit again

### Bypassing Hooks (Not Recommended)

```bash
git commit --no-verify -m "your message"
```

## 🚀 Pre-push Hook

The pre-push hook runs TypeScript type checking before allowing a push:

```bash
git push
```

This ensures that:

- All TypeScript code compiles successfully
- No type errors are present in the codebase

## 🎯 Best Practices

### 1. **Run checks before committing**

```bash
pnpm check-all
```

### 2. **Format code regularly**

```bash
pnpm format
```

### 3. **Fix lint issues immediately**

```bash
pnpm lint:fix
```

### 4. **Commit often with meaningful messages**

```bash
git add .
git commit -m "feat: add user authentication"
```

## 🔍 ESLint Rules

Key rules enforced:

- `@typescript-eslint/no-unused-vars` - Error on unused variables (except those starting with `_`)
- `@typescript-eslint/no-explicit-any` - Warning on explicit `any` types
- `react/react-in-jsx-scope` - Off (not needed in Next.js)
- `react/prop-types` - Off (using TypeScript instead)
- `react-hooks/exhaustive-deps` - Warning on missing dependencies

## 📝 Prettier Configuration

```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🚨 Common Issues

### Issue: Pre-commit hook not running

**Solution**: Ensure Husky is installed

```bash
pnpm prepare
```

### Issue: ESLint errors blocking commit

**Solution**: Fix the errors or bypass if absolutely necessary

```bash
pnpm lint:fix
# or
git commit --no-verify
```

### Issue: Prettier conflicts with ESLint

**Solution**: This is already handled by `eslint-config-prettier` which disables conflicting rules

## 🔄 Updating Configuration

### Adding new ESLint rules

Edit [.eslintrc.json](.eslintrc.json):

```json
{
  "rules": {
    "your-new-rule": "error"
  }
}
```

### Changing Prettier settings

Edit [.prettierrc](.prettierrc):

```json
{
  "printWidth": 120 // example
}
```

## 📚 Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/lint-staged/lint-staged)

## ✅ Setup Checklist

- [x] ESLint installed and configured
- [x] Prettier installed and configured
- [x] Husky git hooks configured
- [x] lint-staged configured for pre-commit
- [x] Pre-push type checking enabled
- [x] npm scripts added for manual checks
- [x] Documentation created

---

**Note**: This setup enforces code quality automatically. Make sure to run `pnpm install` after cloning the repository to set up the git hooks.
