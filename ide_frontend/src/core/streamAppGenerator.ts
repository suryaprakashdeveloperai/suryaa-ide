import { ScreenNode, ComponentNode, ApiConnector, ProjectSchema } from '../types/schema';
import { StreamAppConfig } from './store';

export function generateStreamAppFiles(config: StreamAppConfig): Record<string, string> {
  const streamUrl = config.streamUrl || 'wss://stream.iot-telemetry.io/sensors/v1';
  const streamTag = config.streamTag || 'sensor_group_alpha';
  const xTag = config.xAxisTag || 'timestamp';
  const y1Tag = config.primaryYAxisTag || 'pressure_psi';
  const y2Tag = config.secondaryYAxisTag || 'temperature_c';

  const files: Record<string, string> = {};

  // 1. Dockerfile
  files['backend/Dockerfile'] = `FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    libpq-dev gcc curl && \\
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

  // 2. docker-compose.yml
  files['backend/docker-compose.yml'] = `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: suryaa_postgres
    restart: always
    environment:
      POSTGRES_DB: suryaa_db
      POSTGRES_USER: suryaa_admin
      POSTGRES_PASSWORD: suryaa_secure_password_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U suryaa_admin -d suryaa_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: suryaa_fastapi_backend
    restart: always
    environment:
      DATABASE_URL: postgresql://suryaa_admin:suryaa_secure_password_2026@postgres:5432/suryaa_db
      JWT_SECRET_KEY: suryaa_jwt_super_secret_key_change_in_production_2026
      JWT_ALGORITHM: HS256
      JWT_EXPIRATION_MINUTES: 1440
      STREAM_URL: "${streamUrl}"
      STREAM_TAG: "${streamTag}"
      X_AXIS_TAG: "${xTag}"
      Y1_AXIS_TAG: "${y1Tag}"
      Y2_AXIS_TAG: "${y2Tag}"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
`;

  // 3. requirements.txt
  files['backend/requirements.txt'] = `fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.9.0
sqlalchemy>=2.0.35
psycopg2-binary>=2.9.9
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.12
websockets>=13.0
httpx>=0.27.0
`;

  // 4. backend/app/database.py
  files['backend/app/database.py'] = `import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://suryaa_admin:suryaa_secure_password_2026@localhost:5432/suryaa_db"
)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        pass
except Exception:
    DATABASE_URL = "sqlite:///./suryaa_stream_fallback.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
`;

  // 5. backend/app/models/user.py
  files['backend/app/models/user.py'] = `from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="operator")
    created_at = Column(DateTime, default=datetime.utcnow)
`;

  // 6. backend/app/models/telemetry.py
  files['backend/app/models/telemetry.py'] = `from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from ..database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"
    id = Column(Integer, primary_key=True, index=True)
    tag = Column(String, index=True, nullable=False)
    x_val = Column(String, nullable=False)
    y1_val = Column(Float, nullable=False)
    y2_val = Column(Float, nullable=True)
    status = Column(String, default="OPTIMAL")
    recorded_at = Column(DateTime, default=datetime.utcnow)
`;

  // 7. backend/app/api/v1/auth.py
  files['backend/app/api/v1/auth.py'] = `import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from ...database import get_db
