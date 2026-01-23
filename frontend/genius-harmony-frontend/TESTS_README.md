# Frontend Tests Setup

## Installing Test Dependencies

To run the frontend tests, you need to install the testing dependencies:

```bash
cd frontend/genius-harmony-frontend
npm install --save-dev vitest @testing-library/react @testing-library/react-hooks @testing-library/jest-dom jsdom
```

## Running Tests

After installing the dependencies, add the following script to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

Then run tests with:

```bash
npm test
```

## Test Files

Test files are located next to the code they test:
- `/src/hooks/__tests__/` - Tests for custom hooks
- `/src/__tests__/` - Tests for constants and utilities
- `/src/components/__tests__/` - Tests for React components (to be added)

## Writing New Tests

Follow the pattern in existing test files:

```javascript
import { describe, it, expect } from 'vitest';

describe('YourComponent', () => {
  it('should do something', () => {
    // Your test code
    expect(result).toBe(expected);
  });
});
```

## Coverage

To see test coverage:

```bash
npm run test:coverage
```

## Note

Test files have been created but dependencies are not yet installed to avoid
affecting the current deployment. Install them when you're ready to run tests.
