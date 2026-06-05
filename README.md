# No AI, Yes Kitten 🐱

Replaces AI-generated LinkedIn posts with pictures of cute kittens! 

Tired of seeing the same formulaic, AI-generated ("Ah, the ever-evolving landscape...", "It's not X, it's Y", "A testament to...") thought leadership on your LinkedIn feed? This Chrome extension automatically detects and replaces those posts with delightful pictures of kittens.

## Features

- **Rules-Based Detection:** By default, it uses a customizable list of common AI buzzwords and phrases to flag posts.
- **Fight AI with AI (Experimental):** Add your own Google Gemini API key to use advanced LLM inference to detect if a post is likely AI-generated.
- **Aggressiveness Filter:** Adjust how strictly the extension blocks posts.
- **Click to Reveal:** If you're curious about what you missed, you can see why the post was replaced.

## How to Install

1. Download the extension ZIP file using the web interface.
2. Unzip the downloaded file.
3. Open Google Chrome and go to `chrome://extensions/`.
4. Turn on **Developer mode** (toggle in the top right corner).
5. Click **Load unpacked** and select the unzipped folder containing the extension files (`extension` or the unzipped folder).

## Architecture

- **Extension:** Standard Manifest V3 Chrome Extension containing content scripts, background service workers (for Gemini API calls), and a configuration popup.
- **Web App:** A React + Vite web application that acts as a landing page to preview the extension's codebase and download the compiled zip for installation.

## Privacy

If you use the basic rules-based detection, everything runs locally in your browser. No data leaves your machine. If you opt-in to the Experimental Gemini API feature, only the text of the LinkedIn posts is sent securely to Google's Gemini API for analysis using your own API key.
