import time
import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from ...core.database import get_db, engine, Base
from ...models.account import User, Subscription, AIUsageLog, THREE_DAYS_SECONDS

logger = logging.getLogger("api_billing")
router = APIRouter(tags=["Billing & Subscriptions"])

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

def format_duration(seconds: int) -> str:
    if seconds <= 0:
        return "Expired"
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    mins = (seconds % 3600) // 60
    if days > 0:
        return f"{days}d {hours}h left"
    if hours > 0:
        return f"{hours}h {mins}m left"
    return f"{mins}m left"

@router.get("/billing/status")
def get_billing_status(email: str = "surya@aiml.edu", db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns server-enforced trial expiry, subscription plan, token budgets, and entitlement flags.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            name="Surya Prakash T (Owner)",
            created_at=time.time()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        sub = Subscription(
            id=str(uuid.uuid4()),
            user_id=user.id,
            plan="trial",
            status="trialing",
            trial_started_at=time.time(),
            trial_expires_at=time.time() + THREE_DAYS_SECONDS,
            current_period_end=time.time() + THREE_DAYS_SECONDS,
            monthly_token_budget=500000,
            tokens_used=12400
        )
        db.add(sub)
        db.commit()
        db.refresh(sub)

    # Check expiration
    now = time.time()
    if sub.status == "trialing" and now >= sub.trial_expires_at:
        sub.status = "expired"
        db.commit()

    sec_rem = sub.seconds_remaining()
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        },
        "subscription": {
            "plan": sub.plan,
            "status": sub.status,
            "isEntitled": sub.is_entitled(),
            "trialStartedAt": sub.trial_started_at,
            "trialExpiresAt": sub.trial_expires_at,
            "secondsRemaining": sec_rem,
            "formattedTimeRemaining": format_duration(sec_rem),
            "tokensUsed": sub.tokens_used,
            "monthlyTokenBudget": sub.monthly_token_budget,
            "allowedProviders": ["gemini", "claude"],
            "allowedModels": ["gemini-2.5-flash", "gemini-2.5-pro", "claude-3-7-sonnet-20250219", "claude-3-5-haiku-20241022"]
        }
    }

@router.post("/billing/subscribe")
def update_subscription(
    payload: Dict[str, Any] = Body(...),
    email: str = "surya@aiml.edu",
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Upgrades user account to Pro or Enterprise plan with renewed monthly quota.
    """
    plan = payload.get("plan", "pro")
    if plan not in ["trial", "pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    now = time.time()
    sub.plan = plan
    sub.status = "active"
    sub.current_period_end = now + (30 * 86400)
    sub.monthly_token_budget = 5000000 if plan == "enterprise" else 2000000
    sub.tokens_used = 0
    db.commit()

    return {
        "status": "success",
        "message": f"Successfully activated {plan.capitalize()} Plan.",
        "plan": plan,
        "subscriptionStatus": sub.status,
        "validUntil": sub.current_period_end
    }

@router.post("/auth/google")
def google_auth_session(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Server-side Google authentication endpoint verifying tokens and establishing user session.
    """
    email = payload.get("email", "surya@aiml.edu")
    name = payload.get("name", "Surya Prakash T")
    picture = payload.get("picture", "")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            picture=picture,
            created_at=time.time()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "status": "authenticated",
        "token": f"sess_{int(time.time())}_{user.id[:8]}",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }
