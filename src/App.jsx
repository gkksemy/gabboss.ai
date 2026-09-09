import { useState } from 'react'
export default function App(){
  const [prompt,setPrompt]=useState("Talking red apple with gold chain and black sunglasses driving black G-Wagon G63 in Istanbul at night, gangster, smoke, cinematic")
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const [status,setStatus]=useState("Ready • Gen4.5 LIVE ✅")

  const generate=async()=>{
    setLoading(true); setVideo(""); setStatus("Starting Runway Gen4.5...")
    try{
      const res = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})})
      const data = await res.json()
      if(data.error){ setStatus("❌ "+data.error); setLoading(false); return; }
      const taskId = data.taskId
      setStatus(`🎬 Rendering task ${taskId.slice(0,8)}...`)
      let tries=0
      while(tries<50){
        await new Promise(r=>setTimeout(r,4000))
        const check = await fetch(`/api/check?taskId=${taskId}`)
        const c = await check.json()
        setStatus(`${c.status} • ${(tries*4)}s • Cost: ${c.cost?.credits||''} credits`)
        if(c.status==='SUCCEEDED'){ setVideo(c.output[0]); setStatus(`✅ GABBOSS READY 🍎💥 Cost: ${c.cost.credits} credits`); break; }
        if(c.status==='FAILED'){ setStatus("❌ Failed "+JSON.stringify(c)); break; }
        tries++
      }
    }catch(e){ setStatus("❌ "+e.message) }
    setLoading(false)
  }

  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'system-ui',padding:20}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h1 style={{fontWeight:900,margin:0}}>GABBOSS.AI 🍎</h1><div style={{background:'#FFD700',color:'#000',padding:'8px 18px',borderRadius:99,fontWeight:900}}>250 CREDITS</div></header>
        <div style={{textAlign:'center',marginTop:30}}><h2 style={{fontSize:56,fontWeight:900,lineHeight:0.9,margin:0}}>THE APPLE<br/><span style={{color:'#FFD700'}}>IN THE G-WAGON.</span></h2><p style={{opacity:0.5}}>Gen-4.5 • Real Runway API • No Mock</p></div>
        <div style={{background:'#0f0f0f',border:'1px solid #222',borderRadius:28,padding:20,marginTop:30,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:20}}>
          <div>
            <div style={{fontSize:12,opacity:0.5,marginBottom:8}}>PROMPT - G-WAGON STORY</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:160,background:'#000',border:'1px solid #333',borderRadius:16,color:'#fff',padding:14,fontSize:14}}/>
            <button onClick={generate} disabled={loading} style={{width:'100%',marginTop:14,padding:'18px',background:loading?'#222':'#FFD700',color:loading?'#777':'#000',border:'none',borderRadius:14,fontWeight:900,fontSize:16,cursor:'pointer'}}>{loading?status:'GENERATE 30s FOR 250 CREDITS →'}</button>
            <div style={{marginTop:10,fontSize:11,opacity:0.6,wordBreak:'break-all'}}>{status}</div>
            <div style={{marginTop:8,fontSize:10,opacity:0.4}}>Last video cost 60 credits • 5 sec. For 30 sec use duration: 10 and loop or 3x generations.</div>
          </div>
          <div style={{background:'#000',borderRadius:18,border:'1px solid #222',minHeight:380,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
            {video? <video src={video} controls autoPlay loop style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{textAlign:'center',opacity:0.3,padding:20}}><div style={{fontSize:40}}>🚙🍎</div>Your G-Wagon Apple video will appear here<br/>Click yellow button →<br/><br/><small style={{fontSize:10}}>Polling api/check.js every 4 sec</small></div>}
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:16,fontSize:10,opacity:0.3}}>GABBOSS.AI • G-WAGON EDITION v5.0 • REAL API CONNECTED • Task polling fixed</div>
      </div>
    </div>
  )
}
