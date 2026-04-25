# Employee Engagement Platform - Backend

A modular, production-ready FastAPI backend for an Employee Engagement Platform. Built with SQLAlchemy ORM and PostgreSQL, following Node.js/Express-like architecture patterns.

## Features

- **Modular Architecture**: Clean separation of concerns with routers, services, and models
- **SQLAlchemy ORM**: Type-safe database interactions with PostgreSQL
- **RESTful API**: Comprehensive GET endpoints with pagination and filtering
- **Automatic Documentation**: Interactive API docs via Swagger UI
- **Employee Management**: Track employees and their engagement
- **Recognition Events**: Manage birthday/anniversary recognition
- **Surveys**: Collect feedback and engagement surveys
- **Knowledge Base**: FAQ and HR knowledge management
- **Query System**: Employee query resolution and escalation
- **Audit Logging**: Track all system actions for compliance
- **Notifications**: Multi-channel notification delivery

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL (Aiven)
- **Validation**: Pydantic
- **Python**: 3.8+

## Project Structure

```
backend/
├── app/
│   ├── config/
│   │   ├── database.py       # SQLAlchemy setup
│   │   └── settings.py       # Environment configuration
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── employee_model.py
│   │   ├── recognition_model.py
│   │   ├── engagement_model.py
│   │   ├── survey_model.py
│   │   ├── knowledge_model.py
│   │   ├── approval_model.py
│   │   ├── audit_model.py
│   │   └── notification_model.py
│   ├── modules/              # API endpoint modules
│   │   ├── employees/
│   │   ├── events/
│   │   ├── surveys/
│   │   ├── queries/
│   │   ├── knowledge_base/
│   │   ├── notifications/
│   │   └── audit_logs/
│   └── main.py              # FastAPI app entry point
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup & Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL database (Aiven or local)
- Git

### 1. Clone the Repository

```bash
cd Employee-Engagement-Portal/backend
```

### 2. Create Virtual Environment

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your PostgreSQL connection details
# DATABASE_URL=postgresql://username:password@host:port/dbname
```

**Example for Aiven PostgreSQL:**
```
DATABASE_URL=postgresql://avnadmin:password@pg-12345678.c.aivencloud.com:12345/defaultdb
```

### 5. Create Database Tables

Run this command to create all tables from the SQLAlchemy models:

```bash
python -c "from app.config.database import Base, engine; Base.metadata.create_all(engine)"
```

**Output:**
```
Creating tables...
✓ All tables created successfully!
```

## Running the Application

### Development Server

