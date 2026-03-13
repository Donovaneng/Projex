import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/auth/Unauthorized";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/Dashboard";
import EncadreurAcadDashboard from "./pages/encadreur-acad/Dashboard";
import EncadreurProDashboard from "./pages/encadreur-pro/Dashboard";

import DefaultRedirect from "./components/DefaultRedirect";

function App() {

  return (

    <Router>

      <AuthProvider>

        <Routes>

          {/* Routes publiques */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN */}

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* ETUDIANT */}

          <Route element={<ProtectedRoute allowedRoles={["ETUDIANT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* ENCADREUR ACAD */}

          <Route element={<ProtectedRoute allowedRoles={["ENCADREUR_ACAD"]} />}>
            <Route path="/encadreur-acad/dashboard" element={<EncadreurAcadDashboard />} />
          </Route>

          {/* ENCADREUR PRO */}

          <Route element={<ProtectedRoute allowedRoles={["ENCADREUR_PRO"]} />}>
            <Route path="/encadreur-pro/dashboard" element={<EncadreurProDashboard />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/" element={<DefaultRedirect />} />

        </Routes>

      </AuthProvider>

    </Router>

  );

}

export default App;