# Contributing

Thanks for your interest in this project!

## Local Setup

```bash
# backend
cd backend
npm install
npm start        # runs on :5000

# frontend (new terminal)
cd frontend
npm install
npm run dev      # runs on :5173
```

Or just:

```bash
docker compose up
```

## Running Tests

```bash
cd backend
npm test
```

## Guidelines

- Keep functions short and names obvious
- Add a test if you change service logic in `partsService.js`
- One feature per pull request
- Open a PR against `main`
