from typing import Dict, Any

STYLE_PRESETS: Dict[str, Dict[str, Any]] = {
    "material3": {
        "primaryColor": "0xFF6750A4",
        "secondaryColor": "0xFF625B71",
        "backgroundColor": "0xFFFFFBFE",
        "surfaceColor": "0xFFF3EDF7",
        "textColor": "0xFF1C1B1F",
        "borderRadius": 16.0,
        "elevation": 2.0,
        "isDark": False
    },
    "glassmorphism": {
        "primaryColor": "0xFF6366F1",
        "secondaryColor": "0xFFEC4899",
        "backgroundColor": "0xFF0F172A",
        "surfaceColor": "0x40334155",  # translucent
        "textColor": "0xFFF8FAFC",
        "borderRadius": 20.0,
        "blur": 16.0,
        "elevation": 0.0,
        "isDark": True
    },
    "neumorphism": {
        "primaryColor": "0xFF3B82F6",
        "secondaryColor": "0xFF60A5FA",
        "backgroundColor": "0xFFE0E5EC",
        "surfaceColor": "0xFFE0E5EC",
        "textColor": "0xFF2D3748",
        "borderRadius": 24.0,
        "elevation": 6.0,
        "isDark": False
    },
    "fluent": {
        "primaryColor": "0xFF0078D4",
        "secondaryColor": "0xFF2B88D8",
        "backgroundColor": "0xFFF3F3F3",
        "surfaceColor": "0xFFFFFFFF",
        "textColor": "0xFF201F1E",
        "borderRadius": 8.0,
        "elevation": 1.0,
        "isDark": False
    },
    "bento": {
        "primaryColor": "0xFF18181B",
        "secondaryColor": "0xFF71717A",
        "backgroundColor": "0xFF09090B",
        "surfaceColor": "0xFF18181B",
        "textColor": "0xFFFAFAFA",
        "borderRadius": 22.0,
        "elevation": 0.0,
        "borderWidth": 1.0,
        "borderColor": "0xFF27272A",
        "isDark": True
    },
    "minimalism": {
        "primaryColor": "0xFF000000",
        "secondaryColor": "0xFF737373",
        "backgroundColor": "0xFFFFFFFF",
        "surfaceColor": "0xFFF5F5F5",
        "textColor": "0xFF0A0A0A",
        "borderRadius": 4.0,
        "elevation": 0.0,
        "isDark": False
    },
    "flat": {
        "primaryColor": "0xFF2ECC71",
        "secondaryColor": "0xFFE74C3C",
        "backgroundColor": "0xFFECF0F1",
        "surfaceColor": "0xFFFFFFFF",
        "textColor": "0xFF2C3E50",
        "borderRadius": 6.0,
        "elevation": 0.0,
        "isDark": False
    },
    "skeuomorphism": {
        "primaryColor": "0xFF8B5A2B",
        "secondaryColor": "0xFFCD853F",
        "backgroundColor": "0xFFD7CCC8",
        "surfaceColor": "0xFFEFEBE9",
        "textColor": "0xFF3E2723",
        "borderRadius": 12.0,
        "elevation": 8.0,
        "isDark": False
    },
    "claymorphism": {
        "primaryColor": "0xFFFF6B6B",
        "secondaryColor": "0xFF4ECDC4",
        "backgroundColor": "0xFFF7F7F9",
        "surfaceColor": "0xFFFFFFFF",
        "textColor": "0xFF2D3436",
        "borderRadius": 30.0,
        "elevation": 10.0,
        "isDark": False
    },
    "neobrutalism": {
        "primaryColor": "0xFFFFE600",
        "secondaryColor": "0xFFFF0055",
        "backgroundColor": "0xFFFFFDF0",
        "surfaceColor": "0xFFFFFFFF",
        "textColor": "0xFF000000",
        "borderRadius": 0.0,
        "elevation": 0.0,
        "borderWidth": 3.0,
        "borderColor": "0xFF000000",
        "shadowOffset": [4.0, 4.0],
        "isDark": False
    },
    "neon": {
        "primaryColor": "0xFF00FFCC",
        "secondaryColor": "0xFFFF007F",
        "backgroundColor": "0xFF05050A",
        "surfaceColor": "0xFF12121E",
        "textColor": "0xFFE0FFFF",
        "borderRadius": 14.0,
        "elevation": 0.0,
        "glow": True,
        "isDark": True
    },
    "editorial": {
        "primaryColor": "0xFF1C1917",
        "secondaryColor": "0xFF78716C",
        "backgroundColor": "0xFFFAF7F2",
        "surfaceColor": "0xFFF5F0E6",
        "textColor": "0xFF1C1917",
        "fontFamily": "Playfair Display",
        "borderRadius": 2.0,
        "elevation": 0.0,
        "isDark": False
    },
    "gradient": {
        "primaryColor": "0xFF8A2387",
        "secondaryColor": "0xFFE94057",
        "accentColor": "0xFFF27121",
        "backgroundColor": "0xFF120024",
        "surfaceColor": "0xFF240046",
        "textColor": "0xFFFFFFFF",
        "borderRadius": 18.0,
        "elevation": 4.0,
        "isDark": True
    },
    "enterprise": {
        "primaryColor": "0xFF0F4C81",
        "secondaryColor": "0xFF4A90E2",
        "backgroundColor": "0xFFF8F9FA",
        "surfaceColor": "0xFFFFFFFF",
        "textColor": "0xFF212529",
        "borderRadius": 6.0,
        "elevation": 2.0,
        "isDark": False
    }
}

