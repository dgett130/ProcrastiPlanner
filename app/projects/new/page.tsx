"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"

export default function NewProjectPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [technology, setTechnology] = useState("")
  const [technologies, setTechnologies] = useState<string[]>([])
  const [feature, setFeature] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addTechnology = () => {
    if (technology.trim() !== "" && !technologies.includes(technology.trim())) {
      setTechnologies([...technologies, technology.trim()])
      setTechnology("")
    }
  }

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const addFeature = () => {
    if (feature.trim() !== "" && !features.includes(feature.trim())) {
      setFeatures([...features, feature.trim()])
      setFeature("")
    }
  }

  const removeFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simuliamo un ritardo per il salvataggio
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In una vera applicazione, qui salveremmo i dati nel database
    console.log({
      title,
      description,
      technologies,
      features,
      createdAt: new Date().toISOString(),
    })

    setIsSubmitting(false)
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Nuovo Progetto</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Dettagli del progetto</CardTitle>
              <CardDescription>Inserisci le informazioni per il tuo nuovo progetto</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci il titolo del progetto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi il tuo progetto"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tecnologie</Label>
                <div className="flex gap-2">
                  <Input
                    value={technology}
                    onChange={(e) => setTechnology(e.target.value)}
                    placeholder="Aggiungi una tecnologia"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTechnology()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTechnology} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(tech)}
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Funzionalità</Label>
                <div className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => setFeature(e.target.value)}
                    placeholder="Aggiungi una funzionalità"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addFeature()
                      }
                    }}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  {features.map((feat) => (
                    <div key={feat} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(feat)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvataggio..." : "Salva Progetto"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
