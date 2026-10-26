import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List
from ...core.config import settings
from ...generator.flutter.generator import FlutterProjectGenerator
from ...generator.python.generator import PythonBackendGenerator

logger = logging.getLogger("api_projects")
router = APIRouter(prefix="/projects", tags=["Projects"])

def get_project_dir(project_id: str) -> Path:
    return settings.projects_dir / project_id

@router.get("/")
def list_projects() -> List[Dict[str, Any]]:
    projects = []
    if settings.projects_dir.exists():
        for p in settings.projects_dir.iterdir():
            if p.is_dir():
                schema_file = p / "project.schema.json"
                if schema_file.exists():
                    try:
                        data = json.loads(schema_file.read_text(encoding="utf-8"))
                        projects.append({
                            "id": p.name,
                            "name": data.get("metadata", {}).get("name", p.name),
                            "updatedAt": data.get("metadata", {}).get("updatedAt", "")
                        })
                    except Exception:
                        pass
    return projects

@router.get("/{project_id}")
def get_project(project_id: str) -> Dict[str, Any]:
    schema_file = get_project_dir(project_id) / "project.schema.json"
    if not schema_file.exists():
        raise HTTPException(status_code=404, detail="Project not found")
    return json.loads(schema_file.read_text(encoding="utf-8"))

