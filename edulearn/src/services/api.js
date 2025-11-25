import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edulearn_token')
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const handleRequest = async (promise) => {
  try {
    const { data } = await promise
    return data?.data || data
  } catch (err) {
    const message = err?.response?.data?.message || 'Unable to reach server'
    throw new Error(message)
  }
}

export const courseService = {
  getAll: () => handleRequest(api.get('/course/get-courses')),
  getMostViewed: (limit) =>
    handleRequest(api.get('/course/most-enrolled', { params: { limit } })),
  getByTitleGroup: () => handleRequest(api.get('/course/by-category')),
}

export const learnerService = {
  enroll: (payload) => handleRequest(api.post('/learner/enroll', payload)),
  myCourses: () => handleRequest(api.get('/learner/my-courses')),
  courseContent: (courseId) =>
    handleRequest(api.get(`/learner/course/${courseId}`)),
  updateProgress: (payload) =>
    handleRequest(api.post('/learner/course/progress', payload)),
}

export const instructorService = {
  createCourse: (formData) =>
    handleRequest(
      api.post('/instructor/create-course', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  addVideos: (courseId, formData) =>
    handleRequest(
      api.post(`/instructor/${courseId}/add-videos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
  addResources: (courseId, resources) =>
    handleRequest(api.post(`/instructor/${courseId}/add-resources`, resources)),
  deleteVideo: (courseId, videoId) =>
    handleRequest(api.delete(`/instructor/${courseId}/video/${videoId}`)),
  deleteResource: (courseId, resourceId) =>
    handleRequest(api.delete(`/instructor/${courseId}/resource/${resourceId}`)),
  stats: () => handleRequest(api.get('/instructor/my-courses')),
  courseDetails: (courseId) =>
    handleRequest(api.get(`/instructor/course/${courseId}/details`)),
  approvedStudents: (courseId) =>
    handleRequest(api.get(`/instructor/approve-students/${courseId}`)),
}

export const adminService = {
  stats: () => handleRequest(api.get('/admin/stats')),
}

export default api

