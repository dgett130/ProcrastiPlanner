import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Home() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.has("auth-session")

  if (!isAuthenticated) {
    redirect("/login")
  } else {
    redirect("/dashboard")
  }
}
