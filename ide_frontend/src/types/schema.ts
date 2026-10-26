export interface ComponentProperty {
  [key: string]: any;
}

export interface AnimationConfig {
  type: 'fade' | 'scale' | 'slide' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'rotate' | 'bounce' | 'pulse' | 'shake' | 'container';
  duration: number; // ms
  delay: number; // ms
  curve: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounceOut' | 'elasticOut';
  repeat: 'once' | 'loop' | 'reverse';
  autoPlay: boolean;
  fromValue?: number;
  toValue?: number;
}

export interface ApiConnector {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WS';
  headers?: Record<string, string>;
  authType?: string;
  authToken?: string;
  fields?: string[];
  pollingInterval?: number;
  sampleResponse?: any;
  mockData?: any;
}

export interface TabItemConfig {
  id: string;
  label: string;
  icon?: string;
  childContainerId: string;
}

export type LayoutMode = 'flex' | 'grid' | 'stack' | 'absolute';
export type SizingMode = 'fixed' | 'fill' | 'hug' | 'flex' | 'constrained' | 'auto';

export interface LayoutConstraints {
  width?: number | string;
  height?: number | string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  sizingMode?: SizingMode;
  layoutMode?: LayoutMode;
  x?: number;
  y?: number;
  zIndex?: number;
  isLocked?: boolean;
  isHidden?: boolean;
}

export interface ResponsiveBreakpoints {
  phone?: Partial<ComponentProperty>;
  tablet?: Partial<ComponentProperty>;
  desktop?: Partial<ComponentProperty>;
}

export interface ComponentNode {
  id: string;
  type: string;
  parentId: string | null;
  childIds: string[];
  properties: ComponentProperty;
  layout?: LayoutConstraints;
  breakpoints?: ResponsiveBreakpoints;
  events?: Record<string, string>;
  animation?: AnimationConfig;
  componentRefId?: string;
}

export interface StateVariable {
  name: string;
  type: string;
  initialValue: any;
}

export interface Screen {
  id: string;
  name: string;
  route: string;
  rootComponentId: string;
  stateVariables?: StateVariable[];
}

export type ScreenNode = Screen;

export interface ThemeTokens {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderRadius: number;
  elevation: number;
  blur?: number;
  fontFamily: string;
}

export interface ThemeConfig {
  activePreset: string;
  mode: 'dark' | 'light';
  tokens: ThemeTokens;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'apiCall' | 'setState' | 'navigate' | 'notification';
  title: string;
  config: Record<string, any>;
  x?: number;
  y?: number;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface EntityField {
  name: string;
  type: 'uuid' | 'string' | 'integer' | 'float' | 'boolean' | 'datetime';
  primaryKey?: boolean;
  nullable?: boolean;
}

export interface BackendEntity {
  name: string;
  tableName: string;
  fields: EntityField[];
}

export interface BackendEndpoint {
  path: string;
  methods: string[];
  entity: string;
  authRequired: boolean;
}

export interface BackendConfig {
  enabled: boolean;
  database: 'sqlite' | 'postgresql';
  entities: BackendEntity[];
  endpoints: BackendEndpoint[];
}

export interface AndroidConfig {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  permissions: string[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  packageName: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  android?: AndroidConfig;
  orientationPolicy?: 'portrait_only' | 'landscape_only' | 'adaptive';
}

export interface ProjectSchema {
  version: string;
  metadata: ProjectMetadata;
  theme: ThemeConfig;
  screens: Screen[];
  components: Record<string, ComponentNode>;
  workflows: Workflow[];
  backend: BackendConfig;
  apiConnectors?: ApiConnector[];
}
