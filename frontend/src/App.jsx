import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function App() {
  const { initAuth, authChecked } = useAuthStore();

  // app khulte hi refresh cookie se naya access token lo
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // jab tak check na ho jaye, kuch render mat karo
  // (warna reload pe ek second ke liye /login pe redirect ho jayega)
  if (!authChecked) return null;

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/create" element={<PrivateRoute element={<CreatePage />} />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;