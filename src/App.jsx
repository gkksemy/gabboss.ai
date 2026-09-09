import { useState } from 'react'

export default function App(){
  const [prompt,setPrompt]=useState("Yo I'm GABBOSS, pulling up in my black G-Wagon in Istanbul, gold chain shining...")
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const [status,setStatus]=useState("")

  const generate=async()=>{
    setLoading(true)
    setStatus("Starting G-Wagon engine...")
    setTimeout(()=>setStatus("Apple putting on gold chain..."),1000)
    setTimeout(()=>setStatus("Rendering 30s in Runway... 60 sec left"),2000)
    setTimeout(()=>{
      setVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
      setLoading(false)
      setStatus("GABBOSS IS LIVE 🍎🔥")
    },4000)
  }

  return(
    <div style={{minHeight:'100vh',background:'radial-gradient(circle at top, #1a1a1a 0%, #000 70%)',color:'#fff',fontFamily:'Inter, sans-serif',padding:'20px'}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0'}}>
          <h1 style={{fontSize:32,fontWeight:900,letterSpacing:-1}}>GABBOSS.AI <span>🍎</span></h1>
          <div style={{background:'#FFD700',color:'#000',padding:'8px 16px',borderRadius:20,fontWeight:800}}>250 CREDITS</div>
        </div>

        {/* HERO */}
        <div style={{textAlign:'center',marginTop:40}}>
          <h2 style={{fontSize:64,fontWeight:900,lineHeight:0.9,margin:0}}>THE APPLE<br/><span style={{color:'#FFD700'}}>THAT DON'T GET EATEN.</span></h2>
          <p style={{opacity:0.6,marginTop:20,fontSize:18}}>G-Wagon • Gold Chain • Talking Apple Gangster • 30 Sec Viral Videos</p>
        </div>

        {/* GENERATOR */}
        <div style={{background:'#111',border:'1px solid #222',borderRadius:24,padding:24,marginTop:50,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            <label style={{opacity:0.5,fontSize:12,letterSpacing:2}}>GABBOSS SCRIPT</label>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:160,background:'#000',border:'1px solid #333',borderRadius:16,color:'#fff',padding:16,marginTop:10,fontSize:16,resize:'none'}}/>
            <button onClick={generate} disabled={loading} style={{width:'100%',marginTop:16,padding:'20px',background: loading?'#333':'#FFD700',color:'#000',border:'none',borderRadius:14,fontWeight:900,fontSize:18,cursor:'pointer'}}>
              {loading?'⏳ '+status:'GENERATE 30s FOR 250 CREDITS →'}
            </button>
            <p style={{fontSize:12,opacity:0.4,marginTop:10}}>~90 seconds • Runway Gen-3 • Lip-synced</p>
          </div>
          <div style={{background:'#000',borderRadius:16,border:'1px solid #222',display:'flex',alignItems:'center',justifyContent:'center',minHeight:320}}>
            {video? <video src={video} controls autoPlay style={{width:'100%',borderRadius:16}}/> : <div style={{textAlign:'center',opacity:0.3}}><div style={{fontSize:60}}>🍎</div><p>G-Wagon preview here</p></div>}
          </div>
        </div>

        <p style={{textAlign:'center',opacity:0.2,marginTop:40,fontSize:12}}>Build v2.0 G-WAGON EDITION - LIVE • gabboss.ai</p>
      </div>
    </div>
  )
}
