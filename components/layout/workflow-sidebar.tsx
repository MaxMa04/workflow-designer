'use client'

import { useState, useEffect } from 'react'
import { Plus, MoreVertical, Trash2, Copy, Workflow, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWorkflowStore } from '@/stores/workflow-store'
import { cn } from '@/lib/utils'

const VOICE_BOT_API = 'http://localhost:8000'

interface Patient {
  patient_id: string
  vorname: string
  nachname: string
  geburtsdatum: string
  versicherungsart: string
}

interface WorkflowSidebarProps {
  className?: string
}

export function WorkflowSidebar({ className }: WorkflowSidebarProps) {
  const {
    workflows,
    currentWorkflowId,
    createWorkflow,
    selectWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
  } = useWorkflowStore()

  const [activeTab, setActiveTab] = useState<'workflows' | 'patients'>('workflows')
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Patient state
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [patientsError, setPatientsError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (activeTab === 'patients' && patients.length === 0 && !patientsLoading && !patientsError) {
      fetchPatients()
    }
  }, [activeTab])

  useEffect(() => {
    const q = patientSearch.toLowerCase()
    if (!q) {
      setFilteredPatients(patients)
      return
    }
    setFilteredPatients(
      patients.filter(
        (p) =>
          p.nachname.toLowerCase().includes(q) ||
          p.vorname.toLowerCase().includes(q) ||
          p.geburtsdatum.includes(q)
      )
    )
  }, [patientSearch, patients])

  async function fetchPatients() {
    setPatientsLoading(true)
    setPatientsError(false)
    try {
      const res = await fetch(`${VOICE_BOT_API}/api/patients`)
      const data = await res.json()
      setPatients(data.patients)
      setFilteredPatients(data.patients)
    } catch {
      setPatientsError(true)
    } finally {
      setPatientsLoading(false)
    }
  }

  const handleCreate = () => {
    if (newWorkflowName.trim()) {
      createWorkflow(newWorkflowName.trim())
      setNewWorkflowName('')
      setDialogOpen(false)
    }
  }

  return (
    <aside className={cn('flex flex-col bg-muted/30', className)}>
      {/* Tab Bar */}
      <div className="flex border-b shrink-0">
        <button
          onClick={() => setActiveTab('workflows')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
            activeTab === 'workflows'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Workflow className="h-4 w-4" />
          Workflows
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors',
            activeTab === 'patients'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="h-4 w-4" />
          Praxisdaten
        </button>
      </div>

      {/* Tab: Workflows */}
      {activeTab === 'workflows' && (
        <>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {mounted && workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer group',
                  'hover:bg-muted transition-colors',
                  currentWorkflowId === workflow.id && 'bg-muted'
                )}
                onClick={() => selectWorkflow(workflow.id)}
              >
                <span className="text-sm truncate flex-1">{workflow.name}</span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateWorkflow(workflow.id)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteWorkflow(workflow.id)
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {mounted && workflows.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No workflows yet
              </p>
            )}

            {!mounted && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Loading...
              </p>
            )}
          </div>

          <div className="p-4 border-t">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Workflow name"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    autoFocus
                  />
                  <Button onClick={handleCreate} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      )}

      {/* Tab: Praxisdaten */}
      {activeTab === 'patients' && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-2 border-b shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Name suchen..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {patientsLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">Laden...</p>
            )}

            {patientsError && (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-destructive">Voice Bot nicht erreichbar</p>
                <Button variant="outline" size="sm" onClick={fetchPatients}>
                  Erneut versuchen
                </Button>
              </div>
            )}

            {!patientsLoading && !patientsError && filteredPatients.map((p) => (
              <div
                key={p.patient_id}
                className="px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium truncate">
                    {p.nachname}, {p.vorname}
                  </span>
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0',
                    p.versicherungsart === 'PKV'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  )}>
                    {p.versicherungsart}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p.geburtsdatum}</p>
              </div>
            ))}

            {!patientsLoading && !patientsError && filteredPatients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Patienten gefunden
              </p>
            )}
          </div>

          {!patientsLoading && !patientsError && (
            <div className="p-3 border-t shrink-0">
              <p className="text-xs text-muted-foreground text-center">
                {filteredPatients.length} von {patients.length} Patienten
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
