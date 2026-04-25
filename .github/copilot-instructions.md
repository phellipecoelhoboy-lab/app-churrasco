# Copilot Instructions - Orçamento para Churrasco

## Project Overview
A React + Vite web application for calculating barbecue (churrasco) budgets. Users select number of attendees, churrasco package, beverage option, and optional extras (special drinks, catering staff, photography). The app calculates total cost and generates PDF receipts.

## Architecture & Data Flow

**State Management:** Centralized in [App.jsx](../src/App.jsx) using React hooks
- `numPessoas` → passed to all pricing components
- `churrasco` → selected package object with meats, sides, drinks metadata
- `bebida` → single openBar package object
- `extras` → array of selected items (caipis, drinks, catering services)
- All state is passed DOWN to components with setter functions

**Component Structure:**
- [App.jsx](../src/App.jsx) - Main controller, renders all features
- Option components (ChurrascoOptions, BebidaOptions, ExtrasOptions) - Handle selection UI
- [PacoteChurrasco.jsx](../src/components/PacoteChurrasco.jsx) - Radio selection wrapper that displays package details via sub-components
- Detail component (Carnes, Acompanhamentos, BebidasChurrasco) - Display-only, receive array props
- [Resumo.jsx](../src/components/Resumo.jsx) - Aggregates all state, calculates totals, generates PDF

## Data Model & Patterns

**Constants Location:** [constants.js](../src/constants.js) - Centralize all menu data here
- Objects have: `name`, `price` (per-person for packages)
- Package objects include metadata arrays: `meats`, `sideDishes`, `drinks`
- Individual extras (caipis, drinks, services) have flat structure with `price` (fixed amount)

⚠️ **Data Duplication Issue:** BebidaOptions and ExtrasOptions duplicate data instead of importing from constants.js. Consolidate these when refactoring.

**Selection Patterns:**
- Single selection: `<input type="radio">` (churrasco, bebida)
- Multiple selection: `<input type="checkbox">` with array state management
- Array toggling pattern in ExtrasOptions: `handleExtraChange()` adds/removes items

## Price Calculation Logic

Located in [Resumo.jsx](../src/components/Resumo.jsx#L6):
```
churrasco_total = churrasco.price * numPessoas
bebida_total = bebida.price * numPessoas
extras_total = SUM(extra.price) for each extra (NO multiplier)
total = all above
```
Extras are fixed-price items, NOT per-person rates.

## PDF Generation

[Resumo.jsx](../src/components/Resumo.jsx) uses `jspdf` + `html2canvas`:
1. Captures DOM element by id="resumo" as canvas
2. Converts to PNG image data
3. Embeds in PDF
4. Downloads as `orcamento.pdf`

⚠️ Risk: DOM-based rendering means styling must work in canvas capture (test PDF generation when changing Resumo layout or CSS).

## Development Workflow

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

## Key Conventions

- **Naming:** Portuguese for feature names (Churrasco, Bebida, Acompanhamentos), English for technical structure
- **Props Pattern:** `set*` functions passed down, component calls internally when value changes
- **No Context API:** All state stays in App.jsx, passed explicitly
- **Currency:** All prices in Brazilian Real (R$), formatted to 2 decimals with `.toFixed(2)`
- **Component Returns:** Wrapped in `<div>` containers, not fragments

## Integration Points

- **Calculation dependency:** Any new options must follow extras pattern (single price, not per-person) OR update total calculation logic
- **PDF dependency:** Resumo's `id="resumo"` is critical for PDF capture
- **Style dependency:** CSS classes in [App.css](../src/App.css) - ensure new components match existing structure for consistent rendering

## Next Improvements
- Move duplicated data in BebidaOptions and ExtrasOptions to constants.js
- Consider Context API or state management library if prop drilling increases
- Add input validation for numPessoas (type coercion edge cases)
- Add error handling for PDF generation failures
