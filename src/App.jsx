import { useState } from 'react'
export default function App(){
  const [prompt,setPrompt]=useState("Talking red apple with gold chain and black sunglasses driving black G-Wagon G63 in Istanbul at night, gangster, smoke, cinematic")
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const [status,setStatus]=useState("Ready • ~90 sec")
  const [debug,setDebug]=useState("")

  const generate=async()=>{
    setLoading(true); setVideo(""); setStatus("🔥 Sending to YOUR Runway account..."); setDebug("")
    try{
      const res = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})})
      const data = await res.json()
      setDebug(JSON.stringify(data,null,2))
      if(data.videoUrl){ setVideo(data.videoUrl); setStatus("✅ GABBOSS READY 🍎🚙") }
      else{ setStatus("❌ "+(data.error||"No video yet")); }
    }catch(e){ setStatus("❌ "+e.message); setDebug(e.message) }
    setLoading(false)
  }

  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'system-ui',padding:20}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between'}}><h1 style={{fontWeight:900}}>GABBOSS.AI 🍎</h1><div style={{background:'#FFD700',color:'#000',padding:'8px 18px',borderRadius:99,fontWeight:900}}>250 CREDITS</div></header>
        <div style={{textAlign:'center',marginTop:40}}><h2 style={{fontSize:60,fontWeight:900,lineHeight:0.9,margin:0}}>THE APPLE<br/><span style={{color:'#FFD700'}}>IN THE G-WAGON.</span></h2><p style={{opacity:0.5}}>30 Sec Viral • Your Runway API</p></div>
        <div style={{background:'#0f0f0f',border:'1px solid #222',borderRadius:28,padding:24,marginTop:40,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}>
          <div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:180,background:'#000',border:'1px solid #333',borderRadius:16,color:'#fff',padding:16}}/>
            <button onClick={generate} disabled={loading} style={{width:'100%',marginTop:16,padding:'20px',background:loading?'#222':'#FFD700',color:loading?'#666':'#000',border:'none',borderRadius:14,fontWeight:900,fontSize:18}}>{loading?`⏳ ${status}`:'GENERATE 30s FOR 250 CREDITS →'}</button>
            <div style={{marginTop:12,fontSize:12,opacity:0.7,wordBreak:'break-all'}}>{status}</div>
            <pre style={{marginTop:10,fontSize:10,opacity:0.4,background:'#000',padding:10,borderRadius:10,overflow:'auto',maxHeight:200}}>{debug}</pre>
          </div>
          <div style={{background:'#000',borderRadius:18,border:'1px solid #222',minHeight:400,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
            {video? <video src={video} controls autoPlay style={{width:'100%'}}/> : <div style={{textAlign:'center',opacity:0.3,padding:20}}>Click GENERATE and watch DEBUG box below button. It will tell you exact Runway error.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
