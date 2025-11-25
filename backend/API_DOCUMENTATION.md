# LMS Backend API Documentation

**Base URL**: `http://localhost:5000` (or your configured PORT)

**Authentication**: Most endpoints require JWT authentication via:
- Cookie: `accessToken` (set automatically after login)
- OR Header: `Authorization: Bearer <accessToken>`

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. Learner Signup
- **Method**: `POST`
- **URL**: `/api/auth/learner/signup`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "fullName": "John Doe",
  "userName": "johndoe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "password123",
  "role": "Learner",
  "bank_account_number": "2022331055",
  "bank_secret": "secret_key_here"
}
```
- **Response**: `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "user_id_here",
    "role": "Learner"
  },
  "message": "Signup successful"
}
```

---

### 2. Learner Login
- **Method**: `POST`
- **URL**: `/api/auth/learner/login`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "userName": "johndoe",
      "email": "john@example.com",
      "role": "Learner"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "User logged in successfully"
}
```
- **Note**: Tokens are also set as HTTP-only cookies

---

### 3. Learner Logout
- **Method**: `POST`
- **URL**: `/api/auth/learner/logout`
- **Authentication**: Required (JWT)
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

---

### 4. Instructor Signup
- **Method**: `POST`
- **URL**: `/api/auth/instructor/signup`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "fullName": "Jane Smith",
  "userName": "janesmith",
  "phoneNumber": "+1234567891",
  "email": "jane@example.com",
  "password": "password123",
  "bank_account_number": "2022331056",
  "bank_secret": "secret_key_here"
}
```
- **Response**: `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "user_id_here",
    "role": "Instructor"
  },
  "message": "Instructor created"
}
```

---

### 5. Instructor Login
- **Method**: `POST`
- **URL**: `/api/auth/instructor/login`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "Jane Smith",
      "userName": "janesmith",
      "email": "jane@example.com",
      "role": "Instructor"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "Instructor logged in successfully"
}
```

---

### 6. Instructor Logout
- **Method**: `POST`
- **URL**: `/api/auth/instructor/logout`
- **Authentication**: Required (JWT)
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

---

### 7. Admin Signup
- **Method**: `POST`
- **URL**: `/api/auth/admin/signup`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "fullName": "Admin User",
  "userName": "admin",
  "phoneNumber": "+1234567892",
  "email": "admin@example.com",
  "password": "admin123",
  "bank_account_number": "2022331054",
  "bank_secret": "secret_key_here"
}
```
- **Response**: `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "user_id_here",
    "role": "Admin"
  },
  "message": "Admin created"
}
```

---

### 8. Admin Login
- **Method**: `POST`
- **URL**: `/api/auth/admin/login`
- **Authentication**: Not required
- **Request Body** (JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "Admin User",
      "userName": "admin",
      "email": "admin@example.com",
      "role": "Admin"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "Admin logged in successfully"
}
```

---

### 9. Admin Logout
- **Method**: `POST`
- **URL**: `/api/auth/admin/logout`
- **Authentication**: Required (JWT)
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

---

## 📚 Course Routes (`/api/course`)

### 10. Get All Courses
- **Method**: `GET`
- **URL**: `/api/course/get-courses`
- **Authentication**: Not required
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "course_id",
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript from scratch",
      "price": 99.99,
      "totalVideos": 10,
      "enrolledStudents": 25,
      "instructor": {
        "name": "Jane Smith",
        "username": "janesmith"
      },
      "thumbnail": "https://cloudinary_url/video1.mp4"
    }
  ]
}
```

---

## 👨‍🏫 Instructor Routes (`/api/instructor`)

**All routes require**: JWT Authentication + Instructor Role

### 11. Create Course
- **Method**: `POST`
- **URL**: `/api/instructor/create-course`
- **Authentication**: Required (JWT + Instructor role)
- **Content-Type**: `multipart/form-data`
- **Request Body** (Form Data):
  - `title`: (string) Course title
  - `description`: (string) Course description
  - `price`: (number) Course price
  - `lumpSumPayment`: (number) Lump sum payment amount
  - `files`: (file[]) Array of video files (max 50 files, max 200MB each)
  - `videoTitles`: (array) Array of video titles - e.g., `["Introduction", "Lesson 1"]`
  - `videoDurations`: (array) Array of video durations in seconds - e.g., `[120, 300]`
  - `resources`: (JSON string or array) Optional resources array:
```json
[
  {
    "title": "PDF Notes",
    "mediaType": "document_link",
    "url": "https://drive.google.com/file/example"
  },
  {
    "title": "Image Resource",
    "mediaType": "image",
    "url": "https://example.com/image.jpg"
  }
]
```
  - Valid `mediaType` values: `"image"`, `"text"`, `"mcq"`, `"audio"`, `"document_link"`

- **Response**: `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "_id": "course_id",
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript from scratch",
    "price": 99.99,
    "lumpSumPayment": 99.99,
    "instructor": "instructor_id",
    "videos": [
      {
        "_id": "video_id",
        "title": "Introduction",
        "url": "https://cloudinary_url/video1.mp4",
        "duration_seconds": 120
      }
    ],
    "resources": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Course created successfully"
}
```

---

### 12. Get My Courses with Stats
- **Method**: `GET`
- **URL**: `/api/instructor/my-courses`
- **Authentication**: Required (JWT + Instructor role)
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "courses": [
      {
        "courseId": "course_id",
        "title": "Introduction to JavaScript",
        "price": 99.99,
        "studentsEnrolled": 25,
        "earningsFromThisCourse": 1999.8
      }
    ],
    "totalEarnings": 1999.8
  }
}
```

