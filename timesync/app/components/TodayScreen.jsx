import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

const DAYS = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота']
const MONTHS = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро'
  if (h < 17) return 'Добрый день'
  return 'Добрый вечер'
}

export default function TodayScreen({ user }) {
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [streak, setStreak] = useState(0)
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'друг'
  const today = new Date().toISOString().split('T')[0]
  const d = new Date()
  const dateStr = `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [t, h, st] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', today).order('created_at'),
      supabase.from('habits').select('*, habit_logs(*)').eq('user_id', user.id),
      supabase.from('daily_stats').select('*').eq('user_id', user.id).eq('date', today).single()
    ])
    if (t.data) setTasks(t.data)
    if (h.data) setHabits(h.data)
    if (st.data) { setFocusMinutes(st.data.focus_minutes || 0); setStreak(st.data.streak || 0) }
  }

  async function toggleTask(task) {
    const updated = { ...task, done: !task.done }
    setTasks(p => p.map(t => t.id === task.id ? updated : t))
    await supabase.from('tasks').update({ done: updated.done }).eq('id', task.id)
  }

  async function toggleHabit(habit) {
    const done = habit.habit_logs?.some(l => l.date === today)
    if (done) await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('date', today)
    else await supabase.from('habit_logs').insert({ habit_id: habit.id, user_id: user.id, date: today })
    loadData()
  }

  const done = tasks.filter(t => t.done).length
  const inProgress = tasks.filter(t => !t.done).length
  const focusStr = `${Math.floor(focusMinutes / 60)}ч ${focusMinutes % 60}м`
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}, {userName}</Text>
          <Text style={s.date}>{dateStr}</Text>
        </View>
        <View style={s.timeBadge}><Text style={s.timeBadgeText}>{timeStr}</Text></View>
      </View>

      <View style={s.grid}>
        <View style={s.card}><Text style={s.cardLabel}>Выполнено</Text><Text style={[s.cardVal, { color: '#22C55E' }]}>{done}/{tasks.length}</Text></View>
        <View style={s.card}><Text style={s.cardLabel}>Фокус</Text><Text style={[s.cardVal, { color: '#22C55E' }]}>{focusStr}</Text></View>
        <View style={s.card}><Text style={s.cardLabel}>Streak</Text><Text style={[s.cardVal, { color: '#F59E0B' }]}>{streak} дн</Text></View>
        <View style={s.card}><Text style={s.cardLabel}>В работе</Text><Text style={s.cardVal}>{inProgress}</Text></View>
      </View>

      {done === tasks.length && tasks.length > 0 && (
        <View style={s.mitDone}>
          <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
          <Text style={s.mitDoneText}>MIT задача выполнена!</Text>
        </View>
      )}

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Задачи ({tasks.length})</Text>
        <TouchableOpacity style={s.addLink}><Text style={s.addLinkText}>+ Добавить</Text></TouchableOpacity>
      </View>
      {tasks.map(task => (
        <TouchableOpacity key={task.id} style={s.taskRow} onPress={() => toggleTask(task)}>
          <View style={[s.check, task.done && s.checkDone]}>
            {task.done && <Ionicons name="checkmark" size={14} color="#22C55E" />}
          </View>
          <Text style={[s.taskTitle, task.done && s.strike]}>{task.title}</Text>
        </TouchableOpacity>
      ))}

      <Text style={s.sectionLabel}>ПРИВЫЧКИ</Text>
      {habits.map(habit => {
        const isDone = habit.habit_logs?.some(l => l.date === today)
        const str = habit.habit_logs?.length || 0
        return (
          <TouchableOpacity key={habit.id} style={s.habitRow} onPress={() => toggleHabit(habit)}>
            <View style={[s.habitCheck, isDone && s.habitCheckDone]}>
              {isDone && <Ionicons name="checkmark" size={14} color="#22C55E" />}
            </View>
            <Text style={s.habitName}>{habit.name}</Text>
            <View style={s.streakBadge}>
              <Text style={s.streakText}>🔥 {str}д</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F5F5F0' },
  content: { padding: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', letterSpacing: -0.5 },
  date: { fontSize: 14, color: '#999', marginTop: 2 },
  timeBadge: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  timeBadgeText: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  card: { width: '47.5%', backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardLabel: { fontSize: 13, color: '#999', marginBottom: 6 },
  cardVal: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', letterSpacing: -0.5 },
  mitDone: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 8, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  mitDoneText: { fontSize: 15, color: '#666' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a' },
  addLink: {},
  addLinkText: { fontSize: 14, color: '#999' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E0' },
  check: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#D0D0C8', justifyContent: 'center', alignItems: 'center' },
  checkDone: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  taskTitle: { fontSize: 15, color: '#1a1a1a', flex: 1 },
  strike: { textDecorationLine: 'line-through', color: '#C0C0BB' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#B0B0A8', letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#E8E8E0' },
  habitCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#D0D0C8', justifyContent: 'center', alignItems: 'center' },
  habitCheckDone: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  habitName: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  streakBadge: { backgroundColor: '#FEF9EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#F59E0B' },
})
