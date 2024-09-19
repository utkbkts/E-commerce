import { useState } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Upload, X } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";
const inputForm = [
  {
    id: 1,
    type: "text",
    name: "name",
    label: "Product Name",
  },
  {
    id: 2,
    type: "text",
    name: "description",
    label: "Product Description",
  },
  {
    id: 3,
    type: "number",
    name: "price",
    label: "Product Price",
  },
  {
    id: 4,
    type: "text",
    name: "category",
    label: "Product Category",
  },
  {
    id: 5,
    type: "file",
    name: "image",
    label: "Product Image",
  },
];
const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const { createProducts, loading } = useProductStore();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProducts(newProduct);
      // setNewProduct({
      //   name: "",
      //   description: "",
      //   price: "",
      //   category: "",
      //   image: "",
      // });
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">
        Create New Product
      </h2>
      <form onSubmit={handleSubmit}>
        {inputForm.map((item) => (
          <div key={item.id}>
            <label
              className="block text-sm font-medium text-gray-300 pt-1 pb-1"
              htmlFor={item.name}
            >
              {item.label}
            </label>
            {item.name === "description" ? (
              <textarea
                type={item.type}
                name={item.name}
                id={item.name}
                value={newProduct[item.name]}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            ) : item.name === "image" ? (
              <div className="pt-2 ">
                <input
                  type={item.type}
                  name={item.name}
                  id={item.name}
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor={item.name}
                  className="cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500"
                >
                  <Upload className="h-5 w-5 inline-block mr-2 mb-1" />
                  Upload Image
                </label>
                {newProduct.image && (
                  <div className="relative">
                    <img src={newProduct.image} alt="" className=" pt-4" />
                    <X
                      className="absolute -top-4 right-0 cursor-pointer w-5 h-5"
                      onClick={() =>
                        setNewProduct((prevState) => ({
                          ...prevState,
                          image: "",
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              <input
                type={item.type}
                name={item.name}
                value={newProduct[item.name]}
                onChange={handleInputChange}
                id={item.name}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            )}
          </div>
        ))}
        <button
          className="py-2 px-3 w-full justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 mt-4 flex items-center"
          type="submit"
        >
          {loading ? (
            <>
              {" "}
              <Loader className="mr-2 h-5 w-5 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
