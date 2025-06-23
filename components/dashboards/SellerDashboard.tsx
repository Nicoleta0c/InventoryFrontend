"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import Layout from "@/components/layout/Layout"
import ProductsList from "@/components/crud/ProductsList"
import ProductVariationsList from "@/components/crud/ProductVariationsList"
import ColorsList from "@/components/crud/ColorsList"
import PricesList from "@/components/crud/PricesList"
import UsersList from "@/components/crud/UsersList"

const SellerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("products")

  const tabs = [
    { id: "products", label: "Products" },
    { id: "variations", label: "Product Variations" },
    { id: "colors", label: "Colors" },
    { id: "prices", label: "Prices" },
    { id: "users", label: "Users" },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return <ProductsList userRole="Seller" />
      case "variations":
        return <ProductVariationsList userRole="Seller" />
      case "colors":
        return <ColorsList userRole="Seller" />
      case "prices":
        return <PricesList userRole="Seller" />
      case "users":
        return <UsersList userRole="Seller" />
      default:
        return <ProductsList userRole="Seller" />
    }
  }

  return (
    <Layout title="Seller Dashboard">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome, {user?.name || user?.email}!</h2>
          <p className="text-gray-600">Manage your products, variations, colors, prices, and users.</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </Layout>
  )
}

export default SellerDashboard
