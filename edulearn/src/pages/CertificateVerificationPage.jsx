import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { certificateService } from '../services/api.js'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'

export const CertificateVerificationPage = () => {
    const { serialNumber } = useParams()
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const check = async () => {
            try {
                setLoading(true)
                const data = await certificateService.verify(serialNumber)
                setResult(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        check()
    }, [serialNumber])

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
                {result && result.valid ? (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Valid Certificate</h1>
                        <p className="mt-2 text-slate-500">
                            This certificate was issued by EduLearn to verify course completion.
                        </p>

                        <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6 text-left">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-400">Learner</p>
                                <p className="font-semibold text-slate-900">{result.details.learnerName}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-slate-400">Course</p>
                                <p className="font-semibold text-slate-900">{result.details.courseTitle}</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Issued On</p>
                                    <p className="font-semibold text-slate-900">
                                        {new Date(result.details.issueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Certificate ID</p>
                                    <p className="font-mono font-medium text-slate-600">{result.details.serialNumber}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Invalid or Revoked</h1>
                        <p className="mt-2 text-slate-500">
                            {error || "We could not verify this certificate. It may be invalid or has been revoked."}
                        </p>
                    </>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link to="/">
                        <Button variant="outline">Back to EduLearn</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
