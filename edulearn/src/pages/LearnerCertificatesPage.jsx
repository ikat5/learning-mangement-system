import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { learnerService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'

export const LearnerCertificatesPage = () => {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.certificates()
        setCertificates(Array.isArray(data) ? data : [])
      } catch (err) {
        showToast({ type: 'error', title: 'Unable to load certificates', message: err.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const handleDownload = async (certificateId, courseTitle) => {
    try {
      const blob = await learnerService.downloadCertificate(certificateId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${courseTitle || 'certificate'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      showToast({ type: 'success', title: 'Download started', message: 'Your certificate is downloading.' })
    } catch (err) {
      showToast({ type: 'error', title: 'Download failed', message: err.message })
    }
  }

  if (loading) {
    return <div className="px-6 py-12 text-center text-slate-500">Loading certificates...</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Achievements</p>
          <h1 className="text-3xl font-semibold text-slate-900">Your certificates</h1>
          <p className="text-sm text-slate-500">Download and share the certificates you have earned.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/learner')}>
          Back to dashboard
        </Button>
      </div>

      <DashboardSection
        title="Issued certificates"
        description="Generated automatically after you complete a course."
        className="bg-white/90"
      >
        {certificates.length ? (
          <div className="grid items-stretch gap-4 md:grid-cols-2">
            {certificates.map((cert) => (
              <div key={cert.certificateId} className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{cert.certificateId}</p>
                  <h3 className="text-xl font-semibold text-slate-900">{cert.courseTitle}</h3>
                  <p className="text-sm text-slate-500">Issued to {cert.learnerName}</p>
                  <p className="text-xs text-slate-400">
                    Issued on {cert.generatedAt ? new Date(cert.generatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => handleDownload(cert.certificateId, cert.courseTitle)}>Download PDF</Button>
                  {cert.downloadPath && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`${apiBaseUrl}${cert.downloadPath}`, '_blank')}
                    >
                      Open in browser
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            No certificates yet. Complete a course to unlock your first certificate.
          </div>
        )}
      </DashboardSection>
    </div>
  )
}

export default LearnerCertificatesPage
