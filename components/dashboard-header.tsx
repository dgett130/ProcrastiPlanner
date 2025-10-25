"use client"

// The dashboard header runs on the client so we can handle click events and navigation.
import Link from "next/link"
import { useRouter } from "next/navigation"
// Radix UI button primitive keeps button styles consistent across the app.
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Icons from lucide-react keep the visual language cohesive (all SVG, same stroke width).
import { User, LogOut, Plus, UserCircle } from "lucide-react"

// Explicit prop typing makes the component self-documenting and type-safe.
interface DashboardHeaderProps {
  userEmail: string
}

export function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    // 1) Clear auth cookies so the session is invalidated on the next request.
    document.cookie = "auth-session=; path=/; max-age=0"
    document.cookie = "user-email=; path=/; max-age=0"
    // 2) Programmatically redirect users to the login page for a clean exit.
    router.push("/login")
    // 3) Force a refresh so all client components re-render without stale auth state.
    router.refresh()
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand anchor always points back to the dashboard home. */}
        <Link href="/dashboard" className="font-bold text-xl">
          Project Manager
        </Link>

        {/* Action toolbar stacks on small screens and keeps spacing consistent with gap utilities. */}
        <div className="flex items-center gap-4">
          {/* CTA to create a new project, kept small to match other actions. */}
          <Button asChild variant="outline" size="sm">
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Progetto
            </Link>
          </Button>

          {/* CTA to log new ideas; mirrors the project button for visual rhythm. */}
          <Button asChild variant="outline" size="sm">
            <Link href="/ideas/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuova Idea
            </Link>
          </Button>

          {/* Profile shortcut appears immediately before logout controls to mirror the requested hierarchy. */}
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            <Link href="/profile" aria-label="Apri il profilo utente dalla dashboard">
              <UserCircle className="h-4 w-4" />
              {/* Hide the label on very small screens to keep the toolbar compact while keeping assistive text. */}
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>

          {/* Dropdown keeps account-specific actions (currently logout) grouped behind a single trigger. */}
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