@router.post("/")
def save_project(schema: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    project_id = schema.get("metadata", {}).get("id", "default_app")
    p_dir = get_project_dir(project_id)
    p_dir.mkdir(parents=True, exist_ok=True)
    
    schema_file = p_dir / "project.schema.json"
    schema_file.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    
    return {"status": "success", "projectId": project_id, "savedPath": str(schema_file)}

@router.post("/{project_id}/generate")
def generate_project_code(project_id: str, schema: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Executes real code generation for both the Flutter frontend and Python backend.
    """
    p_dir = get_project_dir(project_id)
    p_dir.mkdir(parents=True, exist_ok=True)
    
    # Save schema
    schema_file = p_dir / "project.schema.json"
    schema_file.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    
    # 1. Generate Flutter Frontend
    frontend_dir = p_dir / "frontend"
    flutter_gen = FlutterProjectGenerator(schema)
    flutter_files = flutter_gen.generate_all(frontend_dir)
    
    # 2. Generate Python Backend if enabled
    python_files = {}
    if schema.get("backend", {}).get("enabled", True):
        backend_dir = p_dir / "backend"
        python_gen = PythonBackendGenerator(schema)
        python_files = python_gen.generate_all(backend_dir)
        
    # Locate primary view and view_model
    first_view = next((v for k, v in flutter_files.items() if "_view.dart" in k), "")
    first_view_model = next((v for k, v in flutter_files.items() if "_view_model.dart" in k), "")

    return {
        "status": "success",
        "projectId": project_id,
        "frontendFilesGenerated": len(flutter_files),
        "backendFilesGenerated": len(python_files),
        "frontendPath": str(frontend_dir),
        "backendPath": str(p_dir / "backend") if python_files else None,
        "files": {**flutter_files, **{f"backend/{k}": v for k, v in python_files.items()}},
        "flutterMainDart": flutter_files.get("lib/main.dart", ""),
        "flutterThemeDart": flutter_files.get("lib/app/theme/app_theme.dart", ""),
        "flutterViewDart": first_view,
        "flutterViewModelDart": first_view_model,
        "pubspecYaml": flutter_files.get("pubspec.yaml", ""),
        "pythonMainPy": python_files.get("app/main.py", "")
    }

# ══════════════════════════════════════════════════════════════════════
# DATABASE CREATION, TABLE MIGRATIONS & LIVE API ENGINE
# ══════════════════════════════════════════════════════════════════════
import sqlite3

def get_project_db_path(project_id: str) -> Path:
    b_dir = get_project_dir(project_id) / "backend"
    b_dir.mkdir(parents=True, exist_ok=True)
    return b_dir / "app.db"

@router.post("/{project_id}/database/migrate")
def migrate_database(project_id: str, payload: Dict[str, Any] = Body(default={})) -> Dict[str, Any]:
    """
    Physically initializes the SQLite database file and executes DDL table migrations
    for all designed entities, then seeds initial records.
    """
    db_path = get_project_db_path(project_id)
    
    # Load schema if not passed
    schema = payload if "backend" in payload else {}
    if not schema:
        schema_file = get_project_dir(project_id) / "project.schema.json"
        if schema_file.exists():
            try:
                schema = json.loads(schema_file.read_text(encoding="utf-8"))
            except Exception:
                pass
                
    entities = schema.get("backend", {}).get("entities", [])
    if not entities:
        entities = [
            {
                "name": "Product",
                "tableName": "products",
                "fields": [
                    {"name": "id", "type": "integer", "primaryKey": True},
                    {"name": "title", "type": "string", "required": True},
                    {"name": "price", "type": "float", "required": True},
                    {"name": "stock", "type": "integer", "required": True},
                    {"name": "category", "type": "string", "required": False},
                    {"name": "description", "type": "string", "required": False}
                ]
            },
            {
                "name": "User",
                "tableName": "users",
                "fields": [
                    {"name": "id", "type": "integer", "primaryKey": True},
                    {"name": "name", "type": "string", "required": True},
                    {"name": "email", "type": "string", "required": True},
                    {"name": "role", "type": "string", "required": False}
                ]
            },
            {
                "name": "Order",
                "tableName": "orders",
                "fields": [
                    {"name": "id", "type": "integer", "primaryKey": True},
                    {"name": "order_number", "type": "string", "required": True},
                    {"name": "total_amount", "type": "float", "required": True},
                    {"name": "status", "type": "string", "required": True},
                    {"name": "customer_name", "type": "string", "required": False}
                ]
            }
        ]

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    migrated_tables = []
    
    for entity in entities:
        table_name = entity.get("tableName", entity.get("name", "items").lower() + "s")
        fields = entity.get("fields", [])
        
        cols = []
        for f in fields:
            fname = f.get("name", "col")
            ftype = f.get("type", "string").lower()
            sql_type = "TEXT"
            if ftype in ("integer", "int"):
                sql_type = "INTEGER"
            elif ftype in ("float", "double", "real"):
                sql_type = "REAL"
            elif ftype in ("boolean", "bool"):
                sql_type = "INTEGER"
            
            if f.get("primaryKey"):
                cols.append(f'"{fname}" {sql_type} PRIMARY KEY AUTOINCREMENT' if sql_type == "INTEGER" else f'"{fname}" {sql_type} PRIMARY KEY')
            else:
                cols.append(f'"{fname}" {sql_type}')
                
        ddl = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({", ".join(cols)})'
        cursor.execute(ddl)
        
        # Check count and seed if empty
        cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
        count = cursor.fetchone()[0]
        
        # Dynamic safe seeding if empty
        if count == 0:
            cursor.execute(f'PRAGMA table_info("{table_name}")')
            col_names = [c[1] for c in cursor.fetchall() if c[1] != "id"]
            
            if "product" in table_name.lower():
                sample_data = [
                    {"title": "Suryaa AI Vision Pro", "name": "Suryaa AI Vision Pro", "price": 299.99, "stock": 45, "category": "Electronics", "description": "High-fidelity spatial computing headset"},
                    {"title": "Neural Audio Pods", "name": "Neural Audio Pods", "price": 149.50, "stock": 120, "category": "Audio", "description": "Active noise canceling with AI spatial audio"},
                    {"title": "Quantum AMOLED Tablet", "name": "Quantum AMOLED Tablet", "price": 699.00, "stock": 18, "category": "Computers", "description": "120Hz HDR10+ visual creator studio"},
                    {"title": "Industrial IoT Sensor Pack", "name": "Industrial IoT Sensor Pack", "price": 89.00, "stock": 250, "category": "Sensors", "description": "Multi-axis telemetry curve tracker"},
                    {"title": "Bionic Mechanical Keyboard", "name": "Bionic Mechanical Keyboard", "price": 179.99, "stock": 64, "category": "Peripherals", "description": "Hot-swappable tactile mechanical switches"}
                ]
            elif "telemetry" in table_name.lower() or "metric" in table_name.lower():
                sample_data = [
                    {"metricName": "CPU Temperature", "metricValue": 48.6, "recordedAt": "2026-10-25 11:30:00"},
                    {"metricName": "Memory Usage", "metricValue": 64.2, "recordedAt": "2026-10-25 11:31:00"},
                    {"metricName": "Throughput IOPS", "metricValue": 1280.0, "recordedAt": "2026-10-25 11:32:00"},
                    {"metricName": "Network Latency", "metricValue": 14.5, "recordedAt": "2026-10-25 11:33:00"}
                ]
            elif "user" in table_name.lower():
                sample_data = [
                    {"name": "Surya Prakash T", "email": "surya@suryaaide.com", "role": "Product Owner / AIML Engineer"},
                    {"name": "Elena Rostova", "email": "elena@enterprise.org", "role": "Senior Cloud Architect"}
                ]
            elif "order" in table_name.lower():
                sample_data = [
                    {"order_number": "ORD-2026-9041", "total_amount": 449.49, "status": "Delivered", "customer_name": "Surya Prakash T"},
                    {"order_number": "ORD-2026-9042", "total_amount": 699.00, "status": "Processing", "customer_name": "Elena Rostova"}
                ]
            else:
                sample_data = []

            for item in sample_data:
                matching_keys = [k for k in item.keys() if k in col_names]
                if matching_keys:
                    placeholders = ", ".join(["?"] * len(matching_keys))
                    keys_str = ", ".join([f'"{k}"' for k in matching_keys])
                    cursor.execute(
                        f'INSERT INTO "{table_name}" ({keys_str}) VALUES ({placeholders})',
                        [item[k] for k in matching_keys]
                    )

        cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
        final_count = cursor.fetchone()[0]
        migrated_tables.append({
            "name": entity.get("name", table_name),
            "tableName": table_name,
            "rowCount": final_count,
            "fields": [f.get("name") for f in fields]
        })

    conn.commit()
    conn.close()
    
    file_size_kb = round(db_path.stat().st_size / 1024, 2) if db_path.exists() else 0

    return {
        "status": "success",
        "projectId": project_id,
        "databaseEngine": "SQLite 3",
        "dbPath": str(db_path),
        "dbFileName": "app.db",
        "fileSizeBytes": db_path.stat().st_size if db_path.exists() else 0,
        "fileSizeKb": file_size_kb,
        "totalTables": len(migrated_tables),
        "totalRecords": sum(t["rowCount"] for t in migrated_tables),
        "tables": migrated_tables
    }

@router.get("/{project_id}/database/tables")
def get_database_tables(project_id: str) -> Dict[str, Any]:
    """
    Returns live table schemas and current row counts from the project's SQLite database.
    """
    db_path = get_project_db_path(project_id)
    if not db_path.exists():
        # Auto-create if not yet migrated
        return migrate_database(project_id)
        
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    table_names = [r[0] for r in cursor.fetchall()]
    
    tables = []
    for tname in table_names:
        cursor.execute(f'PRAGMA table_info("{tname}")')
        cols = [{"name": c[1], "type": c[2], "primaryKey": bool(c[5])} for c in cursor.fetchall()]
        cursor.execute(f'SELECT COUNT(*) FROM "{tname}"')
        count = cursor.fetchone()[0]
        tables.append({
            "tableName": tname,
            "rowCount": count,
            "columns": cols
        })
        
    conn.close()
    return {
        "status": "success",
        "projectId": project_id,
        "dbPath": str(db_path),
        "totalTables": len(tables),
        "tables": tables
    }

@router.get("/{project_id}/database/tables/{table_name}/rows")
def get_table_rows(project_id: str, table_name: str, limit: int = 50) -> Dict[str, Any]:
    """
    Returns live rows from an SQLite table for real-time visualization in the IDE.
    """
    db_path = get_project_db_path(project_id)
    if not db_path.exists():
        migrate_database(project_id)
        
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    try:
        cursor.execute(f'SELECT * FROM "{table_name}" LIMIT ?', (limit,))
        rows = [dict(r) for r in cursor.fetchall()]
        return {
            "status": "success",
            "tableName": table_name,
            "count": len(rows),
            "rows": rows
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.get("/{project_id}/api/{entity_name}")
def live_get_entity(project_id: str, entity_name: str) -> Dict[str, Any]:
    """
    Live executable REST GET endpoint returning real database rows.
    """
    db_path = get_project_db_path(project_id)
    if not db_path.exists():
        migrate_database(project_id)
        
    table_name = entity_name.lower()
    if not table_name.endswith("s") and not table_name.endswith("data"):
        table_name += "s"
        
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Try singular or plural
    try:
        cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 100')
    except Exception:
        table_name = entity_name.lower()
        try:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 100')
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Table for entity '{entity_name}' not found: {e}")
            
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    return {
        "status": "success",
        "entity": entity_name,
        "table": table_name,
        "count": len(rows),
        "data": rows
    }

@router.post("/{project_id}/api/{entity_name}")
def live_create_entity(project_id: str, entity_name: str, payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Live executable REST POST endpoint inserting a record directly into the project's SQLite database.
    """
    db_path = get_project_db_path(project_id)
    if not db_path.exists():
        migrate_database(project_id)
        
    table_name = entity_name.lower()
    if not table_name.endswith("s") and not table_name.endswith("data"):
        table_name += "s"
        
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Check columns
        cursor.execute(f'PRAGMA table_info("{table_name}")')
        valid_cols = [c[1] for c in cursor.fetchall() if c[1] != "id"]
        
        insert_cols = [k for k in payload.keys() if k in valid_cols]
        if not insert_cols:
            insert_cols = valid_cols
            
        vals = [payload.get(k) for k in insert_cols]
        placeholders = ", ".join(["?"] * len(insert_cols))
        cols_clause = ", ".join([f'"{c}"' for c in insert_cols])
        
        query = f'INSERT INTO "{table_name}" ({cols_clause}) VALUES ({placeholders})'
        cursor.execute(query, vals)
        new_id = cursor.lastrowid
        conn.commit()
        
        return {
            "status": "success",
            "message": f"Successfully created record in {table_name}",
            "id": new_id,
            "created": {**payload, "id": new_id}
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

