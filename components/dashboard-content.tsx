"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"

// Tipi di dati
interface Idea {
  id: string
  title: string
  description: string
  createdAt: string
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  features: string[]
  createdAt: string
}

// Dati di esempio
const mockIdeas: Idea[] = [
  {
    id: "1",
    title: "App per la gestione delle spese",
    description: "Un'applicazione che aiuta a tenere traccia delle spese quotidiane e fornisce report mensili.",
    createdAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    title: "Sistema di prenotazione per ristoranti",
    description:
      "Un sistema che permette ai clienti di prenotare tavoli online e ai ristoranti di gestire le prenotazioni.",
    createdAt: "2023-06-20T14:45:00Z",
  },
]

const mockProjects: Project[] = [
  {
    id: "1",
    title: "E-commerce di prodotti artigianali",
    description: "Piattaforma per la vendita di prodotti artigianali locali con sistema di pagamento integrato.",
    technologies: ["React", "Node.js", "MongoDB"],
    features: ["Carrello", "Pagamenti", "Recensioni"],
    createdAt: "2023-04-10T09:15:00Z",
  },
  {
    id: "2",
    title: "Social network per fotografi",
    description:
      "Piattaforma dove i fotografi possono condividere il loro lavoro e connettersi con altri professionisti.",
    technologies: ["Vue.js", "Firebase", "Cloudinary"],
    features: ["Gallerie", "Commenti", "Profili"],
    createdAt: "2023-07-05T16:20:00Z",
  },
]

export default function DashboardContent() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Simuliamo il caricamento dei dati
    setIdeas(mockIdeas)
    setProjects(mockProjects)
  }, [])

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter((idea) => idea.id !== id))
  }

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id))
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
              <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
            ))}

            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onDelete={deleteIdea} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onDelete={deleteProject} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onDelete={deleteIdea} />
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
        <CardTitle>{project.title}</CardTitle>
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
              {project.features.map((feature) => (
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
          <CardTitle>{idea.title}</CardTitle>
          <Badge>Idea</Badge>
        </div>
        <CardDescription>Creato il {formatDate(idea.createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{idea.description}</p>
      </CardContent>
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
