"""
Router for Employee endpoints
Defines all GET endpoints for employees
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.employees import service
from app.modules.employees.schema import EmployeeResponse, PaginatedResponse

# Create APIRouter with prefix and tags
router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
def list_employees(
    skip: int = 0,
    limit: int = 10,
    department: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all employees with pagination and optional filtering
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10, max: 100)
    - department: Filter by department (optional)
    - role: Filter by role (optional)
    
    Example: GET /employees?skip=0&limit=10&department=Engineering
    """
    # Limit the max limit to 100 for performance
    if limit > 100:
        limit = 100
    
    employees, total = service.get_all_employees(
        db=db,
        skip=skip,
        limit=limit,
        department=department,
        role=role
    )
    
    return PaginatedResponse[EmployeeResponse](
        items=employees,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single employee by ID
    
    Path Parameters:
    - employee_id: The ID of the employee to retrieve
    
    Returns:
    - 200: Employee found
    - 404: Employee not found
    
    Example: GET /employees/1
    """
    employee = service.get_employee_by_id(db=db, employee_id=employee_id)
    
    if not employee:
        raise HTTPException(
            status_code=404,
            detail=f"Employee with id {employee_id} not found"
        )
    
    return employee
