import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import TodayScreen from './TodayScreen'
import TasksScreen from './TasksScreen'
import FocusScreen from './FocusScreen'
import ProjectsScreen from './ProjectsScreen'

const TABS = [
  { id: 'today', icon: '☀️', label: 'Сегодня' },
  { id: 'tasks', icon: '✓', label: 'Задачи' },
  { id: 'focus', icon: '◎', label: 'Фокус' },
  { id: 'projects', icon: '▣', label: 'Проекты' },
]

export default function MainApp({ user }) {
  const [tab, setTab] = useState('today')
  const screens = { today: TodayScreen, tasks: TasksScreen, focus: FocusScreen, projects: ProjectsScreen }
  const Screen = screens[tab]

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.content}><Screen user={user} /></View>
      <View style={s.nav}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={s.navBtn} onPress={() => setTab(t.id)}>
            <Text style={[s.navIcon, tab===t.id && s.navActive]}>{t.icon}</Text>
            <Text style={[s.navLabel, tab===t.id && s.navActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#EFEFED' },
  content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 10, paddingBottom: 20 },
  navBtn: { flex: 1, alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 22, color: '#C0C0BB' },
  navLabel: { fontSize: 10, fontWeight: '500', color: '#C0C0BB' },
  navActive: { color: '#1a1a1a' }
})
