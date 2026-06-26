import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { supabase } from '../../lib/supabase'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) { Alert.alert('Ошибка', 'Заполните все поля'); return }
    setLoading(true)
    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      if (error) Alert.alert('Ошибка', error.message)
      else onAuth(data.user)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) Alert.alert('Ошибка', 'Неверный email или пароль')
      else onAuth(data.user)
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={s.logoWrap}>
        <View style={s.logo}><Text style={s.logoText}>⏱</Text></View>
        <Text style={s.title}>TimeSync</Text>
        <Text style={s.sub}>Продуктивность и фокус</Text>
      </View>
      <View style={s.card}>
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab,mode==='login'&&s.tabActive]} onPress={()=>setMode('login')}><Text style={[s.tabText,mode==='login'&&s.tabTextActive]}>Вход</Text></TouchableOpacity>
          <TouchableOpacity style={[s.tab,mode==='register'&&s.tabActive]} onPress={()=>setMode('register')}><Text style={[s.tabText,mode==='register'&&s.tabTextActive]}>Регистрация</Text></TouchableOpacity>
        </View>
        {mode==='register'&&<View style={s.field}><Text style={s.label}>ИМЯ</Text><TextInput style={s.input} placeholder="Ваше имя" value={name} onChangeText={setName}/></View>}
        <View style={s.field}><Text style={s.label}>EMAIL</Text><TextInput style={s.input} placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/></View>
        <View style={s.field}><Text style={s.label}>ПАРОЛЬ</Text><TextInput style={s.input} placeholder="Минимум 6 символов" value={password} onChangeText={setPassword} secureTextEntry/></View>
        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}><Text style={s.btnText}>{loading?'Загрузка...':mode==='login'?'Войти':'Создать аккаунт'}</Text></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#EFEFED',justifyContent:'center',padding:20},
  logoWrap:{alignItems:'center',marginBottom:32},
  logo:{width:64,height:64,backgroundColor:'#1a1a1a',borderRadius:18,justifyContent:'center',alignItems:'center',marginBottom:12},
  logoText:{fontSize:32},
  title:{fontSize:28,fontWeight:'700',letterSpacing:-0.8,color:'#1a1a1a'},
  sub:{fontSize:14,color:'#999',marginTop:4},
  card:{backgroundColor:'#fff',borderRadius:20,padding:20,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.07,shadowRadius:12,elevation:4},
  tabs:{flexDirection:'row',backgroundColor:'#F2F2F0',borderRadius:12,padding:3,marginBottom:20},
  tab:{flex:1,paddingVertical:9,alignItems:'center',borderRadius:10},
  tabActive:{backgroundColor:'#fff',shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.1,shadowRadius:4,elevation:2},
  tabText:{fontSize:14,fontWeight:'500',color:'#999'},
  tabTextActive:{color:'#1a1a1a',fontWeight:'600'},
  field:{marginBottom:12},
  label:{fontSize:11,fontWeight:'600',color:'#999',letterSpacing:0.8,marginBottom:7},
  input:{backgroundColor:'#FAFAF8',borderWidth:1.5,borderColor:'#E8E8E4',borderRadius:12,padding:13,fontSize:15,color:'#1a1a1a'},
  btn:{backgroundColor:'#1a1a1a',borderRadius:14,padding:15,alignItems:'center',marginTop:6},
  btnText:{color:'#fff',fontSize:15,fontWeight:'600'}
})
