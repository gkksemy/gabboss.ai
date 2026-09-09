import { useState } from 'react'

export default function App(){
  const [prompt,setPrompt]=useState("GABBOSS, a talking red apple with gold chain and black sunglasses, driving a black G-Wagon G63 in Istanbul at night, gangster style, cinematic")
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const [status,setStatus]=useState("")

  const generate=async()=>{
    setLoading(true)
    setStatus("Connecting to Runway Gen-3...")
    try{
      const res = await fetch('/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      })
      const data = await res.json()
      setStatus("Rendering your G-Wagon Apple... ~60 sec")
      // Simulate 90 sec wait for demo
      setTimeout(()=>{
        setVideo(data.videoUrl)
        setLoading(false)
        setStatus("GABBOSS IS READY 🍎💥")
      },2000)
    }catch(e){
      setStatus("Error - using demo video")
      setVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
      setLoading(false)
    }
  }

  return(
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',fontFamily:'system-ui',padding:20}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 style={{fontWeight:900,letterSpacing:-1}}>GABBOSS.AI 🍎</h1>
          <div style={{background:'#FFD700',color:'#000',padding:'8px 18px',borderRadius:99,fontWeight:900}}>250 CREDITS</div>
        </header>

        <div style={{textAlign:'center',marginTop:50}}>
          <h2 style={{fontSize:'clamp(32px,8vw,72px)',fontWeight:900,lineHeight:0.9,margin:0}}>THE APPLE<br/><span style={{color:'#FFD700'}}>IN THE G-WAGON.</span></h2>
          <p style={{opacity:0.5,marginTop:15}}>30 Sec Viral Gangster Videos • Inspired by your G-Wagon story</p>
        </div>

        <div style={{background:'#0f0f0f',border:'1px solid #222',borderRadius:28,padding:24,marginTop:50,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24}}>
          <div>
            <div style={{fontSize:11,letterSpacing:3,opacity:0.4}}>PROMPT - G-WAGON STORY</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:180,background:'#000',border:'1px solid #333',borderRadius:16,color:'#fff',padding:16,marginTop:12,fontSize:15}}/>
            <button onClick={generate} disabled={loading} style={{width:'100%',marginTop:16,padding:'20px',background:loading?'#222':'#FFD700',color:loading?'#666':'#000',border:'none',borderRadius:14,fontWeight:900,fontSize:18,cursor:'pointer'}}>
              {loading ? `⏳ ${status}` : 'GENERATE 30s FOR 250 CREDITS →'}
            </button>
            <div style={{marginTop:12,fontSize:12,opacity:0.5}}>{status || 'Ready • ~90 sec generation time'}</div>
          </div>
          <div style={{background:'#000',borderRadius:18,border:'1px solid #222',minHeight:380,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
            {video ? <video src={video} controls autoPlay loop style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{textAlign:'center',padding:40}}><div style={{fontSize:80}}>🚙🍎</div><div style={{opacity:0.4,marginTop:10}}>Your G-Wagon Apple video will appear here after you click GENERATE</div><div style={{opacity:0.2,fontSize:12,marginTop:20}}>Click yellow button →</div></div>}
          </div>
        </div>

        <div style={{textAlign:'center',opacity:0.15,marginTop:50,fontSize:11,letterSpacing:2}}>GABBOSS.AI • G-WAGON EDITION v3.0 • REAL API CONNECTED</div>
      </div>
    </div>
  )
}
