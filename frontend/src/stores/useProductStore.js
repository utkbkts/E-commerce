import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";
export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),

  createProducts: async (productData) => {
    set({ loading: false });
    console.log(productData);

    try {
      const res = await axios.post("/products/admin/create", productData);

      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));

      toast.success("Create is successful");
    } catch (error) {
      set({ loading: false });
      console.log(error.response.data.message);
      toast.error(error?.response?.data?.message);
    }
  },
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/admin/getAll");

      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      console.log(error.response.data.message);
    }
  },
  fetchAllCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      console.log(error.response.data.message);
    }
  },
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.put(`/products/admin/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (item) => item._id !== productId
        ),
        loading: false,
      }));
    } catch (error) {
      toast.error(error.repsonse.data.message);
    }
  },
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));
