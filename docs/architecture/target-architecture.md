# Suryaa IDE v3 — Target Architecture Specification

**Product Owner:** Surya Prakash T — B.Tech Artificial Intelligence and Machine Learning  
**Product:** Suryaa IDE v3 (Professional Visual Flutter Full-Stack Studio)  
**Document:** Target Architecture Specification  

---

## 1. System Architecture Overview

Suryaa IDE v3 adheres to a decoupled, high-performance architecture:
- **Frontend Visual Studio**: React 19 + TypeScript + Zustand state store + Monaco Editor + Lucide Icons + TailwindCSS.
- **Canvas Subsystem**: Multi-layer viewport with independent canvas panning (`Spacebar + drag`), smooth zooming (`30% - 200%`), and internal device preview scrolling for simulated Flutter Scaffold/ListView widgets.
- **Property & Box Model Engine**: 4-sided linked/unlinked Margin & Padding editor, 3x3 9-point alignment grid, Flex/Expanded size modes, and Flutter-specific constraint validation.
- **Code Generation Engine**: Deterministic AST/Schema to Flutter Clean Architecture MVVM Dart code (`lib/app`, `core`, `data`, `features`, `shared`) formatted with official Google Dart SDK.
- **Backend Generator Engine**: FastAPI with SQLAlchemy 2.0, Pydantic v2, Alembic automatic migrations, and PostgreSQL/SQLite guided setup.
- **AI Copilot & Antigravity IDE Bridge**: Structured JSON mutation schema proposals, diff previews, transactional schema application, and native Antigravity skills.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SURYAA IDE PRO STUDIO                          │
├────────────────────────────────────────────────────────────────────────┤
│ Top Navbar: Single-line Brand, Creator Badge, Mode Switcher, Actions   │
├───────────────┬────────────────────────────┬───────────────────────────┤
│ Left Sidebar  │ Central Studio Canvas      │ Right Inspector           │
│ ───────────── │ ────────────────────────── │ ───────────────────────── │
│ • Collapsible │ • Pan Surface (Space+Drag) │ • Props Tab (Color, Font) │
│   Categories  │ • Zoom (30% - 200%)        │ • Layout & Box Model      │
│ • Instant     │ • Device Frame (Phone/Tab) │   (9-point grid, 4-sided) │
│   Search      │ • Inner Scaffold Scrolling │ • Animation Motion Engine │
│ • 16 KPI      │ • Quick Action Morphing    │ • AI Gemini Copilot       │
│   Cards       │ • Responsive Viewports     │   (Natural Language Diff) │
│ • 6-Chart     │                            │                           │
│   Engine      │                            │                           │
├───────────────┴────────────────────────────┴───────────────────────────┤
│ Bottom Drawer: Real-time Dart/Python Terminal, Security Scanner, Jobs   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Canvas & Device Viewport Layering

To completely resolve the scrolling and panning conflicts, four isolated layers are established:

1. **IDE Workspace Level**: Outer flex container with `overflow-hidden`.
2. **Canvas Stage Level**: Transformed via `transform: translate(panX, panY) scale(zoom / 100)`. Panned via `Spacebar + drag` or middle-mouse drag. Coordinates converted smoothly between screen and canvas coordinates.
3. **Device Shell Level**: Fixed physical frame dimensions (iPhone 16 Pro, Pixel 9, Galaxy Tab, iPad Pro, Foldable, Desktop 1080p).
4. **Application Content Level**: Internal Scaffold body wrapped in `overflow-y-auto flex-1 h-full custom-scrollbar` allowing natural touch/wheel scrolling without moving the outer canvas.

---

## 3. Visual Layout & Box Model Editor

The property inspector Layout tab provides:
- **Size Modes**: Auto / Wrap, Fill / Stretch (100%), Fixed (custom px), Expanded (Flex 1..12).
- **9-Point Alignment Grid**: Visual 3x3 matrix mapping directly to Flutter `Alignment.topLeft`, `Alignment.topCenter`, `Alignment.topRight`, `Alignment.centerLeft`, `Alignment.center`, `Alignment.centerRight`, `Alignment.bottomLeft`, `Alignment.bottomCenter`, `Alignment.bottomRight`.
- **4-Sided Box Model**: Top, Right, Bottom, Left numeric inputs with Link/Unlink toggle for both Padding (`EdgeInsets.fromLTRB`) and Margin.
- **Parent-Child Validator**: Real-time linting for unbounded height, flex in non-flex parents, and constraint conflicts.

---

## 4. Six-Chart Engine Architecture

Unified data schema and Flutter `fl_chart` code generation supporting:
1. **Multi-Axis Line Chart**: Dual Y-axes, multiple series curves, custom dots, tooltips, gridlines.
2. **Bar Chart**: Single, grouped, and stacked bar series with border radius and custom bar widths.
3. **Curved Area Chart**: Spline curves with gradient fills beneath the baseline.
4. **Donut & Pie Chart**: Radial sections with percentage badges, center metric label, and custom inner radius.
5. **Radar / Spider Chart**: Multi-variable polygon overlays with grid concentric circles.
6. **Sparkline**: Compact inline trend curves with min/max indicator dots.

Theme presets available: `Neon Cyan`, `Violet Glow`, `Emerald Peak`, `Sunset Coral`.

---

## 5. Flutter Code Generation Pipeline

```
ProjectSchema (JSON)
  │
  ├── 1. Schema Validation & Integrity Check
  ├── 2. AST Transformation
  │     ├── Screen Views (Clean MVVM Views)
  │     ├── ViewModels (ChangeNotifier / StateVariables)
  │     ├── Theme Engine (AppTheme ThemeData tokens)
  │     ├── Data Repositories & Typed API Clients
  │     └── Widgets & Animations (fl_chart, flutter_animate)
  ├── 3. pubspec.yaml & AndroidManifest.xml
  ├── 4. Dart Formatter (`dart format lib/`)
  └── 5. Flutter Analyze / Test Execution
```

---

## 6. Python FastAPI Backend & Database Architecture

- **FastAPI Core**: Modular routers (`app/api/v1/endpoints/`), CORS, dependency injection, and JWT security.
- **SQLAlchemy 2.0**: Declarative models with typed column annotations (`Mapped`, `mapped_column`).
- **Pydantic v2**: Strict request/response schemas with field validation.
- **Alembic Migrations**: `alembic.ini`, `alembic/env.py`, initial revision scripts, and guided migration commands (`alembic upgrade head`).
- **PostgreSQL / SQLite Connection Wizard**: Real-time connection string testing and schema bootstrap.
