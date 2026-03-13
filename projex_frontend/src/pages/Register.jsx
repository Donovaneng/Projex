import { useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  GraduationCap,
  Building2,
  Briefcase,
  BookOpen,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Users,
  FileUp,
  FolderKanban,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";
import logo from "../assets/PROJEX.png";

export default function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    password2: "",
    role_demande: "ETUDIANT",
    matricule: "",
    filiere: "",
    niveau: "BTS1",
    entreprise: "",
    poste: "",
    departement: "",
    grade: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordChecks = useMemo(() => {
    const password = formData.password;

    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  }, [formData.password]);

  const passwordStrength = useMemo(() => {
    const checks = Object.values(passwordChecks).filter(Boolean).length;

    if (!formData.password) {
      return { label: "Aucune", width: "w-0", color: "bg-slate-200" };
    }
    if (checks <= 1) {
      return { label: "Faible", width: "w-1/4", color: "bg-red-500" };
    }
    if (checks === 2 || checks === 3) {
      return { label: "Moyenne", width: "w-2/4", color: "bg-amber-500" };
    }
    return { label: "Forte", width: "w-full", color: "bg-emerald-500" };
  }, [passwordChecks, formData.password]);

  const passwordsMatch =
    formData.password2.length > 0 && formData.password === formData.password2;

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isPasswordValid) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
      );
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);

      if (result.success) {
        setSuccess(result.message || "Création du compte réussie.");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(result.error || "Erreur lors de l'inscription.");
      }
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-7xl grid lg:grid-cols-[1.05fr_1fr] rounded-[34px] overflow-hidden border border-[#D9E2F1] bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
        <div className="hidden lg:flex flex-col justify-between bg-[#1E4AA8] text-white p-10 xl:p-12 relative overflow-hidden">
          <div className="absolute top-[-60px] right-[-60px] h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute bottom-[-80px] left-[-80px] h-64 w-64 rounded-full bg-white/10" />

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
                Rejoignez la plateforme
              </p>

              <h1 className="mt-4 text-4xl xl:text-5xl font-bold leading-tight">
                Créez votre
                <br />
                compte PROJEX
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/90">
                Inscrivez-vous pour suivre vos projets académiques, déposer vos
                livrables et collaborer efficacement avec les encadreurs.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              <FeatureCard
                icon={FolderKanban}
                title="Suivi centralisé"
                text="Retrouvez toutes les informations importantes de vos projets dans un seul espace."
              />
              <FeatureCard
                icon={FileUp}
                title="Gestion des livrables"
                text="Déposez vos documents et suivez leur état en toute simplicité."
              />
              <FeatureCard
                icon={Users}
                title="Encadrement structuré"
                text="Facilitez les échanges entre étudiants, encadreurs et administration."
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 flex items-center justify-between text-sm text-white/75">
            <span>© {new Date().getFullYear()} PROJEX</span>
            <span>Simple • Structuré • Professionnel</span>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#FCFDFE] px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
          <div className="w-full max-w-2xl">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-[#D9E2F1] bg-white px-4 py-3 shadow-sm">
                <img src={logo} alt="PROJEX" className="h-9 w-auto" />
                <span className="font-semibold text-[#0B1C3F]">PROJEX</span>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#1E4AA8]">
                Nouveau compte
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1C3F]">
                Inscription
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Renseignez vos informations pour créer votre espace personnel sur
                PROJEX.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-6">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm leading-6">{success}</p>
                    <p className="text-sm text-green-600 mt-1">
                      Redirection vers la page de connexion...
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  icon={User}
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                />
                <InputField
                  icon={User}
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputField
                  icon={Mail}
                  label="Adresse e-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="ex : prince@mail.com"
                />
                <InputField
                  icon={Phone}
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="Optionnel"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Je suis
                </label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    name="role_demande"
                    value={formData.role_demande}
                    onChange={handleChange}
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
                  >
                    <option value="ETUDIANT">Étudiant(e)</option>
                    <option value="ENCADREUR_ACAD">Encadreur académique</option>
                    <option value="ENCADREUR_PRO">Encadreur professionnel</option>
                  </select>
                </div>
              </div>

              {formData.role_demande === "ETUDIANT" && (
                <RoleBlock title="Informations académiques">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InputField
                      icon={BadgeCheck}
                      label="Matricule"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      required
                      placeholder="Matricule"
                    />
                    <InputField
                      icon={BookOpen}
                      label="Filière"
                      name="filiere"
                      value={formData.filiere}
                      onChange={handleChange}
                      required
                      placeholder="Filière"
                    />
                    <SelectField
                      icon={GraduationCap}
                      label="Niveau"
                      name="niveau"
                      value={formData.niveau}
                      onChange={handleChange}
                      options={[
                        { value: "BTS1", label: "BTS 1" },
                        { value: "BTS2", label: "BTS 2" },
                      ]}
                    />
                  </div>
                </RoleBlock>
              )}

              {formData.role_demande === "ENCADREUR_ACAD" && (
                <RoleBlock title="Informations académiques">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      icon={Building2}
                      label="Département"
                      name="departement"
                      value={formData.departement}
                      onChange={handleChange}
                      required
                      placeholder="Département"
                    />
                    <InputField
                      icon={BadgeCheck}
                      label="Grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="Optionnel"
                    />
                  </div>
                </RoleBlock>
              )}

              {formData.role_demande === "ENCADREUR_PRO" && (
                <RoleBlock title="Informations professionnelles">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      icon={Building2}
                      label="Entreprise"
                      name="entreprise"
                      value={formData.entreprise}
                      onChange={handleChange}
                      required
                      placeholder="Entreprise"
                    />
                    <InputField
                      icon={Briefcase}
                      label="Poste"
                      name="poste"
                      value={formData.poste}
                      onChange={handleChange}
                      placeholder="Optionnel"
                    />
                  </div>
                </RoleBlock>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PasswordField
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  show={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                />
                <PasswordField
                  label="Confirmer le mot de passe"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  show={showPassword2}
                  onToggle={() => setShowPassword2((prev) => !prev)}
                />
              </div>

              <PasswordStrength
                checks={passwordChecks}
                strength={passwordStrength}
                passwordsMatch={passwordsMatch}
                hasConfirmation={formData.password2.length > 0}
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E4AA8] px-4 py-3.5 text-sm font-semibold text-white transition shadow-lg shadow-[#1E4AA8]/20 hover:bg-[#173B86] focus:outline-none focus:ring-4 focus:ring-[#1E4AA8]/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    S'inscrire
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-sm text-slate-600 leading-6">
                Vous avez déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#1E4AA8] hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <input
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition shadow-sm placeholder:text-slate-400 focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
        />
      </div>
    </div>
  );
}
function PasswordField({ label, name, value, onChange, show, onToggle }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-800 outline-none transition shadow-sm placeholder:text-slate-400 focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-[#1E4AA8]"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function PasswordStrength({ checks, strength, passwordsMatch, hasConfirmation }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Sécurité du mot de passe</span>
        <span
          className={`font-semibold ${
            strength.label === "Forte"
              ? "text-emerald-600"
              : strength.label === "Moyenne"
              ? "text-amber-600"
              : strength.label === "Faible"
              ? "text-red-600"
              : "text-slate-400"
          }`}
        >
          {strength.label}
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all ${strength.width} ${strength.color}`} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <RuleItem ok={checks.minLength} text="Au moins 8 caractères" />
        <RuleItem ok={checks.uppercase} text="Au moins une majuscule" />
        <RuleItem ok={checks.lowercase} text="Au moins une minuscule" />
        <RuleItem ok={checks.number} text="Au moins un chiffre" />
      </div>

      {hasConfirmation && (
        <div className="mt-3">
          <RuleItem ok={passwordsMatch} text="Les mots de passe correspondent" />
        </div>
      )}
    </div>
  );
}

function RuleItem({ ok, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
        }`}
      >
        {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </span>
      <span className={ok ? "text-slate-700" : "text-slate-500"}>{text}</span>
    </div>
  );
}

function SelectField({ icon: Icon, label, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}

        <select
          name={name}
          value={value}
          onChange={onChange}
          className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#1E4AA8] focus:ring-4 focus:ring-[#1E4AA8]/10"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RoleBlock({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-[#0B1C3F] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/15 p-2.5">
        {Icon && (
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