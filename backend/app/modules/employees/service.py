"""
Service layer for Employee module
Contains all business logic and database queries
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.employee_model import Employee
from app.modules.service_utils import (
    DatabaseReadError,
    clean_pagination,
    clean_string,
    raise_database_error,
)


def get_all_employees(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    department: Optional[str] = None,
    role: Optional[str] = None
) -> tuple[List[Employee], int]:
    """
    Get all employees with pagination and optional filtering
    
    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Number of records to return
        department: Optional filter by department
        role: Optional filter by role
        
    Returns:
        Tuple of (employees list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        department = clean_string(department)
        role = clean_string(role)

        query = db.query(Employee)

        if department is not None:
            query = query.filter(Employee.department == department)
        if role is not None:
            query = query.filter(Employee.role == role)

        total = query.count()
        employees = query.offset(skip).limit(limit).all()

        return employees, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_employee_by_id(db: Session, employee_id: int) -> Optional[Employee]:
    """
    Get a single employee by ID
    
    Args:
        db: Database session
        employee_id: ID of employee to retrieve
        
    Returns:
        Employee object or None if not found
    """
    try:
        return db.query(Employee).filter(Employee.employee_id == employee_id).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