---

### 13. Get Approved Students for Course
- **Method**: `GET`
- **URL**: `/api/instructor/approve-students/:courseId`
- **Authentication**: Required (JWT + Instructor role)
- **URL Parameters**:
  - `courseId`: (string) Course ID
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "transaction_id",
      "type": "PURCHASE",
      "amount": 99.99,
      "from_user": {
        "_id": "learner_id",
        "userName": "johndoe",
        "fullName": "John Doe",
        "bank_account_number": "2022331055"
      },
      "status": "COMPLETED",
      "course_id": "course_id",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}

14)Add Resources to Course

Method: POST
URL: /api/instructor/:courseId/add-resources
Auth: Required (Owner Instructor)
Content-Type: application/json

Request Body (Raw JSON):
JSON{
  "resources": [
    {
      "title": "React Cheat Sheet",
      "mediaType": "document_link",
      "url": "https://drive.google.com/file/xxx"
    },
    {
      "title": "Project Source Code",
      "mediaType": "document_link",
      "url": "https://github.com/user/repo"
    }
  ]
}
Success Response (200):
JSON{
  "statusCode": 200,
  "data": { "added": 2, "total": 8 },
  "message": "Resources added successfully"
}

15)Delete Video from Course

Method: DELETE
URL: /api/instructor/:courseId/video/:videoId
Auth: Required (Owner Instructor)

No Body Required
Success Response (200):
JSON{
  "statusCode": 200,
  "data": null,
  "message": "Video deleted successfully"
}

16)Delete Resource from Course

Method: DELETE
URL: /api/instructor/:courseId/resource/:resourceId
Auth: Required (Owner Instructor)

No Body Required
Success Response (200):
JSON{
  "statusCode": 200,
  "data": null,
  "message": "Resource deleted successfully"
}

17)Add Videos to Course

Method: POST
URL: /api/instructor/:courseId/add-videos
Auth: Required (Owner Instructor)

Request Body (Form Data):
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **files** | `file[]` | Yes | New video files (Binary). |
| **videoTitles** | `string/JSON` | Yes | JSON Array of titles. <br> Example: `["React Hooks", "Node.js"]` |
| **videoDurations** | `string/JSON` | Yes | JSON Array of durations in seconds. <br> Example: `[480, 600]` |

Success Response (200):
JSON{
  "statusCode": 200,
  "data": {
    "added": 2,
    "total": 12
  },
  "message": "Videos added successfully"
}


```

---

## 👨‍🎓 Learner Routes (`/api/learner`)

**All routes require**: JWT Authentication + Learner Role

### 18. Enroll in Course
- **Method**: `POST`
- **URL**: `/api/learner/enroll`
- **Authentication**: Required (JWT + Learner role)
- **Request Body** (JSON):
```json
{
  "courseId": "course_id_here",
  "bankAccountNumber": "2022331055",
  "secretKey": "your_bank_secret_key"
}
```
- **Response**: `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "message": "Payment successful! Full access granted.",
    "transactionId": "transaction_id"
  }
}
```
- **Note**: This immediately processes payment and grants access

---

### 19. Get My Enrolled Courses
- **Method**: `GET`
- **URL**: `/api/learner/my-courses`
- **Authentication**: Required (JWT + Learner role)
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "courseId": "course_id",
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript from scratch",
      "price": 99.99,
      "instructorName": "Jane Smith",
      "status": "InProgress",
      "progress_percentage": 45,
      "enrolledAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 20. Get Course Content
- **Method**: `GET`
- **URL**: `/api/learner/course/:courseId`
- **Authentication**: Required (JWT + Learner role)
- **URL Parameters**:
  - `courseId`: (string) Course ID
- **Request Body**: None
- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "course": {
      "_id": "course_id",
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript from scratch",
      "instructor": {
        "_id": "instructor_id",
        "fullName": "Jane Smith"
      },
      "videos": [
        {
          "_id": "video_id",
          "title": "Introduction",
          "url": "https://cloudinary_url/video1.mp4",
          "duration_seconds": 120,
          "lastWatchedSeconds": 60,
          "completed": false
        }
      ],
      "resources": [
        {
          "title": "PDF Notes",
          "mediaType": "document_link",
          "url": "https://drive.google.com/file/example"
        }
      ]
    },
    "yourProgress": 45
  }
}
```

