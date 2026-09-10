import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [story, setStory] = useState('');
  const [characters, setCharacters] = useState('');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState('cinematic');
  const [status, setStatus] = useState('idle'); // idle, generating, done, fail
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const intervalRef = useRef(null);

  const generateReal = async () => {
    if (!story.trim()) return alert('Enter story');
    setStatus('generating');
    setProgress(10);
    setVideoUrl(null);
    setErrorMsg('');
    
    try {
      const fullPrompt = `${style} style, ${story}. ${characters ? `Characters: ${characters}` : ''} 4k, highly detailed, dramatic lighting, no text, no watermark`;
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, duration })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      
      const taskId = data.taskId;
      setCurrentTaskId(taskId);
      localStorage.setItem('lastTaskId', taskId); // FIX: saves ID
      console.log('Task created:', taskId);
      
      // Start polling
      intervalRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/status?taskId=${taskId}`);
          const d = await r.json();
          console.log('Status:', d);
          
          if (d.state === 'success' && d.video_url) {
            clearInterval(intervalRef.current);
            setVideoUrl(d.video_url);
            setStatus('done');
            setProgress(100);
          } else if (d.state === 'fail') {
            clearInterval(intervalRef.current);
            setStatus('fail');
            setErrorMsg(d.failReason || JSON.stringify(d));
          } else {
            // generating
            setProgress(prev => Math.min(prev + 3, 92));
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000);
      
    } catch (e) {
      setStatus('fail');
      setErrorMsg(e.message);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black mb-2">GABBOSS AI STUDIO</h1>
      <p className="text-gray-400 mb-8">Veo 3.1 Fast — Real Generation</p>
      
      <div className="w-full max-w-2xl bg-zinc-900 p-6 rounded-2xl space-y-4">
        <textarea value={story} onChange={e=>setStory(e.target.value)} placeholder="Story: a cute orange cat superhero flying over NYC at night..." className="w-full p-3 bg-black rounded-lg h-24" />
        <input value={characters} onChange={e=>setCharacters(e.target.value)} placeholder="Characters (leave empty for test, no real names)" className="w-full p-3 bg-black rounded-lg" />
        
        <div className="flex gap-2">
          {[30,60].map(s=> <button key={s} onClick={()=>setDuration(s)} className={`px-4 py-2 rounded ${duration===s?'bg-white text-black':'bg-zinc-800'}`}>{s}s</button>)}
        </div>
        
        <select value={style} onChange={e=>setStyle(e.target.value)} className="w-full p-3 bg-black rounded-lg">
          <option value="cinematic">Cinematic</option>
          <option value="anime">Anime</option>
          <option value="realistic">Realistic</option>
        </select>
        
        <button onClick={generateReal} disabled={status==='generating'} className="w-full py-4 bg-white text-black font-bold rounded-xl disabled:opacity-50">
          {status==='generating' ? `GENERATING ${progress}%` : 'GENERATE FILM'}
        </button>
        
        {currentTaskId && <p className="text-xs text-gray-500 break-all">Task: {currentTaskId}</p>}
        {status==='generating' && <div className="w-full bg-zinc-800 h-2 rounded"><div className="bg-white h-2 rounded" style={{width: `${progress}%`}}></div></div>}
        {errorMsg && <p className="text-red-400 text-sm break-all">Error: {errorMsg}</p>}
        {videoUrl && <video src={videoUrl} controls autoPlay className="w-full rounded-xl mt-4" />}
      </div>
      
      <div className="mt-6 text-sm text-gray-500 max-w-2xl text-center">
        Test with safe prompt first. No real people (Elon Musk) or copyrighted characters (Goku) — use descriptions. If fail after 10 mins, check https://kie.ai task history for failReason.
      </div>
    </div>
  );
}
