import { useEffect, useState } from "react";
import { instructorService } from "../services/api";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function InstructorAllCoursePage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await instructorService.myCourses();
        setCourses(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) return <p className="text-center py-10">Loading your courses...</p>;
  if (error) return <p className="text-center text-orange-700">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div key={c._id} className="p-5 border rounded-xl shadow-md bg-white">
            <h2 className="text-xl font-semibold">{c.title}</h2>

            <p className="text-sm text-slate-500 mt-1">
              Students Enrolled: <b>{c.studentsEnrolled}</b>
            </p>
            <p className="text-sm text-slate-500">
              Videos: <b>{c.totalVideos}</b>
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Earnings: <b>${c.earningsFromThisCourse}</b>
            </p>

            <Button
              className="w-full"
              onClick={() => navigate(`/instructor/course/${c._id}`)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
