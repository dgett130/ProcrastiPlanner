"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Edit, Trash2 } from "lucide-react"
import {useProjects} from "@/app/hooks/useProjects";
import {useRouter} from "next/navigation";

// Tipi di dati
interface Idea {
  id: string
  text: string
  createdAt: string
  projectId?: string
    projectName?: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  functionality: string[]
  ideas?: Idea[]
  createdAt: string
}

interface DashboardContentProps {
  userEmail?: string
}

const WELCOME_FLAG_PREFIX = "dashboard-welcome-toast"

// Configurazione toast di benvenuto
const TOAST_CONFIG = {
  maxShowCount: 3,        // Numero massimo di volte che il toast appare (0 = infinito)
  storageType: 'session', // 'session' = solo per questa sessione browser, 'local' = permanente
  resetDaily: false,      // true = resetta il conteggio ogni giorno
}

export default function DashboardContent({ userEmail }: DashboardContentProps) {

  const { projects, loading, error, deleteProject, isDeleting, deleteError } = useProjects()
  const router = useRouter()

  const ideas = projects.flatMap(p =>
      (p.ideas || []).map(idea => ({
        ...idea,
        projectId: p._id,
        projectName: p.name,
      }))
  )

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storage = TOAST_CONFIG.storageType === 'local' ? window.localStorage : window.sessionStorage
    const storageKey = `${WELCOME_FLAG_PREFIX}-${userEmail ?? "guest"}`

    // Leggi i dati salvati
    const savedData = storage.getItem(storageKey)
    let showCount = 0
    let lastShownDate = ''

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        showCount = parsed.count || 0
        lastShownDate = parsed.date || ''
      } catch {
        // Se il formato è vecchio (solo "true"), resetta
        showCount = 1
      }
    }

    // Controlla se dobbiamo resettare il conteggio (reset giornaliero)
    if (TOAST_CONFIG.resetDaily) {
      const today = new Date().toISOString().split('T')[0]
      if (lastShownDate !== today) {
        showCount = 0
        lastShownDate = today
      }
    }

    // Controlla se abbiamo raggiunto il limite
    if (TOAST_CONFIG.maxShowCount > 0 && showCount >= TOAST_CONFIG.maxShowCount) {
      return
    }

    // Incrementa il conteggio e salva
    showCount++
    storage.setItem(storageKey, JSON.stringify({
      count: showCount,
      date: TOAST_CONFIG.resetDaily ? new Date().toISOString().split('T')[0] : lastShownDate,
    }))

    const friendlyName = userEmail?.split("@")[0] || undefined
    const greetingTitle = friendlyName ? `Ciao, ${friendlyName}! 😊` : "Benvenuto! 😊"

    // Ritardiamo leggermente il toast per dare tempo al Toaster di montarsi
    const timeoutId = setTimeout(() => {
      toast({
        title: greetingTitle,
        description: "Felici di averti qui. Buona giornata e buon lavoro sui tuoi progetti!",
        duration: 3800,
        className:
          "border-emerald-200/70 bg-emerald-50 text-emerald-900 shadow-lg shadow-emerald-200/40 dark:border-emerald-900/60 dark:bg-emerald-950/80 dark:text-emerald-50",
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [userEmail])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-muted-foreground">Caricamento dei tuoi progetti...</p>
    </div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <p className="text-red-600 font-medium">Errore nel caricamento</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  }


  const deleteIdea = (id: string) => {
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);

      router.push('/dashboard');
    } catch (err) {
      console.log('Errore durante l\'eliminazione del progetto:', err);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="projects">Progetti</TabsTrigger>
          <TabsTrigger value="ideas">Idee</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} onDelete={() => handleDeleteProject(project._id)} />
            ))}

            {ideas.map((idea) => (
              <IdeaCard key={idea.projectId} idea={idea} onDelete={deleteIdea} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} onDelete={() => handleDeleteProject(project._id)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.projectId} idea={idea} onDelete={deleteIdea} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>Creato il {formatDate(project.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium mb-1">Funzionalità:</p>
            <ul className="text-xs text-muted-foreground list-disc pl-4">
              {project.functionality.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${project.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(project.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function IdeaCard({ idea, onDelete }: { idea: Idea; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{idea.text}</CardTitle>
          <Badge>Idea</Badge>
        </div>
        <CardDescription>Creato il {formatDate(idea.createdAt)}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/ideas/${idea.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(idea.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
