import { create } from 'zustand';
import { 
  ProjectSchema, 
  ComponentNode, 
  ThemeTokens, 
  AnimationConfig, 
  AndroidConfig, 
  LayoutConstraints, 
  ComponentProperty,
  BackendEntity,
  BackendEndpoint,
  ApiConnector
} from '../types/schema';
import { DEFAULT_PROJECT_SCHEMA } from './defaultProject';
import { generateStreamAppFiles, generateStreamAppScreensAndComponents } from './streamAppGenerator';

export type EditorMode = 'design' | 'preview' | 'runtime' | 'logic' | 'code';
export type LeftSidebarTab = 'widgets' | 'pages' | 'tree' | 'theme' | 'animation' | 'api' | 'backend' | 'android' | 'security' | 'builds' | 'storage';
export type DevicePreset = 'pixel9' | 'galaxy_s24' | 'iphone16' | 'galaxy_tab' | 'ipad' | 'desktop' | 'foldable' | 'multi_view' | 'custom';

export interface OverflowIssue {
  componentId: string;
  type: string;
  details: string;
  severity: 'warning' | 'error';
  suggestedFix: string;
}

export type OrientationPolicy = 'portrait_only' | 'landscape_only' | 'adaptive';

export interface StreamAppConfig {
  streamUrl: string;
  streamTag?: string;
  xAxisTag: string;
  primaryYAxisTag: string;
  secondaryYAxisTag?: string;
  includeDocker: boolean;
  includePostgres: boolean;
  includeJwtAuth: boolean;
  loginStyle: 'cyberpunk' | 'executive' | 'terminal' | 'aurora';
  orientationPolicy: OrientationPolicy;
  generateDedicatedTelemetry: boolean;
  generateLiveLogs: boolean;
}

interface EditorState {
  project: ProjectSchema;
  selectedComponentId: string | null;
  activeScreenId: string;
  mode: EditorMode;
  sidebarTab: LeftSidebarTab;
  devicePreset: DevicePreset;
  orientation: 'portrait' | 'landscape';
  orientationPolicy: OrientationPolicy;
  zoom: number;
  isEmulatorDrawerOpen: boolean;
  
  // History
  undoStack: ProjectSchema[];
  redoStack: ProjectSchema[];
  isDirty: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  
  // Clipboard
  clipboardComponent: ComponentNode | null;
  
  // Runtime Interaction State
  activeTabIndices: Record<string, number>;
  runtimeInputValues: Record<string, string>;
  activeAnimations: Record<string, boolean>;
  
  // Overflow Diagnostics
  overflowIssues: OverflowIssue[];
  
  // Presentation & Modals
  zenMode: boolean;
  isTemplateModalOpen: boolean;
  isAboutModalOpen: boolean;
  isCopilotOpen: boolean;
  testingAnimationId: string | null;

  // Resizable Panels & Canvas Pan
  sidebarWidth: number;
  inspectorWidth: number;
  canvasPan: { x: number; y: number };

  // Visual API Data Stream Cache
  apiDataCache: Record<string, any>;

  // Generated code cache for Monaco editor
  generatedCode: {
    allFiles: Record<string, string>;
    mainDart: string;
    themeDart: string;
    viewDart: string;
    viewModelDart: string;
    pubspecYaml: string;
    pythonMain: string;
  };
  activeCodeFile: string;
  
  // Diagnostics & Build Status
  buildLogs: string[];
  activeJobId: string | null;
  buildStatus: 'idle' | 'running' | 'success' | 'failed';
  securityReport: any | null;
  artifactsList: any[];

  // Subscription & 3-Day Trial
  billingStatus: {
    plan: 'trial' | 'pro' | 'enterprise';
    isEntitled: boolean;
    secondsRemaining: number;
    hoursRemaining: number;
    aiCreditsRemaining: number;
    trialExpiresAt: number | null;
    features: string[];
  } | null;
  isUpgradeModalOpen: boolean;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  fetchBillingStatus: () => Promise<void>;
  subscribePlan: (plan: 'pro' | 'enterprise') => Promise<boolean>;

  // Actions
  setMode: (mode: EditorMode) => void;
  setSidebarTab: (tab: LeftSidebarTab) => void;
  selectComponent: (id: string | null) => void;
  setDevicePreset: (preset: DevicePreset) => void;
  toggleOrientation: () => void;
  setZoom: (zoom: number) => void;
  setSidebarWidth: (w: number) => void;
  setInspectorWidth: (w: number) => void;
  setCanvasPan: (pan: { x: number; y: number }) => void;
  resetCanvasView: () => void;
  toggleCopilot: () => void;
  setActiveCodeFile: (file: string) => void;
  
  // Runtime interactions
  setActiveTabIndex: (tabBarId: string, index: number) => void;
  setRuntimeInputValue: (compId: string, value: string) => void;
  toggleAnimation: (compId: string) => void;
  
  // Overflow check
  checkOverflows: () => void;
  
  // Presentation & Modals
  toggleZenMode: () => void;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  openAboutModal: () => void;
  closeAboutModal: () => void;
  loadTemplate: (templateType: string) => void;
  
  // Live Animation Testing
  testAnimation: (componentId: string) => void;

  // Visual API Connectors
  fetchApiData: (connectorId: string) => Promise<void>;
  saveApiConnector: (connector: any) => void;
  removeApiConnector: (connectorId: string) => void;
  
  // Project & Component Mutations
  addComponent: (parentId: string, type: string, insertIndex?: number) => string;
  batchAddComponents: (components: ComponentNode[], targetParentId?: string) => void;
  updateComponentProperty: (componentId: string, prop: string, value: any) => void;
  updateComponentAnimation: (componentId: string, animConfig: AnimationConfig | undefined) => void;
  removeComponent: (componentId: string) => void;
  moveComponent: (componentId: string, newParentId: string, newIndex: number) => void;
  moveComponentOrder: (componentId: string, direction: 'up' | 'down') => void;
  replaceComponentType: (componentId: string, newType: string) => void;
  reparentComponent: (componentId: string, newParentId: string) => void;
  duplicateComponent: (componentId: string) => void;
  copyComponent: (componentId: string) => void;
  pasteComponent: (targetParentId?: string) => void;
  setThemePreset: (preset: string) => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  updateThemeToken: (token: keyof ThemeTokens, value: any) => void;
  updateAndroidConfig: (config: Partial<AndroidConfig>) => void;
  updateComponentLayout: (componentId: string, layout: Partial<LayoutConstraints>) => void;
  setComponentLayoutRealtime: (componentId: string, layout: Partial<LayoutConstraints>) => void;
  updateComponentBreakpoint: (componentId: string, breakpoint: 'phone' | 'tablet' | 'desktop', props: Partial<ComponentProperty>) => void;
  toggleLockComponent: (componentId: string) => void;
  toggleHideComponent: (componentId: string) => void;

  // Screen Management & Drawer
  setEmulatorDrawerOpen: (isOpen: boolean) => void;
  toggleEmulatorDrawer: () => void;
  setActiveScreen: (screenId: string) => void;
  addScreen: (name: string, route: string) => string;
  deleteScreen: (screenId: string) => void;
  updateScreenInfo: (screenId: string, name: string, route: string) => void;
  duplicateScreen: (screenId: string) => string;
  
  // Undo / Redo
  undo: () => void;
  redo: () => void;
  
  // Canvas Interaction Tool
  canvasTool: 'select' | 'hand';
  setCanvasTool: (tool: 'select' | 'hand') => void;

  // Orientation Policy
  setOrientationPolicy: (policy: OrientationPolicy) => void;

  // Stream Architect Full-Stack Modal & Generator
  isStreamArchitectModalOpen: boolean;
  openStreamArchitectModal: () => void;
  closeStreamArchitectModal: () => void;
  buildStreamDrivenApp: (config: StreamAppConfig) => void;

  // Full-Stack Component Modal & Generator
  isFullStackModalOpen: boolean;
  fullStackModalParentId: string | null;
  openFullStackModal: (targetParentId?: string) => void;
  closeFullStackModal: () => void;
  addFullStackCard: (params: {
    widgetName: string;
    title: string;
    subtitle?: string;
    createApi: boolean;
    apiPath?: string;
    createDb: boolean;
    tableName?: string;
    targetParentId?: string;
  }) => string;

