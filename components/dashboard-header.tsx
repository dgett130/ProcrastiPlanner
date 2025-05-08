"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Plus } from "lucide-react"

interface DashboardHeaderProps {
  userEmail: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Rimuoviamo i cookie di autenticazione
    document.cookie = "auth-session=; path=/; max-age=0"
    document.cookie = "user-email=; path=/; max-age=0"
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="font-bold text-xl">
          Project Manager
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Progetto
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href="/ideas/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Idea
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
