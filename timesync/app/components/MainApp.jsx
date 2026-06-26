import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import TodayScreen from './TodayScreen'
import TasksScreen from './TasksScreen'
import FocusScreen from './FocusScreen'
import ProjectsScreen from './ProjectsScreen'

const TABS = [
  { id: 'today', icon: 'sunny-outline', label: 'Сегодня' },
  { id: 'tasks', icon: 'checkbox-outline', label: 'Задачи' },
  { id: 'focus', icon: 'timer-outline', label: 'Фокус' },
  { id: 'projects', icon: 'folder-outline', label: 'Проекты' },
  { id: 'analytics', icon: 'bar-chart-outline', label: 'Аналитика' },
]

export default function MainApp({ user }) {
  const [tab, setTab] = useState('today')
  const screens = { today: TodayScreen, tasks: TasksScreen, focus: FocusScreen, projects: ProjectsScreen, analytics: TodayScreen }
  const Screen = screens[tab]

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.content}><Screen user={user} /></View>
      <View style={s.nav}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={s.navBtn} onPress={() => setTab(t.id)}>
            <Ionicons name={tab === t.id ? t.icon.replace('-outline', '') : t.icon} size={24} color={tab === t.id ? '#1a1a1a' : '#C0C0BB'} />
            <Text style={[s.navLabel, tab === t.id && s.navLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#F5F5F0' },
  content: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E0E0D8', paddingTop: 8, paddingBottom: 20, paddingHorizontal: 4 },
  navBtn: { flex: 1, alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 10, color: '#C0C0BB', fontWeight: '500' },
  navLabelActive: { color: '#1a1a1a' },
})
