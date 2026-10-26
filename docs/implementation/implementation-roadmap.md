# Suryaa IDE v3 — Implementation Roadmap

**Product Owner:** Surya Prakash T — B.Tech Artificial Intelligence and Machine Learning  
**Product:** Suryaa IDE v3 (Professional Visual Flutter Full-Stack Studio)  
**Document:** Master Implementation Roadmap  

---

## Priority Order & Execution Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│ P1: Stability, Baseline Verification & Documentation [DONE]           │
├────────────────────────────────────────────────────────────────────────┤
│ P2: Workspace Usability (Shell, Decongest Navbar, Pan/Zoom, Scroll)    │
├────────────────────────────────────────────────────────────────────────┤
│ P3: Visual Editing (Box Model, 9-Point Alignment, Resizable Panels)   │
├────────────────────────────────────────────────────────────────────────┤
│ P4: Design System (16 KPI Cards, 6-Chart Engine, Templates)           │
├────────────────────────────────────────────────────────────────────────┤
│ P5: Reliable Code Generation (Deterministic MVVM, Dart Formatter)      │
├────────────────────────────────────────────────────────────────────────┤
│ P6: Full-Stack Generation (FastAPI, Alembic Migrations, PostgreSQL)   │
├────────────────────────────────────────────────────────────────────────┤
│ P7: External Integrations (Gemini Copilot, Antigravity IDE Bridge)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Details

### Phase Zero — Audit & Baseline Verification (Completed)
- [x] Full source code inspection of frontend and backend.
- [x] Baseline test verification: `pytest` passed (4/4 in 0.93s).
- [x] Frontend compilation verified: `tsc && vite build` passed (0 errors in 4.60s).
- [x] Generation of `docs/architecture/current-architecture.md`.
- [x] Generation of `docs/architecture/target-architecture.md`.
- [x] Generation of `docs/implementation/implementation-roadmap.md`.
- [x] Generation of `docs/implementation/feature-status.md`.

---

### Phase One — Responsive Application Shell and Navbar
- [ ] Decongest top navbar:
  - Single-line compact brand badge: `SURYAA IDE PRO`.
  - Compact creator attribution: `Surya Prakash T · B.Tech AIML` with modal info trigger.
  - Overflow menu for secondary actions when horizontal width < 1400px.
  - Permanently preserve accessible buttons for `Save`, `Build APK`, `Zen Mode`, `Fullscreen` (HTML5 Fullscreen API + F11 support), and `Gemini AI Copilot`.
  - Zero page-level horizontal overflow across all desktop viewports.

---

### Phase Two — Canvas, Device Preview, and Scrolling
- [ ] Implement inner device preview scrolling:
  - In `WidgetRenderer.tsx`, wrap the Scaffold body in `overflow-y-auto flex-1 h-full custom-scrollbar`.
  - Ensure `AppBar` remains fixed at top, bottom nav remains fixed at bottom, and body content scrolls freely with wheel or touch.
- [ ] Canvas Pan & Zoom:
  - Add Spacebar + drag and middle-mouse drag panning with `panX`, `panY` coordinate offsets in `DesignCanvas.tsx`.
  - Dedicated canvas transform matrix: `translate(panX, panY) scale(zoom / 100)`.
  - Add "Fit Canvas", "Reset 100%", and "Center Widget" buttons.
  - Ensure pointer coordinates accurately map between screen and canvas for selection and dragging.

---

### Phase Three — Resizable Panels & Collapsible Widget Catalog
- [ ] Resizable panels:
  - Draggable splitter between Sidebar and Canvas (min 220px, max 460px).
  - Draggable splitter between Canvas and Property Inspector (min 260px, max 480px).
  - Persist custom widths in Zustand store.
- [ ] Collapsible widget catalog:
  - Individually collapsible accordion sections for all 9 categories.
  - Instant real-time widget search input with clear-search button and empty state.
  - Drag-and-drop and click-to-insert fallback support.

---

### Phase Four — Visual Layout & Box Model Editor
- [ ] Layout Size Modes:
  - Auto / Wrap, Fill / Stretch (100%), Fixed (px), Expanded / Flex (1..12).
- [ ] 3x3 9-Point Visual Alignment Matrix:
  - Top-Left, Top-Center, Top-Right, Center-Left, Center, Center-Right, Bottom-Left, Bottom-Center, Bottom-Right.
  - Live preview update and translation to Flutter `Alignment`.
