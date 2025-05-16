import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { User } from './lib/supabase';

// Componenti
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTurno from './pages/AddTurno';
import Profilo from './pages/Profilo';
import Credits from './pages/Credits';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controlla se l'utente è loggato
    const getCurrentUser = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUser({
            id: user.id,
            email: user.email || '',
          });
        }
      } catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Ascolta i cambiamenti dell'auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/aggiungi-turno" element={
          <ProtectedRoute user={user}>
            <AddTurno />
          </ProtectedRoute>
        } />
        <Route path="/modifica-turno/:id" element={
          <ProtectedRoute user={user}>
            <AddTurno />
          </ProtectedRoute>
        } />
        <Route path="/profilo" element={
          <ProtectedRoute user={user}>
            <Profilo />
          </ProtectedRoute>
        } />
        <Route path="/credits" element={
          <ProtectedRoute user={user}>
            <Credits />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;