---

### 21. Update Video Progress
- **Method**: `POST`
- **URL**: `/api/learner/course/progress`
- **Authentication**: Required (JWT + Learner role)
- **Request Body** (JSON):
```json
{
  "courseId": "course_id_here",
  "videoId": "video_id_here",
  "currentTime": 60,
  "completed": false
}
```
- **Parameters**:
  - `courseId`: (string) Course ID
  - `videoId`: (string) Video ID
  - `currentTime`: (number) Current playback time in seconds
  - `completed`: (boolean) Optional - marks video as completed

- **Response**: `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "message": "Progress updated",
    "progress": 45,
    "status": "InProgress",
    "certificates_earned": []
  }
}


### 22)inside course-router.js
Get Courses Grouped by Title (Category Style)

Method: GET
URL: /api/courses/by-category
Authentication: Not Required (Public)
Query Params: None

Success Response (200 OK)
JSON{
  "statusCode": 200,
  "data": [
    {
      "_id": "React Mastery",
      "totalCourses": 12,
      "totalEnrollments": 842,
      "courses": [
        {
          "_id": "66f8a1b2c9d8e7f2a1b3c4d5",
          "title": "React Mastery",
          "description": "Complete React from zero to hero",
          "price": 2499,
          "enrolledCount": 342,
          "thumbnail": "https://res.cloudinary.com/.../react-thumb.jpg",
          "instructor": {
            "fullName": "Rahim Khan",
            "userName": "rahimdev"
          }
        },
        {
          "_id": "66f8a1b2c9d8e7f2a1b3c4d6",
          "title": "React Mastery",
          "description": "Advanced React with Hooks & Redux",
          "price": 2999,
          "enrolledCount": 500,
          "thumbnail": "https://res.cloudinary.com/.../react2.jpg",
          "instructor": {
            "fullName": "Karim Ahmed",
            "userName": "karim_pro"
          }
        }
      ]
    },
    {
      "_id": "Node.js Backend",
      "totalCourses": 8,
      "totalEnrollments": 567,
      "courses": [ ... ]
    },
    {
      "_id": "Python for Beginners",
      "totalCourses": 5,
      "totalEnrollments": 412,
      "courses": [ ... ]
    }
  ],
  "message": "Courses grouped by category"
}



23)
Get Most Enrolled / Trending Courses

Method: GET
URL: /api/courses/most-enrolled
Authentication: Not Required
Query Params:
limit → optional (default: 6, max: 20)


Request Examples:
text GET /api/courses/most-enrolled
GET /api/courses/most-enrolled?limit=8
Success Response (200 OK) – When there are enrollments
JSON{
  "statusCode": 200,
  "data": [
    {
      "_id": "66f8a1b2c9d8e7f2a1b3c4d7",
      "title": "Complete Web Development Bootcamp",
      "description": "HTML, CSS, JS, Node, React - Full Stack",
      "price": 4999,
      "enrolledCount": 1024,
      "thumbnail": "https://res.cloudinary.com/.../fullstack.jpg",
      "instructor": {
        "fullName": "Sabbir Hossain"
      }
    },
    {
      "_id": "66f8a1b2c9d8e7f2a1b3c4d8",
      "title": "React Mastery",
      "description": "Advanced React with real projects",
      "price": 2499,
      "enrolledCount": 842,
      "thumbnail": "https://res.cloudinary.com/.../react-thumb.jpg",
      "instructor": {
        "fullName": "Rahim Khan"
      }
    }
    /* ... up to limit */
  ],
  "message": "Top courses fetched"
}
Success Response – When NO ONE has enrolled yet (Fallback to Random)
JSON{
  "statusCode": 200,
  "data": [
    {
      "_id": "66f9b3c4d5e6f7g8h9i0j1k2",
      "title": "Python for Data Science",
      "description": "Learn Python, Pandas, NumPy",
      "price": 3499,
      "thumbnail": "https://res.cloudinary.com/.../python.jpg",
      "instructor": {
        "fullName": "Ayesha Siddika"
      }
    },
    /* 3 more random courses */
  ],
  "message": "Top courses fetched"
}


### 24
{
  "statusCode": 200,
  "data": {
    "overview": {
      "totalCourses": 92,
      "totalLearners": 1856,
      "totalInstructors": 38,
      "totalEnrollments": 3241,
      "totalRevenue": 6472000,
      "adminIncome": 1294400,
      "platformCommission": "20%"
    },
    "monthlyRevenueChart": [
      { "month": "Apr 2024", "revenue": 84200, "enrollments": 421 },
      { "month": "May 2024", "revenue": 98500, "enrollments": 492 },
      { "month": "Jun 2024", "revenue": 112300, "enrollments": 561 },
      { "month": "Jul 2024", "revenue": 158900, "enrollments": 794 },
      ...
      { "month": "Mar 2025", "revenue": 198700, "enrollments": 993 }
    ],
    "lastUpdated": "2025-04-05T12:00:00.000Z"
  },
  "message": "Admin dashboard stats fetched successfully"
}


25)get: url:/api/instructor/course/:courseId/details

Get My Course Full Details

Method: GET
URL: /api/instructor/course/66f8a1b2c9d8e7f2a1b3c4d5/details
Auth: Required (JWT + Instructor)
Params: courseId in URL

Success Response (200 OK)
JSON{
  "statusCode": 200,
  "data": {
    "courseId": "66f8a1b2c9d8e7f2a1b3c4d5",
    "title": "Complete React Mastery",
    "description": "Learn React from scratch to advanced level",
    "price": 2999,
    "lumpSumPayment": 2999,
    "createdAt": "2025-03-01T10:00:00Z",
    "updatedAt": "2025-04-05T08:22:11Z",
    "totalEnrolled": 342,
    "instructorEarnings": 719280,
    "totalVideos": 28,
    "totalResources": 12,
    "videos": [
      {
        "videoId": "67a1b2c3d4e5f6g7h8i9j0k1",
        "title": "Introduction to React",
        "url": "https://res.cloudinary.com/.../intro.mp4",
        "duration_seconds": 480
      },
      { ... }
    ],
    "resources": [
      {
        "resourceId": "68b2c3d4e5f6g7h8i9j0k1l2",
        "title": "React Cheat Sheet",
        "mediaType": "document_link",
        "url": "https://drive.google.com/..."
      },
      { ... }
    ]
  },
  "message": "Course details fetched successfully"
}
```
- **Note**: If all videos are completed, course status changes to "Completed" and a certificate is awarded