  // Project Storage & File Maintenance
  createProjectFile: (path: string, content?: string) => void;
  deleteProjectFile: (path: string) => void;
  renameProjectFile: (oldPath: string, newPath: string) => void;
  createProjectFolder: (folderPath: string) => void;

  // Remote Engine Operations
  saveProject: () => Promise<void>;
  generateProject: () => Promise<void>;
  triggerBuild: (targetType: string) => Promise<void>;
  runSecurityAudit: () => Promise<void>;
  fetchArtifacts: () => Promise<void>;
}

const DEFAULT_PROJECT_FILES: Record<string, string> = {
  'lib/main.dart': `import 'package:flutter/material.dart';
import 'app/routes/app_routes.dart';
import 'app/theme/app_theme.dart';

void main() {
  runApp(const SuryaaApp());
}

class SuryaaApp extends StatelessWidget {
  const SuryaaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Suryaa Studio App',
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
`,
  'lib/app/theme/app_theme.dart': `import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: const Color(0xFF0F172A),
    primaryColor: const Color(0xFF6366F1),
    fontFamily: 'Inter',
  );
}
`,
  'lib/app/routes/app_routes.dart': `import 'package:go_router/go_router.dart';
import '../../features/home/views/home_view.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeView(),
    ),
  ],
);
`,
  'lib/features/home/views/home_view.dart': `import 'package:flutter/material.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home Dashboard')),
      body: const Center(child: Text('Welcome to Suryaa IDE Full-Stack Studio')),
    );
  }
}
`,
  'lib/features/home/view_models/home_view_model.dart': `import 'package:flutter/foundation.dart';

class HomeViewModel extends ChangeNotifier {
  bool _isLoading = false;
  bool get isLoading => _isLoading;
}
`,
  'backend/app/main.py': `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.endpoints import router as api_router

app = FastAPI(title="Suryaa Full-Stack Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "operational", "version": "1.0.0"}
`,
  'backend/app/database.py': `from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./suryaa_studio.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
`,
  'backend/app/api/v1/endpoints.py': `from fastapi import APIRouter

router = APIRouter()

@router.get("/telemetry")
def get_telemetry():
    return {
        "status": "online",
        "throughput_mbps": 482.4,
        "temperature_c": 38.6,
        "active_nodes": 6
    }
`,
  'assets/data/telemetry_sample.json': `{\n  "device_id": "EDGE-SUR-01",\n  "firmware": "3.2.0-rc",\n  "voltage": 24.2,\n  "uptime_seconds": 184920\n}`,
  'pubspec.yaml': `name: suryaa_app\ndescription: "Generated by Suryaa IDE Full-Stack Studio"\nversion: 1.0.0+1\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\ndependencies:\n  flutter:\n    sdk: flutter\n  go_router: ^14.0.0\n  fl_chart: ^0.68.0\n  http: ^1.2.0\n`,
  'README.md': `# Suryaa IDE Full-Stack Studio Project\n\nThis project contains full-stack Flutter MVVM client code and a FastAPI backend with SQLite persistence.\n`
};

let _clipboardSubtreeNodes: Record<string, ComponentNode> | null = null;

/**
 * Recursively clones a component and all its descendants with new unique IDs,
 * preserving all properties, styles, layout constraints, animations, and data bindings.
 */
function cloneSubtree(
  sourceId: string,
  newParentId: string | null,
  sourceComponents: Record<string, ComponentNode>,
  outComponents: Record<string, ComponentNode>
): string {
  const orig = sourceComponents[sourceId];
  if (!orig) return '';
  const newId = `comp_${orig.type.toLowerCase()}_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 6)}`;

  const clonedChildIds: string[] = [];
  const clonedComp: ComponentNode = {
    ...JSON.parse(JSON.stringify(orig)),
    id: newId,
    parentId: newParentId,
    childIds: clonedChildIds
  };

  outComponents[newId] = clonedComp;

  if (orig.childIds && orig.childIds.length > 0) {
    for (const childId of orig.childIds) {
      const newChildId = cloneSubtree(childId, newId, sourceComponents, outComponents);
      if (newChildId) {
        clonedChildIds.push(newChildId);
      }
    }
  }

  return newId;
}

/**
 * Checks whether `candidateParentId` is `targetId` or any descendant of `targetId`.
 * Prevents circular parent loops like A -> B -> A.
 */
