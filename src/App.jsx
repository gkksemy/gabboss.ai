  const generate=async()=>{
    setLoading(true)
    setStatus("Starting G-Wagon engine... Sending to Runway...")
    setVideo("")
    try{
      const res = await fetch('/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({prompt})
      })
      const data = await res.json()
      console.log(data)
      if(data.videoUrl){
        setVideo(data.videoUrl)
        setStatus("GABBOSS READY! 🍎")
      }else{
        setStatus("❌ ERROR: " + (data.error || JSON.stringify(data)))
        alert("Error: " + (data.error || "Check Vercel logs"))
      }
    }catch(e){
      setStatus("❌ Fetch error: " + e.message)
    }
    setLoading(false)
  }
