import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default function Home() {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has("auth-session")

  if (!isAuthenticated) {
    redirect("/login")
  } else {
    redirect("/dashboard")
  }
}
