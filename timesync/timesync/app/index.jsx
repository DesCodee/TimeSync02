import { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import AuthScreen from './components/AuthScreen'
import MainApp from './components/MainApp'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1a1a1a" />
    </View>
  )

  return user ? <MainApp user={user} /> : <AuthScreen onAuth={setUser} />
}

const s = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEFED' } })