- [ ] 4-Sided Visual Box Model:
  - Independent inputs for Top, Right, Bottom, Left with link/unlink toggle for Padding (`EdgeInsets.fromLTRB`) and Margin.
- [ ] Parent-Child Layout Validation:
  - Diagnostics warning when `Expanded` is placed outside Row/Column.
  - Detection of unbounded height in nested scrollable lists.

---

### Phase Five — Widget Customization & Animation Engine
- [ ] Full property controls:
  - Colors, typography, borders, shadows, elevation, data bindings, icon pickers.
- [ ] Complete functional animation editor:
  - Fade, Slide (Up/Down/Left/Right), Scale, Rotate, Bounce, Pulse, Shake, Container.
  - Real-time canvas playback, duration, delay, curve selection (`easeInOut`, `bounceOut`, etc.), repeat mode (`once`, `loop`, `reverse`).
  - Serialized to `ProjectSchema` and generated Flutter code (`flutter_animate` / `AnimatedWidget`).

---

### Phase Six — KPI Card Library (16 Variants) & Responsive Testing
- [ ] 16 KPI Card styles:
  1. Minimal Numeric
  2. Icon & Metric
  3. Trend Indicator
  4. Sparkline Trend
  5. Circular Progress
  6. Goal vs Actual
  7. Comparison Card
  8. Status Badge Card
  9. Semi-Gauge Card
  10. Compact Horizontal Card
  11. Large Featured Hero Metric
  12. Multi-Value Matrix Card
  13. Alert / Incident Card
  14. Industrial Production Card
  15. System Performance Card
  16. Custom Composition Card
- [ ] Multi-viewport responsive preview:
  - Small phones (360x800), standard phones (393x852), tablets (800x1200), desktop (1280x800).

---

### Phase Seven — Six-Chart Engine (`fl_chart`)
- [ ] Six chart types in canvas preview & Dart code generator:
  1. Multi-axis Line Chart (dual Y-axes, custom series curves)
  2. Bar Chart (single, grouped, stacked)
  3. Curved Area Chart (spline with gradient fills)
  4. Donut & Pie Chart (radial sections, center metric)
  5. Radar / Spider Chart (polygon telemetry)
  6. Compact Sparklines
- [ ] Editable dataset series, legends, tooltips, axis titles, and color palettes (`Neon Cyan`, `Violet Glow`, `Emerald Peak`, `Sunset Coral`).
- [ ] Valid `fl_chart` Dart code output in `widgets.py`.

---

### Phase Eight — Deterministic MVVM Flutter Code Generation
- [ ] Deterministic pipeline generating:
  - `lib/app/app.dart` & `theme/app_theme.dart`
  - `lib/core/` (network, config, error handling)
  - `lib/data/` (models, repositories, services)
  - `lib/features/{feature}/` (views, view_models, widgets)
  - `lib/main.dart` & `pubspec.yaml`
- [ ] Format all generated code with Google Dart SDK (`dart format lib/`).

---

### Phase Nine — FastAPI Backend, Database & Alembic Migrations
- [ ] FastAPI backend generator with SQLAlchemy 2.0 & Pydantic v2.
- [ ] Guided Database Setup:
  - SQLite default with one-click PostgreSQL migration.
  - Interactive database URL testing.
  - Alembic `alembic.ini` and automatic migration script generation.
- [ ] Typed Flutter API Client generation (`lib/data/services/api_client.dart`).

---

### Phase Ten — Gemini AI Copilot
- [ ] Gemini AI Copilot panel:
  - Collapsible side drawer.
  - Natural language prompts ("Add an authentication screen with email and password", "Create 4 industrial KPI cards").
  - Structured schema mutation proposals.
  - Visual Diff preview before applying changes.
  - Transactional apply with undo/redo integration.

---

### Phase Eleven — Antigravity IDE Bridge
- [ ] Create `.agents/skills/suryaa-ide/` skill folder with `SKILL.md`.
- [ ] Project opening action and developer commands for generation, formatting, and building.

---

### Phase Twelve — Testing & Verification
- [ ] Frontend test matrix (viewport resizing, splitter dragging, canvas panning, widget tree operations).
- [ ] Backend test matrix (`pytest`).
- [ ] Code generation analysis (`dart format`, syntax validation).