```bash
# Using uvicorn directly
uvicorn app.main:app --reload

# Using Python module
python -m uvicorn app.main:app --reload
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

### Interactive Swagger UI
```
http://localhost:8000/docs
```

### ReDoc Documentation
```
http://localhost:8000/redoc
```

### OpenAPI JSON
```
http://localhost:8000/openapi.json
```

## API Endpoints

All endpoints are prefixed with `/api/v1/`

### Employees
- `GET /employees` - List all employees (with pagination)
- `GET /employees/{id}` - Get single employee
- Query params: `skip`, `limit`, `department`, `role`

### Events
- `GET /events` - List engagement events
- `GET /events/{id}` - Get single event
- `GET /events/{id}/participants` - Get event participants
- `GET /events/recognition/events` - List recognition events
- Query params: `skip`, `limit`, `status`, `employee_id`

### Surveys
- `GET /surveys` - List surveys
- `GET /surveys/{id}` - Get single survey
- `GET /surveys/{id}/questions` - Get survey questions
- `GET /surveys/{id}/responses` - Get survey responses
- Query params: `skip`, `limit`, `status`

### Queries
- `GET /queries` - List queries
- `GET /queries/{id}` - Get single query
- `GET /queries/escalations/list` - List escalations
- Query params: `skip`, `limit`, `employee_id`, `status`

### Knowledge Base
- `GET /articles` - List articles
- `GET /articles/{id}` - Get single article
- Query params: `skip`, `limit`, `category`, `status`

### Notifications
- `GET /notifications` - List notifications
- `GET /notifications/{id}` - Get single notification
- `GET /notifications/employee/{employee_id}` - Get employee notifications
- Query params: `skip`, `limit`, `employee_id`, `status`

### Audit Logs
- `GET /audit-logs` - List audit logs
- `GET /audit-logs/{id}` - Get single audit log
- Query params: `skip`, `limit`, `event_type`, `employee_id`

## Example API Calls

### Get all employees with pagination
```bash
curl "http://localhost:8000/api/v1/employees?skip=0&limit=10"
```

### Get employees from Engineering department
```bash
curl "http://localhost:8000/api/v1/employees?department=Engineering&limit=5"
```

### Get a specific employee
```bash
curl "http://localhost:8000/api/v1/employees/1"
```

### Get published events
```bash
curl "http://localhost:8000/api/v1/events?status=published"
```

### Get notifications for employee
```bash
curl "http://localhost:8000/api/v1/notifications/employee/1?status=sent"
```

## Database Schema

The application maps 16 PostgreSQL tables with the following main entities:

1. **Employees** - Employee master data
2. **Recognition Templates & Events** - Birthday/anniversary recognition
3. **Engagement Events & Participants** - HR events and attendance
4. **Surveys & Responses** - Feedback collection
5. **Knowledge Base Articles** - FAQ/documentation
6. **Query Logs & Escalations** - Query management
7. **Approvals** - Content approval workflow
8. **Audit Logs** - System audit trail
9. **Notifications** - Multi-channel notifications

All relationships and enums are defined in SQLAlchemy models.

## Code Architecture

### Router Pattern
```python
# app/modules/{module}/router.py
@router.get("")
def list_items(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    items, total = service.get_all(db, skip, limit)
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)
```

### Service Pattern
```python
# app/modules/{module}/service.py
def get_all(db: Session, skip: int, limit: int):
    query = db.query(Model)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total
```

### Model Pattern
```python
# app/models/{module}_model.py
class Employee(Base):
    __tablename__ = "employees"
    employee_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    # ... other fields
```

### Schema Pattern
```python
# app/modules/{module}/schema.py
class EmployeeResponse(BaseModel):
    employee_id: int
    name: str
    # ... other fields
    model_config = ConfigDict(from_attributes=True)
```

## Development

### Code Style

```bash
# Format code with Black
black app/

# Check code with Flake8
flake8 app/
```

### Run Tests

```bash
# Run pytest
pytest

# Run with coverage
pytest --cov=app
```

## Troubleshooting

### Database Connection Error

```
Error: could not connect to server: Connection refused
```

**Solution:**
1. Verify DATABASE_URL in `.env` is correct
2. Check PostgreSQL is running
3. Ensure network access if using Aiven (whitelist IP)

### Table Already Exists Error

```
sqlalchemy.exc.OperationalError: (psycopg2.errors.DuplicateTable)
```

**Solution:**
```bash
# Tables can be dropped and recreated
python -c "from app.config.database import Base, engine; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"
```

### Port Already in Use

```
Address already in use on port 8000
```

**Solution:**
```bash
# Use different port
uvicorn app.main:app --port 8001
```

## Performance Tips

1. **Add Database Indexes**: Already included for common queries
2. **Pagination**: Always use pagination for list endpoints
3. **Connection Pooling**: SQLAlchemy handles automatically
4. **Query Optimization**: Use relationships for eager loading

## Security Considerations

- Add authentication (JWT) before production
- Implement authorization/RBAC
- Add input validation and sanitization
- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following code style
3. Test thoroughly
4. Create pull request

## License

Proprietary - Employee Engagement Platform

## Support

For issues or questions, contact the development team.

---

**Built with ❤️ using FastAPI and SQLAlchemy**
