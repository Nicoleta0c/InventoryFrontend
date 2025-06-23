"use client"

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import Login from "@/components/auth/Login"
import Register from "@/components/auth/Register"
import UserDashboard from "@/components/dashboards/UserDashboard"
import SellerDashboard from "@/components/dashboards/SellerDashboard"
import AdminDashboard from "@/components/dashboards/AdminDashboard"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

const AppRouter: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const [currentView, setCurrentView] = React.useState<"login" | "register">("register")

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {currentView === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentView === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setCurrentView("register")}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setCurrentView("login")}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {currentView === "login" ? (
              <Login onSwitchToRegister={() => setCurrentView("register")} />
            ) : (
              <Register onSwitchToLogin={() => setCurrentView("login")} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render dashboard based on user role
  switch (user?.role) {
    case "User":
      return <UserDashboard />
    case "Seller":
      return <SellerDashboard />
    case "Admin":
      return <AdminDashboard />
    default:
      return <div>Invalid role</div>
  }
}

export default AppRouter
