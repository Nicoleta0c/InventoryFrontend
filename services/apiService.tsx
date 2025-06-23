const BASE_URL = "http://localhost:5292/api";

const getAuthHeaders = (requiresAuth = true) => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
  };
};

interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  brand: string;
  createdAt: string;
}

interface ProductVariation {
  id: number;
  productId: number;
  colorId: number;
  colorName: string;
  createdAt: string;
}

export interface ProductVariationDto {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    brand: string;
  };
  colorName: string;
  priceAmount: number;
}

export interface ProductVariationResponse {
  variations: ProductVariationDto[];
  totalCount: number;
  totalPages: number;
}

interface Price {
  id: number;
  productId: number;
  amount: number;
  currency: string;
  validFrom: string;
  validTo: string;
}

interface Color {
  id: number;
  name: string;
  hexCode: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "User" | "Seller" | "Admin";
}

export const apiService = {
  // Products
  async getProducts(params: { 
    colorFilter?: string; 
    pageNumber?: number; 
    pageSize?: number 
  }): Promise<{ totalPages: number, products: Product[] }> {
    const queryParams = new URLSearchParams();
    if (params.colorFilter) queryParams.append("colorFilter", params.colorFilter);
    queryParams.append("pageNumber", (params.pageNumber || 1).toString());
    queryParams.append("pageSize", (params.pageSize || 10).toString());

    const response = await fetch(`${BASE_URL}/Product?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },

  async getProduct(id: number): Promise<Product | null> {
    const response = await fetch(`${BASE_URL}/Product/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  async createProduct(data: { 
    name: string; 
    description: string; 
    imageUrl: string; 
    brand: string 
  }): Promise<Product> {
    const response = await fetch(`${BASE_URL}/Product`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<void> {
    const response = await fetch(`${BASE_URL}/Product/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Failed to update product");
  },

  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/Product/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete product");
  },

  // Product Variations
  async getProductVariations(): Promise<ProductVariation[]> {
    const response = await fetch(`${BASE_URL}/ProductVariation`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch product variations");
    return response.json();
  },

  async getProductVariationsByColor(colorName: string): Promise<ProductVariationDto[]> {
  const response = await fetch(`${BASE_URL}/ProductVariation/Color/${colorName}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch product variations by color");
  return response.json();
},
  async getProductVariationsDisplay(
    colorName?: string,
    pageNumber: number = 1,
    pageSize: number = 7
  ): Promise<ProductVariationResponse> {
    const queryParams = new URLSearchParams();
    if (colorName) queryParams.append("colorName", colorName);
    queryParams.append("pageNumber", pageNumber.toString());
    queryParams.append("pageSize", pageSize.toString());

    const response = await fetch(`${BASE_URL}/ProductVariation/display?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch product variations display");
    return response.json();
  },

  async getAvailableColors(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/Color/names`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch available colors");
    return response.json();
  },

  async getProductVariation(id: number): Promise<ProductVariation | null> {
    const response = await fetch(`${BASE_URL}/ProductVariation/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  async createProductVariation(data: {
    productId: number;
    colorName: string;
    priceAmount: number;
  }): Promise<ProductVariationDto> {
    const response = await fetch(`${BASE_URL}/ProductVariation`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create product variation");
    return response.json();
  },

  async updateProductVariation(
    id: number,
    data: {
      productId: number;
      colorName: string;
      priceAmount: number;
    }
  ): Promise<ProductVariationDto> {
    const response = await fetch(`${BASE_URL}/ProductVariation/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update product variation");
    return response.json();
  },

  async deleteProductVariation(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/ProductVariation/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete product variation");
  },

  // Prices
  async getPrices(): Promise<Price[]> {
    const response = await fetch(`${BASE_URL}/Price`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch prices");
    return response.json();
  },

  async getPrice(id: number): Promise<Price | null> {
    const response = await fetch(`${BASE_URL}/Price/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  async createPrice(data: Omit<Price, 'id'>): Promise<Price> {
    const response = await fetch(`${BASE_URL}/Price`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create price");
    return response.json();
  },

  async updatePrice(id: number, data: Partial<Price>): Promise<Price> {
    const response = await fetch(`${BASE_URL}/Price/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Failed to update price");
    return response.json();
  },

  async deletePrice(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/Price/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete price");
  },

  // Colors
  async getColors(params: { pageNumber?: number; pageSize?: number } = {}): Promise<{ totalPages: number, colors: Color[] }> {
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    const response = await fetch(`${BASE_URL}/Color?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch colors");
    return response.json();
  },

  async getColor(id: number): Promise<Color | null> {
    const response = await fetch(`${BASE_URL}/Color/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/User/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async getUser(id: string): Promise<User | null> {
    const response = await fetch(`${BASE_URL}/User/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return response.json();
  },

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${BASE_URL}/User/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return response.json();
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${BASE_URL}/User/update`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    if (!response.ok) throw new Error("Failed to update user");
    return response.json();
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/User/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete user");
  },

  async getAdmins(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/User/admins`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch admins");
    return response.json();
  },

  async getSellers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/User/sellers`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch sellers");
    return response.json();
  }
};