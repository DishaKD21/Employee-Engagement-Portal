"""
Shared helpers for service-layer database queries.
"""
from enum import Enum
from typing import Optional, Type

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session


def clean_string(value: Optional[str], *, lowercase: bool = False) -> Optional[str]:
    """Trim optional query-parameter strings and normalize when requested."""
    if value is None:
        return None

    value = value.strip()
    if not value:
        return None

    return value.lower() if lowercase else value


def clean_enum_value(
    value: Optional[str],
    enum_class: Type[Enum],
    field_name: str,
) -> Optional[str]:
    """Validate enum query params against the lowercase values stored in Postgres."""
    value = clean_string(value, lowercase=True)
    if value is None:
        return None

    allowed_values = [item.value for item in enum_class]
    if value not in allowed_values:
        allowed_text = ", ".join(allowed_values)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}. Allowed values: {allowed_text}",
        )

    return value


def clean_pagination(skip: int, limit: int) -> tuple[int, int]:
    """Keep pagination values in a safe range for every list endpoint."""
    skip = max(skip, 0)
    limit = min(max(limit, 1), 100)
    return skip, limit


def raise_database_error(db: Session, error: Exception) -> None:
    """Rollback and turn database errors into a clear API response."""
    db.rollback()
    detail = getattr(error, "orig", error)
    raise HTTPException(
        status_code=500,
        detail=f"Database query failed: {detail}",
    ) from error


DatabaseReadError = (SQLAlchemyError, LookupError)
