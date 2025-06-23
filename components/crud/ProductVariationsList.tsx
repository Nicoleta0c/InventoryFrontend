import { useState, useEffect } from "react";
import { 
  apiService, 
  ProductVariationDto,
} from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import React from "react";

interface ProductVariationsListProps {
  userRole: "User" | "Seller" | "Admin";
}

const ProductVariationsList: React.FC<ProductVariationsListProps> = ({ userRole }) => {
  const [variations, setVariations] = useState<ProductVariationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariation, setEditingVariation] = useState<ProductVariationDto | null>(null);
  const [colorFilter, setColorFilter] = useState("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    productId: "",
    colorName: "",
    priceAmount: "",
  });

  const canCreate = userRole === "Seller" || userRole === "Admin";
  const canEdit = userRole === "Seller" || userRole === "Admin";
  const canDelete = userRole === "Admin";

  useEffect(() => {
    fetchAvailableColors();
  }, []);

  useEffect(() => {
    fetchVariations();
  }, [currentPage]);

  const fetchVariations = async () => {
    try {
      setLoading(true);
      if (colorFilter.trim()) {
        const filteredVariations = await apiService.getProductVariationsByColor(colorFilter.trim());
        setVariations(filteredVariations);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        const response = await apiService.getProductVariationsDisplay(undefined, currentPage, 7);
        setVariations(response.variations);
        setTotalPages(response.totalPages);
      }
    } catch (err) {
      setError("Failed to fetch product variations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableColors = async () => {
    try {
      const colors = await apiService.getAvailableColors();
      setAvailableColors(colors);
    } catch (err) {
      console.error("Failed to fetch available colors", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const variationData = {
        productId: parseInt(formData.productId),
        colorName: formData.colorName,
        priceAmount: parseFloat(formData.priceAmount),
      };

      if (editingVariation) {
        await apiService.updateProductVariation(editingVariation.id, variationData);
      } else {
        await apiService.createProductVariation(variationData);
      }

      setIsModalOpen(false);
      setEditingVariation(null);
      setFormData({ productId: "", colorName: "", priceAmount: "" });
      fetchVariations();
    } catch (err) {
      setError("Failed to save product variation");
      console.error(err);
    }
  };

  const handleEdit = (variation: ProductVariationDto) => {
    setEditingVariation(variation);
    setFormData({
      productId: variation.product.id.toString(),
      colorName: variation.colorName,
      priceAmount: variation.priceAmount.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product variation?")) return;
    try {
      await apiService.deleteProductVariation(id);
      fetchVariations();
    } catch (err) {
      setError("Failed to delete product variation");
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterClick = () => {
    setCurrentPage(1);
    fetchVariations();
  };

  const handleClearFilter = () => {
    setColorFilter("");
    setCurrentPage(1);
    fetchVariations();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Product Variations</h3>
        {canCreate && <Button onClick={() => setIsModalOpen(true)}>Add Variation</Button>}
      </div>

      <div className="flex space-x-4 items-end">
        <div className="flex flex-col w-full">
          <div className="relative">
            <Input
              list="colorOptions"
              id="colorFilter"
              type="text"
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              placeholder="Filter by color name"
            />
            <datalist id="colorOptions">
              {availableColors.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>
          </div>
        </div>
        <Button onClick={handleFilterClick}>Filter</Button>
        {colorFilter && (
          <Button variant="ghost" onClick={handleClearFilter}>
            Clear
          </Button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {variations.map((variation) => (
            <li key={variation.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Product</p>
                      <p className="text-gray-900">{variation.product.name}</p>
                      <p className="text-sm text-gray-500">{variation.product.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-gray-900">{variation.product.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Color</p>
                      <p className="text-gray-900">{variation.colorName}</p>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-gray-900">${variation.priceAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <img
                        src={variation.product.imageUrl}
                        alt={variation.product.name}
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {canEdit && (
                    <Button onClick={() => handleEdit(variation)} variant="outline" size="sm">
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      onClick={() => handleDelete(variation.id)}
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVariation(null);
          setFormData({ productId: "", colorName: "", priceAmount: "" });
        }}
        title={editingVariation ? "Edit Product Variation" : "Add Product Variation"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              name="productId"
              type="number"
              value={formData.productId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="colorName">Color Name</Label>
            <Input
              id="colorName"
              name="colorName"
              type="text"
              value={formData.colorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceAmount">Price</Label>
            <Input
              id="priceAmount"
              name="priceAmount"
              type="number"
              step="0.01"
              value={formData.priceAmount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingVariation ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductVariationsList;
