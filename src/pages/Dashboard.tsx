import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Turno, Job } from '../lib/supabase';
import { format, parseISO, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { PlusCircle, Clock, Briefcase, Edit, Trash2 } from 'lucide-react';
import DeleteTurnoModal from '../components/DeleteTurnoModal';
import ReportGenerator from '../components/ReportGenerator';

function Dashboard() {
  const [turni, setTurni] = useState<Turno[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState<string | null>(null);
  
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  
  const startDate = format(firstDayOfMonth, 'yyyy-MM-dd');
  const endDate = format(lastDayOfMonth, 'yyyy-MM-dd');
  
  const monthName = format(currentMonth, 'MMMM yyyy', { locale: it });
  
  useEffect(() => {
    fetchJobs();
    fetchTurni();
  }, [currentMonth]);
  
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      setJobs(data || []);
      
      if (!selectedJobId && data && data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    } catch (error: any) {
      toast.error('Errore durante il recupero dei lavori: ' + error.message);
    }
  };
  
  const fetchTurni = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from('turni')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      if (data) {
        setTurni(data as Turno[]);
      }
    } catch (error: any) {
      toast.error('Errore durante il recupero dei turni: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(getYear(currentMonth), getMonth(currentMonth) - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(getYear(currentMonth), getMonth(currentMonth) + 1, 1));
  };
  
  const openDeleteModal = (id: string) => {
    setTurnoToDelete(id);
    setDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setTurnoToDelete(null);
  };
  
  const handleDeleteTurno = async () => {
    if (!turnoToDelete) return;
    
    try {
      const { error } = await supabase
        .from('turni')
        .delete()
        .eq('id', turnoToDelete);
        
      if (error) {
        throw error;
      }
      
      toast.success('Turno eliminato con successo');
      fetchTurni();
    } catch (error: any) {
      toast.error('Errore durante l\'eliminazione del turno: ' + error.message);
    } finally {
      closeDeleteModal();
    }
  };

  const filteredTurni = selectedJobId 
    ? turni.filter(turno => turno.job_id === selectedJobId)
    : [];
  
  const oreTotaliMese = filteredTurni.reduce((sum, turno) => sum + turno.ore_totali, 0);

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Nessun lavoro configurato
        </h2>
        <p className="text-gray-600 mb-4">
          Prima di aggiungere turni, devi configurare almeno un lavoro
        </p>
        <Link to="/profilo" className="btn-primary">
          Configura Lavori
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <h2 className="text-xl font-bold text-primary-600">{monthName}</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousMonth}
            className="btn-secondary py-1 px-2"
          >
            &larr;
          </button>
          <button 
            onClick={handleNextMonth}
            className="btn-secondary py-1 px-2"
          >
            &rarr;
          </button>
        </div>
        <Link 
          to="/aggiungi-turno" 
          className="btn-primary flex items-center w-full sm:w-auto justify-center"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nuovo Turno
        </Link>
      </div>
      
      {/* Selezione Lavoro e Statistiche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleziona Lavoro
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.nome}
              </option>
            ))}
          </select>
        </div>
        
        <div className="card p-5 flex items-center">
          <div className="rounded-full bg-primary-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-700">Ore Totali</h2>
            <p className="text-2xl font-bold text-primary-600">{oreTotaliMese.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card p-5">
          <ReportGenerator 
            turni={filteredTurni}
            mese={monthName}
            jobs={jobs}
          />
        </div>
      </div>
      
      {/* Tabella Turni */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Riepilogo Turni</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTurni.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Nessun turno registrato per questo mese.</p>
              <Link 
                to="/aggiungi-turno" 
                className="btn-primary mt-4 inline-flex items-center"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Aggiungi Turno
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTurni.map((turno) => (
                <div key={turno.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {format(parseISO(turno.data), 'EEEE', { locale: it })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(parseISO(turno.data), 'dd/MM/yyyy')}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-900">{turno.ora_inizio} - {turno.ora_fine}</span>
                        </div>
                        
                        <div className="font-medium text-primary-600">
                          {turno.ore_totali.toFixed(2)} ore
                        </div>
                      </div>
                      
                      {turno.note && (
                        <div className="mt-2 text-sm text-gray-500">
                          {turno.note}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/modifica-turno/${turno.id}`}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(turno.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Totale ore del mese:</span>
                  <span className="font-bold text-primary-600">{oreTotaliMese.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal per conferma eliminazione */}
      {deleteModalOpen && (
        <DeleteTurnoModal 
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onDelete={handleDeleteTurno}
        />
      )}
    </div>
  );
}

export default Dashboard;