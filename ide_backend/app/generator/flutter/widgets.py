from typing import Dict, Any, List

def sanitize_dart_string(s: str) -> str:
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('$', '\\$')

def parse_dart_color(c: Any) -> str:
    if not c:
        return "null"
    s = str(c).strip()
    if s.startswith("#"):
        hex_val = s.lstrip("#")
        if len(hex_val) == 6:
            return f"const Color(0xFF{hex_val.upper()})"
        elif len(hex_val) == 8:
            return f"const Color(0x{hex_val.upper()})"
    elif s.startswith("0x") or s.startswith("0X"):
        return f"const Color({s})"
    return "null"

def build_flutter_drawer(props: Dict[str, Any], indent_level: int = 4) -> str:
    pad = "  " * indent_level
    header_title = sanitize_dart_string(props.get("drawerHeaderTitle") or props.get("headerTitle", "Suryaa App"))
    header_subtitle = sanitize_dart_string(props.get("drawerHeaderSubtitle") or props.get("headerSubtitle", "operator@suryaa.io"))
    avatar_text = sanitize_dart_string(props.get("drawerAvatarText", "SP"))
    avatar_url = props.get("drawerAvatarUrl", "")
    grad_key = props.get("drawerHeaderGradient", "indigo")
    show_screens = props.get("drawerShowScreens", True)
    custom_items = props.get("drawerItems", [])
    show_logout = props.get("drawerShowLogout", True)
    logout_label = sanitize_dart_string(props.get("drawerLogoutLabel", "Sign Out"))

    grad_map = {
        "indigo": "[const Color(0xFF312E81), const Color(0xFF581C87)]",
        "emerald": "[const Color(0xFF064E3B), const Color(0xFF115E59)]",
        "cyan": "[const Color(0xFF083344), const Color(0xFF1E40AF)]",
        "purple": "[const Color(0xFF581C87), const Color(0xFF831843)]",
        "rose": "[const Color(0xFF4C0519), const Color(0xFF881337)]",
        "slate": "[const Color(0xFF0F172A), const Color(0xFF27272A)]",
    }
    gradient_colors = grad_map.get(grad_key, grad_map["indigo"])

    if avatar_url:
        pic_code = f"CircleAvatar(backgroundImage: NetworkImage('{sanitize_dart_string(avatar_url)}'))"
    else:
        pic_code = f"CircleAvatar(backgroundColor: Colors.white24, child: Text('{avatar_text}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))"

    items_code = []
    if not show_screens and custom_items:
        for item in custom_items:
            lbl = sanitize_dart_string(item.get("label", "Menu Item"))
            icon_name = str(item.get("icon", "home")).lower()
            flutter_icon = {
                "home": "Icons.home",
                "shopping_bag": "Icons.shopping_bag",
                "cart": "Icons.shopping_cart",
                "activity": "Icons.analytics",
                "telemetry": "Icons.show_chart",
                "settings": "Icons.settings",
                "users": "Icons.person",
                "profile": "Icons.person",
                "bell": "Icons.notifications",
                "server": "Icons.dns",
            }.get(icon_name, "Icons.chevron_right")
            badge = item.get("badge")
            trailing_code = f", trailing: Chip(label: Text('{sanitize_dart_string(str(badge))}'), padding: EdgeInsets.zero)" if badge else ""
            items_code.append(f"""{pad}    ListTile(
{pad}      leading: const Icon({flutter_icon}),
{pad}      title: const Text('{lbl}'){trailing_code},
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),""")
    else:
        items_code.append(f"""{pad}    ListTile(
{pad}      leading: const Icon(Icons.home),
{pad}      title: const Text('Dashboard'),
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),
{pad}    ListTile(
{pad}      leading: const Icon(Icons.shopping_bag),
{pad}      title: const Text('Orders & Cart'),
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),
{pad}    ListTile(
{pad}      leading: const Icon(Icons.analytics),
{pad}      title: const Text('Live Telemetry'),
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),
{pad}    ListTile(
{pad}      leading: const Icon(Icons.settings),
{pad}      title: const Text('Settings'),
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),""")

    if show_logout:
        items_code.append(f"""{pad}    const Divider(),
{pad}    ListTile(
{pad}      leading: const Icon(Icons.logout, color: Colors.redAccent),
{pad}      title: const Text('{logout_label}', style: TextStyle(color: Colors.redAccent)),
{pad}      onTap: () => Navigator.pop(context),
{pad}    ),""")

    joined_items = "\n".join(items_code)
    return f"""Drawer(
{pad}  child: ListView(
{pad}    padding: EdgeInsets.zero,
{pad}    children: [
{pad}      UserAccountsDrawerHeader(
{pad}        decoration: BoxDecoration(
{pad}          gradient: LinearGradient(
{pad}            colors: {gradient_colors},
{pad}          ),
{pad}        ),
{pad}        accountName: Text('{header_title}', style: const TextStyle(fontWeight: FontWeight.bold)),
{pad}        accountEmail: Text('{header_subtitle}'),
{pad}        currentAccountPicture: {pic_code},
{pad}      ),
{joined_items}
{pad}    ],
{pad}  ),
{pad})"""

