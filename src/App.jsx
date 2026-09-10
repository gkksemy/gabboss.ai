import { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState([]);
  const [charInput, setCharInput] = useState('');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState('realistic');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState('');

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
    setCurrentTaskId('');
    try {
      const fullPrompt = style + ' style cinematic 4k: ' + story + '. Starring: ' + characters.join(', ') + '. Duration ' + duration + 's with voice and sound';
      setProgress(20);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: fullPrompt, duration })
      });
      if(!res.ok) { const err = await res.text(); throw new Error(err || 'Failed to start'); }
      const startData = await res.json();
      const taskId = startData.taskId || startData.task_id;
      if(!taskId) throw new Error('No taskId: ' + JSON.stringify(startData).slice(0,200));
      setCurrentTaskId(taskId);
      setProgress(30);
      setError('Rendering started... 2-4 mins. Task: ' + taskId.slice(0,8));
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        setProgress(p => Math.min(30 + attempts * 0.9, 95));
        try {
          const statusRes = await fetch('/api/status?taskId=' + taskId);
          const statusData = await statusRes.json();
          console.log('['+attempts+'] ' + statusData.state + ' flag=' + statusData.successFlag);
          if (statusData.video_url) {
            clearInterval(poll);
            setVideos([statusData.video_url]);
            setProgress(100);
            setStep(6);
            setError('');
            setGenerating(false);
            return;
          }
          if (statusData.state === 'fail' || statusData.successFlag === 2 || statusData.successFlag === 3) {
            clearInterval(poll);
            setError('Failed - try without real celebrity names. TaskId: ' + taskId);
            setGenerating(false);
            return;
          }
        } catch(e) { console.error(e); }
        if (attempts >= 80) { clearInterval(poll); setError('Taking >20 mins. Check kie.ai dashboard TaskId: ' + taskId); setGenerating(false); }
      }, 15000);
    } catch(e) { setError(e.message); setGenerating(false); }
  };

  return (
    <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px'}}>
      <h1 style={{fontSize:'48px', fontWeight:'900', textAlign:'center', margin:'20px 0'}}>GABBOSS<span style={{color:'#FFD700'}}>.AI</span></h1>
      {step === 1 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>1. YOUR STORY</h2>
          <textarea value={story} onChange={e=>setStory(e.target.value)} placeholder="A cyberpunk cat superhero saving NYC" style={{width:'100%', height:'150px', background:'#111', color:'#fff', border:'1px solid #333', padding:'15px', borderRadius:'12px', margin:'15px 0'}} />
          <button onClick={()=>setStep(2)} disabled={!story} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', width:'100%'}}>NEXT</button>
        </div>
      )}
      {step === 2 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>2. ADD ANYBODY</h2>
          <div style={{display:'flex', gap:'10px', margin:'15px 0'}}>
            <input value={charInput} onChange={e=>setCharInput(e.target.value)} placeholder="my dog, robot..." style={{flex:1, background:'#111', color:'#fff', border:'1px solid #333', padding:'15px', borderRadius:'12px'}} />
            <button onClick={addCharacter} style={{background:'#fff', color:'#000', padding:'15px 25px', borderRadius:'12px', fontWeight:'800', border:'none'}}>+ ADD</button>
          </div>
          <div>{characters.map((c,i)=><span key={i} style={{background:'#FFD700', color:'#000', padding:'8px 15px', borderRadius:'20px', margin:'5px', display:'inline-block'}}>{c}</span>)}</div>
          <button onClick={()=>setStep(3)} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', width:'100%', marginTop:'20px'}}>NEXT</button>
        </div>
      )}
      {step === 3 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>3. DURATION</h2>
          <div>{[30,60,120,180].map(d=>(<button key={d} onClick={()=>setDuration(d)} style={{background:duration===d?'#FFD700':'#111', color:duration===d?'#000':'#fff', padding:'15px 25px', borderRadius:'12px', border:'1px solid #333', margin:'5px'}}>{d<60?d+'s':d/60+'min'}</button>))}</div>
          <button onClick={()=>setStep(4)} style={{background:'#FFD700', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', width:'100%', marginTop:'20px'}}>NEXT</button>
        </div>
      )}
      {step === 4 && (
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <h2>4. STYLE</h2>
          <div>{['realistic','cinematic','cartoon'].map(s=>(<button key={s} onClick={()=>setStyle(s)} style={{background:style===s?'#FFD700':'#111', color:style===s?'#000':'#fff', padding:'15px 25px', borderRadius:'12px', border:'1px solid #333', margin:'5px', textTransform:'uppercase'}}>{s}</button>))}</div>
          <button onClick={generateReal} style={{background:'#FFD700', color:'#000', padding:'20px 30px', borderRadius:'30px', fontWeight:'900', border:'none', width:'100%', marginTop:'20px', fontSize:'18px'}}>GENERATE FILM</button>
          {error && <p style={{color:'#FFD700', marginTop:'20px'}}>{error}</p>}
        </div>
      )}
      {generating && (
        <div style={{maxWidth:'700px', margin:'50px auto', textAlign:'center'}}>
          <h2>Rendering {Math.round(progress)}%</h2>
          <div style={{background:'#111', height:'10px', borderRadius:'10px', margin:'20px 0'}}><div style={{background:'#FFD700', height:'100%', width:progress+'%', borderRadius:'10px'}}></div></div>
          <p>VEO 3.1 takes 2-4 mins. Don't close.</p>
          <p style={{fontSize:'11px', color:'#555'}}>{currentTaskId}</p>
          <p style={{color:'#FFD700'}}>{error}</p>
        </div>
      )}
      {step === 6 && (
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'center'}}>
          <h2 style={{color:'#FFD700'}}>FILM READY</h2>
          {videos.map((v,i)=>(<video key={i} src={v} controls autoPlay style={{width:'100%', borderRadius:'16px', margin:'20px 0'}} />))}
          <button onClick={()=>{setStep(1); setStory(''); setCharacters([]); setVideos([]); setError(''); setCurrentTaskId(''); setProgress(0);}} style={{background:'#fff', color:'#000', padding:'15px 30px', borderRadius:'30px', fontWeight:'800', border:'none', marginTop:'20px'}}>MAKE ANOTHER</button>
        </div>
      )}
    </div>
  );
}
