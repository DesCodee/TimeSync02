import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

const PRIORITIES = ['Critical','High','Medium','Low']

export default function TasksScreen({ user }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('Medium')

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    const {data} = await supabase.from('tasks').select('*').eq('user_id',user.id).order('created_at',{ascending:false})
    if (data) setTasks(data)
  }

  async function addTask() {
    if (!newTitle.trim()) return
    const today = new Date().toISOString().split('T')[0]
    const {data} = await supabase.from('tasks').insert({user_id:user.id,title:newTitle,priority:newPriority,done:false,date:today}).select().single()
    if (data) setTasks(p=>[data,...p])
    setNewTitle(''); setAdding(false)
  }

  async function toggleTask(task) {
    const updated = {...task,done:!task.done}
    setTasks(p=>p.map(t=>t.id===task.id?updated:t))
    await supabase.from('tasks').update({done:updated.done}).eq('id',task.id)
  }

  async function deleteTask(id) {
    setTasks(p=>p.filter(t=>t.id!==id))
    await supabase.from('tasks').delete().eq('id',id)
  }

  const filtered = tasks.filter(t=>filter==='active'?!t.done:filter==='done'?t.done:true)

  return (
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.title}>Задачи</Text>
        <TouchableOpacity style={s.addBtn} onPress={()=>setAdding(true)}><Text style={s.addBtnText}>+ Новая</Text></TouchableOpacity>
      </View>
      {adding && (
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Название задачи..." value={newTitle} onChangeText={setNewTitle} autoFocus />
          <View style={s.priorityRow}>
            {PRIORITIES.map(p=>(
              <TouchableOpacity key={p} style={[s.pBtn, newPriority===p && s['pBtn'+p]]} onPress={()=>setNewPriority(p)}>
                <Text style={[s.pBtnText, newPriority===p && s['pBtnText'+p]]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.formActions}>
            <TouchableOpacity style={s.cancelBtn} onPress={()=>setAdding(false)}><Text style={s.cancelText}>Отмена</Text></TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={addTask}><Text style={s.saveBtnText}>Добавить</Text></TouchableOpacity>
          </View>
        </View>
      )}
      <View style={s.filters}>
        {[['all','Все'],['active','Активные'],['done','Готово']].map(([val,label])=>(
          <TouchableOpacity key={val} style={[s.filterBtn, filter===val && s.filterBtnActive]} onPress={()=>setFilter(val)}>
            <Text style={[s.filterText, filter===val && s.filterTextActive]}>{label} {val==='all'?tasks.length:val==='done'?tasks.filter(t=>t.done).length:tasks.filter(t=>!t.done).length}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.listCard}>
        {filtered.length===0?<Text style={s.empty}>Задач нет</Text>:filtered.map(task=>(
          <View key={task.id} style={s.row}>
            <TouchableOpacity style={[s.check, task.done && s.checkDone]} onPress={()=>toggleTask(task)}>
              <Text style={s.checkMark}>{task.done?'✓':''}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.rowInfo} onPress={()=>toggleTask(task)}>
              <Text style={[s.rowTitle, task.done && s.strike]}>{task.title}</Text>
              {task.priority && <View style={[s.badge, s['badge'+task.priority]]}><Text style={[s.badgeText, s['badgeText'+task.priority]]}>{task.priority}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>deleteTask(task.id)}><Text style={s.del}>×</Text></TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#EFEFED'},content:{padding:20,paddingBottom:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  title:{fontSize:28,fontWeight:'700',letterSpacing:-0.8},
  addBtn:{backgroundColor:'#1a1a1a',paddingVertical:9,paddingHorizontal:18,borderRadius:50},
  addBtnText:{color:'#fff',fontWeight:'600',fontSize:13},
  form:{backgroundColor:'#fff',borderRadius:18,padding:16,marginBottom:14,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:8,elevation:2},
  input:{backgroundColor:'#FAFAF8',borderWidth:1.5,borderColor:'#E8E8E4',borderRadius:12,padding:13,fontSize:15,color:'#1a1a1a'},
  priorityRow:{flexDirection:'row',gap:6,marginTop:12,flexWrap:'wrap'},
  pBtn:{paddingVertical:5,paddingHorizontal:12,borderRadius:50,borderWidth:1.5,borderColor:'#E8E8E4'},
  pBtnText:{fontSize:12,fontWeight:'600',color:'#999'},
  pBtnCritical:{backgroundColor:'#FEE2E2',borderColor:'#FCA5A5'},pBtnTextCritical:{color:'#B91C1C'},
  pBtnHigh:{backgroundColor:'#FEF3C7',borderColor:'#FCD34D'},pBtnTextHigh:{color:'#92400E'},
  pBtnMedium:{backgroundColor:'#DBEAFE',borderColor:'#93C5FD'},pBtnTextMedium:{color:'#1E40AF'},
  pBtnLow:{backgroundColor:'#F0FDF4',borderColor:'#86EFAC'},pBtnTextLow:{color:'#166534'},
  formActions:{flexDirection:'row',justifyContent:'flex-end',gap:8,marginTop:14},
  cancelBtn:{paddingVertical:9,paddingHorizontal:18,borderRadius:50,borderWidth:1.5,borderColor:'#E8E8E4'},
  cancelText:{fontSize:13,fontWeight:'500',color:'#666'},
  saveBtn:{backgroundColor:'#1a1a1a',paddingVertical:9,paddingHorizontal:18,borderRadius:50},
  saveBtnText:{color:'#fff',fontWeight:'600',fontSize:13},
  filters:{flexDirection:'row',gap:7,marginBottom:14},
  filterBtn:{paddingVertical:7,paddingHorizontal:14,borderRadius:50,borderWidth:1.5,borderColor:'#E8E8E4',backgroundColor:'#fff'},
  filterBtnActive:{backgroundColor:'#1a1a1a',borderColor:'#1a1a1a'},
  filterText:{fontSize:13,fontWeight:'600',color:'#999'},
  filterTextActive:{color:'#fff'},
  listCard:{backgroundColor:'#fff',borderRadius:18,overflow:'hidden',shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:8,elevation:2},
  row:{flexDirection:'row',alignItems:'center',padding:14,borderBottomWidth:1,borderBottomColor:'#F4F4F2',gap:12},
  check:{width:24,height:24,borderRadius:7,borderWidth:2,borderColor:'#D8D8D2',justifyContent:'center',alignItems:'center'},
  checkDone:{backgroundColor:'#DCFCE7',borderColor:'#16A34A'},
  checkMark:{fontSize:13,fontWeight:'700',color:'#16A34A'},
  rowInfo:{flex:1},
  rowTitle:{fontSize:15,fontWeight:'500',color:'#1a1a1a'},
  strike:{textDecorationLine:'line-through',color:'#C0C0BB'},
  badge:{alignSelf:'flex-start',paddingHorizontal:8,paddingVertical:2,borderRadius:6,marginTop:5,backgroundColor:'#F2F2F0'},
  badgeText:{fontSize:11,fontWeight:'600',color:'#666'},
  badgeCritical:{backgroundColor:'#FEE2E2'},badgeTextCritical:{color:'#B91C1C'},
  badgeHigh:{backgroundColor:'#FEF3C7'},badgeTextHigh:{color:'#92400E'},
  badgeMedium:{backgroundColor:'#DBEAFE'},badgeTextMedium:{color:'#1E40AF'},
  badgeLow:{backgroundColor:'#F0FDF4'},badgeTextLow:{color:'#166534'},
  del:{fontSize:22,color:'#D8D8D2',paddingHorizontal:4},
  empty:{textAlign:'center',color:'#C0C0BB',fontSize:14,fontWeight:'500',padding:28}
})
