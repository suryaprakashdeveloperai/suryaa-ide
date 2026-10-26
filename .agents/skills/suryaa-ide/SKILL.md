---
name: suryaa-ide
description: Complete developer skill and workflows for Suryaa IDE v3, including visual Flutter full-stack studio operations, deterministic MVVM code generation, FastAPI backend generation, fl_chart analytics, and automated verification.
---

# Suryaa IDE v3 — Antigravity Developer Skill & Workflow Guide

**Product Owner:** Surya Prakash T — B.Tech Artificial Intelligence and Machine Learning  
**Product:** Suryaa IDE v3 (Professional Visual Flutter Full-Stack Studio)  

---

## 1. Overview & Capabilities

Suryaa IDE v3 is a visual studio for building Flutter full-stack applications with:
- **Visual Design Canvas**: Independent Spacebar+drag panning, smooth 30%-200% zoom, and native simulated Scaffold/ListView inner scrolling.
- **Visual Box Model**: 4-sided linked/unlinked Margin & Padding editor, 3×3 9-point alignment grid, and Flutter size modes (Auto, Fill, Fixed, Expanded).
- **Six-Chart Engine**: Production-grade `fl_chart` code generation for Multi-Axis Line, Bar, Area, Donut, Radar, and Sparkline charts.
- **Deterministic Clean Architecture**: Generates clean MVVM Dart code formatted with official Google Dart SDK.
- **Python Full-Stack Generation**: Generates FastAPI backends with SQLAlchemy 2.0, Pydantic v2 schemas, and Alembic migrations.
- **Gemini AI Copilot**: Natural language intent to structured JSON schema mutations with live diff previews.

---

## 2. Workspace Layout

```
d:/IDE making/
├── ide_frontend/               # React 19 + TypeScript + Vite Visual Studio
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/         # DesignCanvas, WidgetRenderer
│   │   │   ├── layout/         # Navbar, Sidebar, BottomDrawer
│   │   │   ├── inspector/      # PropertyInspector (Box Model, Size Modes, 9-point grid)
│   │   │   └── panels/         # GeminiCopilot, ApiManager, ThemeStudio, BackendDesigner
│   │   └── core/store.ts       # Central Zustand project store & history
├── ide_backend/                # FastAPI 0.115 + SQLAlchemy 2.0 Engine
│   ├── app/
│   │   ├── generator/
│   │   │   ├── flutter/        # Clean MVVM Dart generator & fl_chart widgets
│   │   │   └── python/         # FastAPI, Pydantic & SQLAlchemy generator
│   │   └── api/                # REST endpoints (/projects, /builds, /security)
└── workspace/                  # Exported target Flutter & FastAPI project directory
```

---

## 3. Essential Development Commands

### Frontend Development
```powershell
# In d:\IDE making\ide_frontend
npm run dev        # Starts Vite studio on http://localhost:3000
npm run build      # Validates TypeScript compilation and builds production bundle
```

### Backend Engine
```powershell
# In d:\IDE making\ide_backend
& "C:\Users\ELCOT\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn app.main:app --port 8000 --host 127.0.0.1
& "C:\Users\ELCOT\AppData\Local\Programs\Python\Python312\python.exe" -m pytest tests/
```

### Flutter Code Formatting
```powershell
# Google Dart SDK Formatter
& "C:\Users\ELCOT\AppData\Local\Microsoft\WinGet\Packages\Google.DartSDK_Microsoft.Winget.Source_8wekyb3d8bbwe\dart-sdk\bin\dart.exe" format <directory>
```

---

## 4. Antigravity IDE Integration Points

When using Antigravity IDE with Suryaa IDE projects:
1. **Interactive Design**: Use the visual studio on `http://localhost:3000` to arrange widgets, adjust 4-sided margins/paddings, and choose theme tokens.
2. **Deterministic Export**: Code generation produces standard Flutter files in `workspace/lib/features/` with separate `views/` and `view_models/` without code duplication.
3. **AI Copilot Prompts**: Natural language prompts sent to Gemini generate structured schema proposals with diff inspection before application to prevent unintended changes.
