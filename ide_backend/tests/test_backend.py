import pytest
import asyncio
from pathlib import Path
from app.generator.flutter.generator import FlutterProjectGenerator
from app.generator.python.generator import PythonBackendGenerator
from app.services.security_service import security_service
from app.core.concurrency import job_coordinator

SAMPLE_SCHEMA = {
    "metadata": {
        "id": "test_app",
        "name": "Test Commerce",
        "version": "1.0.0",
        "android": {
            "packageName": "com.test.commerce",
            "appName": "Test Commerce",
            "permissions": ["android.permission.INTERNET", "android.permission.CAMERA"]
        }
    },
    "theme": {
        "activePreset": "glassmorphism",
        "tokens": {
            "primaryColor": "0xFF6366F1",
            "borderRadius": 16.0
        }
    },
    "screens": [
        {
            "id": "screen_main",
            "name": "MainScreen",
            "rootComponentId": "comp_scaffold",
            "stateVariables": [
                {"name": "counter", "type": "int", "initialValue": 0}
            ]
        }
    ],
    "components": {
        "comp_scaffold": {
            "id": "comp_scaffold",
            "type": "Scaffold",
            "childIds": ["comp_appbar", "comp_tabs"]
        },
        "comp_appbar": {
            "id": "comp_appbar",
            "type": "AppBar",
            "properties": {"title": "Test Title"}
        },
        "comp_tabs": {
            "id": "comp_tabs",
            "type": "TabBar",
            "properties": {
                "tabs": [{"label": "Metrics"}, {"label": "Media"}]
            },
            "childIds": ["comp_col_metrics", "comp_col_media"]
        },
        "comp_col_metrics": {
            "id": "comp_col_metrics",
            "type": "Column",
            "childIds": ["comp_kpi", "comp_chart"]
        },
        "comp_kpi": {
            "id": "comp_kpi",
            "type": "KPICard",
            "properties": {"title": "Revenue", "value": "$92,400", "trend": "+12.4%"}
        },
        "comp_chart": {
            "id": "comp_chart",
            "type": "MultiAxisChart",
            "properties": {"title": "Throughput vs SLA"}
        },
        "comp_col_media": {
            "id": "comp_col_media",
            "type": "Column",
            "childIds": ["comp_video"]
        },
        "comp_video": {
            "id": "comp_video",
            "type": "VideoPlayer",
            "properties": {"videoUrl": "https://sample.mp4"}
        }
    },
    "backend": {
        "enabled": True,
        "database": "sqlite",
        "entities": [
            {
                "name": "Product",
                "tableName": "products",
                "fields": [
                    {"name": "id", "type": "uuid", "primaryKey": True},
                    {"name": "name", "type": "string", "nullable": False},
                    {"name": "price", "type": "float", "nullable": False}
                ]
            }
        ],
        "endpoints": [
            {"path": "/products", "authRequired": False}
        ]
    }
}

def test_flutter_code_generation(tmp_path):
    gen = FlutterProjectGenerator(SAMPLE_SCHEMA)
    files = gen.generate_all(tmp_path / "frontend")
    
    assert "pubspec.yaml" in files
    assert "lib/main.dart" in files
    assert "lib/app/theme/app_theme.dart" in files
    assert "lib/features/main/views/main_view.dart" in files
    assert "lib/features/main/view_models/main_view_model.dart" in files
    assert "android/app/src/main/AndroidManifest.xml" in files
    
    view_code = files["lib/features/main/views/main_view.dart"]
    assert "DefaultTabController" in view_code
    assert "TabBarView" in view_code
    assert "Revenue" in view_code
    assert "AspectRatio" in view_code
    assert "android.permission.CAMERA" in files["android/app/src/main/AndroidManifest.xml"]
    
    theme_code = files["lib/app/theme/app_theme.dart"]
    assert "lightTheme" in theme_code
    assert "darkTheme" in theme_code
    assert "ThemeMode" in files["lib/app/app.dart"]

def test_python_backend_generation(tmp_path):
    gen = PythonBackendGenerator(SAMPLE_SCHEMA)
    files = gen.generate_all(tmp_path / "backend")
    
    assert "pyproject.toml" in files
    assert "app/main.py" in files
    assert "app/database.py" in files
    assert "app/models/product.py" in files
    assert "app/schemas/product.py" in files
    assert "app/api/v1/endpoints/product.py" in files
    assert "alembic.ini" in files
    assert "alembic/env.py" in files

def test_job_coordinator():
    async def _run():
        async with job_coordinator.acquire("test_resource", timeout=2.0):
            with pytest.raises(TimeoutError):
                async with job_coordinator.acquire("test_resource", timeout=0.1):
                    pass
    asyncio.run(_run())

def test_security_audit(tmp_path):
    async def _run():
        test_file = tmp_path / "sample.py"
        test_file.write_text('API_KEY = "AIzaSyD-1234567890abcdefghijklmnopqr"')
        
        report = await security_service.scan_project(tmp_path, SAMPLE_SCHEMA)
        assert report["totalFindings"] > 0
        assert report["score"] < 100
        assert any("Secret Exposure" in f["category"] for f in report["findings"])
    asyncio.run(_run())
