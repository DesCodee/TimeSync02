import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

const COLORS = ['#7F77DD','#378ADD','#1D9E75','#D85A30','#D4537E','#BA7517']

export default function ProjectsScreen({ user }) {
  const [projects,setProjects] = useState([])
  const [adding,setAdding] = useState(false)
  const [newName,setNewName] = useState('')
  const [newDesc,setNewDesc] = useState('')
  const [newColor,setNewColor] = useState(COLORS[0])

  useEffect(()=>{loadProjects()},[])

  async function loadProjects(){
    const {data}=await supabase.from('projects').select('*, tasks(*)').eq('user_id',user.id).order('created_at',{ascending:false})
    if(data) setProjects(data)
  }

  async function addProject(){
    if(!newName.trim()) return
    const {data}=await supabase.from('projects').insert({user_id:user.id,name:newName,description:newDesc,color:newColor,status:'active'}).select().single()
    if(data) setProjects(p=>[{...data,tasks:[]},...p])
    setNewName('');setNewDesc('');setAdding(false)
  }

  return(
    <ScrollView style={s.wrap} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Text style={s.title}>Проекты</Text>
        <TouchableOpacity style={s.addBtn} onPress={()=>setAdding(true)}><Text style={s.addBtnText}>+ Новый</Text></TouchableOpacity>
      </View>
      {adding&&(
        <View style={s.form}>
          <TextInput style={s.input} placeholder="Название проекта" value={newName} onChangeText={setNewName} autoFocus/>
          <TextInput style={[s.input,{marginTop:8}]} placeholder="Описание" value={newDesc} onChangeText={setNewDesc}/>
          <View style={s.colorRow}>
            {COLORS.map(c=><TouchableOpacity key={c} style={[s.colorDot,{backgroundColor:c},newColor===c&&s.colorDotSelected]} onPress={()=>setNewColor(c)}/>)}
          </View>
          <View style={s.formActions}>
            <TouchableOpacity style={s.cancelBtn} onPress={()=>setAdding(false)}><Text style={s.cancelText}>Отмена</Text></TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={addProject}><Text style={s.saveBtnText}>Создать</Text></TouchableOpacity>
          </View>
        </View>
      )}
      {projects.length===0?<Text style={s.empty}>Нет проектов</Text>:projects.map(p=>{
        const total=p.tasks?.length||0
        const done=p.tasks?.filter(t=>t.done).length||0
        const pct=total>0?done/total:0
        return(
          <View key={p.id} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.dot,{backgroundColor:p.color}]}/>
              <Text style={s.cardName}>{p.name}</Text>
              <View style={[s.status,p.status==='active'?s.statusActive:s.statusLate]}>
                <Text style={[s.statusText,p.status==='active'?s.statusTextActive:s.statusTextLate]}>{p.status==='active'?'Активен':'Просрочено'}</Text>
              </View>
            </View>
            {p.description?<Text style={s.desc}>{p.description}</Text>:null}
            <View style={s.bar}><View style={[s.barFill,{width:`${pct*100}%`,backgroundColor:p.color}]}/></View>
            <Text style={s.meta}>{done}/{total} задач</Text>
          </View>
        )
      })}
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
  colorRow:{flexDirection:'row',gap:10,marginTop:12},
  colorDot:{width:28,height:28,borderRadius:14},
  colorDotSelected:{transform:[{scale:1.3}]},
  formActions:{flexDirection:'row',justifyContent:'flex-end',gap:8,marginTop:14},
  cancelBtn:{paddingVertical:9,paddingHorizontal:18,borderRadius:50,borderWidth:1.5,borderColor:'#E8E8E4'},
  cancelText:{fontSize:13,fontWeight:'500',color:'#666'},
  saveBtn:{backgroundColor:'#1a1a1a',paddingVertical:9,paddingHorizontal:18,borderRadius:50},
  saveBtnText:{color:'#fff',fontWeight:'600',fontSize:13},
  card:{backgroundColor:'#fff',borderRadius:18,padding:16,marginBottom:10,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:8,elevation:2},
  cardHeader:{flexDirection:'row',alignItems:'center',gap:9,marginBottom:6},
  dot:{width:11,height:11,borderRadius:6},
  cardName:{fontSize:16,fontWeight:'600',flex:1,letterSpacing:-0.3},
  status:{paddingHorizontal:10,paddingVertical:3,borderRadius:50},
  statusActive:{backgroundColor:'#F0FDF4'},statusLate:{backgroundColor:'#FEF2F2'},
  statusText:{fontSize:11,fontWeight:'700'},
  statusTextActive:{color:'#16A34A'},statusTextLate:{color:'#DC2626'},
  desc:{fontSize:13,color:'#999',marginBottom:10},
  bar:{height:4,backgroundColor:'#F2F2F0',borderRadius:99,marginTop:10,marginBottom:6},
  barFill:{height:4,borderRadius:99},
  meta:{fontSize:12,fontWeight:'500',color:'#C0C0BB',textAlign:'right'},
  empty:{textAlign:'center',color:'#C0C0BB',fontSize:14,fontWeight:'500',padding:40}
})
