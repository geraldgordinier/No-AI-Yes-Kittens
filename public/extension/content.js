const AI_MARKERS = [
  { id: 'ai_word', regex: /\bAI\b/, name: "\"AI mentioned\"", level: 3 },
  { id: 'testament', regex: /testament to/i, name: "\"Testament to\"", level: 3 },
  { id: 'dive_deep', regex: /dive deep/i, name: "\"Dive deep\"", level: 3 },
  { id: 'not_x_but_y', regex: /(?:it(?:')?s not .*?, it(?:')?s|it(?:')?s .*?, not)/i, name: "\"It's not X, it's Y\"", level: 2 },
  { id: 'buckle_up', regex: /buckle up/i, name: "\"Buckle up\"", level: 2 },
  { id: 'game_changer', regex: /game-?changer/i, name: "\"Game-changer\"", level: 2 },
  { id: 'unlock_power', regex: /unlock the power of/i, name: "\"Unlock the power of\"", level: 2 },
  { id: 'ever_evolving', regex: /ever-?evolving/i, name: "\"Ever-evolving\"", level: 2 },
  { id: 'supercharge', regex: /supercharge your/i, name: "\"Supercharge your\"", level: 2 },
  { id: 'ah_the', regex: /\bah, the\b/i, name: "\"Ah, the\"", level: 2 },
  { id: 'in_conclusion', regex: /\bin conclusion\b/i, name: "\"In conclusion\"", level: 2 },
  { id: 'lets_dive_in', regex: /let(?:')?s dive in/i, name: "\"Let's dive in\"", level: 2 },
  { id: 'important_to_remember', regex: /it(?:')?s important to remember/i, name: "\"It's important to remember\"", level: 2 },
  { id: 'picture_this', regex: /\bpicture this\b/i, name: "\"Picture this\"", level: 2 },
  { id: 'imagine_a_world', regex: /imagine a world where/i, name: "\"Imagine a world\"", level: 2 },
  { id: 'in_the_realm_of', regex: /in the realm of/i, name: "\"In the realm of\"", level: 2 },
  { id: 'delve', regex: /\bdelve\b/i, name: "\"Delve\"", level: 1 },
  { id: 'fast_paced', regex: /in today(?:')?s fast(?:\-)?paced/i, name: "\"In today's fast-paced\"", level: 1 },
  { id: 'navigating', regex: /navigating the(?: complexities)?/i, name: "\"Navigating the complexities\"", level: 1 },
  { id: 'paradigm_shift', regex: /a paradigm shift/i, name: "\"A paradigm shift\"", level: 1 },
  { id: 'tapestry', regex: /tapestry of/i, name: "\"Tapestry of\"", level: 1 },
  { id: 'transformative', regex: /transformative power/i, name: "\"Transformative power\"", level: 1 },
  { id: 'as_an_ai', regex: /\bas an ai\b/i, name: "\"As an AI\"", level: 1 }
];

const KITTENS = [
  "kittens/kitten1.jpg",
  "kittens/kitten2.jpg",
  "kittens/kitten3.jpg",
  "kittens/kitten4.jpg",
  "kittens/kitten5.jpg",
  "kittens/kitten6.jpg",
  "kittens/kitten7.jpg",
  "kittens/kitten8.jpg",
  "kittens/kitten9.jpg",
  "kittens/kitten10.jpg",
  "kittens/kitten11.jpg",
  "kittens/kitten12.jpg"
];

let disabledRules = [];
let aggressivenessLevel = 3;
let useAI = false;
let geminiKey = "";
let kittenQueue = [];

function getNextKitten() {
  if (kittenQueue.length === 0) {
    kittenQueue = [...KITTENS];
    for (let i = kittenQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [kittenQueue[i], kittenQueue[j]] = [kittenQueue[j], kittenQueue[i]];
    }
  }
  return kittenQueue.pop();
}

async function checkAI(text) {
  if (useAI && geminiKey) {
    if (!text || text.trim().length === 0) return [];
    try {
      const promptText = `Analyze the following LinkedIn post and estimate the probability that it was written by an AI (like ChatGPT). Return a JSON object with two fields: "score" (a number between 0 and 100 representing the percentage likelihood) and "reason" (a short 3-6 word phrase explaining why it seems like AI, e.g. "overly corporate tone", "excessive use of emojis", or "formulaic structure"). Return ONLY valid JSON without any markdown formatting.\n\nPost:\n${text}`;
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'GEMINI_INFERENCE', key: geminiKey, prompt: promptText },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else if (response && !response.success) {
              reject(new Error(response.error));
            } else {
              resolve(response.data);
            }
          }
        );
      });
      
      const data = response;
      if (data && data.candidates && data.candidates.length > 0) {
        let textVal = data.candidates[0].content.parts[0].text.trim();
        if (textVal.startsWith('```json')) textVal = textVal.substring(7);
        if (textVal.startsWith('```')) textVal = textVal.substring(3);
        if (textVal.endsWith('```')) textVal = textVal.substring(0, textVal.length - 3);
        textVal = textVal.trim();

        let score = NaN;
        let reason = '';

        try {
          const parsed = JSON.parse(textVal);
          score = parseFloat(parsed.score);
          reason = parsed.reason || '';
        } catch (e) {
          score = parseFloat(textVal);
        }

        if (!isNaN(score)) {
           let threshold = 90; // Default (Low)
           if (aggressivenessLevel === 1) threshold = 90;
           else if (aggressivenessLevel === 2) threshold = 80;
           else threshold = 60; // Aggressive
           if (score >= threshold) {
             const reasonText = reason ? `: ${reason}` : '';
             return [`${score}% likely AI${reasonText}`];
           } else {
             return [];
           }
        }
      }
    } catch (e) {
      console.error("[kitten] Gemini API error", e);
    }
    // Return early to ensure rules-based detection is ignored when AI mode is explicitly turned on with a key.
    return [];
  }

  let matchedMarkers = [];
  for (const marker of AI_MARKERS) {
    if (!disabledRules.includes(marker.id) && marker.regex.test(text)) {
      matchedMarkers.push(marker.name);
    }
  }
  
  if (aggressivenessLevel === 1) {
    // Low: need at least 2 markers to consider it AI slop
    if (matchedMarkers.length < 2) return [];
  } else if (aggressivenessLevel === 2) {
    // Medium: 1 marker is enough
    if (matchedMarkers.length < 1) return [];
  } else {
    // High: 1 marker is enough
    if (matchedMarkers.length < 1) return [];
  }
  
  return matchedMarkers;
}

function getPostText(post) {
  const body = post.querySelector(
    '[data-testid="expandable-text-box"], ' +
    // legacy fallbacks in case LinkedIn serves an older layout
    '.update-components-text, ' +
    '.feed-shared-update-v2__description, ' +
    '.update-components-update-v2__commentary, ' +
    '.feed-shared-inline-show-more-text'
  );
  const src = body || post;
  return (src.innerText || src.textContent || '').replace(/\s+/g, ' ').trim();
}

async function decideAndReplace(post) {
  if (post.dataset.kittenDecided === '1') return;
  if (post.querySelector('.yes-kitten-replacement')) return;
  
  let finalContent = getPostText(post);
  post.dataset.kittenDecided = '1';
  
  const matchedMarkers = await checkAI(finalContent);
  
  const bodyEl = post.querySelector(
    '[data-testid="expandable-text-box"], ' +
    '.update-components-text, ' +
    '.feed-shared-update-v2__description, ' +
    '.update-components-update-v2__commentary, ' +
    '.feed-shared-inline-show-more-text'
  );
  console.log(
    '[kitten] decided | bodySelectorMatched:', !!bodyEl,
    '| len:', finalContent.length,
    '| markers:', matchedMarkers,
    '| text:', finalContent.slice(0, 100)
  );
  
  if (matchedMarkers.length > 0) {
    // Find the container to apply replacement to
    const targetContainer = post;
    
    // If our target already has a kitten, don't add another
    if (targetContainer.querySelector('.yes-kitten-replacement')) return;

    // Hide original children without moving them to prevent SPA framework crashes
    Array.from(targetContainer.children).forEach(child => {
      if (!child.classList?.contains('yes-kitten-replacement')) {
        const origDisplay = child.style.display || getComputedStyle(child).display;
        if (origDisplay !== 'none') {
          child.dataset.kittenOriginalDisplay = origDisplay;
          child.style.display = 'none';
        }
        child.classList.add('kitten-hidden-original');
      }
    });
    
    const currentKittenName = getNextKitten();
    
    let activeKittenUrl;
    try {
      activeKittenUrl = chrome.runtime.getURL(currentKittenName);
      if (!activeKittenUrl || activeKittenUrl.includes("invalid")) {
        throw new Error("Invalid extension context");
      }
    } catch (e) {
      activeKittenUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80";
    }
    
    const isDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.classList.contains('theme--dark');
    const bgColor = isDark ? '#1d2226' : 'white';

    const cleanedMarkers = matchedMarkers.map(m => m.replace(/"/g, '')).join(', ');

    const isGeminiResult = matchedMarkers.length > 0 && matchedMarkers[0].includes('% likely AI');
    const reasonPrefix = isGeminiResult ? 'Evaluated as' : 'Contains words';

    const kittenContainer = document.createElement('div');
    kittenContainer.className = 'yes-kitten-replacement';
    kittenContainer.style.cursor = 'pointer';
    kittenContainer.innerHTML = `
      <div style="background: ${bgColor}; border-radius: 8px; overflow: hidden; position: relative; width: 100%; display: flex; align-items: stretch;">
        <img src="${activeKittenUrl}" style="width: 100%; min-height: 200px; object-fit: cover; display: block;" />
        <div class="kitten-tooltip" style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; white-space: nowrap; z-index: 10; font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; text-align: center; line-height: 1.4;">
          Post replaced by a kitten
          <div style="font-size: 11px; font-weight: 400; opacity: 0.85; margin-top: 2px;">
            ${reasonPrefix}: "${cleanedMarkers}"
          </div>
        </div>
      </div>
    `;
    
    kittenContainer.addEventListener('mouseenter', () => {
      const tooltip = kittenContainer.querySelector('.kitten-tooltip');
      if (tooltip) tooltip.style.opacity = '1';
    });
    
    kittenContainer.addEventListener('mouseleave', () => {
      const tooltip = kittenContainer.querySelector('.kitten-tooltip');
      if (tooltip) tooltip.style.opacity = '0';
    });

    kittenContainer.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      kittenContainer.style.display = 'none';
      Array.from(targetContainer.children).forEach(child => {
        if (child.classList?.contains('kitten-hidden-original')) {
          child.style.display = child.dataset.kittenOriginalDisplay || 'block'; // robust fallback
        }
      });
    });
    
    targetContainer.appendChild(kittenContainer);
  }
}

function processPosts() {
  const selectors = [
    // Current LinkedIn feed: posts are role="listitem" inside the mainFeed list.
    // These semantic attributes are stable; the hashed class names are not.
    '[data-testid="mainFeed"] [role="listitem"]',
    // Standalone post pages (/feed/update/, /posts/) wrap the post in a
    // role="listitem" that is NOT under mainFeed — scope to main to avoid
    // matching comment-list or sidebar listitems.
    'main [role="listitem"]',
    // Legacy fallbacks for older layouts / single-post pages
    '.feed-shared-update-v2',
    '.update-components-update-v2',
    '[data-urn^="urn:li:activity:"]',
    '[data-urn^="urn:li:share:"]',
    '[data-urn^="urn:li:ugcPost:"]'
  ].join(', ');
  
  const posts = document.querySelectorAll(selectors);
  
  posts.forEach(post => {
    // De-dup nested containers: LinkedIn nests a data-urn wrapper around an
    // inner .feed-shared-update-v2 (and vice versa). If any ancestor of this
    // node ALSO matches one of our selectors, treat the ancestor as the post
    // and skip this inner one so we don't process/hide at two levels.
    if (post.parentElement && post.parentElement.closest(selectors)) {
      console.log('[kitten] skip nested container', post.className);
      return;
    }

    // Skip if we already decided on this node or replaced it
    if (post.dataset.kittenDecided === '1') return;
    if (post.dataset.kittenScheduled === '1') return;
    if (post.querySelector('.yes-kitten-replacement')) return;

    const text = getPostText(post);
    if (text.length < 20) return; // not enough body yet; try again next pass
    
    // We have real body text. Schedule exactly one decision and don't reschedule.
    post.dataset.kittenScheduled = '1';
    post.dataset.kittenTimerId = String(setTimeout(() => decideAndReplace(post), 600));
  });
}

// Initial state load
try {
  console.log("🐱 No-AI-Yes-Kitten Extension V2 Initialized!");
  console.log(
    "🐱 ctx check (from content script):",
    (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) || 'NO CONTEXT',
    "| listitems:",
    document.querySelectorAll('[data-testid="mainFeed"] [role="listitem"]').length
  );
  
  chrome.storage.sync.get(['disabledRules', 'aggressivenessLevel', 'useAI', 'geminiKey'], (result) => {
    if (result && result.disabledRules) {
      disabledRules = result.disabledRules;
    }
    if (result && result.aggressivenessLevel !== undefined) {
      aggressivenessLevel = result.aggressivenessLevel;
    }
    if (result && result.useAI !== undefined) {
      useAI = result.useAI;
    }
    if (result && result.geminiKey !== undefined) {
      geminiKey = result.geminiKey;
    }
    
    const observer = new MutationObserver((mutations) => {
      // Disconnect observer if extension context was invalidated (extension reinstalled)
      if (!chrome.runtime || !chrome.runtime.id) {
        observer.disconnect();
        return;
      }
      
      let shouldProcess = false;
      for (let mutation of mutations) {
        if (mutation.addedNodes.length) {
          shouldProcess = true;
          break;
        }
      }
      
      if (shouldProcess) {
        try {
          processPosts();
        } catch(e) {}
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true
    });
    
    // Fallback interval to catch anything missed (e.g. dynamic text updates)
    const interval = setInterval(() => {
      if (!chrome.runtime || !chrome.runtime.id) {
        clearInterval(interval);
        return;
      }
      try {
        processPosts();
      } catch(e) { }
    }, 500);

    // Catch SPA route changes
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        // new "page" — clear stale decision flags so reused nodes get re-evaluated
        document.querySelectorAll('[data-kitten-decided], [data-kitten-scheduled], [data-kitten-timer-id]').forEach(el => {
          delete el.dataset.kittenDecided;
          delete el.dataset.kittenScheduled;
          if (el.dataset.kittenTimerId) {
            clearTimeout(parseInt(el.dataset.kittenTimerId, 10));
            delete el.dataset.kittenTimerId;
          }
          const kitten = el.querySelector('.yes-kitten-replacement');
          if (kitten) kitten.remove();
          Array.from(el.children).forEach(child => {
            if (child.classList?.contains('kitten-hidden-original')) {
              child.style.display = child.dataset.kittenOriginalDisplay || '';
              delete child.dataset.kittenOriginalDisplay;
              child.classList.remove('kitten-hidden-original');
            }
          });
        });
        // DOM after SPA nav mounts asynchronously; one pass often fires into a
        // half-built page. Re-scan a few times so the post gets caught without
        // requiring a manual refresh.
        [150, 400, 800, 1500].forEach(delay => setTimeout(processPosts, delay));
      }
    }, 400);

    setTimeout(processPosts, 100);
  });

  // Listen for updates from popup settings
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.disabledRules) {
        disabledRules = changes.disabledRules.newValue || [];
      }
      if (changes.aggressivenessLevel) {
        aggressivenessLevel = changes.aggressivenessLevel.newValue || 3;
      }
      if (changes.useAI) {
        useAI = changes.useAI.newValue || false;
      }
      if (changes.geminiKey) {
        geminiKey = changes.geminiKey.newValue || "";
      }
    }
  });

} catch (e) {
  console.log("Extension context invalidated, skipping load.", e);
}
