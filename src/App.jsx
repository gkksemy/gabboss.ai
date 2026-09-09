import { useState } from 'react'
export default function App(){
  const [prompt,setPrompt]=useState("Talking red apple with gold chain and black sunglasses driving black G-Wagon G63 in Istanbul at night, gangster, smoke, cinematic")
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const [status,setStatus]=useState("Ready")

  const generate=async()=>{
    setLoading(true); setStatus("Starting...")
    const res = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})})
    const data = await res.json()
    if(data.error){ setStatus(data.error); setLoading(false); return; }
    const taskId = data.taskId
    setStatus(`Rendering... task ${taskId.slice(0,8)}`)
    // Poll
    let tries=0
    while(tries<40){
      await new Promise(r=>setTimeout(r,3000))
      const check = await fetch(`/api/check?taskId=${taskId}`)
      const cdata = await check.json()
      setStatus(`Status: ${cdata.status} (${tries*3}s)`)
      if(cdata.status==='SUCCEEDED'){ setVideo(cdata.output[0]); setStatus("✅ READY 🍎🚙"); break; }
      if(cdata.status==='FAILED'){ setStatus("Failed: "+JSON.stringify(cdata)); break; }
      tries++
    }
    setLoading(false)
  }

  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'system-ui',padding:20}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <h1 style={{fontWeight:900}}>GABBOSS.AI 🍎 — YOUR API</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:30}}>
          <div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:150,background:'#111',color:'#fff',padding:12,borderRadius:12}}/>
            <button onClick={generate} disabled={loading} style={{width:'100%',marginTop:12,padding:16,background:'#FFD700',color:'#000',fontWeight:900,borderRadius:12}}>{loading?status:'GENERATE'}</button>
            <div style={{marginTop:10,fontSize:12,opacity:0.6}}>{status}</div>
          </div>
          <div style={{background:'#111',borderRadius:12,minHeight:300,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {video? <video src={video} controls autoPlay style={{width:'100%'}}/> : <div style={{opacity:0.3}}>Video will appear here after ~60-90 sec polling</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