def render_component(comp_id: str, components: Dict[str, Any], indent_level: int = 4) -> str:
    """
    Recursively renders a component and its children to valid Dart widget code.
    """
    if comp_id not in components:
        return "const SizedBox.shrink()"

    comp = components[comp_id]
    comp_type = comp.get("type", "Container")
    props = comp.get("properties", {})
    child_ids: List[str] = comp.get("childIds", [])
    pad = "  " * indent_level

    rendered = ""

    # 1. Structural & Navigation Widgets
    if comp_type == "Scaffold":
        show_app_bar = props.get("showAppBar", True)
        app_bar_code = ""
        body_code = "const Center(child: Text('Empty Canvas'))"
        drawer_code = ""
        nav_mode = props.get("showDrawer", "none")
        
        for cid in child_ids:
            c = components.get(cid, {})
            if c.get("type") == "AppBar":
                if show_app_bar:
                    app_bar_code = f"\n{pad}appBar: {render_component(cid, components, indent_level + 1)},"
            else:
                body_code = render_component(cid, components, indent_level + 1)
                
        if nav_mode in ("drawer", "endDrawer"):
            prop_drawer = "drawer" if nav_mode == "drawer" else "endDrawer"
            built_drawer = build_flutter_drawer(props, indent_level)
            drawer_code = f"\n{pad}{prop_drawer}: {built_drawer},"
                
        rendered = f"""Scaffold({app_bar_code}{drawer_code}
{pad}body: SafeArea(
{pad}  child: {body_code},
{pad}),
{pad})"""

    elif comp_type == "AppBar":
        title = props.get("title", "Suryaa App")
        center_title = str(props.get("centerTitle", True)).lower()
        elevation = props.get("elevation", 4.0)
        bg_color = parse_dart_color(props.get("backgroundColor", "0xFF1E293B"))
        bg_param = f"\n{pad}  backgroundColor: {bg_color}," if bg_color != "null" else ""
        
        rendered = f"""AppBar(
{pad}  title: Text('{sanitize_dart_string(str(title))}'),
{pad}  centerTitle: {center_title},
{pad}  elevation: {elevation},{bg_param}
{pad})"""

    elif comp_type == "Drawer":
        rendered = build_flutter_drawer(props, indent_level)

    elif comp_type == "TabBar":
        tabs = props.get("tabs", [{"label": "Tab 1"}, {"label": "Tab 2"}])
        tab_widgets = ",\n".join([f"{pad}        Tab(text: '{sanitize_dart_string(t.get('label', 'Tab'))}')" for t in tabs])
        
        view_children = ",\n".join([
            f"{pad}        {render_component(cid, components, indent_level + 4)}" for cid in child_ids
        ])
        if not view_children:
            view_children = f"{pad}        const Center(child: Text('Tab Content'))"

        rendered = f"""DefaultTabController(
{pad}  length: {len(tabs)},
{pad}  child: Column(
{pad}    children: [
{pad}      TabBar(
{pad}        indicatorColor: const Color(0xFF6366F1),
{pad}        tabs: [
{tab_widgets}
{pad}        ],
{pad}      ),
{pad}      Expanded(
{pad}        child: TabBarView(
{pad}          children: [
{view_children}
{pad}          ],
{pad}        ),
{pad}      ),
{pad}    ],
{pad}  ),
{pad})"""

    elif comp_type == "Column":
        children_rendered = ",\n".join(
            [f"{pad}    {render_component(cid, components, indent_level + 2)}" for cid in child_ids]
        )
        cross_axis = props.get("crossAxisAlignment", "stretch")
        cross_enum = "CrossAxisAlignment.center" if cross_axis == "center" else "CrossAxisAlignment.stretch"
        rendered = f"""Column(
{pad}  crossAxisAlignment: {cross_enum},
{pad}  children: [
{children_rendered}
{pad}  ],
{pad})"""

    elif comp_type == "Row":
        children_rendered = ",\n".join(
            [f"{pad}    {render_component(cid, components, indent_level + 2)}" for cid in child_ids]
        )
        rendered = f"""Row(
{pad}  children: [
{children_rendered}
{pad}  ],
{pad})"""

    elif comp_type == "Container":
        child_code = render_component(child_ids[0], components, indent_level + 1) if child_ids else "null"
        padding = props.get("padding", 16)
        radius = props.get("borderRadius", 12)
        border_width = props.get("borderWidth", 1)
        bg_color = parse_dart_color(props.get("backgroundColor", "0xFF1E293B"))
        border_color = parse_dart_color(props.get("borderColor", "0xFF334155"))
        
        bg_expr = f"color: {bg_color}," if bg_color != "null" else ""
        border_expr = f"border: Border.all(color: {border_color}, width: {border_width})," if border_color != "null" else ""
        
        rendered = f"""Container(
{pad}  padding: const EdgeInsets.all({padding}.0),
{pad}  decoration: BoxDecoration(
{pad}    {bg_expr}
{pad}    borderRadius: BorderRadius.circular({radius}.0),
{pad}    {border_expr}
{pad}  ),
{pad}  child: {child_code},
{pad})"""

    elif comp_type == "Card":
        child_code = render_component(child_ids[0], components, indent_level + 1) if child_ids else "null"
        elevation = props.get("elevation", 2.0)
        rendered = f"""Card(
{pad}  elevation: {elevation},
{pad}  margin: const EdgeInsets.all(8),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: {child_code},
{pad}  ),
{pad})"""

    # 2. KPI Cards (16 Configurable Styles)
    elif comp_type == "KPICard":
        title = props.get("title", "Metric")
        value = props.get("value", "$0.00")
        trend = props.get("trend", "+0.0%")
        is_up = props.get("trendDirection", "up") != "down"
        trend_color = "Colors.green" if is_up else "Colors.red"
        kpi_type = props.get("kpiType", "trend")
        
        if kpi_type == "progress":
            progress_val = props.get("progress", 0.75)
            rendered = f"""Card(
{pad}  elevation: 3.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
{pad}        const SizedBox(height: 8),
{pad}        Text('{sanitize_dart_string(value)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
{pad}        const SizedBox(height: 12),
{pad}        LinearProgressIndicator(
{pad}          value: {progress_val},
{pad}          backgroundColor: Colors.grey.shade800,
{pad}          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""
        else:
            rendered = f"""Card(
{pad}  elevation: 3.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
{pad}        const SizedBox(height: 8),
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.spaceBetween,
{pad}          children: [
{pad}            Text('{sanitize_dart_string(value)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
{pad}            Container(
{pad}              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
{pad}              decoration: BoxDecoration(
{pad}                color: {trend_color}.withOpacity(0.15),
{pad}                borderRadius: BorderRadius.circular(12),
{pad}              ),
{pad}              child: Text('{sanitize_dart_string(trend)}', style: const TextStyle(color: {trend_color}, fontSize: 11, fontWeight: FontWeight.bold)),
{pad}            ),
{pad}          ],
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    # 3. Video Player
    elif comp_type == "VideoPlayer":
        rendered = f"""AspectRatio(
{pad}  aspectRatio: 16 / 9,
{pad}  child: ClipRRect(
{pad}    borderRadius: BorderRadius.circular(12),
{pad}    child: Container(
{pad}      color: Colors.black,
{pad}      child: const Center(
{pad}        child: Icon(Icons.play_circle_fill, size: 54, color: Colors.white),
{pad}      ),
{pad}    ),
{pad}  ),
{pad})"""

    # 4. Six-Chart Engine (fl_chart integration)
    elif comp_type in ["MultiAxisChart", "LineChart"]:
        title = props.get("title", "Multi-Axis Telemetry Curve")
        x_title = props.get("xAxisTitle", "Time (UTC)")
        y_title = props.get("yAxisTitle", "Primary (PSI)")
        series_list = props.get("series", [
            {"id": "s1", "name": "Primary Metric", "color": "#6366F1", "data": [35, 60, 48, 85, 92, 74]},
            {"id": "s2", "name": "Secondary Metric", "color": "#10B981", "data": [18, 24, 30, 26, 34, 38]}
        ])
        
        bars_code = []
        for s in series_list:
            color = parse_dart_color(s.get("color", "#6366F1"))
            data_pts = s.get("data", [10, 40, 25, 70, 85, 60])
            spots = ", ".join([f"const FlSpot({idx}, {val})" for idx, val in enumerate(data_pts)])
            bars_code.append(f"""LineChartBarData(
{pad}              spots: [{spots}],
{pad}              isCurved: true,
{pad}              color: {color},
{pad}              barWidth: 3,
{pad}              dotData: const FlDotData(show: true),
{pad}              belowBarData: BarAreaData(
{pad}                show: true,
{pad}                color: {color}.withValues(alpha: 0.15),
{pad}              ),
{pad}            )""")

        bars_rendered = f",\n{pad}            ".join(bars_code)

        rendered = f"""Card(
{pad}  elevation: 4.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.between,
{pad}          children: [
{pad}            Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
{pad}            const Chip(label: Text('fl_chart', style: TextStyle(fontSize: 10)), visualDensity: VisualDensity.compact),
{pad}          ],
{pad}        ),
{pad}        const SizedBox(height: 12),
{pad}        SizedBox(
{pad}          height: 180,
{pad}          child: LineChart(
{pad}            LineChartData(
{pad}              gridData: const FlGridData(show: true, drawVerticalLine: false),
{pad}              titlesData: const FlTitlesData(
{pad}                rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
{pad}                topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
{pad}              ),
{pad}              borderData: FlBorderData(show: false),
{pad}              lineBarsData: [
{pad}                {bars_rendered}
{pad}              ],
{pad}            ),
{pad}          ),
{pad}        ),
{pad}        const SizedBox(height: 8),
{pad}        Center(child: Text('{sanitize_dart_string(x_title)}', style: const TextStyle(fontSize: 10, color: Colors.grey))),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    # 4b. Compact KPI Gauges & Telemetry Boxes
    elif comp_type == "CircularGauge":
        title = props.get("title", "Pressure Gauge")
        val = props.get("value", 74)
        unit = props.get("unit", "PSI")
        min_val = props.get("min", 0)
        max_val = props.get("max", 100)
        color = parse_dart_color(props.get("color", "#6366F1"))
        pct = min(1.0, max(0.0, (val - min_val) / max(1, max_val - min_val)))

        rendered = f"""Card(
{pad}  elevation: 3.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      mainAxisSize: MainAxisSize.min,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
{pad}        const SizedBox(height: 12),
{pad}        SizedBox(
{pad}          width: 100,
{pad}          height: 100,
{pad}          child: Stack(
{pad}            alignment: Alignment.center,
{pad}            children: [
{pad}              CircularProgressIndicator(
{pad}                value: {pct:.2f},
{pad}                strokeWidth: 8.0,
{pad}                backgroundColor: Colors.grey.withValues(alpha: 0.15),
{pad}                valueColor: AlwaysStoppedAnimation<Color>({color}),
{pad}              ),
{pad}              Column(
{pad}                mainAxisSize: MainAxisSize.min,
{pad}                children: [
{pad}                  Text('{val}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
{pad}                  Text('{sanitize_dart_string(unit)}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
{pad}                ],
{pad}              ),
{pad}            ],
{pad}          ),
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "ArcGauge":
        title = props.get("title", "Engine Speed")
        val = props.get("value", 6200)
        unit = props.get("unit", "RPM")
        color = parse_dart_color(props.get("color", "#10B981"))

        rendered = f"""Card(
{pad}  elevation: 3.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      mainAxisSize: MainAxisSize.min,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
{pad}        const SizedBox(height: 8),
{pad}        Text('{val}', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: {color})),
{pad}        Text('{sanitize_dart_string(unit)}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type in ["MetricCardCompact", "KPICard"]:
        title = props.get("title", "Daily Revenue")
        val = props.get("value", "$12,450")
        trend = props.get("trend", "+18.2%")
        color = parse_dart_color(props.get("color", "#6366F1"))

        rendered = f"""Card(
{pad}  elevation: 2.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(14.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.between,
{pad}          children: [
{pad}            Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
{pad}            Container(
{pad}              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
{pad}              decoration: BoxDecoration(color: {color}.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
{pad}              child: Text('{sanitize_dart_string(trend)}', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: {color})),
{pad}            ),
{pad}          ],
{pad}        ),
{pad}        const SizedBox(height: 6),
{pad}        Text('{sanitize_dart_string(str(val))}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "RadialProgressBox":
        title = props.get("title", "Storage Used")
        val = props.get("value", 78)
        subtitle = props.get("subtitle", "780 GB of 1 TB")
        color = parse_dart_color(props.get("color", "#06B6D4"))

        rendered = f"""Card(
{pad}  elevation: 2.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(14.0),
{pad}    child: Row(
{pad}      children: [
{pad}        SizedBox(
{pad}          width: 44,
{pad}          height: 44,
{pad}          child: CircularProgressIndicator(
{pad}            value: {val}/100.0,
{pad}            strokeWidth: 5.0,
{pad}            valueColor: AlwaysStoppedAnimation<Color>({color}),
{pad}          ),
{pad}        ),
{pad}        const SizedBox(width: 14),
{pad}        Expanded(
{pad}          child: Column(
{pad}            crossAxisAlignment: CrossAxisAlignment.start,
{pad}            children: [
{pad}              Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
{pad}              Text('{sanitize_dart_string(subtitle)}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
{pad}            ],
{pad}          ),
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "SparklineBox":
        title = props.get("title", "Network Throughput")
        val = props.get("value", "4.8 Gbps")
        trend = props.get("trend", "+5.4%")

        rendered = f"""Card(
{pad}  elevation: 2.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(14.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.between,
{pad}          children: [
{pad}            Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
{pad}            Text('{sanitize_dart_string(trend)}', style: const TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold)),
{pad}          ],
{pad}        ),
{pad}        const SizedBox(height: 4),
{pad}        Text('{sanitize_dart_string(str(val))}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "StatusBeaconBox":
        title = props.get("title", "Cluster Master")
        code = props.get("code", "200 OK")
        latency = props.get("latency", "12 ms")
        region = props.get("region", "us-east-1")

        rendered = f"""Card(
{pad}  elevation: 2.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(14.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.between,
{pad}          children: [
{pad}            Row(
{pad}              children: [
{pad}                const Icon(Icons.circle, size: 10, color: Colors.green),
{pad}                const SizedBox(width: 6),
{pad}                Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
{pad}              ],
{pad}            ),
{pad}            Text('{sanitize_dart_string(region)}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
{pad}          ],
{pad}        ),
{pad}        const SizedBox(height: 6),
{pad}        Row(
{pad}          mainAxisAlignment: MainAxisAlignment.between,
{pad}          children: [
{pad}            Text('{sanitize_dart_string(code)}', style: const TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.bold)),
{pad}            Text('{sanitize_dart_string(latency)}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
{pad}          ],
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "BarChart":
        title = props.get("title", "Metrics Bar Chart")
        rendered = f"""Card(
{pad}  elevation: 4.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
{pad}        const SizedBox(height: 16),
{pad}        SizedBox(
{pad}          height: 180,
{pad}          child: BarChart(
{pad}            BarChartData(
{pad}              borderData: FlBorderData(show: false),
{pad}              titlesData: const FlTitlesData(show: false),
{pad}              barGroups: [
{pad}                BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 18, color: const Color(0xFF6366F1), width: 14)]),
{pad}                BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 26, color: const Color(0xFF6366F1), width: 14)]),
{pad}                BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 34, color: const Color(0xFF6366F1), width: 14)]),
{pad}                BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 48, color: const Color(0xFF6366F1), width: 14)]),
{pad}                BarChartGroupData(x: 4, barRods: [BarChartRodData(toY: 42, color: const Color(0xFF6366F1), width: 14)]),
{pad}              ],
{pad}            ),
{pad}          ),
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    elif comp_type == "PieChart":
        title = props.get("title", "Distribution")
        rendered = f"""Card(
{pad}  elevation: 4.0,
{pad}  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
{pad}  child: Padding(
{pad}    padding: const EdgeInsets.all(16.0),
{pad}    child: Column(
{pad}      crossAxisAlignment: CrossAxisAlignment.start,
{pad}      children: [
{pad}        Text('{sanitize_dart_string(title)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
{pad}        const SizedBox(height: 16),
{pad}        SizedBox(
{pad}          height: 180,
{pad}          child: PieChart(
{pad}            PieChartData(
{pad}              sectionsSpace: 3,
{pad}              centerSpaceRadius: 36,
{pad}              sections: [
{pad}                PieChartSectionData(color: const Color(0xFF6366F1), value: 45, title: '45%', radius: 24),
{pad}                PieChartSectionData(color: const Color(0xFF10B981), value: 30, title: '30%', radius: 24),
{pad}                PieChartSectionData(color: const Color(0xFFF59E0B), value: 15, title: '15%', radius: 24),
{pad}                PieChartSectionData(color: const Color(0xFFF43F5E), value: 10, title: '10%', radius: 24),
{pad}              ],
{pad}            ),
{pad}          ),
{pad}        ),
{pad}      ],
{pad}    ),
{pad}  ),
{pad})"""

    # 5. Text with Typography & Colors
    elif comp_type == "Text":
        text_content = props.get("text", "Hello World")
        data_binding = props.get("dataBinding")
        if data_binding:
            text_expr = "viewModel.title"
        else:
            text_expr = f"'{sanitize_dart_string(str(text_content))}'"
            
        style_parts = []
        if props.get("fontFamily"):
            style_parts.append(f"fontFamily: '{sanitize_dart_string(props['fontFamily'])}'")
        if props.get("fontSize"):
            style_parts.append(f"fontSize: {props['fontSize']}.0")
        
        weight = str(props.get("fontWeight", ""))
        if weight in ["bold", "700"]:
            style_parts.append("fontWeight: FontWeight.bold")
        elif weight in ["300", "500", "600", "800", "900"]:
            style_parts.append(f"fontWeight: FontWeight.w{weight}")
        elif props.get("isBold"):
            style_parts.append("fontWeight: FontWeight.bold")
            
        if props.get("fontStyle") == "italic":
            style_parts.append("fontStyle: FontStyle.italic")
            
        if props.get("textColor"):
            clr = parse_dart_color(props["textColor"])
            if clr != "null":
                style_parts.append(f"color: {clr}")
        elif "color" in props:
            clr = parse_dart_color(props["color"])
            if clr != "null":
                style_parts.append(f"color: {clr}")
                
        if props.get("letterSpacing"):
            style_parts.append(f"letterSpacing: {props['letterSpacing']}.0")
            
        if props.get("textDecoration") == "underline":
            style_parts.append("decoration: TextDecoration.underline")
            
        style_code = f", style: TextStyle({', '.join(style_parts)})" if style_parts else ""
        rendered = f"Text({text_expr}{style_code})"

    elif comp_type == "Image":
        src = props.get("src", "https://picsum.photos/400/200")
        width = f"width: {props['width']}," if "width" in props else ""
        height = f"height: {props['height']}," if "height" in props else ""
        rendered = f"""ClipRRect(
{pad}  borderRadius: BorderRadius.circular(12),
{pad}  child: Image.network(
{pad}    '{sanitize_dart_string(src)}',
{pad}    {width}
{pad}    {height}
{pad}    fit: BoxFit.cover,
{pad}    errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image, size: 50),
{pad}  ),
{pad})"""

    elif comp_type == "Icon":
        icon_name = props.get("icon", "star")
        size = props.get("size", 24)
        rendered = f"Icon(Icons.{icon_name}, size: {size})"

    elif comp_type == "Divider":
        rendered = "const Divider(thickness: 1, height: 24)"

    elif comp_type == "TextField":
        hint = props.get("hintText", "Enter text...")
        label = props.get("labelText", "")
        obscure = str(props.get("isPassword", False)).lower()
        rendered = f"""TextField(
{pad}  obscureText: {obscure},
{pad}  decoration: InputDecoration(
{pad}    hintText: '{sanitize_dart_string(hint)}',
{pad}    labelText: '{sanitize_dart_string(label)}',
{pad}  ),
{pad})"""

    elif comp_type == "ElevatedButton":
        label = props.get("label", "Click Me")
        action = props.get("action", "")
        target_route = props.get("targetRoute", "")
        target_screen = props.get("targetScreen", "")
        bg_color = props.get("backgroundColor", "")

        if action == "navigate" and (target_route or target_screen):
            route_val = target_route if target_route else "/"
            on_pressed = f"() => Navigator.pushNamed(context, '{sanitize_dart_string(route_val)}')"
        elif action:
            on_pressed = f"viewModel.executeAction('{sanitize_dart_string(action)}')"
        else:
            on_pressed = "() {}"

        style_lines = []
        if bg_color and bg_color.startswith("#"):
            hex_val = bg_color.replace("#", "")
            if len(hex_val) == 6:
                style_lines.append(f"backgroundColor: const Color(0xFF{hex_val})")
        style_prop = f"\n{pad}  style: ElevatedButton.styleFrom({', '.join(style_lines)})," if style_lines else ""

        rendered = f"""ElevatedButton(
{pad}  onPressed: {on_pressed},{style_prop}
{pad}  child: const Text('{sanitize_dart_string(str(label))}'),
{pad})"""

    elif comp_type == "Switch":
        val = str(props.get("value", True)).lower()
        rendered = f"Switch(value: {val}, onChanged: (val) {{}})"

    elif comp_type == "Slider":
        val = props.get("value", 50.0)
        rendered = f"""Slider(
{pad}  value: {val}.0,
{pad}  min: 0,
{pad}  max: 100,
{pad}  onChanged: (val) {{}},
{pad})"""

    elif comp_type == "ListView":
        children_rendered = ",\n".join(
            [f"{pad}    {render_component(cid, components, indent_level + 2)}" for cid in child_ids]
        )
        rendered = f"""ListView(
{pad}  padding: const EdgeInsets.all(12),
{pad}  children: [
{children_rendered}
{pad}  ],
{pad})"""

    elif comp_type == "GridView":
        cross_axis_count = props.get("crossAxisCount", 2)
        spacing = props.get("spacing", 12.0)
        children_rendered = ",\n".join(
            [f"{pad}    {render_component(cid, components, indent_level + 2)}" for cid in child_ids]
        )
        rendered = f"""GridView.count(
{pad}  crossAxisCount: {cross_axis_count},
{pad}  mainAxisSpacing: {spacing},
{pad}  crossAxisSpacing: {spacing},
{pad}  padding: const EdgeInsets.all({spacing}),
{pad}  children: [
{children_rendered}
{pad}  ],
{pad})"""
    else:
        rendered = f"const SizedBox.shrink() // Type: {comp_type}"

    # 6. Apply Animation Wrappers if configured
    anim = comp.get("animation")
    if anim and anim.get("autoPlay", True):
        duration = anim.get("duration", 600)
        anim_type = anim.get("type", "fade")
        if anim_type == "fade":
            return f"""AnimatedOpacity(
{pad}  opacity: 1.0,
{pad}  duration: const Duration(milliseconds: {duration}),
{pad}  child: {rendered},
{pad})"""
        elif anim_type == "scale":
            return f"""AnimatedScale(
{pad}  scale: 1.0,
{pad}  duration: const Duration(milliseconds: {duration}),
{pad}  child: {rendered},
{pad})"""
        elif anim_type in ["slide", "slideUp", "slideDown"]:
            return f"""AnimatedSlide(
{pad}  offset: Offset.zero,
{pad}  duration: const Duration(milliseconds: {duration}),
{pad}  child: {rendered},
{pad})"""

    return rendered
