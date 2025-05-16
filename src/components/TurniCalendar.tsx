import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
} from 'date-fns';
import { it } from 'date-fns/locale';
import type { Turno } from '../lib/supabase';

type TurniCalendarProps = {
  turni: Turno[];
  currentMonth: Date;
};

function TurniCalendar({ turni, currentMonth }: TurniCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getDayTurni = (day: Date) => {
    return turni.filter(turno => isSameDay(parseISO(turno.data), day));
  };
  
  const handleDayClick = (day: Date) => {
    setSelectedDay(selectedDay && isSameDay(day, selectedDay) ? null : day);
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
          <div 
            key={index} 
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayTurni = getDayTurni(day);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
          
          return (
            <div 
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-16 p-1 border rounded-md transition-all relative
                ${isToday(day) ? 'border-primary-500' : 'border-gray-200'}
                ${!isSameMonth(day, currentMonth) ? 'bg-gray-50 text-gray-400' : ''}
                ${isSelected ? 'ring-2 ring-primary-500' : ''}
                ${dayTurni.length > 0 ? 'cursor-pointer' : ''}
                hover:bg-gray-50
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`
                  text-sm font-medium
                  ${isToday(day) ? 'text-primary-600' : ''}
                `}>
                  {format(day, 'd')}
                </span>
                
                {dayTurni.length > 0 && (
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {dayTurni.length}
                  </span>
                )}
              </div>
              
              {isSelected && dayTurni.length > 0 && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg rounded-md border border-gray-200 p-3 z-10">
                  <h4 className="text-sm font-medium mb-2">
                    {format(day, 'EEEE d MMMM', { locale: it })}
                  </h4>
                  
                  <div className="space-y-2">
                    {dayTurni.map((turno) => (
                      <div key={turno.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">
                            {turno.ora_inizio} - {turno.ora_fine}
                          </span>
                          <span className="font-bold text-primary-700">
                            {turno.ore_totali.toFixed(2)} ore
                          </span>
                        </div>
                        
                        {turno.note && (
                          <div className="text-gray-600">{turno.note}</div>
                        )}
                        
                        <div className="mt-2 flex justify-end">
                          <Link 
                            to={`/modifica-turno/${turno.id}`}
                            className="text-xs text-primary-600 hover:text-primary-800"
                          >
                            Modifica
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {dayTurni.length > 0 && !isSelected && (
                <div className="mt-1">
                  {dayTurni.slice(0, 1).map((turno) => (
                    <div key={turno.id} className="text-xs text-gray-600 truncate">
                      {turno.ora_inizio}-{turno.ora_fine}
                    </div>
                  ))}
                  {dayTurni.length > 1 && (
                    <div className="text-xs text-gray-500">
                      +{dayTurni.length - 1} altri
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TurniCalendar;