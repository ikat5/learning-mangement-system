📘 LMS Backend API Documentation

Base URL: http://localhost:5000 (or your configured PORT)

Authentication:
Most endpoints require JWT authentication via:

Cookie: accessToken (HTTP-only, set automatically after login)

Header: Authorization: Bearer <accessToken>

📖 Table of Contents

Public & General Routes

Learner Module

Instructor Module

Admin Module

Configuration & Error Handling

🌍 1. Public & General Routes

Routes accessible without login or common to all users.

1.1 Get All Courses

Method: GET

URL: /api/course/get-courses

Authentication: None

Response: 200 OK

{
  "statusCode": 200,
  "data": [
    {
      "_id": "course_id",
      "title": "Introduction to JavaScript",
      "price": 99.99,
      "instructor": { "name": "Jane Smith", "username": "janesmith" },
      "thumbnail": "https://cloudinary_url/video1.mp4"
    }
  ]
}


1.2 Get Courses by Category

Method: GET

URL: /api/courses/by-category

Authentication: None

Response: 200 OK

{
  "statusCode": 200,
  "data": [
    {
      "_id": "React Mastery",
      "totalCourses": 12,
      "courses": [ ... ]
    }
  ]
}


1.3 Get Trending / Most Enrolled

Method: GET

URL: /api/courses/most-enrolled

Query Params: ?limit=6 (optional, default 6)

Authentication: None

Response: 200 OK

{
  "statusCode": 200,
  "data": [
    {
      "_id": "course_id",
      "title": "Complete Web Development Bootcamp",
      "enrolledCount": 1024
    }
  ]
}


👨‍🎓 2. Learner Module

Routes specific to the Student/Learner role.

🔐 Authentication (Learner)

2.1 Learner Signup

Method: POST

URL: /api/auth/learner/signup

Body:

{
  "fullName": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "bank_account_number": "2022331055",
  "bank_secret": "secret_key_here"
}


2.2 Learner Login

Method: POST

URL: /api/auth/learner/login

Body:

{ "email": "john@example.com", "password": "password123" }


2.3 Learner Logout

Method: POST

URL: /api/auth/learner/logout

Auth: JWT Required

📚 Course Actions (Learner)

2.4 Enroll in Course (Purchase)

Method: POST

URL: /api/learner/enroll

Auth: JWT (Learner)

Body:

{
  "courseId": "course_id_here",
  "bankAccountNumber": "2022331055",
  "secretKey": "your_bank_secret_key"
}


Note: Processes payment immediately.

2.5 Get My Enrolled Courses

Method: GET

URL: /api/learner/my-courses

Auth: JWT (Learner)

Response: List of courses with progress_percentage.

2.6 Get Buyable Courses

Method: GET

URL: /api/learner/buyable-course

Auth: JWT (Learner)

Description: Returns courses available for purchase.

2.7 Get Course Player Content

Method: GET

URL: /api/learner/course/:courseId

Auth: JWT (Learner)

Description: Returns full video list, resources, and user's specific progress/last watched time.

2.8 Update Video Progress

Method: POST

URL: /api/learner/course/progress

Auth: JWT (Learner)

Body:

{
  "courseId": "course_id",
  "videoId": "video_id",
  "currentTime": 60,
  "completed": false
}


👨‍🏫 3. Instructor Module

Routes specific to the Teacher/Instructor role.

🔐 Authentication (Instructor)

3.1 Instructor Signup

Method: POST

URL: /api/auth/instructor/signup

Body: Same structure as Learner signup.

3.2 Instructor Login

Method: POST

URL: /api/auth/instructor/login

3.3 Instructor Logout

Method: POST

URL: /api/auth/instructor/logout

🛠 Course Management

3.4 Create Course

Method: POST

URL: /api/instructor/create-course

Auth: JWT (Instructor)

Content-Type: multipart/form-data

Body Fields:

title: String

description: String

price: Number

files: Array of Video Files (Binary)

videoTitles: JSON String Array ["Intro", "Lesson 1"]

videoDurations: JSON Number Array [120, 300] (seconds)

resources: JSON Array (Optional) [{ "title": "Notes", "mediaType": "document_link", "url": "..." }]

3.5 Get My Courses (Dashboard)

Method: GET

URL: /api/instructor/my-courses

Auth: JWT (Instructor)

Response: List of courses with stats (earningsFromThisCourse, studentsEnrolled).

3.6 Get Specific Course Details

Method: GET

URL: /api/instructor/course/:courseId/details

Auth: JWT (Instructor)

Response: Full details including total earnings, video list, and resource list.

3.7 Earnings Chart Data

Method: GET

URL: /api/instructor/total-earning-forChart

Auth: JWT (Instructor)

Response: [{ "courseId": "...", "title": "...", "totalEarning": 3840 }]

3.8 Approve Students (Transaction History)

Method: GET

URL: /api/instructor/approve-students/:courseId

Auth: JWT (Instructor)

Response: List of completed purchase transactions for the course.

✏️ Content Updates

3.9 Add Videos to Existing Course

Method: POST

URL: /api/instructor/:courseId/add-videos

Auth: JWT (Instructor)

Content-Type: multipart/form-data

Body: files (binary), videoTitles (JSON), videoDurations (JSON).

3.10 Add Resources

Method: POST

URL: /api/instructor/:courseId/add-resources

Auth: JWT (Instructor)

Body:

{
  "resources": [
    { "title": "Notes", "mediaType": "document_link", "url": "..." }
  ]
}


3.11 Delete Resource

Method: DELETE

URL: /api/instructor/:courseId/resource/:resourceId

Auth: JWT (Instructor)

👮 4. Admin Module

Routes specific to the System Administrator.

🔐 Authentication (Admin)

4.1 Admin Signup

Method: POST

URL: /api/auth/admin/signup

Note: Admin bank account hardcoded in system logic as 2022331054.

4.2 Admin Login

Method: POST

URL: /api/auth/admin/login

4.3 Admin Logout

Method: POST

URL: /api/auth/admin/logout

📊 Dashboard

4.4 Get Dashboard Stats

Method: GET

URL: /api/admin/dashboard-stats (Suggested Endpoint)

Auth: JWT (Admin)

Response:

{
  "statusCode": 200,
  "data": {
    "overview": {
      "totalRevenue": 6472000,
      "adminIncome": 1294400,
      "platformCommission": "20%"
    },
    "monthlyRevenueChart": [ ... ]
  }
}


5. Configuration & Error Handling

⚠️ Error Response Format

All errors return the following JSON structure:

{
  "statusCode": 400,
  "message": "Error description here"
}


💰 Payment & Commission

Instructor Share: 80%

Admin/Platform Share: 20%

Admin Bank Account: 2022331054

📂 Resource Media Types

Valid values for mediaType in resource objects:

image

text

mcq

audio

document_link

🔧 Environment Variables (.env)

PORT=5000
MONGODB_URL=mongodb://localhost:27017
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
