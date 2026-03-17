import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  FolderKanban,
  FileUp,
  Users,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/projex.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";
  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Bonjour"
      : hour >= 12 && hour < 18
      ? "Bon après-midi"
      : hour >= 18 && hour < 22
      ? "Bonsoir"
      : "Bonne nuit";

  const subtitle =
    hour >= 5 && hour < 12
      ? "Commencez votre journée avec une vue claire sur vos projets académiques."
      : hour >= 12 && hour < 18
      ? "Gardez le cap sur vos livrables et l’évolution de vos travaux."
      : hour >= 18 && hour < 22
      ? "Finalisez vos tâches et consultez vos avancées en toute sérénité."
      : "Accédez à votre espace et poursuivez votre travail à votre rythme.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // si une route de provenance est fournie, on y retourne
        if (from && from !== "/" && from !== "/login") {
          navigate(from, { replace: true });
        } else if (result.user) {
          // sinon, redirection selon le rôle
          const role = (result.user.role || '').toUpperCase();
          switch (role) {
            case 'ADMIN':
              navigate('/admin/dashboard', { replace: true });
              break;
            case 'ETUDIANT':
              navigate('/student/dashboard', { replace: true });
              break;
            case 'ENCADREUR_ACAD':
            case 'ENCADREUR_PRO':
              navigate('/supervisor/dashboard', { replace: true });
              break;
            default:
              navigate('/login', { replace: true });
          }
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError(result.error || "Identifiants invalides.");
      }
    } catch  {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        if (result.flow === "LOGIN") {
          // Redirection selon le rôle
          const role = (result.user.role || "").toUpperCase();
          switch (role) {
            case "ADMIN":
              navigate("/admin/dashboard", { replace: true });
              break;
            case "ETUDIANT":
              navigate("/student/dashboard", { replace: true });
              break;
            case 'ENCADREUR_ACAD':
            case 'ENCADREUR_PRO':
              navigate('/supervisor/dashboard', { replace: true });
              break;
            default:
              navigate("/", { replace: true });
          }
        } else if (result.flow === "REGISTER") {
          // Rediriger vers l'inscription avec les données Google
          navigate("/register", { state: { googleData: result.googleData } });
        }
      } else {
        setError(result.error || "Erreur lors de l'authentification Google.");
      }
    } catch {
      setError("Une erreur est survenue avec Google OAuth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] rounded-[34px] overflow-hidden border border-[#D9E2F1] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
        <div className="hidden lg:flex flex-col justify-between bg-[#1E4AA8] text-white p-10 xl:p-12 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute bottom-[-80px] left-[-80px] h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute top-1/3 right-10 h-24 w-24 rounded-full border border-white/10" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <img src={logo} alt="PROJEX" className="h-10 w-auto" />
              <div>
             
                <p className="text-xs text-white/75">
                  Plateforme de gestion académique
                </p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm uppercase tracking-[0.25em] text-white/65">
                Espace intelligent
              </p>

              <h1 className="mt-4 text-4xl xl:text-5xl font-bold leading-tight">
                {greeting},
                <br />
                bienvenue !
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/90">
                {subtitle}
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              <FeatureCard
                icon={FolderKanban}
                title="Suivi des projets"
                text="Visualisez l’avancement global de vos projets et suivez les étapes importantes."
              />
              <FeatureCard
                icon={FileUp}
                title="Gestion des livrables"
                text="Déposez, organisez et consultez vos fichiers dans un espace structuré."
              />
              <FeatureCard
                icon={Users}
                title="Collaboration fluide"
                text="Facilitez les échanges entre étudiants, encadreurs et administration."
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center justify-between text-sm text-white/75">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Accès sécurisé</span>
            </div>
            <span>© {new Date().getFullYear()} PROJEX</span>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#FCFDFE] px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#D9E2F1] bg-white px-4 py-3 shadow-sm">
                <img src={logo} alt="PROJEX" className="h-9 w-auto" />
                <span className="font-semibold text-[#0B1C3F]">PROJEX</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#1E4AA8]">{greeting}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1C3F]">
                Connexion à votre espace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entrez vos identifiants pour accéder à votre tableau de bord
                et retrouver l’ensemble de vos activités PROJEX.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-6">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Adresse e-mail
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex : prince@mail.com"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition shadow-sm placeholder:text-slate-400 focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Mot de passe
                  </label>

                  <button
                    type="button"
                    className="text-sm font-medium text-[#1E4AA8] transition hover:text-[#173B86] hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition shadow-sm placeholder:text-slate-400 focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-[#1E4AA8]"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#1E4AA8] focus:ring-[#1E4AA8]"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <span className="text-slate-400">Connexion protégée</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E4AA8] px-4 py-3.5 text-sm font-semibold text-white transition shadow-lg shadow-[#1E4AA8]/20 hover:bg-[#173B86] focus:outline-none focus:ring-4 focus:ring-[#1E4AA8]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#FCFDFE] px-4 text-slate-400 font-medium">Ou continuer avec</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("La connexion Google a échoué.")}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="360"
                />
              </div>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-600 leading-6">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#1E4AA8] hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/15 p-2.5">
        { Icon && (
          <Icon className="h-5 w-5 text-white" />
        )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-white/80">{text}</p>
        </div>
      </div>
    </div>
  );
}