import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, calcolaOreTotali, type Job } from '../lib/supabase';
import { toast } from 'react-toastify';
import DatePicker, { registerLocale } from 'react-datepicker';
import { it } from 'date-fns/locale';
import { format } from 'date-fns';
import { Calendar, Clock, Save, ArrowLeft, Briefcase } from 'lucide-react';

// Registra la localizzazione italiana
registerLocale('it', it);

function AddTurno() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [data, setData] = useState<Date>(new Date());
  const [oraInizio, setOraInizio] = useState('09:00');
  const [oraFine, setOraFine] = useState('17:00');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [oreTotali, setOreTotali] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  
  useEffect(() => {
    fetchJobs();
    if (isEditing) {
      fetchTurno();
    }
  }, [id]);
  
  useEffect(() => {
    // Calcola le ore totali quando cambiano gli orari
    setOreTotali(calcolaOreTotali(oraInizio, oraFine));
  }, [oraInizio, oraFine]);
  
  const fetchJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .order('nome');
        
      if (error) throw error;
      
      if (jobs) {
        setJobs(jobs);
        if (jobs.length > 0 && !isEditing) {
          setSelectedJobId(jobs[0].id);
        }
      }
    } catch (error: any) {
      toast.error('Errore durante il recupero dei lavori: ' + error.message);
    }
  };
  
  const fetchTurno = async () => {
    try {
      const { data: turno, error } = await supabase
        .from('turni')
        .select('*')
        .eq('id', id as string)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (turno) {
        setData(new Date(turno.data));
        setOraInizio(turno.ora_inizio);
        setOraFine(turno.ora_fine);
        setNote(turno.note || '');
        setSelectedJobId(turno.job_id);
      }
    } catch (error: any) {
      toast.error('Errore durante il recupero del turno: ' + error.message);
      navigate('/dashboard');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJobId) {
      toast.error('Seleziona un lavoro');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utente non autenticato');
      }
      
      const turnoData = {
        user_id: user.id,
        job_id: selectedJobId,
        data: format(data, 'yyyy-MM-dd'),
        ora_inizio: oraInizio,
        ora_fine: oraFine,
        ore_totali: oreTotali,
        note: note || null,
      };
      
      if (isEditing) {
        // Aggiorna il turno esistente
        const { error } = await supabase
          .from('turni')
          .update(turnoData)
          .eq('id', id as string);
          
        if (error) {
          throw error;
        }
        
        toast.success('Turno aggiornato con successo');
      } else {
        // Inserisci un nuovo turno
        const { error } = await supabase
          .from('turni')
          .insert([turnoData]);
          
        if (error) {
          throw error;
        }
        
        toast.success('Turno aggiunto con successo');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(`Errore durante il ${isEditing ? 'aggiornamento' : 'salvataggio'} del turno: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Nessun lavoro configurato
        </h2>
        <p className="text-gray-600 mb-4">
          Prima di aggiungere un turno, devi configurare almeno un lavoro
        </p>
        <button
          onClick={() => navigate('/profilo')}
          className="btn-primary"
        >
          Configura Lavori
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mr-4 text-gray-600 hover:text-primary-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Modifica Turno' : 'Aggiungi Nuovo Turno'}
        </h1>
      </div>
      
      <div className="card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lavoro
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="input input-with-icon"
                  required
                >
                  <option value="">Seleziona un lavoro</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  selected={data}
                  onChange={(date: Date) => setData(date)}
                  locale="it"
                  dateFormat="EEEE dd/MM/yyyy"
                  className="input input-with-icon"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Inizio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  value={oraInizio}
                  onChange={(e) => setOraInizio(e.target.value)}
                  className="input input-with-icon"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Fine
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  value={oraFine}
                  onChange={(e) => setOraFine(e.target.value)}
                  className="input input-with-icon"
                  required
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (opzionale)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input"
                placeholder="Note aggiuntive sul turno"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Ore Totali:</span>
              <span className="text-xl font-bold text-primary-600">{oreTotali.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary mr-3"
            >
              Annulla
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
              {isEditing ? 'Aggiorna Turno' : 'Salva Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTurno;
