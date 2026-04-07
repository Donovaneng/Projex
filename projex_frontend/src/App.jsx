import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/auth/Unauthorized";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjectsManagement from "./pages/admin/ProjectsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import AdminDeliverables from "./pages/admin/AdminDeliverables";
import SystemSettings from "./pages/admin/SystemSettings";
import AdminSoutenances from "./pages/admin/Soutenances";
import AdminProjectDetails from "./pages/admin/ProjectDetails";
import AdminEvaluations from "./pages/admin/AdminEvaluations";

import StudentDashboard from "./pages/student/Dashboard";
import StudentProjects from "./pages/student/Projects";
import StudentTasks from "./pages/student/Tasks";
import StudentDeliverables from "./pages/student/Deliverables";
import StudentProjectDetails from "./pages/student/ProjectDetails";

import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import SupervisorProjects from "./pages/supervisor/Projects";
import SupervisorProposals from "./pages/supervisor/Proposals";
import SupervisorEvaluations from "./pages/supervisor/Evaluations";
import SupervisorDeliverables from "./pages/supervisor/Deliverables";
import SupervisorHelp from "./pages/supervisor/Help";
import GlobalMessages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

import DefaultRedirect from "./components/DefaultRedirect";
import LegacyRedirect from "./components/LegacyRedirect";

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
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/projects" element={<AdminProjectsManagement />} />
            <Route path="/admin/projects/:id" element={<AdminProjectDetails />} />
            <Route path="/admin/evaluations" element={<AdminEvaluations />} />
            <Route path="/admin/deliverables" element={<AdminDeliverables />} />
            <Route path="/admin/soutenances" element={<AdminSoutenances />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </Route>

          {/* ETUDIANT */}

          <Route element={<ProtectedRoute allowedRoles={["ETUDIANT"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/projects" element={<StudentProjects />} />
            <Route path="/student/projects/:id" element={<StudentProjectDetails />} />
            <Route path="/student/tasks" element={<StudentTasks />} />
            <Route path="/student/deliverables" element={<StudentDeliverables />} />
          </Route>

          {/* ENCADREURS (ACAD & PRO) */}
          <Route element={<ProtectedRoute allowedRoles={["ENCADREUR_ACAD", "ENCADREUR_PRO"]} />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/proposals" element={<SupervisorProposals />} />
            <Route path="/supervisor/projects" element={<SupervisorProjects />} />
            <Route path="/supervisor/deliverables" element={<SupervisorDeliverables />} />
            <Route path="/supervisor/evaluations" element={<SupervisorEvaluations />} />
            <Route path="/supervisor/help" element={<SupervisorHelp />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ETUDIANT", "ENCADREUR_ACAD", "ENCADREUR_PRO"]} />}>
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/messages" element={<GlobalMessages />} />
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/projex/public/*" element={<LegacyRedirect />} />
          <Route path="/" element={<DefaultRedirect />} />

        </Routes>

      </AuthProvider>

    </Router>

  );

}

export default App;