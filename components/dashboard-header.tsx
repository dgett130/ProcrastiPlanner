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

  const handleProfileNavigation = () => {
    // Keep profile navigation co-located with logout so account tasks stay grouped.
    router.push("/profile")
  }

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

          {/* Dropdown keeps account-specific actions (currently logout) grouped behind a single trigger. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Profile shortcut sits above destructive actions to encourage exploration before exit. */}
              <DropdownMenuItem onClick={handleProfileNavigation}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
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
