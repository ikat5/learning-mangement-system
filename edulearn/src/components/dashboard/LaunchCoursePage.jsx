import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { instructorService } from '../../services/api.js'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Textarea } from '../ui/textarea.jsx'
import { useToast } from '../../hooks/useToast.js'

export const LaunchCoursePage = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    lumpSumPayment: "",
  })

  const [numVideos, setNumVideos] = useState(0)
  const [videos, setVideos] = useState([])

  // 🔥 New Resource Fields
  const [resources, setResources] = useState([])

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const allFilled = videos.every((v) => v.title && v.duration && v.file)
    if (!allFilled) {
      setError("Please complete all video fields before submitting.")
      return
    }

    const cleanedResources = resources
      .map((resource) => ({
        title: resource.title.trim(),
        mediaType: resource.mediaType.trim(),
        url: resource.url.trim(),
      }))
      .filter((resource) => resource.title || resource.mediaType || resource.url)

    const hasIncompleteResource = cleanedResources.some(
      (resource) => !resource.title || !resource.mediaType || !resource.url,
    )
    if (hasIncompleteResource) {
      setError("Please fill every resource field or remove the empty entries.")
      return
    }

    const fd = new FormData()
    fd.append("title", form.title)
    fd.append("description", form.description)
    fd.append("price", form.price)
    fd.append("lumpSumPayment", form.lumpSumPayment)

    fd.append("videoTitles", JSON.stringify(videos.map(v => v.title)))
    fd.append("videoDurations", JSON.stringify(videos.map(v => Number(v.duration))))

    videos.forEach((v) => fd.append("files", v.file))

    if (cleanedResources.length) {
      fd.append("resources", JSON.stringify(cleanedResources))
    }

    try {
      await instructorService.createCourse(fd)
      setSuccess("Course launched successfully!")
      showToast({
        type: 'success',
        title: 'Course created',
        message: 'Your course is live for learners.',
      })
      setTimeout(() => navigate('/dashboard/instructor'), 1500)
    } catch (err) {
      setError(err.message)
      showToast({
        type: 'error',
        title: 'Unable to launch course',
        message: err.message,
      })
    }
  }

  const addResource = () => {
    setResources([...resources, { title: "", mediaType: "", url: "" }])
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Launch New Course</h1>
      <p className="text-slate-500 mb-6">Upload videos and publish your course.</p>

      {error && <div className="p-4 bg-rose-100 text-rose-700 rounded-lg mb-4">{error}</div>}
      {success && <div className="p-4 bg-emerald-100 text-emerald-700 rounded-lg mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">

        <Input placeholder="Course Title" required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <Textarea placeholder="Course Description" rows={3} required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Input type="number" placeholder="Price" required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <Input type="number" placeholder="Lump Sum Payment" required
          value={form.lumpSumPayment}
          onChange={(e) => setForm({ ...form, lumpSumPayment: e.target.value })}
        />

        {/* Number of videos */}
        <div>
          <label className="font-medium">Number of Videos</label>
          <Input
            type="number"
            min="1"
            value={numVideos}
            onChange={(e) => {
              const count = Number(e.target.value)
              setNumVideos(count)
              setVideos(Array.from(
                { length: count },
                () => ({ title: "", duration: "", file: null })
              ))
            }}
          />
        </div>

        {/* Video Upload Boxes */}
        {videos.map((v, i) => (
          <div key={i} className="p-4 border rounded-xl bg-indigo-50/40">
            <h3 className="font-semibold mb-2">Video {i + 1}</h3>

            <Input placeholder="Video Title"
              value={v.title}
              onChange={(e) => {
                const c = [...videos]
                c[i].title = e.target.value
                setVideos(c)
              }}
            />

            <Input type="number" placeholder="Duration (seconds)"
              value={v.duration}
              onChange={(e) => {
                const c = [...videos]
                c[i].duration = e.target.value
                setVideos(c)
              }}
            />

            <input type="file" accept="video/*"
              className="mt-2"
              onChange={(e) => {
                const c = [...videos]
                c[i].file = e.target.files[0]
                setVideos(c)
              }}
            />
          </div>
        ))}

        {/* 🔥 Resource Section */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Additional Resources (Optional)</h2>

          {resources.map((r, i) => (
            <div key={i} className="p-4 border rounded-xl bg-green-50/40 mb-3">
              <Input placeholder="Resource Title"
                value={r.title}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].title = e.target.value
                  setResources(c)
                }}
              />

              <Input placeholder="Media Type (e.g., document_link, pdf, image)"
                value={r.mediaType}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].mediaType = e.target.value
                  setResources(c)
                }}
                className="mt-2"
              />

              <Input placeholder="Resource URL"
                value={r.url}
                onChange={(e) => {
                  const c = [...resources]
                  c[i].url = e.target.value
                  setResources(c)
                }}
                className="mt-2"
              />
            </div>
          ))}

          <Button type="button" onClick={addResource}>
            + Add Resource
          </Button>
        </div>

        <Button type="submit" className="w-full">Launch Course</Button>
      </form>
    </div>
  )
}
