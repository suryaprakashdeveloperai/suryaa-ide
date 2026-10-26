# Suryaa IDE v3 — Current Architecture & Audit Report

**Product Owner:** Surya Prakash T — B.Tech Artificial Intelligence and Machine Learning  
**Project:** Suryaa IDE v3 (Professional Visual Flutter Full-Stack Studio)  
**Audit Date:** 2026-10-24  
**Audit Status:** Complete Baseline Verified

---

## 1. Executive Summary

Suryaa IDE v3 is an advanced visual Flutter development studio with integrated Python/FastAPI backend generation. An in-depth code audit of both frontend (`ide_frontend`) and backend (`ide_backend`) was executed against the Phase Zero requirements.

The existing build baseline is solid:
- **Frontend**: Vite 6.4.5 + React 19 + TypeScript + TailwindCSS + Zustand + Lucide Icons + Monaco Editor. Compiles clean with `tsc && vite build` (404 kB JS, 38 kB CSS). Dev server active on `http://localhost:3000`.
- **Backend**: FastAPI 0.115 + Uvicorn + Pydantic v2 + SQLAlchemy 2.0 + Pytest. All unit tests passing (`4/4 passed in 0.93s`). Daemon active on `http://127.0.0.1:8000`.
- **Dart Formatter**: Google Dart SDK 3.13.7 installed and operational.

However, several architectural bottlenecks and usability defects restrict production readiness.

---

## 2. Component Hierarchy & Current Implementation

```
ide_frontend/src/
├── App.tsx                     # Top-level shell (Navbar, Sidebar, DesignCanvas, PropertyInspector, BottomDrawer)
├── core/
│   ├── store.ts                # Zustand store (ProjectSchema, selection, history, modes, build logs)
│   ├── defaultProject.ts       # Starter schema (Scaffold, AppBar, TabBar, Column, KPICard, Chart, Video)
├── types/
│   └── schema.ts               # ProjectSchema, ComponentNode, ThemeTokens, AnimationConfig, BackendConfig
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Brand, mode switch, device presets, orientation, undo/redo, Save, Build APK
│   │   ├── Sidebar.tsx         # Tabbed rail (widgets, tree, theme, android, api, backend, security, builds)
│   │   └── BottomDrawer.tsx    # Terminal logs, security audit, active jobs
│   ├── canvas/
│   │   ├── DesignCanvas.tsx    # Viewport container, breadcrumbs, zoom, floating quick actions, device frame
│   │   └── WidgetRenderer.tsx  # Recursive Flutter widget simulation (Scaffold, Column, Row, Card, Text, etc.)
│   ├── inspector/
│   │   └── PropertyInspector.tsx # 3-tab inspector (Properties, Box Model/Layout, Animation Engine)
│   ├── panels/
│   │   ├── ApiManager.tsx      # Visual API connector studio & live caching
│   │   ├── ThemeStudio.tsx     # 14+ style presets, custom tokens, live CSS variable injection
│   │   ├── BackendDesigner.tsx # Visual entity modeler (SQLAlchemy tables, Pydantic fields, REST routes)
│   │   ├── AndroidManager.tsx  # AndroidManifest.xml package & permissions configuration
│   │   ├── SecurityCenter.tsx  # Static AST scanner, OWASP Top 10 mobile vulnerabilities
│   │   └── DownloadCenter.tsx  # APK / ZIP package generator & export
│   └── modals/
│       ├── AboutModal.tsx      # Surya Prakash T (B.Tech AIML) attribution & system specs
│       └── TemplateModal.tsx   # Project startup template gallery
```

---

## 3. Confirmed Defects & Root Causes

### Defect 1: Navbar Congestion on Standard Screens (High)
- **Symptom**: On viewports ≤ 1366px, the brand title, creator badge, 5 mode tabs, 6 device preset buttons, undo/redo, and build buttons overflow horizontally, cutting off Save, Zen Mode, Fullscreen, and Build APK.
- **Root Cause**: `Navbar.tsx` renders all controls inline in flex rows without responsive grouping, collapsible overflow menus, or icon-only responsive breakpoints.

### Defect 2: Phone Emulator Inner Scrolling Blocked (Critical)
- **Symptom**: Content placed inside the simulated phone screen (long columns, list views) is clipped at the bottom bezel and cannot be scrolled with mouse wheel or touch.
- **Root Cause**: In `WidgetRenderer.tsx` (lines 273-280), the main Scaffold content column has `overflow-hidden` across the container without an inner scrollable body layer (`overflow-y-auto`).

### Defect 3: Fixed Canvas Lacks Drag / Pan Surface (High)
- **Symptom**: In `DesignCanvas.tsx`, the phone frame is rigidly centered in flexbox without pan coordinates (`panX`, `panY`). Users cannot pan with Spacebar+drag or middle-mouse click to navigate around large designs.
- **Root Cause**: Canvas lacks mouse drag listeners for coordinate translation and transform matrix management.

### Defect 4: Rigid Panel Widths Lacking Draggable Splitters (Medium)
- **Symptom**: Sidebar (`w-72` / 288px) and Property Inspector (`w-80` / 320px) cannot be resized by dragging splitters.
- **Root Cause**: Panels have hardcoded Tailwind width classes rather than dynamic pixel widths tied to pointer drag handles.

### Defect 5: Widget Catalog Lacks Accordions & Instant Search (Medium)
- **Symptom**: Finding specific widgets requires scrolling through a long static list.
- **Root Cause**: Categories in `Sidebar.tsx` render unconditionally without accordion collapse state or search query filtering.

### Defect 6: Incomplete Visual Box Model & Alignment Matrix (High)
- **Symptom**: `PropertyInspector.tsx` only offers single numeric sliders for margin/padding, lacking 4-sided linked/unlinked inputs, 3x3 9-point alignment grid, and size modes (Auto, Fill, Fixed, Expanded).
- **Root Cause**: Layout tab only implemented scalar properties (`width`, `height`, `padding`, `margin`).

### Defect 7: Chart Engine Restricted to Placeholder Card (High)
- **Symptom**: MultiAxisChart in Dart code generation outputs a dummy container instead of real `fl_chart` code for Line, Bar, Curved Area, Donut, Radar, and Sparkline charts.
- **Root Cause**: `widgets.py` lacks chart-specific code renderers.

### Defect 8: Missing Alembic Migrations & PostgreSQL Guided Flow (Medium)
- **Symptom**: Backend generation creates basic SQLite schema but lacks Alembic `env.py`/`alembic.ini` migration setup and interactive database connection wizard.
- **Root Cause**: Python generator in `app/generator/python/generator.py` only exports raw model files.

---

## 4. Test Baseline Status

| Component | Test Runner | Status | Metrics |
|---|---|---|---|
| **ide_backend** | Pytest 9.1.1 | **PASSED** | 4/4 tests passed (0.93s) |
| **ide_frontend** | TypeScript 5.7 + Vite 6.4.5 | **PASSED** | Exit code 0 (4.60s) |
| **Dart Formatter** | Google Dart SDK 3.13.7 | **PASSED** | Exit code 0 |