---

## 🔑 Authentication Headers

For authenticated endpoints, include one of:

1. **Cookie** (automatically set after login):
   - `accessToken: <jwt_token>`

2. **Authorization Header**:
   ```
   Authorization: Bearer <accessToken>
   ```

---

## 📝 Important Notes

1. **Bank Account Setup**: Before signup, ensure bank accounts are seeded. The admin account number is `2022331054`.

2. **File Uploads**: 
   - Maximum file size: 200MB per file
   - Maximum files: 50 files per request
   - Supported formats: Videos (mp4, mov, etc.)

3. **Error Responses**: All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message here"
}
```

4. **Roles**: Three roles are supported:
   - `Admin`
   - `Instructor`
   - `Learner`

5. **Payment Split**: 
   - 80% goes to Instructor
   - 20% goes to Admin

---

## 🧪 Testing with Postman

### Setup:
1. Set base URL: `http://localhost:5000`
2. For authenticated requests, first login and copy the `accessToken` from response
3. Add to Headers: `Authorization: Bearer <accessToken>`

### Example Test Flow:

1. **Signup as Learner**
   - POST `/api/auth/learner/signup`
   - Save the user ID

2. **Login as Learner**
   - POST `/api/auth/learner/login`
   - Copy `accessToken` from response

3. **Get All Courses**
   - GET `/api/course/get-courses`
   - Save a course ID

4. **Enroll in Course**
   - POST `/api/learner/enroll`
   - Include `Authorization: Bearer <accessToken>`

5. **Get Course Content**
   - GET `/api/learner/course/:courseId`
   - Include `Authorization: Bearer <accessToken>`

6. **Update Progress**
   - POST `/api/learner/course/progress`
   - Include `Authorization: Bearer <accessToken>`

---

## 🔧 Environment Variables Required

Make sure these are set in your `.env` file:

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

---

**Last Updated**: 2024-01-01


