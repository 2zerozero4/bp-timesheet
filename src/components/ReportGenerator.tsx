import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';
import type { Turno, Job } from '../lib/supabase';
import { toast } from 'react-toastify';

type ReportGeneratorProps = {
  turni: Turno[];
  mese: string;
  jobs: Job[];
};

function ReportGenerator({ turni, mese, jobs }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  
  const generatePDF = async () => {
    setLoading(true);
    
    try {
      if (turni.length === 0) {
        toast.error('Non ci sono turni da includere nel report per questo periodo');
        return;
      }
      
      const selectedJob = jobs.find(job => job.id === turni[0].job_id);
      if (!selectedJob) {
        toast.error('Lavoro non trovato');
        return;
      }
      
      // Calcola le ore totali
      const oreTotali = turni.reduce((sum, turno) => sum + turno.ore_totali, 0);
      
      // Crea un nuovo documento PDF in formato A4
      const doc = new jsPDF();
      
      // Imposta i metadati del documento
      doc.setProperties({
        title: `BP TimeSheet - Report ${selectedJob.nome} - ${mese}`,
        subject: 'Report ore lavorative',
        creator: 'BP TimeSheet App',
      });
      
      // Intestazione
      doc.setFontSize(22);
      doc.setTextColor(75, 70, 229); // Primary color
      doc.text('BP TimeSheet', 14, 22);
      
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(`Report Ore: ${selectedJob.nome}`, 14, 32);
      doc.text(`Periodo: ${mese}`, 14, 42);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generato il: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 52);
      
      // Dati per la tabella
      const tableRows = turni.map(turno => [
        format(parseISO(turno.data), 'dd/MM/yyyy'),
        format(parseISO(turno.data), 'EEEE', { locale: it }),
        turno.ora_inizio,
        turno.ora_fine,
        turno.ore_totali.toFixed(2),
        turno.note || '',
      ]);
      
      // Creazione della tabella
      autoTable(doc, {
        head: [['Data', 'Giorno', 'Inizio', 'Fine', 'Ore', 'Note']],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { 
          fillColor: [79, 70, 229], // Primary color
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
      
      // Aggiungi il totale delle ore
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229); // Primary color
      doc.text(`Totale ore: ${oreTotali.toFixed(2)}`, 14, finalY);
      
      // Nota a piè di pagina
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Report generato automaticamente da BP TimeSheet', 14, 285);
      
      // Salva e scarica il PDF
      doc.save(`BP_TimeSheet_${selectedJob.nome}_${mese.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      toast.error('Si è verificato un errore durante la generazione del report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <button
        onClick={generatePDF}
        disabled={loading || turni.length === 0}
        className={`
          btn flex items-center justify-center
          ${turni.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-success'}
        `}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        ) : (
          <FileText className="mr-2 h-5 w-5" />
        )}
        Genera Report PDF
      </button>
    </div>
  );
}

export default ReportGenerator;