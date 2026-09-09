import { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState([]);
  const [charInput, setCharInput] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState('realistic');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');

  const addCharacter = () => {
    if(charInput.trim()) {
      setCharacters([...characters, charInput.trim()]);
      setCharInput('');
    }
  };

  const generateReal = async () => {
    setGenerating(true);
    setProgress(10);
    setError('');
    setVideos([]);

    try {
      const fullPrompt = `${style} style, cinematic 4k: ${story}. Starring: ${characters.join(', ')}. ${style === 'realistic' ? 'photorealistic, 8k detail' : style === 'cinematic' ? 'anamorphic lens, dramatic lighting' : 'pixar style animation'} -- duration ${duration}s with voice and sound`;

      setProgress(30);

      // CALL YOUR BACKEND
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: fullPrompt, duration })
      });

      setProgress(60);

      if(!res.ok) {
        const err = await res.text();
        throw new Error(err || 'KIE API failed');
      }

      const data = await res.json();
      
      setProgress(90);
      
      // KIE returns video_url or task
      if(data.video_url || data.url || data.data?.video_url) {
        setVideos([data.video_url || data.url || data.data.video_url]);
      } else if(data.task_id) {
        // polling if async
        setError('Video generating... task: ' + data.task_id + ' — check KIE dashboard');
      } else {
        setVideos([JSON.stringify(data)]); // show raw for debug
      }

      setProgress(100);
      setStep(6);

    } catch(e) {
      setError(e.message);
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', fontFamily:'Syne, sans-serif', padding:'20px'}}>
      <h1 style={{fontSize:'48px', fontWeight:'900', textAlign:'center', margin:'20px 0'}}>
        GABBOSS<span style={{color:'#FFD700'}}>.AI</span>
      </h1>
      
      {step === 1 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>1. YOUR STORY (Any universe)</h2>
          <textarea value={story} onChange={e=>setStory(e.target.value)} placeholder="Ex: Me as superhero fighting dragons in cyberpunk NYC with my dog..." style={{width:'100%', height:'150px', background:'#111', color:'#fff', border:'1px solid #333', padding:'15px', borderRadius:'12px', margin:'15px 0'}} />
          <button onClick={()=>setStep(2)} disabled={!story} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', cursor:'pointer', width:'100%'}}>NEXT →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>2. ADD ANYBODY (real people, fictional, yourself, animals)</h2>
          <div style={{display:'flex', gap:'10px', margin:'15px 0'}}>
            <input value={charInput} onChange={e=>setCharInput(e.target.value)} placeholder="Ex: Elon Musk, Goku, my cat Whiskers..." style={{flex:1, background:'#111', color:'#fff', border:'1px solid #333', padding:'15px', borderRadius:'12px'}} />
            <button onClick={addCharacter} style={{background:'#fff', color:'#000', padding:'15px 25px', borderRadius:'12px', fontWeight:'800', border:'none', cursor:'pointer'}}>+ ADD</button>
          </div>
          <div>{characters.map((c,i)=><span key={i} style={{background:'#FFD700', color:'#000', padding:'8px 15px', borderRadius:'20px', margin:'5px', display:'inline-block'}}>{c}</span>)}</div>
          <button onClick={()=>setStep(3)} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', cursor:'pointer', width:'100%', marginTop:'20px'}}>NEXT →</button>
        </div>
      )}

      {step === 3 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>3. DURATION</h2>
          {[30,60,120,180].map(d=>(
            <button key={d} onClick={()=>setDuration(d)} style={{background:duration===d?'#FFD700':'#111', color:duration===d?'#000':'#fff', padding:'15px 25px', borderRadius:'12px', border:'1px solid #333', margin:'5px', cursor:'pointer'}}>{d<60?`${d}s`:`${d/60}min`}</button>
          ))}
          <button onClick={()=>setStep(4)} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', cursor:'pointer', width:'100%', marginTop:'20px'}}>NEXT →</button>
        </div>
      )}

      {step === 4 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>4. STYLE</h2>
          {['realistic','cinematic','cartoon'].map(s=>(
            <button key={s} onClick={()=>setStyle(s)} style={{background:style===s?'#FFD700':'#111', color:style===s?'#000':'#fff', padding:'15px 25px', borderRadius:'12px', border:'1px solid #333', margin:'5px', cursor:'pointer', textTransform:'uppercase'}}>{s}</button>
          ))}
          <button onClick={generateReal} style={{background:'#FFD700', color:'#000', padding:'20px 30px', borderRadius:'30px', fontWeight:'900', border:'none', cursor:'pointer', width:'100%', marginTop:'20px', fontSize:'18px'}}>🎬 GENERATE REAL FILM WITH KIE VEO3.1</button>
        </div>
      )}

      {generating && (
        <div style={{maxWidth:'700px', margin:'50px auto', textAlign:'center'}}>
          <h2>Generating {progress}%</h2>
          <div style={{background:'#111', height:'10px', borderRadius:'10px', margin:'20px 0'}}><div style={{background:'#FFD700', height:'100%', width:`${progress}%`, borderRadius:'10px', transition:'width 0.5s'}}></div></div>
          <p>Calling veo3.1 with voice... this takes 60-90 seconds</p>
          {error && <p style={{color:'#ff4444'}}>{error}</p>}
        </div>
      )}

      {step === 6 && (
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'center'}}>
          <h2 style={{color:'#FFD700'}}>FILM READY 🔥</h2>
          {videos.length > 0 ? videos.map((v,i)=>(
            v.startsWith('http') ? <video key={i} src={v} controls style={{width:'100%', borderRadius:'16px', margin:'20px 0'}} /> : <pre style={{background:'#111', padding:'20px', borderRadius:'12px', textAlign:'left', overflow:'auto'}}>{v}</pre>
          )) : <p>No video URL returned — check Vercel logs</p>}
          {error && <p style={{color:'#ff4444'}}>{error}</p>}
          <button onClick={()=>{setStep(1); setStory(''); setCharacters([]); setVideos([]);}} style={{background:'#fff', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', cursor:'pointer', marginTop:'20px'}}>MAKE ANOTHER FILM →</button>
        </div>
      )}
    </div>
  );
}