function isDescendantOrSelf(
  candidateParentId: string,
  targetId: string,
  components: Record<string, ComponentNode>
): boolean {
  if (candidateParentId === targetId) return true;
  let curr = components[candidateParentId];
  while (curr && curr.parentId) {
    if (curr.parentId === targetId) return true;
    curr = components[curr.parentId];
  }
  return false;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: DEFAULT_PROJECT_SCHEMA,
  selectedComponentId: "comp_banner_animated",
  activeScreenId: "screen_home",
  mode: "design",
  sidebarTab: "widgets",
  devicePreset: "iphone16",
  orientation: "portrait",
  orientationPolicy: "adaptive",
  zoom: 100,
  isEmulatorDrawerOpen: false,
  canvasTool: "select",
  isFullStackModalOpen: false,
  fullStackModalParentId: null,
  isStreamArchitectModalOpen: false,
  
  undoStack: [],
  redoStack: [],
  isDirty: false,
  isSaving: false,
  isGenerating: false,
  clipboardComponent: null,
  
  activeTabIndices: { comp_main_tabs: 0 },
  runtimeInputValues: {},
  activeAnimations: {},
  overflowIssues: [],
  zenMode: false,
  isTemplateModalOpen: false,
  isAboutModalOpen: false,
  isCopilotOpen: true,
  testingAnimationId: null,

  // Default panel widths & canvas pan
  sidebarWidth: 288,
  inspectorWidth: 320,
  canvasPan: { x: 0, y: 0 },

  apiDataCache: {
    api_products: [
      { id: 1, title: "Suryaa AI Vision Pro", price: 299.99, stock: 45 },
      { id: 2, title: "Neural Audio Pods", price: 149.50, stock: 120 },
      { id: 3, title: "Quantum AMOLED Tablet", price: 699.00, stock: 18 }
    ],
    api_analytics: {
      revenue: 128450,
      growth: 28.4,
      activeUsers: 8420,
      conversionRate: 4.8
    }
  },
  
  generatedCode: {
    allFiles: { ...DEFAULT_PROJECT_FILES },
    mainDart: DEFAULT_PROJECT_FILES['lib/main.dart'] || "",
    themeDart: DEFAULT_PROJECT_FILES['lib/app/theme/app_theme.dart'] || "",
    viewDart: DEFAULT_PROJECT_FILES['lib/features/home/views/home_view.dart'] || "",
    viewModelDart: DEFAULT_PROJECT_FILES['lib/features/home/view_models/home_view_model.dart'] || "",
    pubspecYaml: DEFAULT_PROJECT_FILES['pubspec.yaml'] || "",
    pythonMain: DEFAULT_PROJECT_FILES['backend/app/main.py'] || ""
  },
  activeCodeFile: "lib/main.dart",
  buildLogs: ["IDE Ready. Full-Stack Studio active."],
  activeJobId: null,
  buildStatus: "idle",
  securityReport: null,
  artifactsList: [],

  setMode: (mode) => {
    set({ mode });
    if (mode === 'code') {
      get().generateProject();
    }
    if (mode === 'preview' || mode === 'runtime') {
      set({ selectedComponentId: null });
    }
  },
  
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setActiveScreen: (screenId) => {
    set({ activeScreenId: screenId, selectedComponentId: null, isEmulatorDrawerOpen: false });
  },

  setEmulatorDrawerOpen: (isOpen) => set({ isEmulatorDrawerOpen: isOpen }),
  toggleEmulatorDrawer: () => set((s) => ({ isEmulatorDrawerOpen: !s.isEmulatorDrawerOpen })),

  addScreen: (name, route) => {
    const { project, undoStack } = get();
    const sanitizedName = name.trim() || `Screen ${project.screens.length + 1}`;
    const rawRoute = route.trim() || sanitizedName.toLowerCase().replace(/\s+/g, '_');
    const sanitizedRoute = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`;
    const screenId = `screen_${Date.now()}`;
    const scaffoldId = `comp_scaffold_${screenId}`;
    const appbarId = `comp_appbar_${screenId}`;
    const columnId = `comp_column_${screenId}`;

    const newScaffold: ComponentNode = {
      id: scaffoldId,
      type: "Scaffold",
      parentId: null,
      childIds: [appbarId, columnId],
      properties: {
        showAppBar: true,
        showDrawer: "drawer"
      }
    };

    const newAppBar: ComponentNode = {
      id: appbarId,
      type: "AppBar",
      parentId: scaffoldId,
      childIds: [],
      properties: {
        title: sanitizedName,
        centerTitle: true,
        leadingIcon: "arrow_back"
      }
    };

    const newColumn: ComponentNode = {
      id: columnId,
      type: "Column",
      parentId: scaffoldId,
      childIds: [],
      properties: {
        mainAxisAlignment: "flex-start",
        crossAxisAlignment: "stretch",
        spacing: 16
      }
    };

    const newScreen = {
      id: screenId,
      name: sanitizedName,
      route: sanitizedRoute,
      rootComponentId: scaffoldId,
      stateVariables: []
    };

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      activeScreenId: screenId,
      selectedComponentId: columnId,
      isEmulatorDrawerOpen: false,
      project: {
        ...project,
        screens: [...project.screens, newScreen],
        components: {
          ...project.components,
          [scaffoldId]: newScaffold,
          [appbarId]: newAppBar,
          [columnId]: newColumn
        }
      }
    });

    return screenId;
  },

  deleteScreen: (screenId) => {
    const { project, undoStack, activeScreenId } = get();
    if (project.screens.length <= 1) return;

    const screenToDelete = project.screens.find(s => s.id === screenId);
    if (!screenToDelete) return;

    const idsToDelete = new Set<string>();
    const collectIds = (cid: string) => {
      idsToDelete.add(cid);
      const c = project.components[cid];
      if (c && c.childIds) {
        c.childIds.forEach(collectIds);
      }
    };
    if (screenToDelete.rootComponentId) {
      collectIds(screenToDelete.rootComponentId);
    }

    const nextComponents = { ...project.components };
    idsToDelete.forEach(id => delete nextComponents[id]);

    const nextScreens = project.screens.filter(s => s.id !== screenId);
    const nextActiveScreenId = activeScreenId === screenId ? nextScreens[0].id : activeScreenId;

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      activeScreenId: nextActiveScreenId,
      selectedComponentId: null,
      isEmulatorDrawerOpen: false,
      project: {
        ...project,
        screens: nextScreens,
        components: nextComponents
      }
    });
  },

  updateScreenInfo: (screenId, name, route) => {
    const { project, undoStack } = get();
    const nextScreens = project.screens.map(s => {
      if (s.id === screenId) {
        const rawRoute = route.trim() || s.name.toLowerCase().replace(/\s+/g, '_');
        return {
          ...s,
          name: name.trim() || s.name,
          route: rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`
        };
      }
      return s;
    });

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        screens: nextScreens
      }
    });
  },

  duplicateScreen: (screenId) => {
    const { project, undoStack } = get();
    const sourceScreen = project.screens.find(s => s.id === screenId);
    if (!sourceScreen) return '';

    const newScreenId = `screen_${Date.now()}`;
    const nextComponents = { ...project.components };

    const newRootId = cloneSubtree(sourceScreen.rootComponentId, null, project.components, nextComponents);

    const newScreen = {
      id: newScreenId,
      name: `${sourceScreen.name} Copy`,
      route: `${sourceScreen.route}_copy`,
      rootComponentId: newRootId,
      stateVariables: JSON.parse(JSON.stringify(sourceScreen.stateVariables || []))
    };

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      activeScreenId: newScreenId,
      selectedComponentId: newRootId,
      isEmulatorDrawerOpen: false,
      project: {
        ...project,
        screens: [...project.screens, newScreen],
        components: nextComponents
      }
    });

    return newScreenId;
  },
  selectComponent: (id) => {
    const { mode } = get();
    // Only permit component selection in Design Mode!
    if (mode === 'design') {
      set({ selectedComponentId: id });
    }
  },
  setDevicePreset: (devicePreset) => {
    set({ devicePreset });
    get().checkOverflows();
  },
  toggleOrientation: () => {
    set((s) => ({ orientation: s.orientation === 'portrait' ? 'landscape' : 'portrait' }));
    get().checkOverflows();
  },
  setZoom: (zoom) => set({ zoom }),
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth: Math.max(220, Math.min(480, sidebarWidth)) }),
  setInspectorWidth: (inspectorWidth) => set({ inspectorWidth: Math.max(260, Math.min(500, inspectorWidth)) }),
  setCanvasPan: (canvasPan) => set({ canvasPan }),
  resetCanvasView: () => set({ zoom: 100, canvasPan: { x: 0, y: 0 } }),
  toggleCopilot: () => set((s) => ({ isCopilotOpen: !s.isCopilotOpen })),
  setActiveCodeFile: (activeCodeFile) => set({ activeCodeFile }),
  setCanvasTool: (canvasTool) => set({ canvasTool }),

  setOrientationPolicy: (orientationPolicy) => {
    const { project } = get();
    set({
      orientationPolicy,
      project: {
        ...project,
        metadata: { ...project.metadata, orientationPolicy }
      }
    });
  },

  openStreamArchitectModal: () => set({ isStreamArchitectModalOpen: true }),
  closeStreamArchitectModal: () => set({ isStreamArchitectModalOpen: false }),

  openFullStackModal: (targetParentId) => set({ isFullStackModalOpen: true, fullStackModalParentId: targetParentId || null }),
  closeFullStackModal: () => set({ isFullStackModalOpen: false, fullStackModalParentId: null }),

  createProjectFile: (path: string, content: string = '') => {
    const { generatedCode } = get();
    const nextFiles = { ...generatedCode.allFiles, [path]: content };
    set({
      isDirty: true,
      generatedCode: {
        ...generatedCode,
        allFiles: nextFiles
      },
      activeCodeFile: path
    });
  },

  deleteProjectFile: (path: string) => {
    const { generatedCode, activeCodeFile } = get();
    const nextFiles = { ...generatedCode.allFiles };
    delete nextFiles[path];
    const nextActive = activeCodeFile === path ? Object.keys(nextFiles)[0] || 'lib/main.dart' : activeCodeFile;
    set({
      isDirty: true,
      generatedCode: {
        ...generatedCode,
        allFiles: nextFiles
      },
      activeCodeFile: nextActive
    });
  },

  renameProjectFile: (oldPath: string, newPath: string) => {
    const { generatedCode, activeCodeFile } = get();
    const content = generatedCode.allFiles[oldPath] || '';
    const nextFiles = { ...generatedCode.allFiles };
    delete nextFiles[oldPath];
    nextFiles[newPath] = content;
    set({
      isDirty: true,
      generatedCode: {
        ...generatedCode,
        allFiles: nextFiles
      },
      activeCodeFile: activeCodeFile === oldPath ? newPath : activeCodeFile
    });
  },

  createProjectFolder: (folderPath: string) => {
    const { generatedCode } = get();
    const cleanFolder = folderPath.replace(/\/+$/, '');
    const placeholder = `${cleanFolder}/.gitkeep`;
    const nextFiles = { ...generatedCode.allFiles, [placeholder]: '' };
    set({
      isDirty: true,
      generatedCode: {
        ...generatedCode,
        allFiles: nextFiles
      }
    });
  },

  setActiveTabIndex: (tabBarId, index) => {
    set((s) => ({
      activeTabIndices: { ...s.activeTabIndices, [tabBarId]: index }
    }));
  },

  setRuntimeInputValue: (compId, value) => {
    set((s) => ({
      runtimeInputValues: { ...s.runtimeInputValues, [compId]: value }
    }));
  },

  toggleAnimation: (compId) => {
    set((s) => ({
      activeAnimations: { ...s.activeAnimations, [compId]: !s.activeAnimations[compId] }
    }));
  },

  checkOverflows: () => {
    const { project, devicePreset, orientation } = get();
    const issues: OverflowIssue[] = [];

    // Analyze component tree constraints against viewport
    const dims = {
      iphone16: { w: 393, h: 852 },
      pixel9: { w: 412, h: 915 },
      galaxy_s24: { w: 360, h: 780 },
      galaxy_tab: { w: 1200, h: 800 },
      ipad: { w: 820, h: 1180 },
      foldable: { w: 375, h: 904 },
      desktop: { w: 1280, h: 800 },
      multi_view: { w: 1280, h: 800 },
      custom: { w: 400, h: 800 },
    }[devicePreset] || { w: 393, h: 852 };

    const effectiveWidth = orientation === 'landscape' ? dims.h : dims.w;

    // Check GridViews or wide elements
    Object.values(project.components).forEach((comp) => {
      if (comp.type === 'GridView') {
        const cols = comp.properties.crossAxisCount || 2;
        if (effectiveWidth < 400 && cols > 2) {
          issues.push({
            componentId: comp.id,
            type: "RenderFlex Horizontal Overflow",
            details: `GridView has ${cols} columns on a ${effectiveWidth}px viewport, causing narrow item squishing.`,
            severity: "error",
            suggestedFix: "Change crossAxisCount to 2 on mobile viewports."
          });
        }
      }
      if (comp.type === 'Row' && comp.childIds.length > 3 && effectiveWidth < 400) {
        issues.push({
          componentId: comp.id,
          type: "Row Overflow Risk",
          details: `Row contains ${comp.childIds.length} horizontal items without Expanded wrapping.`,
          severity: "warning",
          suggestedFix: "Wrap items in Expanded or convert to Wrap/Column."
        });
      }
    });

    set({ overflowIssues: issues });
  },

  toggleZenMode: () => set(state => ({ zenMode: !state.zenMode })),
  openTemplateModal: () => set({ isTemplateModalOpen: true }),
  closeTemplateModal: () => set({ isTemplateModalOpen: false }),
  openAboutModal: () => set({ isAboutModalOpen: true }),
  closeAboutModal: () => set({ isAboutModalOpen: false }),
  loadTemplate: (_templateType: string) => {
    set({ isTemplateModalOpen: false });
  },

  testAnimation: (componentId: string) => {
    set({ testingAnimationId: componentId });
    setTimeout(() => {
      set(state => state.testingAnimationId === componentId ? { testingAnimationId: null } : {});
    }, 1200);
  },

  fetchApiData: async (connectorId: string) => {
    const { project } = get();
    const connector = (project.apiConnectors || []).find(c => c.id === connectorId);
    if (!connector) return;
    try {
      const res = await fetch(connector.url, { method: connector.method });
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          apiDataCache: { ...state.apiDataCache, [connectorId]: data }
        }));
      } else if (connector.mockData) {
        set(state => ({
          apiDataCache: { ...state.apiDataCache, [connectorId]: connector.mockData }
        }));
      }
    } catch {
      if (connector.mockData) {
        set(state => ({
          apiDataCache: { ...state.apiDataCache, [connectorId]: connector.mockData }
        }));
      }
    }
  },

  saveApiConnector: (connector: any) => {
    const { project, undoStack } = get();
    const connectors = [...(project.apiConnectors || [])];
    const idx = connectors.findIndex(c => c.id === connector.id);
    if (idx >= 0) {
      connectors[idx] = connector;
    } else {
      connectors.push(connector);
    }
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: { ...project, apiConnectors: connectors }
    });
  },

  removeApiConnector: (connectorId: string) => {
    const { project, undoStack } = get();
    const connectors = (project.apiConnectors || []).filter(c => c.id !== connectorId);
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: { ...project, apiConnectors: connectors }
    });
  },

  addComponent: (parentId, type, insertIndex) => {
    const { project, undoStack, activeScreenId } = get();
    const newId = `comp_${type.toLowerCase()}_${Date.now().toString().slice(-4)}`;
    
    const defaultProps: Record<string, any> = {
      Text: { text: "New Text Widget", fontSize: 16, isBold: false },
      ElevatedButton: { label: "Action Button", action: "trigger_action" },
      TextField: { hintText: "Enter value...", labelText: "Label" },
      Card: { elevation: 2 },
      Container: { padding: 16 },
      Image: { src: "https://picsum.photos/300/180", height: 140 },
      Icon: { icon: "star", size: 28 },
      Switch: { value: true },
      Checkbox: { value: false },
      Slider: { value: 50 },
      Column: { crossAxisAlignment: "stretch" },
      Row: { mainAxisAlignment: "start" },
      GridView: { crossAxisCount: 2, spacing: 12 },
      ListView: {},
      TabBar: {
        activeTab: 0,
        tabs: [
          { id: "tab_1", label: "Tab 1", icon: "tab" },
          { id: "tab_2", label: "Tab 2", icon: "tab" }
        ],
        indicatorColor: "0xFF6366F1"
      },
      Drawer: {
        drawerHeaderTitle: "Suryaa App",
        drawerHeaderSubtitle: "operator@suryaa.io",
        drawerAvatarText: "SP",
        drawerHeaderGradient: "indigo",
        drawerShowScreens: true,
        drawerShowLogout: true,
        drawerLogoutLabel: "Sign Out",
        drawerFooterText: "v3.0 • Production Build",
        drawerItems: [
          { id: "item_home", label: "Dashboard", icon: "home", route: "/" },
          { id: "item_orders", label: "Orders & Cart", icon: "shopping_bag", route: "/orders" },
          { id: "item_telemetry", label: "Live Telemetry", icon: "activity", route: "/telemetry" },
          { id: "item_settings", label: "Settings", icon: "settings", route: "/settings" }
        ]
      },
      NavigationRail: {
        selectedIndex: 0,
        labelType: "all"
      },
      KPICard: {
        kpiType: "trend",
        title: "Active Metric",
        value: "4,820",
        trend: "+8.4%",
        trendDirection: "up",
        period: "vs last week",
        icon: "activity"
      },
      VideoPlayer: {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        autoPlay: false,
        loop: true,
        showControls: true,
        aspectRatio: "16:9"
      },
      MultiAxisChart: {
        chartType: "multi_axis_line",
        title: "Multi-Axis Telemetry",
        xAxisTitle: "Timestamp",
        xAxisLabels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        showXGrid: true,
        yAxisPrimaryTitle: "Throughput (k)",
        yAxisPrimaryUnit: "k",
        yAxisPrimaryMin: 0,
        yAxisPrimaryMax: 100,
        yAxisPrimaryInterval: 20,
        showSecondaryYAxis: true,
        yAxisSecondaryTitle: "Temp (°C)",
        yAxisSecondaryUnit: "°C",
        yAxisSecondaryMin: 20,
        yAxisSecondaryMax: 120,
        yAxisSecondaryInterval: 20,
        series: [
          {
            id: "series_1",
            name: "Throughput",
            color: "#6366F1",
            axis: "primary",
            curveStyle: "spline",
            data: [24, 38, 42, 65, 78, 82],
            showGradient: true
          },
          {
            id: "series_2",
            name: "Temp SLA",
            color: "#F59E0B",
            axis: "secondary",
            curveStyle: "smooth",
            data: [32, 45, 58, 72, 85, 94],
            showGradient: false
          }
        ],
        showLegend: true,
        showTooltips: true
      },
      CircularGauge: {
        title: "Vessel Pressure",
        value: 78.4,
        unit: "PSI",
        min: 0,
        max: 120,
        target: 85,
        thresholdWarning: 75,
        thresholdCritical: 100,
        showNeedle: true,
        arcColor: "#10B981",
        warningColor: "#F59E0B",
        criticalColor: "#EF4444"
      },
      ArcGauge: {
        title: "Turbine Speed",
        value: 3450,
        unit: "RPM",
        min: 0,
        max: 6000,
        sweepAngle: 180,
        primaryColor: "#06B6D4",
        trackColor: "#1E293B"
      },
      MetricCardCompact: {
        title: "Efficiency",
        value: "94.6%",
        unit: "%",
        change: "+2.3%",
        status: "optimal",
        progress: 94.6,
        icon: "zap"
      },
      RadialProgressBox: {
        title: "Batch Yield",
        percent: 88,
        metricText: "88%",
        subtext: "1,240 / 1,400 kg",
        ringColor: "#6366F1"
      },
      SparklineBox: {
        title: "Vibration Peak",
        value: "0.42 mm/s",
        trend: "Stable",
        dataPoints: [12, 19, 15, 25, 22, 30, 28, 35, 32, 42],
        lineColor: "#10B981"
      },
      StatusBeaconBox: {
        title: "Mill Status",
        statusText: "Operational",
        telemetry: "48.2 Hz",
        statusLevel: "success"
      }
    };

    // Resolve target parent if parentId is empty or not in project
    let actualParentId = parentId;
    if (!actualParentId || !project.components[actualParentId]) {
      const curScreen = project.screens.find(s => s.id === activeScreenId) || project.screens[0];
      actualParentId = curScreen ? curScreen.rootComponentId : Object.keys(project.components)[0];
    }

    const nextComponents = { ...project.components };
    let parent = nextComponents[actualParentId];

    // If parent is a Scaffold and widget is not AppBar:
    if (parent && parent.type === 'Scaffold' && type !== 'AppBar') {
      const bodyChildId = parent.childIds.find(cid => nextComponents[cid]?.type !== 'AppBar');
      if (bodyChildId && nextComponents[bodyChildId]) {
        // Route into existing body container
        actualParentId = bodyChildId;
        parent = nextComponents[actualParentId];
      } else if (type !== 'Column' && type !== 'ListView' && type !== 'Row') {
        // Scaffold has NO body container and dropped widget is not a container! Auto-create Column!
        const colId = `comp_column_${Date.now().toString().slice(-4)}`;
        const newCol: ComponentNode = {
          id: colId,
          type: 'Column',
          parentId: actualParentId,
          childIds: [],
          properties: { crossAxisAlignment: 'stretch', spacing: 16 }
        };
        nextComponents[colId] = newCol;
        nextComponents[actualParentId] = {
          ...parent,
          childIds: [...parent.childIds, colId]
        };
        actualParentId = colId;
        parent = newCol;
      }
    }

    const newComponent: ComponentNode = {
      id: newId,
      type,
      parentId: actualParentId,
      childIds: [],
      properties: defaultProps[type] || {}
    };

    nextComponents[newId] = newComponent;
    if (parent) {
      const nextChildren = [...parent.childIds];
      if (typeof insertIndex === 'number' && insertIndex >= 0) {
        nextChildren.splice(insertIndex, 0, newId);
      } else {
        nextChildren.push(newId);
      }
      nextComponents[actualParentId] = { ...parent, childIds: nextChildren };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: newId,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
    return newId;
  },

  batchAddComponents: (componentsList, targetParentId) => {
    const { project, undoStack, activeScreenId } = get();
    if (!componentsList || componentsList.length === 0) return;

    let pId = targetParentId;
    const curScreen = project.screens.find(s => s.id === activeScreenId) || project.screens[0];
    if (!pId && curScreen) {
      pId = curScreen.rootComponentId;
    }

    const nextComponents = { ...project.components };

    // If target parent is Scaffold, find or auto-create body Column!
    if (pId && nextComponents[pId] && nextComponents[pId].type === 'Scaffold') {
      const bodyChildId = nextComponents[pId].childIds.find(cid => nextComponents[cid]?.type !== 'AppBar');
      if (bodyChildId && nextComponents[bodyChildId]) {
        pId = bodyChildId;
      } else {
        const colId = `comp_column_${Date.now().toString().slice(-4)}`;
        nextComponents[colId] = {
          id: colId,
          type: 'Column',
          parentId: pId,
          childIds: [],
          properties: { crossAxisAlignment: 'stretch', spacing: 16 }
        };
        nextComponents[pId] = {
          ...nextComponents[pId],
          childIds: [...nextComponents[pId].childIds, colId]
        };
        pId = colId;
      }
    }

    const addedIds: string[] = [];

    componentsList.forEach(comp => {
      const resolvedComp: ComponentNode = {
        ...comp,
        parentId: comp.parentId || pId || null
      };
      nextComponents[comp.id] = resolvedComp;
      addedIds.push(comp.id);
    });

    // Attach to parent container
    if (pId && nextComponents[pId]) {
      const parent = nextComponents[pId];
      const newChildIds = [...parent.childIds];
      addedIds.forEach(id => {
        if (!newChildIds.includes(id)) {
          newChildIds.push(id);
        }
      });
      nextComponents[pId] = { ...parent, childIds: newChildIds };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      mode: 'design',
      selectedComponentId: addedIds[0] || null,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
  },

  addFullStackCard: (params: {
    widgetName: string;
    title: string;
    subtitle?: string;
    createApi: boolean;
    apiPath?: string;
    createDb: boolean;
    tableName?: string;
    targetParentId?: string;
  }) => {
    const { project, undoStack, activeScreenId } = get();
    const timestamp = Date.now().toString().slice(-4);
    const sanitizedName = (params.widgetName || 'MetricCard').replace(/\s+/g, '');
    const cardId = `comp_card_${sanitizedName.toLowerCase()}_${timestamp}`;
    const colInnerId = `comp_col_card_${timestamp}`;
    const headerRowId = `comp_row_hdr_${timestamp}`;
    const titleId = `comp_txt_title_${timestamp}`;
    const statusBeaconId = `comp_beacon_${timestamp}`;
    const metricValId = `comp_txt_val_${timestamp}`;
    const subtitleId = `comp_txt_sub_${timestamp}`;
    const btnId = `comp_btn_action_${timestamp}`;

    const apiSlug = (params.apiPath || sanitizedName.toLowerCase()).replace(/^\//, '');
    const apiUrl = `/api/v1/${apiSlug}`;
    const tblName = (params.tableName || sanitizedName.toLowerCase()).replace(/[^a-zA-Z0-9_]/g, '_');

    // 1. Backend Entity & Endpoint
    let nextBackend = { ...project.backend };
    if (params.createDb) {
      const newEntity: BackendEntity = {
        name: sanitizedName,
        tableName: tblName,
        fields: [
          { name: 'id', type: 'integer', primaryKey: true },
          { name: 'title', type: 'string', nullable: false },
          { name: 'metric_value', type: 'float', nullable: false },
          { name: 'status', type: 'string', nullable: true },
          { name: 'created_at', type: 'datetime', nullable: true }
        ]
      };
      const newEndpoint: BackendEndpoint = {
        path: apiUrl,
        methods: ['GET', 'POST'],
        entity: sanitizedName,
        authRequired: false
      };
      nextBackend = {
        ...nextBackend,
        entities: [...(nextBackend.entities || []).filter(e => e.name !== sanitizedName), newEntity],
        endpoints: [...(nextBackend.endpoints || []).filter(ep => ep.path !== apiUrl), newEndpoint]
      };
    }

    // 2. ApiConnector
    let nextConnectors = [...(project.apiConnectors || [])];
    const connectorId = `api_${sanitizedName.toLowerCase()}_${timestamp}`;
    if (params.createApi) {
      const newConnector: ApiConnector = {
        id: connectorId,
        name: `${sanitizedName} Live Stream`,
        url: apiUrl,
        method: 'GET',
        mockData: {
          id: 1,
          title: params.title || "Telemetry Stream",
          metric_value: 94.6,
          status: "Optimal",
          timestamp: new Date().toISOString()
        }
      };
      nextConnectors = [...nextConnectors.filter(c => c.id !== connectorId), newConnector];
    }

    // 3. UI Component Structure (Card with children)
    const cardComp: ComponentNode = {
      id: cardId,
      type: 'Card',
      parentId: null,
      childIds: [colInnerId],
      properties: {
        elevation: 3,
        padding: 16,
        borderRadius: 16,
        dataBinding: params.createApi ? { connectorId, field: 'metric_value' } : undefined,
        entityName: sanitizedName
      }
    };

    const innerCol: ComponentNode = {
      id: colInnerId,
      type: 'Column',
      parentId: cardId,
      childIds: [headerRowId, metricValId, subtitleId, btnId],
      properties: {
        crossAxisAlignment: 'stretch',
        spacing: 8
      }
    };

    const headerRow: ComponentNode = {
      id: headerRowId,
      type: 'Row',
      parentId: colInnerId,
      childIds: [titleId, statusBeaconId],
      properties: {
        mainAxisAlignment: 'spaceBetween',
        crossAxisAlignment: 'center'
      }
    };

    const titleComp: ComponentNode = {
      id: titleId,
      type: 'Text',
      parentId: headerRowId,
      childIds: [],
      properties: {
        text: params.title || "Real-Time Telemetry",
        fontSize: 14,
        isBold: true,
        textColor: "0xFF94A3B8"
      }
    };

    const beaconComp: ComponentNode = {
      id: statusBeaconId,
      type: 'StatusBeaconBox',
      parentId: headerRowId,
      childIds: [],
      properties: {
        title: "Status",
        statusText: "Active",
        statusLevel: "success"
      }
    };

    const metricComp: ComponentNode = {
      id: metricValId,
      type: 'Text',
      parentId: colInnerId,
      childIds: [],
      properties: {
        text: "94.6%",
        fontSize: 28,
        isBold: true,
        textColor: "0xFF6366F1"
      }
    };

    const subComp: ComponentNode = {
      id: subtitleId,
      type: 'Text',
      parentId: colInnerId,
      childIds: [],
      properties: {
        text: params.subtitle || `Connected to ${apiUrl} · SQLite: ${tblName}`,
        fontSize: 11,
        textColor: "0xFF64748B"
      }
    };

    const btnComp: ComponentNode = {
      id: btnId,
      type: 'ElevatedButton',
      parentId: colInnerId,
      childIds: [],
      properties: {
        label: `Refresh ${sanitizedName}`,
        action: `fetch_${connectorId}`,
        backgroundColor: "0xFF1E2536",
        textColor: "0xFFFFFFFF"
      }
    };

    let targetParent = params.targetParentId;
    const curScreen = project.screens.find(s => s.id === activeScreenId) || project.screens[0];
    if (!targetParent && curScreen) {
      targetParent = curScreen.rootComponentId;
    }

    const nextComponents = {
      ...project.components,
      [cardId]: cardComp,
      [colInnerId]: innerCol,
      [headerRowId]: headerRow,
      [titleId]: titleComp,
      [statusBeaconId]: beaconComp,
      [metricValId]: metricComp,
      [subtitleId]: subComp,
      [btnId]: btnComp
    };

    if (targetParent && nextComponents[targetParent]) {
      const p = nextComponents[targetParent];
      if (p.type === 'Scaffold') {
        const bodyChild = p.childIds.find(cid => nextComponents[cid]?.type !== 'AppBar');
        if (bodyChild && nextComponents[bodyChild]) {
          cardComp.parentId = bodyChild;
          nextComponents[bodyChild] = {
            ...nextComponents[bodyChild],
            childIds: [...nextComponents[bodyChild].childIds, cardId]
          };
        } else {
          const colId = `comp_column_${Date.now().toString().slice(-4)}`;
          nextComponents[colId] = {
            id: colId,
            type: 'Column',
            parentId: targetParent,
            childIds: [cardId],
            properties: { crossAxisAlignment: 'stretch', spacing: 16 }
          };
          nextComponents[targetParent] = {
            ...p,
            childIds: [...p.childIds, colId]
          };
          cardComp.parentId = colId;
        }
      } else {
        cardComp.parentId = targetParent;
        nextComponents[targetParent] = {
          ...p,
          childIds: [...p.childIds, cardId]
        };
      }
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: cardId,
      mode: 'design',
      project: {
        ...project,
        backend: nextBackend,
        apiConnectors: nextConnectors,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });

    return cardId;
  },

  buildStreamDrivenApp: (config: StreamAppConfig) => {
    const { project, generatedCode, undoStack } = get();
    
    // 1. Generate full backend Docker + PostgreSQL + JWT + Flutter files
    const newFiles = generateStreamAppFiles(config);
    const mergedFiles = { ...generatedCode.allFiles, ...newFiles };

    // 2. Generate Screens & Visual Component Trees
    const { screens, components, apiConnector } = generateStreamAppScreensAndComponents(config, project);

    // 3. Update connectors
    const nextConnectors = [...(project.apiConnectors || []).filter(c => !c.id.startsWith('connector_stream_')), apiConnector];

    // 4. Update project state
    const nextProject: ProjectSchema = {
      ...project,
      screens,
      components,
      apiConnectors: nextConnectors,
      metadata: {
        ...project.metadata,
        orientationPolicy: config.orientationPolicy,
        updatedAt: new Date().toISOString()
      }
    };

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      orientationPolicy: config.orientationPolicy,
      isStreamArchitectModalOpen: false,
      activeScreenId: screens[0]?.id || 'screen_home',
      selectedComponentId: screens[0]?.rootComponentId || null,
      generatedCode: {
        ...generatedCode,
        allFiles: mergedFiles,
        mainDart: mergedFiles['lib/main.dart'] || generatedCode.mainDart,
        pythonMain: mergedFiles['backend/app/main.py'] || generatedCode.pythonMain
      },
      project: nextProject,
      buildLogs: [
        ...get().buildLogs,
        `[Stream Architect] Standalone Docker & PostgreSQL 16 backend created.`,
        `[Stream Architect] Continuous stream ${config.streamUrl} wired with tag [${config.streamTag || 'root'}].`,
        `[Stream Architect] Generated ${screens.length} screens including ${config.loginStyle} authentication.`
      ]
    });
  },

  updateComponentProperty: (componentId, prop, value) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            properties: { ...comp.properties, [prop]: value }
          }
        }
      }
    });
    get().checkOverflows();
  },

  updateComponentAnimation: (componentId, animConfig) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            animation: animConfig
          }
        }
      }
    });
  },

  removeComponent: (componentId) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    // Never remove the root container of any screen
    const isRoot = project.screens.some(s => s.rootComponentId === componentId);
    if (isRoot) return;

    // Recursively collect all descendant component IDs to prevent orphaned dangling nodes
    const idsToDelete = new Set<string>();
    const collectDescendants = (cid: string) => {
      idsToDelete.add(cid);
      const node = project.components[cid];
      if (node && node.childIds) {
        node.childIds.forEach(collectDescendants);
      }
    };
    collectDescendants(componentId);

    const nextComponents = { ...project.components };
    idsToDelete.forEach(id => delete nextComponents[id]);

    // Detach from parent
    if (comp.parentId && nextComponents[comp.parentId]) {
      const parent = nextComponents[comp.parentId];
      nextComponents[comp.parentId] = {
        ...parent,
        childIds: parent.childIds.filter((cid) => cid !== componentId)
      };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: comp.parentId || null,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
  },

  moveComponent: (componentId, newParentId, newIndex) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    // Prevent circular dependency: target cannot be componentId or any descendant of componentId
    if (isDescendantOrSelf(newParentId, componentId, project.components)) {
      return;
    }

    const nextComponents = { ...project.components };
    // Remove from old parent
    if (comp.parentId && nextComponents[comp.parentId]) {
      const oldParent = nextComponents[comp.parentId];
      nextComponents[comp.parentId] = {
        ...oldParent,
        childIds: oldParent.childIds.filter(id => id !== componentId)
      };
    }

    // Attach to new parent
    const targetParent = nextComponents[newParentId];
    if (targetParent) {
      const nextChildren = [...targetParent.childIds];
      const validIndex = Math.max(0, Math.min(newIndex, nextChildren.length));
      nextChildren.splice(validIndex, 0, componentId);
      nextComponents[newParentId] = { ...targetParent, childIds: nextChildren };
      nextComponents[componentId] = { ...comp, parentId: newParentId };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: componentId,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
  },

  moveComponentOrder: (componentId, direction) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp || !comp.parentId) return;
    const parent = project.components[comp.parentId];
    if (!parent) return;

    const childIds = [...parent.childIds];
    const idx = childIds.indexOf(componentId);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= childIds.length) return;

    const temp = childIds[idx];
    childIds[idx] = childIds[targetIdx];
    childIds[targetIdx] = temp;

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [comp.parentId]: { ...parent, childIds }
        }
      }
    });
  },

  replaceComponentType: (componentId, newType) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    const nextProps: Record<string, any> = { ...comp.properties };
    if (newType === 'ElevatedButton' && comp.properties.text) {
      nextProps.label = comp.properties.text;
    } else if (newType === 'Text' && comp.properties.label) {
      nextProps.text = comp.properties.label;
    } else if (newType === 'TextField' && comp.properties.text) {
      nextProps.hintText = comp.properties.text;
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            type: newType,
            properties: nextProps
          }
        }
      }
    });
    get().checkOverflows();
  },

  reparentComponent: (componentId, newParentId) => {
    const { project, moveComponent } = get();
    const targetParent = project.components[newParentId];
    if (targetParent) {
      moveComponent(componentId, newParentId, targetParent.childIds.length);
    }
  },

  duplicateComponent: (componentId) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp || !comp.parentId) return;
    const parent = project.components[comp.parentId];
    if (!parent) return;

    const nextComponents = { ...project.components };
    // Deep clone the component and all its nested children
    const newRootId = cloneSubtree(componentId, comp.parentId, project.components, nextComponents);
    if (!newRootId) return;

    const parentChildIds = [...parent.childIds];
    const sourceIndex = parentChildIds.indexOf(componentId);
    if (sourceIndex >= 0) {
      parentChildIds.splice(sourceIndex + 1, 0, newRootId);
    } else {
      parentChildIds.push(newRootId);
    }
    nextComponents[comp.parentId] = { ...parent, childIds: parentChildIds };

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: newRootId,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
  },

  copyComponent: (componentId) => {
    const { project } = get();
    const comp = project.components[componentId];
    if (!comp) return;

    // Collect entire subtree nodes into clipboard
    const subtreeMap: Record<string, ComponentNode> = {};
    const collect = (id: string) => {
      const node = project.components[id];
      if (node) {
        subtreeMap[id] = JSON.parse(JSON.stringify(node));
        if (node.childIds) {
          node.childIds.forEach(collect);
        }
      }
    };
    collect(componentId);
    _clipboardSubtreeNodes = subtreeMap;

    set({ clipboardComponent: JSON.parse(JSON.stringify(comp)) });
  },

  pasteComponent: (targetParentId) => {
    const { clipboardComponent, selectedComponentId, project, undoStack, activeScreenId } = get();
    if (!clipboardComponent) return;

    // Resolve target parent
    let parentId = targetParentId || selectedComponentId;
    if (!parentId || !project.components[parentId]) {
      const curScreen = project.screens.find(s => s.id === activeScreenId) || project.screens[0];
      parentId = curScreen ? curScreen.rootComponentId : Object.keys(project.components)[0];
    }

    const nextComponents = { ...project.components };
    let parent = nextComponents[parentId];

    // If target parent is a Scaffold, route into body Column
    if (parent && parent.type === 'Scaffold') {
      const bodyChildId = parent.childIds.find(cid => nextComponents[cid]?.type !== 'AppBar');
      if (bodyChildId && nextComponents[bodyChildId]) {
        parentId = bodyChildId;
        parent = nextComponents[parentId];
      }
    }

    // Deep clone from clipboard subtree
    const sourceMap = _clipboardSubtreeNodes || { [clipboardComponent.id]: clipboardComponent };
    const newRootId = cloneSubtree(clipboardComponent.id, parentId, sourceMap, nextComponents);
    if (!newRootId) return;

    if (parent) {
      nextComponents[parentId] = {
        ...parent,
        childIds: [...parent.childIds, newRootId]
      };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      selectedComponentId: newRootId,
      project: {
        ...project,
        components: nextComponents,
        metadata: { ...project.metadata, updatedAt: new Date().toISOString() }
      }
    });
    get().checkOverflows();
  },

  setThemePreset: (preset) => {
    const { project, undoStack } = get();
    const presetTokens: Record<string, any> = {
      glassmorphism: { 
        primaryColor: "0xFF6366F1", 
        secondaryColor: "0xFFEC4899", 
        backgroundColor: "0xFF0F172A", 
        surfaceColor: "0x40334155", 
        textColor: "0xFFF8FAFC", 
        borderRadius: 20, 
        blur: 16, 
        elevation: 0,
        isDark: true 
      },
      neumorphism: { 
        primaryColor: "0xFF3B82F6", 
        secondaryColor: "0xFF60A5FA", 
        backgroundColor: "0xFFE0E5EC", 
        surfaceColor: "0xFFE0E5EC", 
        textColor: "0xFF2D3748", 
        borderRadius: 24, 
        elevation: 6,
        blur: 0,
        isDark: false 
      },
      material3: { 
        primaryColor: "0xFF6750A4", 
        secondaryColor: "0xFF625B71", 
        backgroundColor: "0xFFFFFBFE", 
        surfaceColor: "0xFFF3EDF7", 
        textColor: "0xFF1C1B1F", 
        borderRadius: 16, 
        elevation: 2,
        blur: 0,
        isDark: false 
      },
      fluent: { 
        primaryColor: "0xFF0078D4", 
        secondaryColor: "0xFF2B88D8", 
        backgroundColor: "0xFFF3F3F3", 
        surfaceColor: "0xFFFFFFFF", 
        textColor: "0xFF201F1E", 
        borderRadius: 8, 
        elevation: 1,
        blur: 10,
        isDark: false 
      },
      bento: { 
        primaryColor: "0xFF18181B", 
        secondaryColor: "0xFF71717A", 
        backgroundColor: "0xFF09090B", 
        surfaceColor: "0xFF18181B", 
        textColor: "0xFFFAFAFA", 
        borderRadius: 22, 
        elevation: 0, 
        borderWidth: 1, 
        borderColor: "0xFF27272A",
        blur: 0,
        isDark: true 
      },
      minimalism: { 
        primaryColor: "0xFF000000", 
        secondaryColor: "0xFF737373", 
        backgroundColor: "0xFFFFFFFF", 
        surfaceColor: "0xFFF5F5F5", 
        textColor: "0xFF0A0A0A", 
        borderRadius: 4, 
        elevation: 0,
        blur: 0,
        isDark: false 
      },
      neobrutalism: { 
        primaryColor: "0xFFFFE600", 
        secondaryColor: "0xFFFF0055", 
        backgroundColor: "0xFFFFFDF0", 
        surfaceColor: "0xFFFFFFFF", 
        textColor: "0xFF000000", 
        borderRadius: 2, 
        elevation: 0, 
        borderWidth: 3, 
        borderColor: "0xFF000000",
        blur: 0,
        isDark: false 
      },
      neon: { 
        primaryColor: "0xFF00FFCC", 
        secondaryColor: "0xFFFF007F", 
        backgroundColor: "0xFF05050A", 
        surfaceColor: "0xFF12121E", 
        textColor: "0xFF00FFCC", 
        borderRadius: 14, 
        elevation: 0,
        blur: 0,
        isDark: true 
      },
      claymorphism: { 
        primaryColor: "0xFFFF6B6B", 
        secondaryColor: "0xFF4ECDC4", 
        backgroundColor: "0xFFF4F6FB", 
        surfaceColor: "0xFFFFFFFF", 
        textColor: "0xFF2D3436", 
        borderRadius: 28, 
        elevation: 10,
        blur: 0,
        isDark: false 
      },
      skeuomorphism: { 
        primaryColor: "0xFF8B5A2B", 
        secondaryColor: "0xFFCD853F", 
        backgroundColor: "0xFF232733", 
        surfaceColor: "0xFF2C3241", 
        textColor: "0xFFFFFFFF", 
        borderRadius: 12, 
        elevation: 8,
        blur: 0,
        isDark: true 
      },
      editorial: { 
        primaryColor: "0xFF1C1917", 
        secondaryColor: "0xFF78716C", 
        backgroundColor: "0xFFFAF7F2", 
        surfaceColor: "0xFFF5F0E6", 
        textColor: "0xFF1C1917", 
        fontFamily: "Playfair Display",
        borderRadius: 2, 
        elevation: 0,
        blur: 0,
        isDark: false 
      },
      gradient: { 
        primaryColor: "0xFF8A2387", 
        secondaryColor: "0xFFE94057", 
        backgroundColor: "0xFF120024", 
        surfaceColor: "0xFF240046", 
        textColor: "0xFFFFFFFF", 
        borderRadius: 18, 
        elevation: 4,
        blur: 0,
        isDark: true 
      },
      enterprise: { 
        primaryColor: "0xFF0F4C81", 
        secondaryColor: "0xFF4A90E2", 
        backgroundColor: "0xFFF8F9FA", 
        surfaceColor: "0xFFFFFFFF", 
        textColor: "0xFF212529", 
        borderRadius: 6, 
        elevation: 2,
        blur: 0,
        isDark: false 
      },
      flat: { 
        primaryColor: "0xFF2ECC71", 
        secondaryColor: "0xFFE74C3C", 
        backgroundColor: "0xFFECF0F1", 
        surfaceColor: "0xFFFFFFFF", 
        textColor: "0xFF2C3E50", 
        borderRadius: 6, 
        elevation: 0,
        blur: 0,
        isDark: false 
      }
    };

    const chosenPreset = presetTokens[preset] || {};
    const tokens = { ...project.theme.tokens, ...chosenPreset };
    const nextMode = chosenPreset.isDark !== undefined 
      ? (chosenPreset.isDark ? 'dark' : 'light') 
      : project.theme.mode;

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        theme: { 
          ...project.theme, 
          activePreset: preset, 
          mode: nextMode,
          tokens 
        }
      }
    });
  },

  setThemeMode: (mode: 'dark' | 'light') => {
    const { project, undoStack } = get();
    let nextTokens = { ...project.theme.tokens };
    if (mode === 'light') {
      nextTokens = {
        ...nextTokens,
        backgroundColor: "0xFFF8FAFC",
        surfaceColor: "0xFFFFFFFF",
        textColor: "0xFF0F172A",
      };
    } else {
      nextTokens = {
        ...nextTokens,
        backgroundColor: "0xFF0F172A",
        surfaceColor: "0x40334155",
        textColor: "0xFFFFFFFF",
      };
    }

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        theme: {
          ...project.theme,
          mode,
          tokens: nextTokens
        }
      }
    });
  },

  toggleThemeMode: () => {
    const { project } = get();
    const currentMode = project.theme.mode || 'dark';
    const nextMode = currentMode === 'dark' ? 'light' : 'dark';
    get().setThemeMode(nextMode);
  },

  updateThemeToken: (token, value) => {
    const { project, undoStack } = get();
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        theme: {
          ...project.theme,
          tokens: { ...project.theme.tokens, [token]: value }
        }
      }
    });
  },

  updateAndroidConfig: (config) => {
    const { project, undoStack } = get();
    const currentAndroid = project.metadata.android || {
      packageName: "com.example.app",
      appName: project.metadata.name,
      versionName: "1.0.0",
      versionCode: 1,
      minSdk: 21,
      targetSdk: 34,
      permissions: ["android.permission.INTERNET"]
    };

    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        metadata: {
          ...project.metadata,
          android: { ...currentAndroid, ...config }
        }
      }
    });
  },

  updateComponentLayout: (componentId, layout) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            layout: { ...(comp.layout || {}), ...layout }
          }
        }
      }
    });
  },

  setComponentLayoutRealtime: (componentId, layout) => {
    const { project } = get();
    const comp = project.components[componentId];
    if (!comp) return;
    set({
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            layout: { ...(comp.layout || {}), ...layout }
          }
        }
      }
    });
  },

  updateComponentBreakpoint: (componentId, breakpoint, props) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;
    const currentBreakpoints = comp.breakpoints || {};
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            breakpoints: {
              ...currentBreakpoints,
              [breakpoint]: { ...(currentBreakpoints[breakpoint] || {}), ...props }
            }
          }
        }
      }
    });
  },

  toggleLockComponent: (componentId) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;
    const isLocked = !(comp.layout?.isLocked);
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            layout: { ...(comp.layout || {}), isLocked }
          }
        }
      }
    });
  },

  toggleHideComponent: (componentId) => {
    const { project, undoStack } = get();
    const comp = project.components[componentId];
    if (!comp) return;
    const isHidden = !(comp.layout?.isHidden);
    set({
      undoStack: [...undoStack, project],
      redoStack: [],
      isDirty: true,
      project: {
        ...project,
        components: {
          ...project.components,
          [componentId]: {
            ...comp,
            layout: { ...(comp.layout || {}), isHidden }
          }
        }
      }
    });
  },

  undo: () => {
    const { undoStack, redoStack, project } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, project],
      project: prev,
      isDirty: true
    });
    get().checkOverflows();
  },

  redo: () => {
    const { redoStack, undoStack, project } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, project],
      project: next,
      isDirty: true
    });
    get().checkOverflows();
  },

  saveProject: async () => {
    const { project } = get();
    set({ isSaving: true });
    try {
      const res = await fetch('/api/v1/projects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        set({ isDirty: false });
      }
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      set({ isSaving: false });
    }
  },

  generateProject: async () => {
    const { project } = get();
    set({ isGenerating: true });
    try {
      const res = await fetch(`/api/v1/projects/${project.metadata.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const data = await res.json();
        const filesMap: Record<string, string> = data.files || {};
        const firstViewKey = Object.keys(filesMap).find(k => k.includes('_view.dart')) || 'lib/features/home/views/home_view.dart';
        const firstVmKey = Object.keys(filesMap).find(k => k.includes('_view_model.dart')) || 'lib/features/home/view_models/home_view_model.dart';
        set({
          generatedCode: {
            allFiles: { ...get().generatedCode.allFiles, ...filesMap },
            mainDart: filesMap['lib/main.dart'] || data.flutterMainDart || "",
            themeDart: filesMap['lib/app/theme/app_theme.dart'] || data.flutterThemeDart || "",
            viewDart: filesMap[firstViewKey] || data.flutterViewDart || "",
            viewModelDart: filesMap[firstVmKey] || data.flutterViewModelDart || "",
            pubspecYaml: filesMap['pubspec.yaml'] || data.pubspecYaml || ("name: " + project.metadata.id),
            pythonMain: filesMap['backend/app/main.py'] || data.pythonMainPy || ""
          }
        });
      }
    } catch (e) {
      console.error("Generate failed:", e);
    } finally {
      set({ isGenerating: false });
    }
  },

  triggerBuild: async (targetType) => {
    const { project } = get();
    set({ buildStatus: 'running' });
    try {
      await get().generateProject();
      
      const res = await fetch('/api/v1/builds/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.metadata.id, targetType })
      });
      
      if (res.ok) {
        const data = await res.json();
        set({ activeJobId: data.jobId });
        
        const poll = setInterval(async () => {
          const pollRes = await fetch(`/api/v1/builds/${data.jobId}`);
          if (pollRes.ok) {
            const jobData = await pollRes.json();
            set({ buildLogs: jobData.logs || [] });
            if (jobData.status === 'success' || jobData.status === 'failed') {
              clearInterval(poll);
              set({ buildStatus: jobData.status });
              get().fetchArtifacts();
            }
          }
        }, 1000);
      }
    } catch (e) {
      set({ buildStatus: 'failed' });
    }
  },

  runSecurityAudit: async () => {
    const { project } = get();
    try {
      const res = await fetch('/api/v1/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.metadata.id, schema: project })
      });
      if (res.ok) {
        const data = await res.json();
        set({ securityReport: data });
      }
    } catch (e) {
      console.error("Security audit failed:", e);
    }
  },

  fetchArtifacts: async () => {
    try {
      const res = await fetch('/api/v1/artifacts/');
      if (res.ok) {
        const list = await res.json();
        set({ artifactsList: list });
      }
    } catch (e) {
      console.error("Fetch artifacts failed:", e);
    }
  },

  // Subscription & 3-Day Free Trial
  billingStatus: null,
  isUpgradeModalOpen: false,
  openUpgradeModal: () => set({ isUpgradeModalOpen: true }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),
  fetchBillingStatus: async () => {
    try {
      const res = await fetch('/api/v1/billing/status?user_id=usr_suryaa_default');
      if (res.ok) {
        const data = await res.json();
        const sub = data.subscription || data;
        set({
          billingStatus: {
            plan: sub.plan || 'trial',
            isEntitled: sub.isEntitled !== undefined ? sub.isEntitled : (sub.is_entitled ?? true),
            secondsRemaining: sub.secondsRemaining ?? sub.seconds_remaining ?? 259200,
            hoursRemaining: sub.secondsRemaining ? Math.round(sub.secondsRemaining / 3600) : (sub.hours_remaining ?? 72),
            aiCreditsRemaining: sub.monthlyTokenBudget ?? sub.ai_credits_remaining ?? 500,
            trialExpiresAt: sub.trialExpiresAt ?? sub.trial_expires_at ?? null,
            features: sub.allowedProviders || sub.features || []
          }
        });
      }
    } catch (e) {
      console.error("Fetch billing failed:", e);
    }
  },
  subscribePlan: async (plan: 'pro' | 'enterprise') => {
    try {
      const res = await fetch('/api/v1/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'usr_suryaa_default', plan })
      });
      if (res.ok) {
        await get().fetchBillingStatus();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Subscribe plan failed:", e);
      return false;
    }
  }
}));
