chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GEMINI_INFERENCE') {
    (async () => {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${request.key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: request.prompt }] }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        sendResponse({ success: true, data });
      } catch (error) {
        // Silently fail to avoid console spam
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    // Return true to indicate we wish to send a response asynchronously
    return true; 
  }
});
