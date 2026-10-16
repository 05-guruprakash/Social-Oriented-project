import { useEffect, useState } from 'react'
import { useReports } from '../../hooks/useReports'
import { api } from '../../lib/api'

const statusStyles: Record<string, string> = {
  PENDING: 'bg-accent-soft text-paper-stream',
  ACCEPTED: 'bg-accent-soft text-accent',
  IN_PROGRESS: 'bg-accent-soft text-accent',
  CLEANING_COMPLETED: 'bg-accent-soft text-plastic',
  RESOLVED: 'bg-accent-soft text-organic',
  REJECTED: 'bg-accent-soft text-glass',
}

interface Team {
  id: string
  name: string
}

function AllReports() {
  const { reports, loading, assignTeam } = useReports('all')
  const [teams, setTeams] = useState<Team[]>([])
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/cleaning-teams').then((res) => setTeams(res.data)).catch(() => setTeams([]))
  }, [])

  const handleAssign = async (reportId: string) => {
    const teamId = selected[reportId]
    if (!teamId) return
    setBusyId(reportId)
    setError('')
    try {
      await assignTeam(reportId, teamId)
    } catch {
      setError('Could not assign team. Try again.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="text-muted text-sm">Loading...</p>

  return (
    <div>
      <div className="mb-8">
        <span className="label text-accent">Reports</span>
        <h1 className="text-3xl font-black tracking-tighter mt-1">All Reports</h1>
        <p className="text-muted text-sm mt-1">Full history of every report submitted on the platform</p>
      </div>

      {error && <p className="text-sm text-glass mb-3">{error}</p>}

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 label text-muted">ID</th>
                <th className="px-4 py-3 label text-muted">Description</th>
                <th className="px-4 py-3 label text-muted">Reporter</th>
                <th className="px-4 py-3 label text-muted">Location</th>
                <th className="px-4 py-3 label text-muted">Status</th>
                <th className="px-4 py-3 label text-muted">Team</th>
                <th className="px-4 py-3 label text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const teamName = r.assignment?.cleaningTeam?.name
                const canAssign = !r.assignment && r.status === 'PENDING'
                return (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-paper transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted">#{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">{r.description.split(':')[0]}</td>
                    <td className="px-4 py-3 text-muted">{r.reporter?.name || r.reporter?.email || '-'}</td>
                    <td className="px-4 py-3 text-muted">{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</td>
                    <td className="px-4 py-3">
                      <span className={`label px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {teamName ? (
                        <span>{teamName}</span>
                      ) : canAssign ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selected[r.id] || ''}
                            onChange={(e) => setSelected((s) => ({ ...s, [r.id]: e.target.value }))}
                            className="bg-paper border border-line rounded-md px-2 py-1 text-xs"
                          >
                            <option value="">Select team</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(r.id)}
                            disabled={!selected[r.id] || busyId === r.id}
                            className="label px-2 py-1 rounded-md bg-accent text-white disabled:opacity-40"
                          >
                            {busyId === r.id ? '...' : 'Assign'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AllReports