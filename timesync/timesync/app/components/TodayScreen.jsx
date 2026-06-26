import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
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
    if (st.data) { setFocusMinutes(st.data.focus_minutes||0); setStreak(st.data.streak||0) }
  }

  async function toggleTask(task) {
    const updated = { ...task, done: !task.done }
    setTasks(prev => prev.map(t => t.id===task.id ? updated : t))
    await supabase.from('tasks').update({ done: updated.done }).eq('id', task.id)
  }

  async function toggleHabit(habit) {
    const done = habit.habit_logs?.some(l => l.date===today)
    if (done) await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('date', today)
    else await supabase.from('habit_logs').insert({ habit_id: habit.id, user_id: user.id, date: today })
    loadData()
  }

  const done = tasks.filter(t=>t.done).length
  const focusStr = `${Math.floor(focusMinutes/60)}ч ${focusMinutes%60}м`

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <Text style={s.greeting}>{getGreeting()}, {userName}</Text>
      <Text style={s.date}>{dateStr}</Text>
      <View style={s.grid}>
        {[['Выполнено', `${done}/${tasks.length}`, '#16A34A'],['Фокус', focusStr, '#2563EB'],['Streak', `${streak} дн`, '#D97706'],['В работе', `${tasks.filter(t=>!t.done).length}`, '#1a1a1a']].map(([label, val, color]) => (
          <View key={label} style={s.card}>
            <Text style={s.cardLabel}>{label}</Text>
            <Text style={[s.cardVal, {color}]}>{val}</Text>
          </View>
        ))}
      </View>
      <Text style={s.sectionTitle}>ЗАДАЧИ</Text>
      <View style={s.listCard}>
        {tasks.length===0 ? <Text style={s.empty}>Нет задач на сегодня</Text> : tasks.map(task => (
          <TouchableOpacity key={task.id} style={s.row} onPress={() => toggleTask(task)}>
            <View style={[s.check, task.done && s.checkDone]}><Text style={s.checkMark}>{task.done?'✓':''}</Text></View>
            <View style={s.rowInfo}>
              <Text style={[s.rowTitle, task.done && s.strikethrough]}>{task.title}</Text>
              {task.priority && <View style={[s.badge, s['badge'+task.priority]]}><Text style={[s.badgeText, s['badgeText'+task.priority]]}>{task.priority}</Text></View>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.sectionTitle}>ПРИВЫЧКИ</Text>
      <View style={s.listCard}>
        {habits.length===0 ? <Text style={s.empty}>Нет привычек</Text> : habits.map(habit => {
          const isDone = habit.habit_logs?.some(l => l.date===today)
          return (
            <TouchableOpacity key={habit.id} style={s.row} onPress={() => toggleHabit(habit)}>
              <View style={[s.checkRound, isDone && s.checkDone]}><Text style={s.checkMark}>{isDone?'✓':''}</Text></View>
              <Text style={s.rowTitle}>{habit.name}</Text>
              <View style={s.streak}><Text style={s.streakText}>🔥 {habit.habit_logs?.length||0}д</Text></View>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#EFEFED' },
  content: { padding: 20, paddingBottom: 20 },
  greeting: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: '#1a1a1a', marginBottom: 3 },
  date: { fontSize: 14, color: '#999', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  card: { width: '47.5%', backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: {width:0,height:1}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 6 },
  cardVal: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#B0B0AA', letterSpacing: 1, marginTop: 22, marginBottom: 10 },
  listCard: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: {width:0,height:1}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F4F4F2', gap: 12 },
  check: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: '#D8D8D2', justifyContent: 'center', alignItems: 'center' },
  checkRound: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D8D8D2', justifyContent: 'center', alignItems: 'center' },
  checkDone: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  checkMark: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  strikethrough: { textDecorationLine: 'line-through', color: '#C0C0BB' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 5, backgroundColor: '#F2F2F0' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#666' },
  badgeCritical: { backgroundColor: '#FEE2E2' }, badgeTextCritical: { color: '#B91C1C' },
  badgeHigh: { backgroundColor: '#FEF3C7' }, badgeTextHigh: { color: '#92400E' },
  badgeMedium: { backgroundColor: '#DBEAFE' }, badgeTextMedium: { color: '#1E40AF' },
  badgeLow: { backgroundColor: '#F0FDF4' }, badgeTextLow: { color: '#166534' },
  streak: { backgroundColor: '#FEF9EC', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#D97706' },
  empty: { textAlign: 'center', color: '#C0C0BB', fontSize: 14, fontWeight: '500', padding: 28 }
})
