import * as React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {Button} from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RegisterProps {
  onSwitchToLogin: () => void
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    const success = await register(formData.email, formData.password, formData.name)
    if (!success) {
      setError("Registration failed. Please try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      <div className="space-y-1">
        <Label htmlFor="name">Full name</Label>
        <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email address</Label>
        <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}

export default Register
