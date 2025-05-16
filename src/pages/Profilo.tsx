import { useState, useEffect } from 'react';
import { supabase, type Job } from '../lib/supabase';
import { toast } from 'react-toastify';
import { User, Save, Plus, Trash2, Briefcase } from 'lucide-react';

function Profilo() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJobNome, setNewJobNome] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  useEffect(() => {
    loadProfile();
    loadJobs();
  }, []);
  
  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      setUserId(user.id);
      setEmail(user.email || '');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setNome(data.nome || '');
        setCognome(data.cognome || '');
      }
    } catch (error: any) {
      toast.error('Errore durante il caricamento del profilo: ' + error.message);
    }
  };
  
  const loadJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error: any) {
      toast.error('Errore durante il caricamento dei lavori: ' + error.message);
    }
  };
  
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('Utente non trovato');
      return;
    }
    
    setLoading(true);
    
    try {
      const updates = {
        id: userId,
        nome,
        cognome,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(updates);
        
      if (error) {
        throw error;
      }
      
      toast.success('Profilo aggiornato con successo');
    } catch (error: any) {
      toast.error('Errore durante l\'aggiornamento del profilo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Email di reset password inviata');
    } catch (error: any) {
      toast.error('Errore durante l\'invio dell\'email di reset: ' + error.message);
    }
  };
  
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingJobs(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { error } = await supabase
        .from('jobs')
        .insert({
          nome: newJobNome,
          user_id: user.id
        });
        
      if (error) throw error;
      
      toast.success('Lavoro aggiunto con successo');
      setNewJobNome('');
      setShowAddJob(false);
      loadJobs();
    } catch (error: any) {
      toast.error('Errore durante l\'aggiunta del lavoro: ' + error.message);
    } finally {
      setLoadingJobs(false);
    }
  };
  
  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo lavoro? Verranno eliminati anche tutti i turni associati.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
        
      if (error) throw error;
      
      toast.success('Lavoro eliminato con successo');
      loadJobs();
    } catch (error: any) {
      toast.error('Errore durante l\'eliminazione del lavoro: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Il Tuo Profilo</h1>
      
      {/* Informazioni Personali */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center">
          <div className="bg-primary-100 p-2 rounded-full mr-3">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700">Informazioni Personali</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={updateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome
                </label>
                <input
                  type="text"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="input bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                L'email non può essere modificata
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="btn-secondary"
              >
                Reimposta Password
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                Salva Modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Gestione Lavori */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary-100 p-2 rounded-full mr-3">
              <Briefcase className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">I Tuoi Lavori</h2>
          </div>
          
          <button
            onClick={() => setShowAddJob(!showAddJob)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuovo Lavoro
          </button>
        </div>
        
        <div className="p-6">
          {showAddJob && (
            <form onSubmit={handleAddJob} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Lavoro
                </label>
                <input
                  type="text"
                  value={newJobNome}
                  onChange={(e) => setNewJobNome(e.target.value)}
                  className="input"
                  placeholder="es. Nome azienda"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="btn-secondary"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loadingJobs}
                  className="btn-primary flex items-center"
                >
                  {loadingJobs ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Aggiungi Lavoro
                </button>
              </div>
            </form>
          )}
          
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Non hai ancora aggiunto nessun lavoro.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{job.nome}</h3>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-danger-600 hover:text-danger-800 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profilo;