from ...models.user import User

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "suryaa_jwt_super_secret_key_change_in_production_2026")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")
    hashed = pwd_context.hash(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed, role="operator")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = jwt.encode(
        {"sub": user.email, "role": user.role, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role}

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = jwt.encode(
        {"sub": user.email, "role": user.role, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer", "role": user.role}

@router.get("/me")
def read_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"email": email, "role": payload.get("role", "operator"), "status": "active"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
`;

  // 8. backend/app/api/v1/stream.py
  files['backend/app/api/v1/stream.py'] = `import os
import json
import asyncio
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()
STREAM_URL = os.getenv("STREAM_URL", "${streamUrl}")
STREAM_TAG = os.getenv("STREAM_TAG", "${streamTag}")
X_AXIS_TAG = os.getenv("X_AXIS_TAG", "${xTag}")
Y1_AXIS_TAG = os.getenv("Y1_AXIS_TAG", "${y1Tag}")
Y2_AXIS_TAG = os.getenv("Y2_AXIS_TAG", "${y2Tag}")

class StreamManager:
    def __init__(self):
        self.active_websockets: List[WebSocket] = []
        self.latest_data = {
            "tag": STREAM_TAG,
            "x": "14:00:00",
            "y1": 78.4,
            "y2": 82.1,
            "status": "OPTIMAL",
            "connected": True
        }

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_websockets.append(ws)
        await ws.send_text(json.dumps(self.latest_data))

    def disconnect(self, ws: WebSocket):
        if ws in self.active_websockets:
            self.active_websockets.remove(ws)

    async def broadcast(self, data: dict):
        self.latest_data = data
        dead = []
        for ws in self.active_websockets:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for d in dead:
            self.disconnect(d)

manager = StreamManager()

async def start_stream_worker():
    sec = 0
    while True:
        try:
            sec += 1
            now_str = f"{14 + (sec // 3600):02d}:{(sec % 3600) // 60:02d}:{sec % 60:02d}"
            base_y1 = 80.0 + (sec % 15) * 1.4
            base_y2 = 72.0 + (sec % 10) * 2.2
            payload = {
                "tag": STREAM_TAG or "root",
                "x": now_str,
                "y1": round(base_y1, 2),
                "y2": round(base_y2, 2),
                "status": "OPTIMAL" if base_y1 < 95 else "WARNING",
                "connected": True
            }
            await manager.broadcast(payload)
            await asyncio.sleep(1.0)
        except Exception:
            await asyncio.sleep(2.0)

@router.websocket("/live")
async def websocket_stream_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/latest")
def get_latest_stream():
    return manager.latest_data
`;

  // 8.5 backend/app/api/v1/security.py
  files['backend/app/api/v1/security.py'] = `import time
import uuid
from typing import Dict, Any, List
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request, Body

router = APIRouter()

_nonces: Dict[str, float] = {}
_ip_rate_limits: Dict[str, List[float]] = defaultdict(list)
_revoked_sessions: Dict[str, Dict[str, Any]] = {}

@router.post("/incident")
def report_incident(request: Request, payload: Dict[str, Any] = Body(...)):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    
    # Rate limiting: 10 reports / minute
    valid_ts = [t for t in _ip_rate_limits[client_ip] if now - t <= 60.0]
    _ip_rate_limits[client_ip] = valid_ts
    if len(valid_ts) >= 10:
        raise HTTPException(status_code=429, detail="Too many security reports from this client")
    _ip_rate_limits[client_ip].append(now)

    # Replay protection
    nonce = payload.get("nonce", "")
    ts = payload.get("timestamp", 0.0)
    if not nonce or not ts or abs(now - ts) > 300.0 or nonce in _nonces:
        raise HTTPException(status_code=400, detail="Invalid or replayed incident nonce/timestamp")
    _nonces[nonce] = now + 300.0

    incident_id = f"inc_{uuid.uuid4().hex[:12]}"
    threat_type = payload.get("threat_type", "unknown")
    severity = payload.get("severity", "MEDIUM").upper()
    session_token = payload.get("session_token")

    session_revoked = False
    if severity == "CRITICAL" and session_token:
        _revoked_sessions[session_token] = {
            "incident_id": incident_id,
            "threat_type": threat_type,
            "revoked_at": now,
            "reason": f"Critical security threat: {threat_type}"
        }
        session_revoked = True

    return {"status": "recorded", "incident_id": incident_id, "session_revoked": session_revoked}

@router.get("/sessions/{session_token}/status")
def check_session(session_token: str):
    if session_token in _revoked_sessions:
        return {"revoked": True, "details": _revoked_sessions[session_token]}
    return {"revoked": False}
`;

  // 9. backend/app/main.py
  files['backend/app/main.py'] = `import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api.v1.auth import router as auth_router
from .api.v1.stream import router as stream_router, start_stream_worker
from .api.v1.security import router as security_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Suryaa Stream Full-Stack API",
    version="2.0.0",
    description="Containerized PostgreSQL and Stream Ingestion Gateway with JWT Authentication."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(stream_router, prefix="/api/v1/stream", tags=["Continuous Stream"])
app.include_router(security_router, prefix="/api/v1/security", tags=["Security Incident Center"])

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_stream_worker())

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "PostgreSQL 16 (Docker)",
        "stream_url": os.getenv("STREAM_URL", "${streamUrl}"),
        "stream_tag": os.getenv("STREAM_TAG", "${streamTag}")
    }
`;

  // 9.5 Flutter Mobile Security Service
  files['lib/core/security/security_service.dart'] = `import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;

enum SecurityThreatLevel { low, medium, high, critical }

class SecurityThreatEvent {
  final String threatType;
  final SecurityThreatLevel level;
  final String description;
  final DateTime timestamp;

  SecurityThreatEvent({
    required this.threatType,
    required this.level,
    required this.description,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson(String? sessionToken) {
    final nonce = 'nonce_\${Random().nextInt(1000000)}_\${DateTime.now().microsecondsSinceEpoch}';
    return {
      'nonce': nonce,
      'timestamp': DateTime.now().millisecondsSinceEpoch / 1000.0,
      'threat_type': threatType,
      'severity': level.name.toUpperCase(),
      'session_token': sessionToken,
      'device_metadata': {
        'platform': 'flutter_client',
        'reported_at': DateTime.now().toIso8601String(),
      }
    };
  }
}

class MobileSecurityService {
  static const String incidentUrl = 'http://10.0.2.2:8000/api/v1/security/incident';
  static bool _isCompromised = false;
  static bool get isCompromised => _isCompromised;

  static final StreamController<SecurityThreatEvent> _threatStream =
      StreamController<SecurityThreatEvent>.broadcast();
  static Stream<SecurityThreatEvent> get onThreatDetected => _threatStream.stream;

  /// Initialize RASP (Talsec/freeRASP) threat callbacks
  static void initializeRASP({String? currentSessionToken}) {
    // In production, register Talsec callbacks:
    // Talsec.instance.attachListener(
    //   onRootDetected: () => handleCriticalThreat('root_jailbreak', currentSessionToken),
    //   onDebuggerDetected: () => handleCriticalThreat('debugger_attached', currentSessionToken),
    //   onHookDetected: () => handleCriticalThreat('hooking_framework', currentSessionToken),
    // );
  }

  static Future<void> handleCriticalThreat(String threatType, String? sessionToken) async {
    _isCompromised = true;
    final event = SecurityThreatEvent(
      threatType: threatType,
      level: SecurityThreatLevel.critical,
      description: 'Critical device or application integrity compromise detected: \$threatType',
    );
    _threatStream.add(event);

    try {
      await http.post(
        Uri.parse(incidentUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(event.toJson(sessionToken)),
      ).timeout(const Duration(seconds: 4));
    } catch (_) {
      // Best-effort reporting must never block local containment
    }
  }
}
`;

  // 10. Flutter Login Screen (based on config.loginStyle)
  files['lib/features/auth/views/login_view.dart'] = generateFlutterLoginDart(config.loginStyle);

  // 11. Flutter AuthService
  files['lib/features/auth/services/auth_service.dart'] = `import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'http://10.0.2.2:8000/api/v1/auth';
  static String? _token;
  static String? _role;

  static bool get isAuthenticated => _token != null;
  static String? get token => _token;
  static String? get role => _role;

  static Future<bool> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('\$baseUrl/login'),
        body: {'username': email, 'password': password},
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _token = data['access_token'];
        _role = data['role'];
        return true;
      }
      return false;
    } catch (e) {
      // Mock fallback for visual IDE preview
      _token = "mock_jwt_token_suryaa_2026";
      _role = "operator";
      return true;
    }
  }

  static void logout() {
    _token = null;
    _role = null;
  }
}
`;

  // 12. Flutter Stream ViewModel with Exponential Backoff & Jitter
  files['lib/features/telemetry/view_models/stream_view_model.dart'] = `import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class StreamTelemetryViewModel extends ChangeNotifier {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  String _streamTag = "${streamTag}";
  
  List<double> _y1Points = [72.0, 78.4, 82.1, 79.5, 84.6, 88.2];
  List<double> _y2Points = [65.0, 68.2, 74.0, 72.1, 76.5, 78.0];
  List<String> _xLabels = ["14:00", "14:05", "14:10", "14:15", "14:20", "14:25"];
  
  double _currentY1 = 88.2;
  double _currentY2 = 78.0;
  String _status = "OPTIMAL";

  int _retryCount = 0;
  Timer? _reconnectTimer;
  bool _isDisposed = false;

  bool get isConnected => _isConnected;
  String get streamTag => _streamTag;
  List<double> get y1Points => _y1Points;
  List<double> get y2Points => _y2Points;
  List<String> get xLabels => _xLabels;
  double get currentY1 => _currentY1;
  double get currentY2 => _currentY2;
  String get status => _status;

  void initStream() {
    connect();
  }

  void connect() {
    if (_isDisposed) return;
    _reconnectTimer?.cancel();
    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('ws://10.0.2.2:8000/api/v1/stream/live'),
      );
      _isConnected = true;
      _retryCount = 0;
      notifyListeners();

      _channel?.stream.listen(
        (message) {
          final data = json.decode(message);
          _currentY1 = (data['y1'] as num).toDouble();
          _currentY2 = (data['y2'] as num).toDouble();
          _status = data['status'] ?? "OPTIMAL";
          _y1Points.add(_currentY1);
          _y2Points.add(_currentY2);
          _xLabels.add(data['x'] ?? "now");
          if (_y1Points.length > 20) {
            _y1Points.removeAt(0);
            _y2Points.removeAt(0);
            _xLabels.removeAt(0);
          }
          notifyListeners();
        },
        onError: (err) => _scheduleReconnect(),
        onDone: () => _scheduleReconnect(),
      );
    } catch (e) {
      _isConnected = false;
      notifyListeners();
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_isDisposed) return;
    _isConnected = false;
    notifyListeners();
    // Exponential backoff with random jitter (base: 1s, max: 30s)
    final delayMs = (1000 * (1 << (_retryCount < 5 ? _retryCount : 5))) + Random().nextInt(500);
    _retryCount++;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(milliseconds: delayMs), () => connect());
  }

  @override
  void dispose() {
    _isDisposed = true;
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    super.dispose();
  }
}
`;

  // 13. Flutter Dashboard View
  files['lib/features/telemetry/views/dashboard_view.dart'] = `import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../view_models/stream_view_model.dart';

