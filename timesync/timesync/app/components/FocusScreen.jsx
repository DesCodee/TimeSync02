import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

const MODES = [{label:'25/5',work:25,brk:5},{label:'52/17',work:52,brk:17},{label:'90/20',work:90,brk:20}]

export default function FocusScreen({ user }) {
  const [modeIdx, setModeIdx] = useState(0)
  const [phase, setPhase] = useState('work')
  const [secs, setSecs] = useState(25*60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const ref = useRef(null)
  const mode = MODES[modeIdx]

  useEffect(() => () => clearInterval(ref.current), [])

  function setMode(i) { clearInterval(ref.current); setRunning(false); setModeIdx(i); setPhase('work'); setSecs(MODES[i].work*60); setSessions(0) }

  function toggle() {
    if (running) { clearInterval(ref.current); setRunning(false) }
    else {
      setRunning(true)
      ref.current = setInterval(() => {
        setSecs(p => { if (p<=1) { handleEnd(); return 0 } return p-1 })
      }, 1000)
    }
  }

  async function handleEnd() {
    clearInterval(ref.current); setRunning(false)
    if (phase==='work') {
      setSessions(s=>s+1); setPhase('break'); setSecs(mode.brk*60)
      const today = new Date().toISOString().split('T')[0]
      const {data} = await supabase.from('daily_stats').select('*').eq('user_id',user.id).eq('date',today).single()
      if (data) await supabase.from('daily_stats').update({focus_minutes:(data.focus_minutes||0)+mode.work}).eq('id',data.id)
      else await supabase.from('daily_stats').insert({user_id:user.id,date:today,focus_minutes:mode.work,streak:1})
    } else { setPhase('work'); setSecs(mode.work*60) }
  }

  function reset() { clearInterval(ref.current); setRunning(false); setPhase('work'); setSecs(mode.work*60) }

  const m = Math.floor(secs/60), sc = secs%60
  const display = `${String(m).padStart(2,'0')}:${String(sc).padStart(2,'0')}`

  return (
    <View style={s.wrap}>
      <View style={s.modes}>
        {MODES.map((md,i) => (
          <TouchableOpacity key={i} style={[s.modeBtn, modeIdx===i && s.modeBtnActive]} onPress={()=>setMode(i)}>
            <Text style={[s.modeTxt, modeIdx===i && s.modeTxtActive]}>{md.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.circle}>
        <Text style={s.phaseLabel}>{phase==='work'?'РАБОТА':'ПЕРЕРЫВ'}</Text>
        <Text style={s.display}>{display}</Text>
      </View>
      <View style={s.dots}>
        {[0,1,2,3].map(i=><View key={i} style={[s.dot, i<sessions%4 && s.dotFilled]}/>)}
      </View>
      <Text style={s.sessionsLabel}>{sessions}/4 сессий</Text>
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={reset}><Text style={s.ctrlIcon}>↺</Text></TouchableOpacity>
        <TouchableOpacity style={s.playBtn} onPress={toggle}><Text style={s.playIcon}>{running?'⏸':'▶'}</Text></TouchableOpacity>
        <TouchableOpacity style={s.ctrlBtn} onPress={()=>{reset();setSessions(0)}}><Text style={s.ctrlIcon}>■</Text></TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#EFEFED', alignItems: 'center', paddingTop: 40 },
  modes: { flexDirection: 'row', gap: 8, marginBottom: 36 },
  modeBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 50, borderWidth: 1.5, borderColor: '#E8E8E4', backgroundColor: '#fff' },
  modeBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  modeTxt: { fontSize: 14, fontWeight: '600', color: '#999' },
  modeTxtActive: { color: '#fff' },
  circle: { width: 210, height: 210, borderRadius: 105, borderWidth: 2, borderColor: '#E8E8E4', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 28, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.07, shadowRadius: 20, elevation: 4 },
  phaseLabel: { fontSize: 11, fontWeight: '700', color: '#C0C0BB', letterSpacing: 2, marginBottom: 8 },
  display: { fontSize: 48, fontWeight: '700', letterSpacing: -2, color: '#1a1a1a' },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8E8E4' },
  dotFilled: { backgroundColor: '#1a1a1a' },
  sessionsLabel: { fontSize: 13, fontWeight: '500', color: '#C0C0BB', marginBottom: 28 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctrlBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: '#E8E8E4', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  ctrlIcon: { fontSize: 20, color: '#999' },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  playIcon: { fontSize: 26, color: '#fff' }
})
