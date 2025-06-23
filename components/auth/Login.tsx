"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginProps {
  onSwitchToRegister: () => void
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "User",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(formData.email, formData.password, formData.role)
    if (!success) {
      setError("Invalid credentials")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-500"
        >
          <option value="User">User</option>
          <option value="Seller">Seller</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-sm text-center">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={onSwitchToRegister}
        >
          Register here
        </button>
      </p>
    </form>
  )
}

export default Login
