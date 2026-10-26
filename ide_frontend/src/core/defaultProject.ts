import { ProjectSchema } from '../types/schema';

export const DEFAULT_PROJECT_SCHEMA: ProjectSchema = {
  version: "1.0.0",
  metadata: {
    id: "flutter_ecommerce_studio",
    name: "Nova Commerce Pro",
    packageName: "com.nova.commerce",
    version: "1.0.0+1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    android: {
      packageName: "com.nova.commerce",
      appName: "Nova Commerce Pro",
      versionName: "1.0.0",
      versionCode: 1,
      minSdk: 21,
      targetSdk: 34,
      permissions: [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    }
  },
  theme: {
    activePreset: "glassmorphism",
    mode: "dark",
    tokens: {
      primaryColor: "0xFF6366F1",
      secondaryColor: "0xFFEC4899",
      backgroundColor: "0xFF0F172A",
      surfaceColor: "0x40334155",
      textColor: "0xFFF8FAFC",
      borderRadius: 18,
      elevation: 4,
      blur: 16,
      fontFamily: "Inter"
    }
  },
  screens: [
    {
      id: "screen_home",
      name: "HomeScreen",
      route: "/",
      rootComponentId: "comp_root_scaffold",
      stateVariables: [
        { name: "searchQuery", type: "String", initialValue: "" },
        { name: "cartCount", type: "int", initialValue: 3 },
        { name: "activeTabIndex", type: "int", initialValue: 0 }
      ]
    }
  ],
  components: {
    "comp_root_scaffold": {
      id: "comp_root_scaffold",
      type: "Scaffold",
      parentId: null,
      childIds: ["comp_appbar", "comp_main_tabs"],
      properties: {}
    },
    "comp_appbar": {
      id: "comp_appbar",
      type: "AppBar",
      parentId: "comp_root_scaffold",
      childIds: [],
      properties: {
        title: "Nova Enterprise Studio",
        centerTitle: true
      }
    },
    "comp_main_tabs": {
      id: "comp_main_tabs",
      type: "TabBar",
      parentId: "comp_root_scaffold",
      childIds: [
        "comp_tab_view_1",
        "comp_tab_view_2",
        "comp_tab_view_3"
      ],
      properties: {
        activeTab: 0,
        tabs: [
          { id: "tab_1", label: "Overview", icon: "dashboard" },
          { id: "tab_2", label: "Metrics & Charts", icon: "bar_chart" },
          { id: "tab_3", label: "Media Stream", icon: "videocam" }
        ],
        indicatorColor: "0xFF6366F1"
      }
    },

    /* TAB 1: OVERVIEW */
    "comp_tab_view_1": {
      id: "comp_tab_view_1",
      type: "Column",
      parentId: "comp_main_tabs",
      childIds: [
        "comp_banner_animated",
        "comp_kpi_grid_overview",
        "comp_search_input",
        "comp_products_grid"
      ],
      properties: {
        crossAxisAlignment: "stretch",
        mainAxisAlignment: "start"
      }
    },
    "comp_banner_animated": {
      id: "comp_banner_animated",
      type: "Card",
      parentId: "comp_tab_view_1",
      childIds: ["comp_banner_col"],
      properties: {
        elevation: 4
      },
      animation: {
        type: "fade",
        duration: 800,
        delay: 100,
        curve: "easeOut",
        repeat: "once",
        autoPlay: true
      }
    },
    "comp_banner_col": {
      id: "comp_banner_col",
      type: "Column",
      parentId: "comp_banner_animated",
      childIds: ["comp_banner_title", "comp_banner_desc", "comp_banner_btn"],
      properties: { crossAxisAlignment: "start" }
    },
    "comp_banner_title": {
      id: "comp_banner_title",
      type: "Text",
      parentId: "comp_banner_col",
      childIds: [],
      properties: {
        text: "⚡ Q4 Throughput: 99.98% High Availability",
        fontSize: 18,
        isBold: true
      }
    },
    "comp_banner_desc": {
      id: "comp_banner_desc",
      type: "Text",
      parentId: "comp_banner_col",
      childIds: [],
      properties: {
        text: "Production lines active. Telemetry stream synchronized in real-time.",
        fontSize: 13,
        isBold: false
      }
    },
    "comp_banner_btn": {
      id: "comp_banner_btn",
      type: "ElevatedButton",
      parentId: "comp_banner_col",
      childIds: [],
      properties: {
        label: "View Telemetry Logs",
        action: "navigate_telemetry"
      }
    },

    /* KPI GRID */
    "comp_kpi_grid_overview": {
      id: "comp_kpi_grid_overview",
      type: "GridView",
      parentId: "comp_tab_view_1",
      childIds: [
        "comp_kpi_revenue",
        "comp_kpi_conversions",
        "comp_kpi_gauge",
        "comp_kpi_status"
      ],
      properties: {
        crossAxisCount: 2,
        spacing: 12
      }
    },
    "comp_kpi_revenue": {
      id: "comp_kpi_revenue",
      type: "KPICard",
      parentId: "comp_kpi_grid_overview",
      childIds: [],
      properties: {
        kpiType: "trend",
        title: "Total Revenue",
        value: "$84,230",
        trend: "+14.8%",
        trendDirection: "up",
        period: "vs last month",
        icon: "dollar"
      }
    },
    "comp_kpi_conversions": {
      id: "comp_kpi_conversions",
      type: "KPICard",
      parentId: "comp_kpi_grid_overview",
      childIds: [],
      properties: {
        kpiType: "sparkline",
        title: "Active Users",
        value: "14,290",
        sparklineData: [20, 35, 28, 45, 52, 60, 58, 75, 82],
        period: "Past 24 hours",
        icon: "users"
      }
    },
    "comp_kpi_gauge": {
      id: "comp_kpi_gauge",
      type: "KPICard",
      parentId: "comp_kpi_grid_overview",
      childIds: [],
      properties: {
        kpiType: "gauge",
        title: "Capacity Target",
        value: "86.4%",
        progress: 86.4,
        target: "Target: 90%",
        icon: "gauge"
      }
    },
    "comp_kpi_status": {
      id: "comp_kpi_status",
      type: "KPICard",
      parentId: "comp_kpi_grid_overview",
      childIds: [],
      properties: {
        kpiType: "status",
        title: "API Microservices",
        value: "Healthy",
        statusLevel: "optimal",
        details: "12/12 Nodes Active (42ms)",
        icon: "server"
      }
    },

    "comp_search_input": {
      id: "comp_search_input",
      type: "TextField",
      parentId: "comp_tab_view_1",
      childIds: [],
      properties: {
        hintText: "Search metrics or products...",
        labelText: "Global Search"
      }
    },

    "comp_products_grid": {
      id: "comp_products_grid",
      type: "GridView",
      parentId: "comp_tab_view_1",
      childIds: ["comp_prod_card_1", "comp_prod_card_2"],
      properties: {
        crossAxisCount: 2,
        spacing: 12
      }
    },
    "comp_prod_card_1": {
      id: "comp_prod_card_1",
      type: "Card",
      parentId: "comp_products_grid",
      childIds: ["comp_prod_col_1"],
      properties: { elevation: 2 }
    },
    "comp_prod_col_1": {
      id: "comp_prod_col_1",
      type: "Column",
      parentId: "comp_prod_card_1",
      childIds: ["comp_prod_img_1", "comp_prod_title_1", "comp_prod_price_1"],
      properties: { crossAxisAlignment: "start" }
    },
    "comp_prod_img_1": {
      id: "comp_prod_img_1",
      type: "Image",
      parentId: "comp_prod_col_1",
      childIds: [],
      properties: {
        src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
        height: 110
      }
    },
    "comp_prod_title_1": {
      id: "comp_prod_title_1",
      type: "Text",
      parentId: "comp_prod_col_1",
      childIds: [],
      properties: { text: "Studio Wireless Max", fontSize: 14, isBold: true }
    },
    "comp_prod_price_1": {
      id: "comp_prod_price_1",
      type: "Text",
      parentId: "comp_prod_col_1",
      childIds: [],
      properties: { text: "$349.00", fontSize: 13, isBold: true }
    },
    "comp_prod_card_2": {
      id: "comp_prod_card_2",
      type: "Card",
      parentId: "comp_products_grid",
      childIds: ["comp_prod_col_2"],
      properties: { elevation: 2 }
    },
    "comp_prod_col_2": {
      id: "comp_prod_col_2",
      type: "Column",
      parentId: "comp_prod_card_2",
      childIds: ["comp_prod_img_2", "comp_prod_title_2", "comp_prod_price_2"],
      properties: { crossAxisAlignment: "start" }
    },
    "comp_prod_img_2": {
      id: "comp_prod_img_2",
      type: "Image",
      parentId: "comp_prod_col_2",
      childIds: [],
      properties: {
        src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
        height: 110
      }
    },
    "comp_prod_title_2": {
      id: "comp_prod_title_2",
      type: "Text",
      parentId: "comp_prod_col_2",
      childIds: [],
      properties: { text: "Chronos GPS Series", fontSize: 14, isBold: true }
    },
    "comp_prod_price_2": {
      id: "comp_prod_price_2",
      type: "Text",
      parentId: "comp_prod_col_2",
      childIds: [],
      properties: { text: "$279.00", fontSize: 13, isBold: true }
    },

    /* TAB 2: METRICS & MULTI-AXIS CHARTS */
    "comp_tab_view_2": {
      id: "comp_tab_view_2",
      type: "Column",
      parentId: "comp_main_tabs",
      childIds: [
        "comp_multi_axis_card",
        "comp_bar_chart_card"
      ],
      properties: {
        crossAxisAlignment: "stretch",
        mainAxisAlignment: "start"
      }
    },
    "comp_multi_axis_card": {
      id: "comp_multi_axis_card",
      type: "MultiAxisChart",
      parentId: "comp_tab_view_2",
      childIds: [],
      properties: {
        title: "Multi-Axis Telemetry & Revenue vs Conversion Rate",
        yAxisLeftLabel: "Revenue ($k)",
        yAxisRightLabel: "Conversion (%)",
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        seriesLeft: [32, 45, 41, 58, 62, 78, 85],
        seriesRight: [2.8, 3.4, 3.1, 4.2, 4.0, 5.1, 5.6]
      }
    },
    "comp_bar_chart_card": {
      id: "comp_bar_chart_card",
      type: "MultiAxisChart",
      parentId: "comp_tab_view_2",
      childIds: [],
      properties: {
        chartType: "bar",
        title: "Quarterly Throughput by Regional Hub",
        yAxisLeftLabel: "Units Produced",
        labels: ["Q1 Hub A", "Q2 Hub A", "Q3 Hub A", "Q1 Hub B", "Q2 Hub B", "Q3 Hub B"],
        seriesLeft: [1200, 1450, 1890, 950, 1100, 1600]
      }
    },

    /* TAB 3: MEDIA STREAM & VIDEO */
    "comp_tab_view_3": {
      id: "comp_tab_view_3",
      type: "Column",
      parentId: "comp_main_tabs",
      childIds: [
        "comp_video_player",
        "comp_stream_info_card"
      ],
      properties: {
        crossAxisAlignment: "stretch",
        mainAxisAlignment: "start"
      }
    },
    "comp_video_player": {
      id: "comp_video_player",
      type: "VideoPlayer",
      parentId: "comp_tab_view_3",
      childIds: [],
      properties: {
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        autoPlay: false,
        loop: true,
        showControls: true,
        aspectRatio: "16:9"
      }
    },
    "comp_stream_info_card": {
      id: "comp_stream_info_card",
      type: "Card",
      parentId: "comp_tab_view_3",
      childIds: ["comp_stream_info_text"],
      properties: { elevation: 2 }
    },
    "comp_stream_info_text": {
      id: "comp_stream_info_text",
      type: "Text",
      parentId: "comp_stream_info_card",
      childIds: [],
      properties: {
        text: "HD Video Pipeline powered by Flutter video_player. Supports HLS live streams and local assets.",
        fontSize: 13
      }
    }
  },
  workflows: [
    {
      id: "wf_fetch_catalog",
      name: "Fetch Catalog",
      trigger: "onScreenInit",
      nodes: [
        { id: "n1", type: "trigger", title: "Screen Load", config: {}, x: 50, y: 100 },
        { id: "n2", type: "apiCall", title: "GET /api/v1/products", config: { endpoint: "/products" }, x: 260, y: 100 },
        { id: "n3", type: "notification", title: "Toast Notification", config: { message: "Catalog Synchronized" }, x: 480, y: 100 }
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" }
      ]
    }
  ],
  backend: {
    enabled: true,
    database: "sqlite",
    entities: [
      {
        name: "Product",
        tableName: "products",
        fields: [
          { name: "id", type: "uuid", primaryKey: true },
          { name: "title", type: "string", nullable: false },
          { name: "price", type: "float", nullable: false },
          { name: "stock", type: "integer", nullable: false }
        ]
      },
      {
        name: "TelemetryMetric",
        tableName: "telemetry_metrics",
        fields: [
          { name: "id", type: "uuid", primaryKey: true },
          { name: "metricName", type: "string", nullable: false },
          { name: "metricValue", type: "float", nullable: false },
          { name: "recordedAt", type: "datetime", nullable: false }
        ]
      }
    ],
    endpoints: [
      { path: "/products", methods: ["GET", "POST"], entity: "Product", authRequired: false },
      { path: "/metrics", methods: ["GET", "POST"], entity: "TelemetryMetric", authRequired: true }
    ]
  },
  apiConnectors: [
    {
      id: "api_products",
      name: "Products Stream",
      url: "http://127.0.0.1:8001/api/v1/products/",
      method: "GET",
      sampleResponse: [
        { id: 1, title: "Suryaa AI Vision Pro", price: 299.99, stock: 45 },
        { id: 2, title: "Neural Audio Pods", price: 149.50, stock: 120 },
        { id: 3, title: "Quantum AMOLED Tablet", price: 699.00, stock: 18 }
      ],
      mockData: [
        { id: 1, title: "Suryaa AI Vision Pro", price: 299.99, stock: 45 },
        { id: 2, title: "Neural Audio Pods", price: 149.50, stock: 120 },
        { id: 3, title: "Quantum AMOLED Tablet", price: 699.00, stock: 18 }
      ]
    },
    {
      id: "api_analytics",
      name: "Live Metrics Stream",
      url: "http://127.0.0.1:8001/api/v1/metrics/",
      method: "GET",
      sampleResponse: {
        revenue: 128450,
        growth: 28.4,
        activeUsers: 8420,
        conversionRate: 4.8
      },
      mockData: {
        revenue: 128450,
        growth: 28.4,
        activeUsers: 8420,
        conversionRate: 4.8
      }
    }
  ]
};
