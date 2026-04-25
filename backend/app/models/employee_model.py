"""
Employee model
Maps to employees table in PostgreSQL
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime
from app.config.database import Base


class Employee(Base):
    """
    Employee model representing an employee in the system
    
    Attributes:
        employee_id: Primary key, auto-incremented
        name: Employee full name
        email: Email address (unique)
        date_of_birth: Employee date of birth
        joining_date: Employment joining date
        department: Department name
        role: Job role/title
        location: Office location
        language: Preferred language
        time_zone: Employee timezone
        created_at: Record creation timestamp
    """
    __tablename__ = "employees"

    employee_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    joining_date = Column(Date, nullable=False)
    department = Column(String(100), nullable=True)
    role = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    language = Column(String(50), nullable=True)
    time_zone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
