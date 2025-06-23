"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/pagination";

interface Product {
  Id: number;
  Name: string;
  Description: string;
  ImageUrl: string;
  Brand: string;
}

const ProductImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-20 w-20 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">
        No image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-20 w-20 object-cover mt-2 rounded-md"
      onError={() => setHasError(true)}
    />
  );
};

const ProductsList = ({ userRole }: { userRole: "User" | "Seller" | "Admin" }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    ImageUrl: "",
    Brand: "",
  });

  const canCreate = userRole === "Seller" || userRole === "Admin";
  const canEdit = canCreate;
  const canDelete = userRole === "Admin";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts({
          pageNumber: currentPage,
          pageSize: 5,
        });

        const { totalPages, products } = response;

        const normalized: Product[] = products.map((p: any) => ({
          Id: p.id ?? p.Id,
          Name: p.name ?? p.Name,
          Description: p.description ?? p.Description,
          ImageUrl: p.imageUrl ?? p.ImageUrl ?? '',
          Brand: p.brand ?? p.Brand,
        }));

        setProducts(normalized);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.Id, {
          Id: editingProduct.Id,
          ...formData,
        });
      } else {
        await apiService.createProduct(formData);
      }

      setIsModalOpen(false);
      setFormData({ Name: "", Description: "", ImageUrl: "", Brand: "" });
      setCurrentPage(1);
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      Name: product.Name,
      Description: product.Description,
      ImageUrl: product.ImageUrl,
      Brand: product.Brand,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiService.deleteProduct(id);
      setProducts(products.filter(p => p.Id !== id));
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <div className="text-red-600 p-2">{error}</div>}

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Products</h1>
        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)}>Add Product</Button>
        )}
      </div>

      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.Id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-4">
                <ProductImage src={product.ImageUrl} alt={product.Name} />
                <div>
                  <h2 className="font-bold">{product.Name}</h2>
                  <p className="text-sm text-gray-600">{product.Description}</p>
                  <p className="text-sm mt-1">Brand: {product.Brand}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(product.Id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.ImageUrl}
              onChange={(e) =>
                setFormData({ ...formData, ImageUrl: e.target.value })
              }
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.Brand}
              onChange={(e) => setFormData({ ...formData, Brand: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsList;
