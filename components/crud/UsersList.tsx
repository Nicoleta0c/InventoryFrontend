"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "@/services/apiService"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import Modal from "@/components/ui/Modal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface UsersListProps {
  userRole: "User" | "Seller" | "Admin"
}

const UsersList: React.FC<UsersListProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "User",
  })

  const canCreate = userRole === "Seller" || userRole === "Admin"
  const canEdit = userRole === "Seller" || userRole === "Admin"
  const canDelete = userRole === "Admin"

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers()
      setUsers(response || [])
    } catch (err) {
      setError("Failed to fetch users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await apiService.updateUser(editingUser.id, formData)
      } else {
        await apiService.createUser(formData)
      }

      setIsModalOpen(false)
      setEditingUser(null)
      setFormData({ name: "", email: "", password: "", role: "User" })
      fetchUsers()
    } catch (err) {
      setError("Failed to save user")
      console.error(err)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await apiService.deleteUser(id)
      fetchUsers()
    } catch (err) {
      setError("Failed to delete user")
      console.error(err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Users</h3>
        {canCreate && <Button onClick={() => setIsModalOpen(true)}>Add User</Button>}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
                <div className="flex space-x-2">
                  {canEdit && (
                    <Button onClick={() => handleEdit(user)} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
          setFormData({ name: "", email: "", password: "", role: "User" })
        }}
        title={editingUser ? "Edit User" : "Add User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
         <Input //label="Name" 
         type="text" name="name" value={formData.name} onChange={handleChange} required />
         <Input //label="Email" 
         type="email" name="email" value={formData.email} onChange={handleChange} required />
          <Input
           // label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!editingUser}
            placeholder={editingUser ? "Leave blank to keep current password" : ""}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="User">User</option>
              <option value="Seller">Seller</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingUser ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsersList
