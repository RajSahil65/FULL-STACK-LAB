# Student Record Management System

A full-stack CRUD web application built for the **Full Stack Development Lab**.

- **Frontend:** HTML5, CSS3, vanilla JavaScript (`fetch` + `async/await`)
- **Backend:** Node.js + Express.js (REST API)
- **Database:** MongoDB via Mongoose (ODM)

## 1. Project Structure

```
student-record-app/
├── models/
│   └── Student.js        # Mongoose schema (name, rollNo, course, marks)
├── public/
│   ├── index.html         # Form + table UI
│   ├── style.css
│   └── script.js          # fetch/async-await CRUD logic + client-side validation
├── server.js               # Express app + REST API routes
├── package.json
├── .env.example
└── README.md
```

## 2. Prerequisites

- Node.js (v18+) and npm installed
- A running MongoDB instance — either:
  - **Local MongoDB** (`mongodb://127.0.0.1:27017/studentdb`), or
  - **MongoDB Atlas** (free cluster) — copy your connection string

## 3. Setup

```bash
cd student-record-app
npm install
```

Create a `.env` file (copy `.env.example`) if you want to use a custom database URI or port:

```
MONGO_URI=mongodb://127.0.0.1:27017/studentdb
PORT=5000
```

If you don't create a `.env` file, the app defaults to `mongodb://127.0.0.1:27017/studentdb` on port `5000`.

## 4. Run

```bash
npm start
```

You should see:

```
Server running at http://localhost:5000
MongoDB connected: mongodb://127.0.0.1:27017/studentdb
```

Open **http://localhost:5000** in your browser to use the app.

> If MongoDB isn't running, the server will still start (so you can see the frontend), but API calls will fail until the database connection succeeds. Check the terminal for the connection error message.

## 5. REST API Endpoints

| Method | Endpoint          | Description                  |
|--------|-------------------|-------------------------------|
| POST   | `/students`       | Add a new student record      |
| GET    | `/students`       | Fetch all student records     |
| GET    | `/students/:id`   | Fetch a single student record |
| PUT    | `/students/:id`   | Update an existing record     |
| DELETE | `/students/:id`   | Delete a student record       |

### Sample request body (POST / PUT)

```json
{
  "name": "Aditi Sharma",
  "rollNo": "CS21B045",
  "course": "B.Tech CSE",
  "marks": 87.5
}
```

## 6. Testing with Postman (before frontend integration)

1. Open Postman (or Thunder Client in VS Code).
2. **Add a student** — `POST http://localhost:5000/students` with the JSON body above (set header `Content-Type: application/json`).
3. **View all students** — `GET http://localhost:5000/students`.
4. **View one student** — `GET http://localhost:5000/students/<id>` (use the `_id` returned from step 2).
5. **Update a student** — `PUT http://localhost:5000/students/<id>` with an updated JSON body.
6. **Delete a student** — `DELETE http://localhost:5000/students/<id>`.
7. Try invalid inputs (e.g. `marks: 150`, missing `rollNo`, duplicate `rollNo`) to confirm validation errors return `400` status codes with a clear message.

## 7. Validation Implemented

- **Server-side (Mongoose schema):** `name`, `rollNo`, `course`, `marks` are required; `rollNo` is unique; `marks` must be between 0 and 100.
- **Client-side (script.js):** the form blocks submission and shows inline errors if Roll No. is empty or Marks is outside 0–100, before any network request is made.

## 8. Notes for the Lab Report

- The frontend communicates with the backend exclusively through `fetch` calls using `async/await` (see `public/script.js`).
- The backend follows REST conventions and returns consistent JSON responses: `{ success, data }` or `{ success, message }` for errors.
- Error handling in `server.js` distinguishes Mongoose validation errors (400), duplicate key errors (400), invalid ObjectId (400), and not-found (404) from generic server errors (500).
- Screenshot the Postman requests/responses and the running frontend (add/edit/delete flows) for your lab file.
