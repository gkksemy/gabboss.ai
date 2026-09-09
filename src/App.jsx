import { useState } from 'react'
export default function App(){
  const [loading,setLoading]=useState(false)
  const [video,setVideo]=useState("")
  const generate=async()=>{
    setLoading(true)
    // MOCK for now - will replace with Runway API
    setTimeout(()=>{setVideo("https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4");setLoading(false)},2000)
  }
  return(
    <div style={{padding:40,textAlign:'center'}}>
      <h1 style={{color:'#FFD700',fontSize:50}}>GABBOSS.AI 🍎</h1>
      <p>Talking Apple Gangster Studio - 30 Sec Video Generator</p>
      <button onClick={generate} style={{padding:'20px 40px',background:'#FFD700',color:'#000',fontSize:20,border:'none',borderRadius:10,cursor:'pointer',marginTop:20}}>
        {loading?"GENERATING...":"GENERATE 30s FOR 250 CREDITS →"}
      </button>
      {video&&<video src={video} controls autoPlay style={{width:'100%',maxWidth:600,marginTop:30,borderRadius:20}}/>}
      <p style={{marginTop:30,opacity:0.5}}>Build v1.0 - LIVE</p>
    </div>
  )
}
