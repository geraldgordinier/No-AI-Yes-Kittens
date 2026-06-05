import { useState, useEffect } from 'react';
import { Copy, Check, Download, ExternalLink, Archive } from 'lucide-react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function CodeViewer() {
  const [manifestContent, setManifestContent] = useState('');
  const [contentScriptContent, setContentScriptContent] = useState('');
  const [backgroundContent, setBackgroundContent] = useState('');
  const [popupHtmlContent, setPopupHtmlContent] = useState('');
  const [popupJsContent, setPopupJsContent] = useState('');
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);
  const [copied3, setCopied3] = useState(false);
  const [copied4, setCopied4] = useState(false);
  const [copied5, setCopied5] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    // Fetch local files for display
    const bust = `?t=${Date.now()}`;
    fetch(`/extension/manifest.json${bust}`)
      .then(res => res.text())
      .then(text => setManifestContent(text));
      
    fetch(`/extension/content.js${bust}`)
      .then(res => res.text())
      .then(text => setContentScriptContent(text));
      
    fetch(`/extension/background.js${bust}`)
      .then(res => res.text())
      .then(text => setBackgroundContent(text));
      
    fetch(`/extension/popup.html${bust}`)
      .then(res => res.text())
      .then(text => setPopupHtmlContent(text));
      
    fetch(`/extension/popup.js${bust}`)
      .then(res => res.text())
      .then(text => setPopupJsContent(text));
  }, []);

  const handleCopy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const zipOpts = {};
      
      const extensionFolder = zip.folder("no-ai-yes-kitten-extension");
      if (extensionFolder) {
        extensionFolder.file("manifest.json", manifestContent, zipOpts);
        extensionFolder.file("content.js", contentScriptContent, zipOpts);
        extensionFolder.file("background.js", backgroundContent, zipOpts);
        extensionFolder.file("popup.html", popupHtmlContent, zipOpts);
        extensionFolder.file("popup.js", popupJsContent, zipOpts);
        
        // Add icons
        const iconsFolder = extensionFolder.folder("icons");
        const icons = ["icon-16.png", "icon-48.png", "icon-128.png"];
        const bust = `?t=${Date.now()}`;
        for(const icon of icons) {
          const res = await fetch(`/extension/icons/${icon}${bust}`);
          if (!res.ok) throw new Error(`Failed to fetch ${icon}`);
          const blob = await res.blob();
          iconsFolder?.file(icon, blob);
        }
        
        // Add kittens
        const kittensFolder = extensionFolder.folder("kittens");
        const kittenMatches = contentScriptContent.match(/kittens\/kitten\d+\.jpg/g) || [];
        for(const fullPath of kittenMatches) {
          const kittenFile = fullPath.replace('kittens/', '');
          const res = await fetch(`/extension/kittens/${kittenFile}${bust}`);
          if (!res.ok) {
            console.warn(`Failed to fetch ${kittenFile}, skipping...`);
            continue;
          }
          const blob = await res.blob();
          kittensFolder?.file(kittenFile, blob);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "no-ai-yes-kitten-extension.zip");
    } catch (error) {
      console.error("Error generating zip:", error);
      alert("Failed to generate zip file.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-medium text-slate-800 tracking-tight">Export & Install</h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Download the extension files below, or view the source code to understand how it works.
          </p>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={isZipping || !manifestContent}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Archive className="w-4 h-4" />
          {isZipping ? 'Zipping...' : 'Download Extension ZIP'}
        </button>
      </div>

      <div className="bg-indigo-50 text-indigo-800 p-6 rounded-2xl border border-indigo-100 flex flex-col gap-3 shadow-sm">
        <h3 className="font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          How to install in Chrome
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm ml-1">
          <li>Extract the downloaded ZIP file to a folder.</li>
          <li>Open Chrome and navigate to <code>chrome://extensions/</code></li>
          <li>Enable <strong>Developer mode</strong> in the top right corner.</li>
          <li>Click <strong>Load unpacked</strong> and select the extracted folder.</li>
          <li>Navigate to LinkedIn and enjoy kitten photos! (Note: <strong>Refresh any previously open LinkedIn tabs</strong> after installing/updating)</li>
          <li>Click the extension icon in Chrome toolbar to configure which AI markers you want to filter.</li>
        </ol>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <span className="text-amber-600 font-bold">⚠️ IMPORTANT:</span>
          <p className="text-sm text-amber-800">
            If you are updating the extension, Chrome leaves the old version running in your tabs. 
            You <strong>MUST hard refresh (CMD+R / CTRL+R)</strong> your active LinkedIn tab after installing, 
            otherwise the old "zombie" extension will crash with <code>net::ERR_FAILED chrome-extension://invalid/</code> errors.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-sm font-medium text-slate-700">manifest.json</div>
          <button 
            onClick={() => handleCopy(manifestContent, setCopied1)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {copied1 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed">
          <pre>{manifestContent || "Loading..."}</pre>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-sm font-medium text-slate-700">content.js</div>
          <button 
            onClick={() => handleCopy(contentScriptContent, setCopied2)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {copied2 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px]">
          <pre>{contentScriptContent || "Loading..."}</pre>
        </div>
      </div>
      
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-sm font-medium text-slate-700">background.js</div>
          <button 
            onClick={() => handleCopy(backgroundContent, setCopied5)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {copied5 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed max-h-[500px]">
          <pre>{backgroundContent || "Loading..."}</pre>
        </div>
      </div>
      
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-sm font-medium text-slate-700">popup.html</div>
          <button 
            onClick={() => handleCopy(popupHtmlContent, setCopied3)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {copied3 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed max-h-64">
          <pre>{popupHtmlContent || "Loading..."}</pre>
        </div>
      </div>
      
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-200">
        <div className="bg-slate-50 border-b px-4 py-3 flex items-center justify-between">
          <div className="font-mono text-sm font-medium text-slate-700">popup.js</div>
          <button 
            onClick={() => handleCopy(popupJsContent, setCopied4)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            {copied4 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-900 text-slate-50 overflow-x-auto text-sm font-mono leading-relaxed max-h-64">
          <pre>{popupJsContent || "Loading..."}</pre>
        </div>
      </div>
    </div>
  );
}