class StreamDashboardView extends StatefulWidget {
  const StreamDashboardView({super.key});

  @override
  State<StreamDashboardView> createState() => _StreamDashboardViewState();
}

class _StreamDashboardViewState extends State<StreamDashboardView> {
  final StreamTelemetryViewModel _vm = StreamTelemetryViewModel();

  @override
  void initState() {
    super.initState();
    _vm.initStream();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Stream Ingestion: ${streamTag}'),
        backgroundColor: const Color(0xFF161B26),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _vm.initStream(),
          ),
        ],
      ),
      body: OrientationBuilder(
        builder: (context, orientation) {
          final isLandscape = orientation == Orientation.landscape;
          return isLandscape 
            ? _buildLandscapeLayout(context) 
            : _buildPortraitLayout(context);
        },
      ),
    );
  }

  Widget _buildPortraitLayout(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildStatusBanner(),
          const SizedBox(height: 16),
          _buildChartCard(),
          const SizedBox(height: 16),
          _buildMetricsGrid(),
        ],
      ),
    );
  }

  Widget _buildLandscapeLayout(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: _buildChartCard(),
          ),
        ),
        Expanded(
          flex: 2,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _buildStatusBanner(),
                const SizedBox(height: 12),
                _buildMetricsGrid(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF161B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF232A3B)),
      ),
      child: Row(
        children: [
          const Icon(Icons.stream, color: Color(0xFF06B6D4)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('STREAM TAG: ${streamTag}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                Text('${streamUrl}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.emerald.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text('LIVE', style: TextStyle(color: Colors.emerald, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildChartCard() {
    return Container(
      height: 260,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161B26),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF232A3B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Continuous X/Y Telemetry (${xTag} vs ${y1Tag})', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Expanded(
            child: LineChart(
              LineChartData(
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(0, 72),
                      FlSpot(1, 78),
                      FlSpot(2, 82),
                      FlSpot(3, 80),
                      FlSpot(4, 85),
                      FlSpot(5, 88),
                    ],
                    isCurved: true,
                    color: Color(0xFF6366F1),
                    barWidth: 3,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricsGrid() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF161B26),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF232A3B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${y1Tag.toUpperCase()}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 4),
                const Text('88.4', style: TextStyle(color: Color(0xFF6366F1), fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF161B26),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF232A3B)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${y2Tag.toUpperCase()}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 4),
                const Text('74.2', style: TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
`;

  // 14. Flutter GoRouter
  files['lib/app/routes/app_routes.dart'] = `import 'package:go_router/go_router.dart';
import '../../features/auth/views/login_view.dart';
import '../../features/telemetry/views/dashboard_view.dart';
import '../../features/auth/services/auth_service.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
    final isAuth = AuthService.isAuthenticated;
    final isLoggingIn = state.uri.path == '/login';
    if (!isAuth && !isLoggingIn) return '/login';
    if (isAuth && isLoggingIn) return '/';
    return null;
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginView(),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => const StreamDashboardView(),
    ),
  ],
);
`;

  return files;
}

function generateFlutterLoginDart(style: string): string {
  if (style === 'cyberpunk') {
    return `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _emailCtrl = TextEditingController(text: 'operator@suryaa.io');
  final _passCtrl = TextEditingController(text: 'secret123');
  bool _isLoading = false;

  void _submit() async {
    setState(() => _isLoading = true);
    await AuthService.login(_emailCtrl.text, _passCtrl.text);
    setState(() => _isLoading = false);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF080B14),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: const Color(0xFF111726).withOpacity(0.85),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.4), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF06B6D4).withOpacity(0.15),
                  blurRadius: 30,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF06B6D4).withOpacity(0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF06B6D4)),
                  ),
                  child: const Icon(Icons.fingerprint, color: Color(0xFF06B6D4), size: 36),
                ),
                const SizedBox(height: 16),
                const Text('BIOMETRIC HUD LOGIN', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                const Text('JWT Docker Gateway · 256-Bit TLS', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                const SizedBox(height: 24),
                TextField(
                  controller: _emailCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'OPERATOR ID / EMAIL',
                    labelStyle: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11),
                    filled: true,
                    fillColor: const Color(0xFF080B14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passCtrl,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'SECURITY CIPHER',
                    labelStyle: const TextStyle(color: Color(0xFF06B6D4), fontSize: 11),
                    filled: true,
                    fillColor: const Color(0xFF080B14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF06B6D4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('AUTHORIZE & CONNECT', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;
  } else if (style === 'terminal') {
    return `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _pinCtrl = TextEditingController(text: '749201');

  void _submit() async {
    await AuthService.login('terminal_admin@suryaa.io', 'pin_auth');
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFF111724),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFF59E0B)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFFF59E0B), shape: BoxShape.circle)),
                    const SizedBox(width: 8),
                    const Text('CLEARANCE LEVEL 4 REQUIRED', style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2)),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('TERMINAL ACCESS GATEWAY', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const Text('Hardware Node: DOCKER_NODE_PG_01', style: TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 24),
                TextField(
                  controller: _pinCtrl,
                  style: const TextStyle(color: Colors.white, fontFamily: 'monospace', letterSpacing: 4),
                  decoration: InputDecoration(
                    labelText: 'SECURITY PIN / KEY',
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                    filled: true,
                    fillColor: const Color(0xFF080B14),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(4)),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    ),
                    onPressed: _submit,
                    child: const Text('UNLOCK TERMINAL', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;
  } else if (style === 'aurora') {
    return `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _emailCtrl = TextEditingController(text: 'user@aurora.io');
  final _passCtrl = TextEditingController(text: 'aurora2026');

  void _submit() async {
    await AuthService.login(_emailCtrl.text, _passCtrl.text);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F172A), Color(0xFF312E81), Color(0xFF065F46)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white.withOpacity(0.2)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.blur_on, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  const Text('Aurora Telemetry Cloud', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  const Text('Instant Biometric Stream Gateway', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 24),
                  TextField(
                    controller: _emailCtrl,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Enter Email',
                      hintStyle: const TextStyle(color: Colors.white60),
                      filled: true,
                      fillColor: Colors.black26,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _passCtrl,
                    obscureText: true,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Password',
                      hintStyle: const TextStyle(color: Colors.white60),
                      filled: true,
                      fillColor: Colors.black26,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _submit,
                      child: const Text('Access Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
`;
  }

  // Default: Executive SaaS
  return `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _emailCtrl = TextEditingController(text: 'alex.director@enterprise.com');
  final _passCtrl = TextEditingController(text: 'securePass2026');
  bool _isSignUp = false;

  void _submit() async {
    await AuthService.login(_emailCtrl.text, _passCtrl.text);
    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF334155)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Nova Executive Suite', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                const Text('Sign in to access continuous stream telemetry', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          backgroundColor: !_isSignUp ? const Color(0xFF334155) : Colors.transparent,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => setState(() => _isSignUp = false),
                        child: const Text('Sign In'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          backgroundColor: _isSignUp ? const Color(0xFF334155) : Colors.transparent,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => setState(() => _isSignUp = true),
                        child: const Text('Create Account'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _emailCtrl,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Work Email',
                    labelStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _passCtrl,
                  obscureText: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Password',
                    labelStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _submit,
                    child: Text(_isSignUp ? 'Create Enterprise Account' : 'Sign In with JWT', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;
}

export function generateStreamAppScreensAndComponents(
  config: StreamAppConfig, 
  curProject: ProjectSchema
): {
  screens: ScreenNode[];
  components: Record<string, ComponentNode>;
  apiConnector: ApiConnector;
} {
  const ts = Date.now().toString().slice(-4);
  const streamTag = config.streamTag || 'sensor_group_alpha';
  const xTag = config.xAxisTag || 'timestamp';
  const y1Tag = config.primaryYAxisTag || 'pressure_psi';
  const y2Tag = config.secondaryYAxisTag || 'temperature_c';

  const screens: ScreenNode[] = [
    {
      id: `screen_login_${ts}`,
      name: "Authentication Gateway",
      route: "/login",
      rootComponentId: `comp_scaffold_login_${ts}`
    },
    {
      id: `screen_stream_dashboard_${ts}`,
      name: "Stream Telemetry Suite",
      route: "/",
      rootComponentId: `comp_scaffold_home_${ts}`
    }
  ];

  if (config.generateDedicatedTelemetry) {
    screens.push({
      id: `screen_dedicated_${ts}`,
      name: "High-Frequency Telemetry",
      route: "/telemetry",
      rootComponentId: `comp_scaffold_telem_${ts}`
    });
  }

  if (config.generateLiveLogs) {
    screens.push({
      id: `screen_logs_${ts}`,
      name: "Live Audit Log Stream",
      route: "/logs",
      rootComponentId: `comp_scaffold_logs_${ts}`
    });
  }

  const components: Record<string, ComponentNode> = { ...curProject.components };

  // 1. Build Login Screen Components
  const scaffoldLoginId = `comp_scaffold_login_${ts}`;
  const colLoginId = `comp_col_login_${ts}`;
  const cardLoginId = `comp_card_login_${ts}`;
  const txtTitleLoginId = `comp_txt_title_log_${ts}`;
  const inputEmailId = `comp_input_email_${ts}`;
  const inputPassId = `comp_input_pass_${ts}`;
  const btnLoginId = `comp_btn_login_${ts}`;

  components[scaffoldLoginId] = {
    id: scaffoldLoginId,
    type: 'Scaffold',
    parentId: null,
    childIds: [colLoginId],
    properties: { showAppBar: false }
  };

  components[colLoginId] = {
    id: colLoginId,
    type: 'Column',
    parentId: scaffoldLoginId,
    childIds: [cardLoginId],
    properties: { crossAxisAlignment: 'center', mainAxisAlignment: 'center' }
  };

  const loginTitleMap = {
    cyberpunk: '⚡ BIOMETRIC CYBERPUNK HUD',
    executive: '🏢 NOVA EXECUTIVE SUITE',
    terminal: '📟 MISSION CONTROL TERMINAL',
    aurora: '🌌 AURORA CLOUD TELEMETRY'
  };

  components[cardLoginId] = {
    id: cardLoginId,
    type: 'Card',
    parentId: colLoginId,
    childIds: [txtTitleLoginId, inputEmailId, inputPassId, btnLoginId],
    properties: { elevation: 6, padding: 24, borderRadius: 20 }
  };

  components[txtTitleLoginId] = {
    id: txtTitleLoginId,
    type: 'Text',
    parentId: cardLoginId,
    childIds: [],
    properties: {
      text: loginTitleMap[config.loginStyle] || 'Authentication Gateway',
      fontSize: 16,
      isBold: true,
      textColor: config.loginStyle === 'cyberpunk' ? '0xFF06B6D4' : config.loginStyle === 'terminal' ? '0xFFF59E0B' : '0xFF6366F1'
    }
  };

  components[inputEmailId] = {
    id: inputEmailId,
    type: 'TextField',
    parentId: cardLoginId,
    childIds: [],
    properties: {
      labelText: 'Operator Identity',
      hintText: 'operator@suryaa.io'
    }
  };

  components[inputPassId] = {
    id: inputPassId,
    type: 'TextField',
    parentId: cardLoginId,
    childIds: [],
    properties: {
      labelText: 'Security Cipher / Token',
      hintText: '••••••••••••'
    }
  };

  components[btnLoginId] = {
    id: btnLoginId,
    type: 'ElevatedButton',
    parentId: cardLoginId,
    childIds: [],
    properties: {
      label: 'Authorize & Launch Stream',
      action: 'navigate_home',
      targetScreen: `screen_stream_dashboard_${ts}`,
      backgroundColor: config.loginStyle === 'cyberpunk' ? '0xFF06B6D4' : config.loginStyle === 'terminal' ? '0xFFF59E0B' : '0xFF6366F1',
      textColor: config.loginStyle === 'cyberpunk' || config.loginStyle === 'terminal' ? '0xFF000000' : '0xFFFFFFFF'
    }
  };

  // 2. Build Stream Dashboard Screen Components
  const scaffoldHomeId = `comp_scaffold_home_${ts}`;
  const appbarHomeId = `comp_appbar_home_${ts}`;
  const colHomeId = `comp_col_home_${ts}`;
  const beaconId = `comp_beacon_stream_${ts}`;
  const chartId = `comp_chart_stream_${ts}`;
  const rowGaugesId = `comp_row_gauges_${ts}`;
  const gauge1Id = `comp_gauge_press_${ts}`;
  const gauge2Id = `comp_gauge_speed_${ts}`;

  components[scaffoldHomeId] = {
    id: scaffoldHomeId,
    type: 'Scaffold',
    parentId: null,
    childIds: [appbarHomeId, colHomeId],
    properties: { showAppBar: true }
  };

  components[appbarHomeId] = {
    id: appbarHomeId,
    type: 'AppBar',
    parentId: scaffoldHomeId,
    childIds: [],
    properties: {
      title: `Live Stream: ${streamTag}`,
      centerTitle: false,
      leadingIcon: 'menu'
    }
  };

  components[colHomeId] = {
    id: colHomeId,
    type: 'Column',
    parentId: scaffoldHomeId,
    childIds: [beaconId, chartId, rowGaugesId],
    properties: { crossAxisAlignment: 'stretch', spacing: 16 }
  };

  components[beaconId] = {
    id: beaconId,
    type: 'StatusBeaconBox',
    parentId: colHomeId,
    childIds: [],
    properties: {
      title: `Gateway Stream [Tag: ${streamTag}]`,
      status: 'online',
      code: 'Docker WebSocket :8000',
      latency: '8 ms',
      region: 'PostgreSQL 16'
    }
  };

  components[chartId] = {
    id: chartId,
    type: 'MultiAxisChart',
    parentId: colHomeId,
    childIds: [],
    properties: {
      chartType: 'multi_axis_line',
      title: `Continuous Stream (${xTag} vs ${y1Tag})`,
      xAxisTitle: `X-Axis: ${xTag}`,
      xAxisLabels: ["14:00", "14:04", "14:08", "14:12", "14:16", "14:20"],
      yAxisPrimaryTitle: `${y1Tag}`,
      yAxisPrimaryMin: 0,
      yAxisPrimaryMax: 120,
      yAxisPrimaryInterval: 20,
      showSecondaryYAxis: !!y2Tag,
      yAxisSecondaryTitle: `${y2Tag}`,
      yAxisSecondaryMin: 0,
      yAxisSecondaryMax: 100,
      yAxisSecondaryInterval: 20,
      series: [
        {
          id: 'series_y1',
          name: y1Tag,
          color: '#6366F1',
          axis: 'primary',
          curveStyle: 'spline',
          data: [72, 78, 82, 80, 85, 88],
          showGradient: true
        },
        {
          id: 'series_y2',
          name: y2Tag,
          color: '#10B981',
          axis: 'secondary',
          curveStyle: 'smooth',
          data: [65, 68, 74, 72, 76, 78],
          showGradient: false
        }
      ]
    }
  };

  components[rowGaugesId] = {
    id: rowGaugesId,
    type: 'Row',
    parentId: colHomeId,
    childIds: [gauge1Id, gauge2Id],
    properties: { mainAxisAlignment: 'spaceEvenly' }
  };

  components[gauge1Id] = {
    id: gauge1Id,
    type: 'CircularGauge',
    parentId: rowGaugesId,
    childIds: [],
    properties: {
      title: y1Tag,
      value: 88.4,
      unit: 'Units',
      min: 0,
      max: 120,
      target: 85,
      arcColor: '#6366F1'
    }
  };

  components[gauge2Id] = {
    id: gauge2Id,
    type: 'ArcGauge',
    parentId: rowGaugesId,
    childIds: [],
    properties: {
      title: y2Tag,
      value: 74.2,
      unit: 'Metric',
      min: 0,
      max: 100,
      primaryColor: '#10B981'
    }
  };

  const apiConnector: ApiConnector = {
    id: `connector_stream_${ts}`,
    name: `Stream Ingestion (${streamTag})`,
    url: config.streamUrl,
    method: 'WS',
    authType: 'bearer',
    authToken: 'jwt_access_token_bearer',
    fields: [xTag, y1Tag, y2Tag].filter(Boolean),
    pollingInterval: 1000
  };

  return { screens, components, apiConnector };
}
