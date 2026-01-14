import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Flame, Calendar, Dumbbell, ChevronLeft, ChevronRight, AlertTriangle, Circle, Target } from 'lucide-react-native';

// Import workout log data
import workoutLogData from '@/src/constants/workoutLogData.json';
import { fontFamily } from '@/src/theme/fontFamily';

const { currentStreak, workoutLog } = workoutLogData;

const StartHeader = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  }, []);

  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const getMonthInfo = () => {
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    return { name: monthNames[currentMonth], year: currentYear };
  };

  const monthInfo = getMonthInfo();

  const getDayStatus = (year: number, month: number, day: number) => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    console.log(monthKey)
    const dayKey = String(day);
    
    // Type cast to access dynamic keys
    const monthData = (workoutLog as any)[monthKey];
    if (!monthData) return 'none';
    
    const dayData = monthData[dayKey];
    if (!dayData) return 'none';
    
    return dayData.status || 'none';
  };

  const getStatusIcon = (status: string, isFuture: boolean) => {
    // If it's a future date, don't show pending targets
    if (isFuture && status === 'pending') return null;
    
    switch (status) {
      case 'completed':
        return <Flame size={10} color="#FACC15" fill="#FACC15" />;
      case 'missed':
        return <AlertTriangle size={10} color="#EF4444" strokeWidth={3} />;
      case 'rest':
        return <Circle size={10} color="#9CA3AF" fill="#9CA3AF" />;
      case 'pending':
        return <Target size={10} color="#8E8E93" />; 
      default:
        return null;
    }
  };

  const weekDates = (() => {
    const dates = [];
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const startOfWeek = new Date(today);
    const dayIdx = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - (dayIdx === 0 ? 6 : dayIdx - 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push({
        dayName: dayNames[i],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
        status: getDayStatus(d.getFullYear(), d.getMonth(), d.getDate()),
        isFuture: d > today
      });
    }
    return dates;
  })();

  const monthDates = (() => {
    const dates = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < startPadding; i++) {
      dates.push({ date: null });
    }
    for (let i = 1; i <= lastDay; i++) {
      const checkDate = new Date(currentYear, currentMonth, i);
      dates.push({
        date: i,
        isToday: i === todayDate && currentMonth === todayMonth && currentYear === todayYear,
        status: getDayStatus(currentYear, currentMonth, i),
        isFuture: checkDate > today
      });
    }
    return dates;
  })();

  const handleMonthChange = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    else if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text style={{fontFamily: fontFamily.semiBold}} className="text-textPrimary-light dark:text-textPrimary-dark font-black text-2xl">Logger</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="px-4 py-1 rounded-full border-2 border-primary flex-row items-center gap-1">
            <Flame size={20} color="#FACC15" fill="#FACC15" />
            <Text className="text-textPrimary-light dark:text-textPrimary-dark font-bold text-lg">{currentStreak}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setIsExpanded(!isExpanded); }}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${isExpanded ? 'bg-primary' : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark'}`}
          >
            <Calendar size={24} color={isExpanded ? "#000" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-3">
        {isExpanded && (
          <View className="flex-row items-center justify-between mb-6 px-2">
            <Text className="text-textPrimary-light dark:text-textPrimary-dark font-black text-sm uppercase tracking-widest">
              {monthInfo.name} {monthInfo.year}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => handleMonthChange(-1)} className="p-2 bg-background-light dark:bg-background-dark rounded-xl">
                <ChevronLeft size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMonthChange(1)} className="p-2 bg-background-light dark:bg-background-dark rounded-xl">
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex-row mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} className="flex-1 items-center">
              <Text className="text-textMuted-light dark:text-textMuted-dark text-[10px] font-bold">{day}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {(isExpanded ? monthDates : weekDates).map((item, index) => (
            <View key={index} style={{ width: '14.28%' }} className="items-center justify-center py-2">
              {item.date ? (
                <View className={`items-center ${item.isFuture ? 'opacity-40' : 'opacity-100'}`}>
                  <View className={`w-9 h-9 rounded-full items-center justify-center mb-1 ${item.isToday ? 'bg-primary' : ''}`}>
                    <Text className={`text-xs font-bold ${item.isToday ? 'text-black' : 'text-textPrimary-light dark:text-textPrimary-dark'}`}>
                      {item.date}
                    </Text>
                  </View>
                  {/* Fixed container for the icon so spacing stays consistent */}
                  <View className="h-4 w-full items-center justify-center">
                    {getStatusIcon(item.status, item.isFuture)}
                  </View>
                </View>
              ) : <View className="w-9 h-14" />} 
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default StartHeader;