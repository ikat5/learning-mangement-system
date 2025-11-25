# Quick Postman Collection Reference

## 📋 All API Routes Summary

### Base URL: `http://localhost:5000`

---

## 🔐 Authentication Endpoints

| Method | Endpoint | Auth Required | Role Required |
|--------|----------|---------------|---------------|
| POST | `/api/auth/learner/signup` | ❌ No | - |
| POST | `/api/auth/learner/login` | ❌ No | - |
| POST | `/api/auth/learner/logout` | ✅ Yes | Learner |
| POST | `/api/auth/instructor/signup` | ❌ No | - |
| POST | `/api/auth/instructor/login` | ❌ No | - |
| POST | `/api/auth/instructor/logout` | ✅ Yes | Instructor |
| POST | `/api/auth/admin/signup` | ❌ No | - |
| POST | `/api/auth/admin/login` | ❌ No | - |
| POST | `/api/auth/admin/logout` | ✅ Yes | Admin |

---

## 📚 Course Endpoints

| Method | Endpoint | Auth Required | Role Required |
|--------|----------|---------------|---------------|
| GET | `/api/course/get-courses` | ❌ No | - |

---

## 👨‍🏫 Instructor Endpoints

| Method | Endpoint | Auth Required | Role Required |
|--------|----------|---------------|---------------|
| POST | `/api/instructor/create-course` | ✅ Yes | Instructor |
| GET | `/api/instructor/my-courses` | ✅ Yes | Instructor |
| GET | `/api/instructor/approve-students/:courseId` | ✅ Yes | Instructor |

---

## 👨‍🎓 Learner Endpoints

| Method | Endpoint | Auth Required | Role Required |
|--------|----------|---------------|---------------|
| POST | `/api/learner/enroll` | ✅ Yes | Learner |
| GET | `/api/learner/my-courses` | ✅ Yes | Learner |
| GET | `/api/learner/course/:courseId` | ✅ Yes | Learner |
| POST | `/api/learner/course/progress` | ✅ Yes | Learner |

---

## 📝 Sample Request Bodies

### Learner Signup
```json
POST /api/auth/learner/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "userName": "johndoe",
  "phoneNumber": "+1234567890",
  "email": "learner@example.com",
  "password": "password123",
  "bank_account_number": "2022331055",
  "bank_secret": "secret123"
}
```

### Instructor Signup
```json
POST /api/auth/instructor/signup
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "userName": "janesmith",
  "phoneNumber": "+1234567891",
  "email": "instructor@example.com",
  "password": "password123",
  "bank_account_number": "2022331056",
  "bank_secret": "secret456"
}
```

### Login (All Roles)
```json
POST /api/auth/{role}/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Create Course (Form Data)
```
POST /api/instructor/create-course
Content-Type: multipart/form-data
Authorization: Bearer <token>

title: "Introduction to JavaScript"
description: "Learn JavaScript from scratch"
price: 99.99
lumpSumPayment: 99.99
files: [video1.mp4, video2.mp4]
videoTitles: ["Intro", "Lesson 1"]
videoDurations: [120, 300]
resources: [{"title":"PDF","mediaType":"document_link","url":"https://example.com"}]
```

### Enroll in Course
```json
POST /api/learner/enroll
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "692307bcc8a71ef5dd43475b",
  "bankAccountNumber": "2022331055",
  "secretKey": "secret123"
}
```

### Update Video Progress
```json
POST /api/learner/course/progress
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "course_id_here",
  "videoId": "video_id_here",
  "currentTime": 60,
  "completed": false
}
```

---

## 🔑 Authentication Header

After login, add this header to authenticated requests:

```
Authorization: Bearer <accessToken>
```

Or use cookies (automatically set after login).

---

## ✅ Testing Checklist

### As Learner:
1. ✅ Signup as Learner
2. ✅ Login as Learner
3. ✅ Get All Courses
4. ✅ Enroll in a Course
5. ✅ Get My Courses
6. ✅ Get Course Content
7. ✅ Update Video Progress
8. ✅ Logout

### As Instructor:
1. ✅ Signup as Instructor
2. ✅ Login as Instructor
3. ✅ Create Course
4. ✅ Get My Courses with Stats
5. ✅ Get Approved Students
6. ✅ Logout

### As Admin:
1. ✅ Signup as Admin
2. ✅ Login as Admin
3. ✅ Logout

---

**Note**: Make sure your MongoDB and Cloudinary are configured before testing file upload endpoints!

