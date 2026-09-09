import { useState } from 'react';

export default function App() {
  const [step, setStep] = useState(1);
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState('60');
  const [charStyle, setCharStyle] = useState('cinematic');
  const [characters, setCharacters] = useState([]);
  const [newChar, setNewChar] = useState({ name: '', look: '', personality: '' });
  const [scenes, setScenes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState('creator');

  const addCharacter = () => {
    if (!newChar.name) return;
    setCharacters([...characters, { ...newChar, id: Date.now() }]);
    setNewChar({ name: '', look: '', personality: '' });
  };

  const createScenes = () => {
    const total = parseInt(duration);
    const count = Math.ceil(total / 8);
    const newScenes = Array.from({ length: count }, (_, i) => ({
      id: i+1,
      desc: '',
      status: 'pending',
      duration: 8
    }));
    setScenes(newScenes);
    setStep(6);
  };

  const generateAll = async () => {
    setGenerating(true);
    for (let i=0; i<scenes.length; i++) {
      setScenes(prev => prev.map((s, idx) => idx===i ? {...s, status:'generating'} : s));
      await new Promise(r => setTimeout(r, 1500));
      setScenes(prev => prev.map((s, idx) => idx===i ? {...s, status:'done'} : s));
    }
    setGenerating(false);
    setStep(7);
  };

  return (
    <div style={{ background:'#050507', minHeight:'100vh', color:'#fff', fontFamily:'Inter, sans-serif' }}>
      <header style={{ display:'flex', justifyContent:'space-between', padding:'20px 40px', borderBottom:'1px solid #1a1a1a', alignItems:'center' }}>
        <div style={{ fontWeight:900, letterSpacing:'-1px', fontSize:'20px' }}>GABBOSS<span style={{color:'#FFD700'}}>.AI</span> FILM</div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <span style={{ background:'#FFD700', color:'#000', padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:700 }}>250 CREDITS</span>
          <button style={{ background:'#fff', color:'#000', border:'none', padding:'8px 18px', borderRadius:'20px', fontWeight:700 }}>Login</button>
        </div>
      </header>

      <div style={{ display:'flex', justifyContent:'center', gap:'8px', padding:'30px 20px', flexWrap:'wrap' }}>
        {['Your Story','Sign Up / Login','Choose Plan','Create Film','Duration','Characters','Generate'].map((label, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: step >= i+1 ? '#FFD700' : '#222', color: step >= i+1 ? '#000' : '#666', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:800 }}>{i+1}</div>
            <span style={{ fontSize:'11px', color: step >= i+1 ? '#fff' : '#555', fontWeight:600 }}>{label}</span>
            {i<6 && <div style={{ width:'20px', height:'1px', background:'#222', margin:'0 4px' }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px 60px', display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:'30px' }}>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid #1e1e1e', borderRadius:'24px', padding:'30px' }}>
          {step===1 && (
            <div>
              <h1 style={{ fontSize:'42px', lineHeight:'0.9', letterSpacing:'-2px', margin:'0 0 10px' }}>YOUR STORY,<br/>YOUR FILM.</h1>
              <p style={{ color:'#888', marginBottom:'30px' }}>Turn any idea into a cinematic film. 30 sec to 3 min episodes.</p>
              <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Describe your film idea... any genre, any world" style={{ width:'100%', height:'140px', background:'#0a0a0a', border:'1px solid #222', borderRadius:'16px', padding:'16px', color:'#fff' }} />
              <button onClick={()=>setStep(2)} style={{ marginTop:'20px', background:'#FFD700', color:'#000', border:'none', padding:'14px 28px', borderRadius:'30px', fontWeight:800, width:'100%' }}>CONTINUE →</button>
            </div>
          )}
          {step===2 && (
            <div>
              <h2>Sign Up / Login</h2>
              <input placeholder="Email" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #222', borderRadius:'12px', padding:'14px', color:'#fff', marginTop:'20px' }} />
              <input placeholder="Password" type="password" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #222', borderRadius:'12px', padding:'14px', color:'#fff', marginTop:'12px' }} />
              <button onClick={()=>setStep(3)} style={{ marginTop:'20px', background:'#FFD700', color:'#000', border:'none', padding:'14px', borderRadius:'30px', fontWeight:800, width:'100%' }}>CONTINUE</button>
            </div>
          )}
          {step===3 && (
            <div>
              <h2>Choose Your Plan</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginTop:'20px' }}>
                {[
                  { id:'free', name:'Free', price:'$0' },
                  { id:'creator', name:'Creator', price:'$19/mo' },
                  { id:'studio', name:'Studio', price:'$99/mo' }
                ].map(p=>(
                  <div key={p.id} onClick={()=>setPlan(p.id)} style={{ border: plan===p.id ? '2px solid #FFD700' : '1px solid #222', background:'#0a0a0a', borderRadius:'16px', padding:'16px', cursor:'pointer' }}>
                    <div style={{ fontWeight:800 }}>{p.name}</div><div style={{ fontSize:'20px', fontWeight:900 }}>{p.price}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setStep(4)} style={{ marginTop:'20px', background:'#FFD700', color:'#000', border:'none', padding:'14px', borderRadius:'30px', fontWeight:800, width:'100%' }}>CHOOSE {plan.toUpperCase()} →</button>
            </div>
          )}
          {step===4 && (
            <div>
              <h2>Create Your Film</h2>
              <input placeholder="My Cinematic Film" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #222', borderRadius:'12px', padding:'14px', color:'#fff', marginTop:'20px' }} />
              <button onClick={()=>setStep(5)} style={{ marginTop:'20px', background:'#FFD700', color:'#000', border:'none', padding:'14px', borderRadius:'30px', fontWeight:800, width:'100%' }}>NEXT: DURATION →</button>
            </div>
          )}
          {step===5 && (
            <div>
              <h2>Choose Duration</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'20px' }}>
                {[
                  { v:'30', label:'30 seconds', cost:'250 credits' },
                  { v:'60', label:'1 minute', cost:'500 credits' },
                  { v:'120', label:'2 minutes', cost:'1000 credits' },
                  { v:'180', label:'3 min Episode', cost:'1500 credits' }
                ].map(d=>(
                  <div key={d.v} onClick={()=>setDuration(d.v)} style={{ border: duration===d.v ? '2px solid #FFD700' : '1px solid #222', background:'#0a0a0a', borderRadius:'16px', padding:'16px', cursor:'pointer' }}>
                    <div style={{ fontWeight:800 }}>{d.label}</div><div style={{ fontSize:'12px', color:'#888' }}>{d.cost}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'20px' }}>
                <label style={{ fontSize:'12px', color:'#888' }}>Character Style</label>
                <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                  {['realistic','cinematic','cartoon'].map(s=>(
                    <button key={s} onClick={()=>setCharStyle(s)} style={{ flex:1, padding:'10px', borderRadius:'20px', border: charStyle===s ? '2px solid #FFD700' : '1px solid #333', background: charStyle===s ? '#FFD700' : 'transparent', color: charStyle===s ? '#000' : '#fff', fontWeight:700, textTransform:'capitalize' }}>{s}</button>
                  ))}
                </div>
              </div>
              <button onClick={createScenes} style={{ marginTop:'20px', background:'#FFD700', color:'#000', border:'none', padding:'14px', borderRadius:'30px', fontWeight:800, width:'100%' }}>CREATE {duration}s FILM →</button>
            </div>
          )}
          {step===6 && (
            <div>
              <h2>Characters: Choose ANYBODY</h2>
              <p style={{ color:'#666', fontSize:'12px' }}>Real, fictional, historical, yourself — anybody.</p>
              <div style={{ background:'#0a0a0a', border:'1px dashed #333', borderRadius:'16px', padding:'16px', marginTop:'16px' }}>
                <input value={newChar.name} onChange={e=>setNewChar({...newChar, name:e.target.value})} placeholder="Who is this? e.g. John Wick, yourself, a dragon..." style={{ width:'100%', background:'#111', border:'1px solid #222', borderRadius:'10px', padding:'12px', color:'#fff', marginBottom:'8px' }} />
                <input value={newChar.look} onChange={e=>setNewChar({...newChar, look:e.target.value})} placeholder="What do they look like?" style={{ width:'100%', background:'#111', border:'1px solid #222', borderRadius:'10px', padding:'12px', color:'#fff', marginBottom:'8px' }} />
                <input value={newChar.personality} onChange={e=>setNewChar({...newChar, personality:e.target.value})} placeholder="Personality" style={{ width:'100%', background:'#111', border:'1px solid #222', borderRadius:'10px', padding:'12px', color:'#fff', marginBottom:'8px' }} />
                <button onClick={addCharacter} style={{ background:'#fff', color:'#000', border:'none', padding:'10px 16px', borderRadius:'20px', fontWeight:700 }}>+ Add Character</button>
              </div>
              {characters.map(c=>(
                <div key={c.id} style={{ background:'#111', border:'1px solid #222', borderRadius:'12px', padding:'12px', marginTop:'8px' }}>
                  <div style={{ fontWeight:700 }}>{c.name}</div><div style={{ fontSize:'11px', color:'#888' }}>{c.look} • {c.personality} • {charStyle}</div>
                </div>
              ))}
              <button onClick={generateAll} disabled={generating} style={{ marginTop:'20px', background: generating ? '#333' : '#FFD700', color: generating ? '#888' : '#000', border:'none', padding:'16px', borderRadius:'30px', fontWeight:900, width:'100%' }}>
                {generating ? 'GENERATING...' : `🎬 GENERATE ${duration}s FILM`}
              </button>
            </div>
          )}
          {step===7 && (
            <div>
              <h2>Your Final Film Ready</h2>
              <div style={{ background:'#000', borderRadius:'16px', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #222', marginTop:'16px' }}>🎬 {duration}s Film - {charStyle}</div>
              <button style={{ marginTop:'16px', background:'#FFD700', color:'#000', border:'none', padding:'12px', borderRadius:'20px', fontWeight:800, width:'100%' }}>Download & Publish S1 E1</button>
            </div>
          )}
        </div>
        <div>
          <div style={{ background:'rgba(255,215,0,0.05)', border:'1px solid rgba(255,215,0,0.2)', borderRadius:'24px', padding:'20px' }}>
            <h3 style={{ fontSize:'12px', color:'#FFD700' }}>LIVE PREVIEW</h3>
            <div style={{ background:'#000', border
