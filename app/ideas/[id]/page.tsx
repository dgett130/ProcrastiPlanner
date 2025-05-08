"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Tipo di dati per l'idea
interface Idea {
  id: string
  title: string
  description: string
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

export default function EditIdeaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuliamo il caricamento dei dati
    const fetchIdea = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const foundIdea = mockIdeas.find((i) => i.id === params.id)

      if (foundIdea) {
        setIdea(foundIdea)
        setTitle(foundIdea.title)
        setDescription(foundIdea.description)
      } else {
        router.push("/dashboard")
      }

      setIsLoading(false)
    }

    fetchIdea()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuliamo un ritardo per il salvataggio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In una vera applicazione, qui salveremmo i dati nel database
    console.log({
      id: params.id,
      title,
      description,
      updatedAt: new Date().toISOString(),
    })

    setIsSubmitting(false)
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[60vh]">
        <p>Caricamento in corso...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Modifica Idea</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Dettagli dell'idea</CardTitle>
              <CardDescription>Modifica le informazioni della tua idea</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci il titolo dell'idea"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi la tua idea"
                  rows={6}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
