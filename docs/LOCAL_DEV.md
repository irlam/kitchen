# Local Development

## Prereqs
- Node.js 18+ recommended

## Install
```
npm install
```

## Run with Vite
```
npm run dev
```

## Build for production
```
npm run build
```

- Output is written to /dist
- Static assets are copied by scripts/copy-static.js

## No-build fallback
- Serve the repository root with a static server
- Open index.static.html (uses import maps + /src entry)
