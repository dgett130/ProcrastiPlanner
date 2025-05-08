import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardContent from "@/components/dashboard-content"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardPage() {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has("auth-session")

  if (!isAuthenticated) {
    redirect("/login")
  }

  const userEmail = cookieStore.get("user-email")?.value || "Utente"

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader userEmail={userEmail} />
      <main className="flex-1 container mx-auto py-6 px-4">
        <DashboardContent />
      </main>
    </div>
  )
}
