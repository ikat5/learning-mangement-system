import { useState } from 'react'
import { learnerService } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export const BankSetupModal = ({ isOpen, onClose }) => {
    const [accountNumber, setAccountNumber] = useState('')
    const [secret, setSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const { updateUser } = useAuth()
    const { showToast } = useToast()

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { bank_account_number } = await learnerService.updateBankInfo({
                bankAccountNumber: accountNumber,
                secretKey: secret,
            })
            updateUser({ bank_account_number })
            showToast({ type: 'success', message: 'Bank info updated successfully' })
            onClose()
        } catch (err) {
            showToast({ type: 'error', message: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Setup Bank Information</h2>
                <p className="mb-6 text-sm text-slate-600">
                    To purchase courses, you need to link your bank account.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Account Number
                        </label>
                        <input
                            type="text"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. 1234567890"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            required
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Your bank secret"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
