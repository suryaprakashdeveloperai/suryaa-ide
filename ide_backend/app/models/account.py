import time
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

THREE_DAYS_SECONDS = 3 * 24 * 60 * 60

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="Surya Prakash T")
    picture = Column(String, nullable=True)
    created_at = Column(Float, default=time.time)

    subscription = relationship("Subscription", back_populates="user", uselist=False)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    plan = Column(String, default="trial")  # trial | pro | enterprise
    status = Column(String, default="trialing")  # trialing | active | expired | canceled
    trial_started_at = Column(Float, default=time.time)
    trial_expires_at = Column(Float, default=lambda: time.time() + THREE_DAYS_SECONDS)
    current_period_end = Column(Float, default=lambda: time.time() + THREE_DAYS_SECONDS)
    monthly_token_budget = Column(Integer, default=500000)
    tokens_used = Column(Integer, default=0)

    user = relationship("User", back_populates="subscription")

    def is_entitled(self) -> bool:
        now = time.time()
        if self.plan in ["pro", "enterprise"] and self.status == "active":
            return True
        if self.status == "trialing" and now < self.trial_expires_at:
            return True
        return False

    def seconds_remaining(self) -> int:
        now = time.time()
        if self.status == "trialing":
            return max(0, int(self.trial_expires_at - now))
        elif self.status == "active":
            return max(0, int(self.current_period_end - now))
        return 0

class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    project_id = Column(String, nullable=True)
    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    created_at = Column(Float, default=time.time)