def generate_theme_dart(preset_name: str, overrides: Dict[str, Any] = None, mode: str = "dark") -> str:
    preset_key = preset_name.lower()
    preset = STYLE_PRESETS.get(preset_key, STYLE_PRESETS["material3"]).copy()
    if overrides:
        preset.update(overrides)

    is_dark = overrides.get("isDark") if (overrides and "isDark" in overrides) else (mode == "dark")
    b_radius = preset.get('borderRadius', 12.0)
    elevation = preset.get('elevation', 2.0)

    # Preset specific Flutter customizations
    is_neobrutalism = preset_key == "neobrutalism"
    is_claymorphism = preset_key == "claymorphism"

    btn_fg = "Colors.black" if is_neobrutalism else "Colors.white"
    btn_radius = "999.0" if is_claymorphism else str(b_radius)
    btn_side = "const BorderSide(color: Colors.black, width: 2.5)" if is_neobrutalism else "BorderSide.none"
    btn_elevation = "4.0" if is_neobrutalism else ("4.0" if elevation > 4 else "1.0")
    btn_shadow = "Colors.black" if is_neobrutalism else "Colors.black26"

    card_side_light = "const BorderSide(color: Colors.black, width: 2.5)" if is_neobrutalism else "const BorderSide(color: Color(0xFFE2E8F0))"
    card_side_dark = "const BorderSide(color: Colors.black, width: 2.5)" if is_neobrutalism else "const BorderSide(color: Color(0x1FFFFFFF))"
    card_elevation = "4.0" if is_neobrutalism else str(elevation)
    card_shadow = "Colors.black" if is_neobrutalism else "Colors.black38"

    input_side = "const BorderSide(color: Colors.black, width: 2.5)" if is_neobrutalism else "const BorderSide(color: Color(0xFFCBD5E1))"

    return f"""// Generated by Visual Flutter IDE Style Engine
import 'package:flutter/material.dart';

class AppTheme {{
  static const Color primaryColor = Color({preset['primaryColor']});
  static const Color secondaryColor = Color({preset['secondaryColor']});
  static const Color backgroundColor = Color({preset['backgroundColor']});
  static const Color surfaceColor = Color({preset['surfaceColor']});
  static const Color textColor = Color({preset['textColor']});
  static const double borderRadius = {b_radius};
  static const double elevation = {elevation};

  /// Light Theme Definition
  static ThemeData get lightTheme {{
    const lightBg = Color({preset['backgroundColor'] if not is_dark else '0xFFF8FAFC'});
    const lightSurface = Color({preset['surfaceColor'] if not is_dark else '0xFFFFFFFF'});
    const lightText = Color({preset['textColor'] if not is_dark else '0xFF0F172A'});

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: lightBg,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: lightSurface,
        onSurface: lightText,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: {'primaryColor' if is_neobrutalism else 'lightSurface'},
        elevation: {'2.0' if is_neobrutalism else '0.0'},
        iconTheme: IconThemeData(color: {'Colors.black' if is_neobrutalism else 'lightText'}),
        titleTextStyle: TextStyle(
          color: {'Colors.black' if is_neobrutalism else 'lightText'},
          fontSize: 18,
          fontWeight: {'FontWeight.w900' if is_neobrutalism else 'FontWeight.bold'},
        ),
      ),
      cardTheme: CardTheme(
        color: lightSurface,
        elevation: {card_elevation},
        shadowColor: {card_shadow},
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          side: {card_side_light},
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: {btn_fg},
          elevation: {btn_elevation},
          shadowColor: {btn_shadow},
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular({btn_radius}),
            side: {btn_side},
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightSurface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: {input_side},
        ),
      ),
    );
  }}

  /// Dark Theme Definition
  static ThemeData get darkTheme {{
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundColor,
      colorScheme: ColorScheme(
        brightness: Brightness.dark,
        primary: primaryColor,
        onPrimary: Colors.white,
        secondary: secondaryColor,
        onSecondary: Colors.white,
        error: Colors.red,
        onError: Colors.white,
        background: backgroundColor,
        onBackground: textColor,
        surface: surfaceColor,
        onSurface: textColor,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        elevation: {preset.get('elevation', 0.0)},
        iconTheme: IconThemeData(color: textColor),
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceColor,
        elevation: {card_elevation},
        shadowColor: {card_shadow},
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          side: {card_side_dark},
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: {btn_fg},
          elevation: {btn_elevation},
          shadowColor: {btn_shadow},
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular({btn_radius}),
            side: {btn_side},
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceColor,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: BorderSide(color: primaryColor.withOpacity(0.5)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: BorderSide(color: Colors.grey.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
      ),
    );
  }}

  /// Active ThemeData matching Studio emulator mode
  static ThemeData get themeData => {'darkTheme' if is_dark else 'lightTheme'};
}}
"""
