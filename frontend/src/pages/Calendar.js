import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, DollarSign, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { getSubscriptions, getTransactions } from '../utils/mockData';

export default function Calendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected day details
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = () => {
    const subscriptions = getSubscriptions();
    const transactions = getTransactions();

    const calendarEvents = [];

    subscriptions.forEach(sub => {
      if (sub.active && sub.nextDueDate) {
        const dueDate = new Date(sub.nextDueDate);
        calendarEvents.push({
          id: `sub-${sub.id}`,
          date: dueDate.getDate(),
          month: dueDate.getMonth(),
          year: dueDate.getFullYear(),
          title: sub.name,
          amount: sub.amount,
          type: 'subscription',
          color: 'purple',
          icon: Zap
        });
      }
    });

    transactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      if (txnDate.getMonth() === currentDate.getMonth() && txnDate.getFullYear() === currentDate.getFullYear()) {
        calendarEvents.push({
          id: `txn-${txn.id}`,
          date: txnDate.getDate(),
          month: txnDate.getMonth(),
          year: txnDate.getFullYear(),
          title: txn.category,
          amount: txn.amount,
          type: txn.type,
          color: txn.type === 'income' ? 'green' : 'red',
          icon: txn.type === 'income' ? TrendingUp : TrendingDown
        });
      }
    });

    setEvents(calendarEvents);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const handleDayClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const getEventsForDay = (day) => {
    return events.filter(e =>
      e.date === day &&
      e.month === currentDate.getMonth() &&
      e.year === currentDate.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Get events for the currently SELECTED date
  const selectedDayEvents = events.filter(e =>
    e.date === selectedDate.getDate() &&
    e.month === selectedDate.getMonth() &&
    e.year === selectedDate.getFullYear()
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500" data-testid="calendar-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Financial Calendar
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Plan your payments & track income</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-4 bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-cyan-400"
          >
            <ChevronLeft size={24} />
          </button>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white w-40 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-cyan-400"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CALENDAR GRID */}
        <div className="lg:col-span-2 cyberpunk-card p-6 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 shadow-xl dark:shadow-none">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const today = isToday(day);
              const selected = isSelected(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square p-2 rounded-xl border transition-all flex flex-col justify-between group relative overflow-hidden ${selected
                      ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : today
                        ? 'border-purple-500/50 bg-purple-500/5'
                        : 'border-gray-100 dark:border-white/5 hover:border-cyan-400/30 hover:bg-gray-50 dark:hover:bg-white/5 bg-white dark:bg-transparent'
                    }`}
                >
                  <span className={`text-sm font-bold ml-1 ${selected ? 'text-cyan-600 dark:text-cyan-400' :
                      today ? 'text-purple-600 dark:text-purple-400' :
                        'text-gray-700 dark:text-gray-300'
                    }`}>
                    {day}
                  </span>

                  <div className="flex flex-wrap gap-1 content-end">
                    {dayEvents.slice(0, 4).map((event, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${event.color === 'green' ? 'bg-green-500 dark:bg-green-400' :
                            event.color === 'red' ? 'bg-red-500 dark:bg-red-400' :
                              event.color === 'purple' ? 'bg-purple-500 dark:bg-purple-400' :
                                'bg-cyan-500 dark:bg-cyan-400'
                          }`}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[10px] text-gray-400 leading-none">+</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Date Header */}
          <div className="cyberpunk-card p-6 bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 shadow-lg dark:shadow-none">
            <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs mb-1">Selected Date</h3>
            <div className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="text-cyan-500" />
              {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No events scheduled for this day.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayEvents.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-colors group">
                      <div className={`p-3 rounded-lg ${event.color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                          event.color === 'red' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                            'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        }`}>
                        <event.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 dark:text-white">{event.title}</div>
                        <div className="text-xs text-gray-500 capitalize">{event.type}</div>
                      </div>
                      <div className={`font-mono font-bold ${event.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          event.color === 'red' ? 'text-red-600 dark:text-red-400' :
                            'text-purple-600 dark:text-purple-400'
                        }`}>
                        ${event.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-500/20">
              <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Total Income</div>
              <div className="text-2xl font-black text-green-700 dark:text-green-400">
                ${events.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-500/20">
              <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Total Expense</div>
              <div className="text-2xl font-black text-red-700 dark:text-red-400">
                ${events.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
