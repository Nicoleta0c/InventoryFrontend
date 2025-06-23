"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import AppRouter from "@/components/AppRouter"

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
