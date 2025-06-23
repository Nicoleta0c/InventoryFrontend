"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/services/apiService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/ui/Modal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Price {
  id: number
  amount: number
}

interface PricesListProps {
  userRole: "User" | "Seller" | "Admin"
}

const PricesList: React.FC<PricesListProps> = ({ userRole }) => {
  const [prices, setPrices] = useState<Price[]>([])
  const [filteredPrices, setFilteredPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<Price | null>(null)
  const [amount, setAmount] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const canCreate = userRole === "Seller" || userRole === "Admin"
  const canEdit = userRole === "Seller" || userRole === "Admin"
  const canDelete = userRole === "Admin"

  useEffect(() => {
    fetchPrices()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = prices.filter(price =>
        price.id.toString().includes(searchTerm)
      )
      setFilteredPrices(filtered)
    } else {
      setFilteredPrices(prices)
    }
  }, [searchTerm, prices])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPrices()
      setPrices(response)
      setFilteredPrices(response)
    } catch (err) {
      setError("Failed to fetch prices")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const amountValue = parseFloat(amount)
      if (isNaN(amountValue)) {
        throw new Error("Please enter a valid amount")
      }

      if (editingPrice) {
        await apiService.updatePrice(editingPrice.id, { amount: amountValue })
      } else {
        await apiService.createPrice({ amount: amountValue })
      }

      setIsModalOpen(false)
      setEditingPrice(null)
      setAmount("")
      await fetchPrices()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save price")
      console.error(err)
    }
  }

  const handleEdit = (price: Price) => {
    setEditingPrice(price)
    setAmount(price.amount.toString())
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this price?")) return

    try {
      const success = await apiService.deletePrice(id)
      if (success) {
        await fetchPrices()
      } else {
        setError("Price not found")
      }
    } catch (err) {
      setError("Failed to delete price")
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Prices</h3>
        {canCreate && (
          <Button onClick={() => {
            setEditingPrice(null)
            setAmount("")
            setIsModalOpen(true)
          }}>
            Add Price
          </Button>
        )}
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search by ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPrices.map((price) => (
            <li key={price.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">Price ID: {price.id}</h4>
                  <p className="text-gray-600">Amount: {price.amount}</p>
                </div>
                <div className="flex space-x-2">
                  {canEdit && (
                    <Button onClick={() => handleEdit(price)} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={() => handleDelete(price.id)}
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
          setEditingPrice(null)
          setAmount("")
          setError("")
        }}
        title={editingPrice ? "Edit Price" : "Add Price"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setEditingPrice(null)
                setAmount("")
                setError("")
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingPrice ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PricesList
