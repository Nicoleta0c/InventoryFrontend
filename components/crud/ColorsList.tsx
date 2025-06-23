"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "@/services/apiService"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import {Pagination} from "@/components/ui/pagination"

interface Color {
  id: string
  name: string
  hexCode: string
  createdAt: string
}

interface ColorsListProps {
  userRole: "User" | "Seller" | "Admin"
}

const ColorsList: React.FC<ColorsListProps> = ({ userRole }) => {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchColors()
  }, [currentPage])

  const fetchColors = async () => {
    try {
      setLoading(true)
      const response = await apiService.getColors({
        pageNumber: currentPage,
        pageSize: 10,
      })
      setColors(response.data || [])
      setTotalPages(response.totalPages || 1)
    } catch (err) {
      setError("Failed to fetch colors")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Colors</h3>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {colors.map((color) => (
            <li key={color.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{color.name}</h4>
                    <p className="text-sm text-gray-500">{color.hexCode}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}

export default ColorsList
