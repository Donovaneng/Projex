import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Loader from '../components/ui/Loader';
import { User, Lock, Mail, Phone, Building, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { formatFileUrl } from '../utils/file';

export default function Settings() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [profile, setProfile] = useState({});
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfile(data.user || {});
            } catch (err) {
                setError('Impossible de charger votre profil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setUpdating(true);
        try {
            const data = await userService.updateProfile(profile);
            setSuccess('Profil mis à jour avec succès.');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la mise à jour.');
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (passwords.new !== passwords.confirm) {
            setError('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }
        setUpdating(true);
        try {
            await userService.updatePassword(passwords.old, passwords.new);
            setSuccess('Mot de passe modifié avec succès.');
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex justify-center p-12"><Loader text="Chargement des paramètres..." /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
                <header>
                    <h1 className="text-3xl font-bold text-[#0B1C3F]">Paramètres</h1>
                    <p className="text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
                </header>

                {(error || success) && (
                    <div className={`p-4 rounded-xl border ${error ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                        {error || success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne de gauche : Profil & Avatar */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <Card.Header className="flex items-center gap-2 border-b p-5">
                                <User className="h-5 w-5 text-[#1E4AA8]" />
                                <h2 className="text-lg font-bold">Photo de Profil</h2>
                            </Card.Header>
                            <Card.Content className="p-6 flex flex-col items-center sm:flex-row gap-8">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                                        {profile.image_profil ? (
                                            <img src={formatFileUrl(profile.image_profil)} className="h-full w-full object-cover" alt="Avatar" />
                                        ) : (
                                            <User className="h-10 w-10 text-slate-300" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <p className="text-sm text-slate-500">
                                        Téléchargez une nouvelle photo de profil. Formats supportés : JPG, PNG, WEBP (Max 2Mo).
                                    </p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="file" 
                                            id="avatar-upload" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('avatar', file);
                                                setUpdating(true);
                                                try {
                                                    const res = await userService.uploadAvatar(formData);
                                                    const newPath = res.image_profil;
                                                    setProfile({...profile, image_profil: newPath});
                                                    setUser({...user, image_profil: newPath});
                                                    setSuccess("Photo de profil mise à jour !");
                                                } catch (err) {
                                                    setError(err.response?.data?.error || "Erreur d'upload");
                                                } finally {
                                                    setUpdating(false);
                                                }
                                            }}
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                            loading={updating}
                                        >
                                            Changer la photo
                                        </Button>
                                    </div>
                                </div>
                            </Card.Content>
                        </Card>

                        <Card>
                            <Card.Header className="flex items-center gap-2 border-b p-5">
                                <User className="h-5 w-5 text-[#1E4AA8]" />
                                <h2 className="text-lg font-bold">Informations Personnelles</h2>
                            </Card.Header>
                            <Card.Content className="p-6">
                                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input 
                                        label="Nom" 
                                        value={profile.nom || ''} 
                                        onChange={(e) => setProfile({...profile, nom: e.target.value})}
                                    />
                                    <Input 
                                        label="Prénom" 
                                        value={profile.prenom || ''} 
                                        onChange={(e) => setProfile({...profile, prenom: e.target.value})}
                                    />
                                    <Input 
                                        label="Email" 
                                        type="email"
                                        icon={Mail}
                                        value={profile.email || ''} 
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                    />
                                    <Input 
                                        label="Téléphone" 
                                        icon={Phone}
                                        value={profile.telephone || ''} 
                                        onChange={(e) => setProfile({...profile, telephone: e.target.value})}
                                    />

                                    {/* Champs spécifiques selon le rôle */}
                                    {profile.role === 'ETUDIANT' && (
                                        <>
                                            <Input label="Matricule" value={profile.matricule || ''} disabled />
                                            <Input label="Filière" value={profile.filiere || ''} onChange={(e) => setProfile({...profile, filiere: e.target.value})} />
                                            <Input label="Niveau" value={profile.niveau || ''} disabled />
                                        </>
                                    )}

                                    {profile.role === 'ENCADREUR_PRO' && (
                                        <>
                                            <Input label="Entreprise" icon={Building} value={profile.entreprise || ''} onChange={(e) => setProfile({...profile, entreprise: e.target.value})} />
                                            <Input label="Poste" icon={Briefcase} value={profile.poste || ''} onChange={(e) => setProfile({...profile, poste: e.target.value})} />
                                        </>
                                    )}

                                    {profile.role === 'ENCADREUR_ACAD' && (
                                        <>
                                            <Input label="Département" value={profile.departement || ''} onChange={(e) => setProfile({...profile, departement: e.target.value})} />
                                            <Input label="Grade" value={profile.grade || ''} onChange={(e) => setProfile({...profile, grade: e.target.value})} />
                                        </>
                                    )}

                                    <div className="md:col-span-2 pt-4 border-t">
                                        <Button type="submit" loading={updating} className="bg-[#1E4AA8]">
                                            Enregistrer les modifications
                                        </Button>
                                    </div>
                                </form>
                            </Card.Content>
                        </Card>
                    </div>

                    {/* Colonne de droite : Sécurité & Infos fixes */}
                    <div className="space-y-6">
                        <Card>
                            <Card.Header className="flex items-center gap-2 border-b p-5">
                                <Lock className="h-5 w-5 text-[#1E4AA8]" />
                                <h2 className="text-lg font-bold">Sécurité</h2>
                            </Card.Header>
                            <Card.Content className="p-6">
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <Input 
                                        label="Ancien mot de passe" 
                                        type="password"
                                        value={passwords.old}
                                        onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                                        required
                                    />
                                    <Input 
                                        label="Nouveau mot de passe" 
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        required
                                    />
                                    <Input 
                                        label="Confirmer le nouveau" 
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        required
                                    />
                                    <Button type="submit" variant="outline" className="w-full" loading={updating}>
                                        Modifier le mot de passe
                                    </Button>
                                </form>
                            </Card.Content>
                        </Card>

                        <Card className="bg-slate-50 border-dashed">
                             <Card.Content className="p-6 text-center space-y-3">
                                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <ShieldCheck className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0B1C3F]">Rôle : {profile.role}</p>
                                    <p className="text-xs text-slate-500">Compte vérifié et actif</p>
                                </div>
                             </Card.Content>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
