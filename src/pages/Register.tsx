import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Clock } from 'lucide-react';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password-for-check'
      });
      
      if (existingUser.user) {
        toast.error('Un account con questa email esiste già. Accedi invece di registrarti.');
        navigate('/login');
        return;
      }
      
      // Registra l'utente
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            cognome,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.user) {
        // Crea il profilo dell'utente
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nome,
            cognome,
          });
          
        if (profileError) {
          toast.error('Errore durante la creazione del profilo');
        }
        
        toast.success('Registrazione completata con successo!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.message === 'Invalid login credentials') {
        // This means the user doesn't exist, which is what we want for registration
        // Continue with registration
        try {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                nome,
                cognome,
              },
            },
          });
          
          if (signUpError) throw signUpError;
          
          if (data?.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                nome,
                cognome,
              });
              
            if (profileError) {
              toast.error('Errore durante la creazione del profilo');
            }
            
            toast.success('Registrazione completata con successo!');
            navigate('/dashboard');
          }
        } catch (signUpError: any) {
          toast.error(signUpError.message || 'Errore durante la registrazione');
        }
      } else {
        toast.error(error.message || 'Errore durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-primary-100 p-3 rounded-full">
            <Clock className="h-10 w-10 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">BP TimeSheet</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crea il tuo account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md -space-y-px">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input"
                  placeholder="Mario"
                />
              </div>
              
              <div>
                <label htmlFor="cognome" className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome
                </label>
                <input
                  id="cognome"
                  name="cognome"
                  type="text"
                  required
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="input"
                  placeholder="Rossi"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nome@esempio.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                La password deve contenere almeno 6 caratteri
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Registrati'
              )}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Accedi
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;