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
      const fullPrompt = `${style} style, cinematic 4k: ${story}. Starring: ${characters.join(', ')}. ${style === 'realistic' ? 'photorealistic, 8k detail' : style === 'cinematic' ? 'anamorphic lens, dramatic lighting' : 'pixar style animation'} -- duration ${duration}s with voice and sound`;

      setProgress(20);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: fullPrompt, duration })
      });

      if(!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to start generation');
      }

      const startData = await res.json();
      const taskId = startData.taskId || startData.task_id;
      
      if(!taskId) {
        if(startData.video_url || startData.url) {
          setVideos([startData.video_url || startData.url]);
          setProgress(100);
          setStep(6);
          setGenerating(false);
          return;
        }
        throw new Error('No taskId: ' + JSON.stringify(startData).slice(0,300));
      }

      setCurrentTaskId(taskId);
      setProgress(30);
      setError(`Rendering started... takes 2-4 mins for ${duration}s video. Task: ${taskId.slice(0,8)}`);

      let attempts = 0;
      const maxAttempts = 80; // 20 mins max
      
      const poll = setInterval(async () => {
        attempts++;
        setProgress(prev => Math.min(30 + attempts * 0.9, 95));

        try {
          const statusRes = await fetch(`/api/status?taskId=${taskId}`);
          const statusData = await statusRes.json();

          console.log(`[${attempts}] state=${statusData.state} flag=${statusData.successFlag}`);

          if (statusData.video_url && (statusData.state === 'success' || statusData.successFlag === 1)) {
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
            const reason = statusData.rawState || 'Content policy or credits. Try removing real person names like Elon Musk.';
            setError(`Generation failed (${reason}). Try a simpler prompt without real celebrities. TaskId: ${taskId}`);
            setGenerating(false);
            return;
          }

        } catch (pollErr) {
          console.error('poll error', pollErr);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setError(`Still processing after 20 mins. Your video is rendering on KIE servers. TaskId: ${taskId} - check kie.ai dashboard.`);
          setGenerating(false);
        }
      }, 15000); // every 15s

    } catch(e) {
      setError(e.message);
      console.error(e);
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
          <textarea value={story} onChange={e=>setStory(e.target.value)} placeholder="Ex: A cyberpunk cat superhero saving
