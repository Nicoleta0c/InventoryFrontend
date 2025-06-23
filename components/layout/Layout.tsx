"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import {Button} from "@/components/ui/button"

interface LayoutProps {
  children: React.ReactNode
  title: string
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name || user?.email} ({user?.role})
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  )
}

export default Layout
