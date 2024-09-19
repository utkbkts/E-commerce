import React, { useEffect } from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import HomePage from "./pages/home/HomePage";
import NotFound from "./components/notFound/NotFound";
import { SignUp } from "./pages/signup/SignUp";
import SignIn from "./pages/signin/SignIn";
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/loading/Loading";
import AdminPage from "./pages/admin/AdminPage";
import CategoryPage from "./pages/categoryPage/CategoryPage";
import CartPage from "./pages/cartPage/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/purchasePage/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/purchaseCancelPage/PurchaseCancelPage";

const App = () => {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();
  useEffect(() => {
    checkAuth();
  }, []);
  useEffect(() => {
    if (!user) return;

    getCartItems();
  }, [getCartItems, user]);

  const authRedirect = async () => {
    if (user) {
      return redirect("/");
    }
    return null;
  };

  const adminRedirect = async () => {
    if (user?.user?.role !== "admin") {
      return redirect("/");
    }
    return null;
  };

  if (checkingAuth) return <LoadingSpinner />;
  const router = createBrowserRouter([
    {
      path: "/",
      element: <UserLayout />,
      errorElement: <NotFound />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/signup",
          element: <SignUp />,
          loader: authRedirect,
        },
        {
          path: "/login",
          element: <SignIn />,
          loader: authRedirect,
        },
        {
          path: "/secret-dashboard",
          element: <AdminPage />,
          loader: adminRedirect,
        },
        {
          path: "/category/:category",
          element: <CategoryPage />,
        },
        {
          path: "/purchase-success",
          element: <PurchaseSuccessPage />,
        },
        {
          path: "/purchase-cancel",
          element: <PurchaseCancelPage />,
        },
        {
          path: "/cart",
          element: <CartPage />,
        },
      ],
    },
  ]);

  return (
    <React.Fragment>
      <div>
        <RouterProvider router={router} />
      </div>
    </React.Fragment>
  );
};

export default App;
