"use client"

import type React from "react"
import { useAuth } from "@/contexts/AuthContext"
import Layout from "@/components/layout/Layout"
import ProductVariationsList from "@/components/crud/ProductVariationsList"

const UserDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <Layout title="User Dashboard">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.name || user?.email}!</h2>
          <p className="text-gray-600">You can view product variations and filter them by color.</p>
        </div>

        <ProductVariationsList userRole="User" />
      </div>
    </Layout>
  )
}

export default UserDashboard
