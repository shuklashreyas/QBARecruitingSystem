# # QBA Recurting System

conda activate job-management
/opt/homebrew/Caskroom/miniconda/base/envs/job-management/bin/python

This is a **FastAPI-based job management system** that allows users to register, authenticate, and manage job listings. It includes user authentication with JWT tokens and CRUD operations for job postings.

## Features

- **User Authentication**: Register, login, and obtain JWT tokens.
- **Job Management**:
  - Create, update, delete jobs (authenticated users only).
  - Retrieve all jobs.
  - Retrieve jobs created by the logged-in user.

## Installation

### 1. Clone the repository

```sh
git clone https://github.com/your-repo/job-management.git
cd job-management
```

### 2. Create a virtual environment

```sh
python -m venv env
source env/bin/activate  # On Windows, use `env\Scriptsctivate`
```

### 3. Install dependencies

```sh
pip install -r requirements.txt
```

### 4. Set up the database

```sh
alembic upgrade head
```

### 5. Run the server

```sh
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication

#### Register a User

```sh
POST /auth/register
```

- **Request Body**:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created successfully"
  }
  ```

#### Login and Get Token

```sh
POST /auth/token
```

- **Request Body (x-www-form-urlencoded)**:
  ```
  username=testuser&password=testpass
  ```
- **Response**:
  ```json
  {
    "access_token": "your_jwt_token",
    "token_type": "bearer"
  }
  ```

### Job Management

#### Get all jobs

```sh
GET /jobs
```

- **Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Software Engineer",
      "description": "Develop and maintain software",
      "company": "Tech Corp",
      "owner_id": 1
    }
  ]
  ```

#### Get jobs created by the current user

```sh
GET /jobs/mine
```

- **Headers**:
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  ```
- **Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Software Engineer",
      "description": "Develop and maintain software",
      "company": "Tech Corp",
      "owner_id": 1
    }
  ]
  ```

#### Create a new job (Authenticated)

```sh
POST /jobs
```

- **Headers**:
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  ```
- **Request Body**:
  ```json
  {
    "title": "Software Engineer",
    "description": "Develop and maintain software",
    "company": "Tech Corp"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "title": "Software Engineer",
    "description": "Develop and maintain software",
    "company": "Tech Corp",
    "owner_id": 1
  }
  ```

#### Update a job (Authenticated, Owner only)

```sh
PUT /jobs/{job_id}
```

- **Headers**:
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  ```
- **Request Body**:
  ```json
  {
    "title": "Senior Software Engineer",
    "description": "Lead software development"
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "title": "Senior Software Engineer",
    "description": "Lead software development",
    "company": "Tech Corp",
    "owner_id": 1
  }
  ```

#### Delete a job (Authenticated, Owner only)

```sh
DELETE /jobs/{job_id}
```

- **Headers**:
  ```
  Authorization: Bearer YOUR_ACCESS_TOKEN
  ```
- **Response**:
  ```json
  {
    "message": "Job deleted successfully"
  }
  ```

## Authorization

For protected endpoints, include the **JWT token** in the request headers:

```sh
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Technologies Used

- **FastAPI** - API framework
- **SQLAlchemy** - ORM
- **Alembic** - Migrations
- **PostgreSQL** - Database
- **JWT** - Authentication

## Future Improvements

- Role-based access control
- Job search and filtering
- Pagination for large job listings

---

🚀 **Happy Coding!**
