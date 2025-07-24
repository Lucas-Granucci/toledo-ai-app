'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Settings, Globe, FileText, X, MessageSquare, Zap } from 'lucide-react';

export default function Home() {

  const [messages, setMessages] = useState([
    {
      role: 'assistant', 
      content: 'Welcome to **ToledoAI!** I specialize in translating scientific documents, \
with a focus on **low-resource languages**. Please upload a document or paste text to begin. You can \
also ask me to clarify scientific concepts from the translated material.',
      file: null
    }, 
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);

  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewText, setPreviewText] = useState("");
  const fileInputRef = useRef(null);


  const languages = {
    source: ['Auto-detect', 'English', 'Spanish', 'French', 'Chinese'],
    target: ['Hindi', 'Swahili', 'Tamil', 'Hebrew']
  };


  const extractTextFromPDF = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Error extracting text:', error);
      alert(`Error extracting text from PDF: ${error.message}`);
      return '';
    }
  };

  const sendMessage = async () => {

    if (!input.trim() && !uploadedFile) return;

    if (!apiKey) {
      setShowApiKeyAlert(true);
      setIsTyping(false);
      return;
    }

    let extractedText = '';

    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(uploadedFile);
      if (!extractedText) return; // Stop if extraction failed
    }

    const newMessage = {
      role: 'user',
      content: input,
      file: extractedText 
      ? {
        name: uploadedFile.name,
        text: extractedText,
        target_lang: targetLang
      }
      : null
    }

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setUploadedFile(null);
    setIsTyping(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': "application/json"},
      body: JSON.stringify({ messages: [...messages, newMessage], userApiKey: apiKey}),
    });

    const data = await res.json();

    if (data.error) {
      alert(`Error: ${data.error}`);
      return;
    }

    const assistantReply = {
      role: 'assistant',
      content: data.response,
      file: data.file
    }
    setMessages((prev) => [...prev, assistantReply]);
    setIsTyping(false);
  };

  const handleFileUpload = (file) => {
    if (file && file.size < 25 * 1024 * 1024) { // 25mb limit
      setUploadedFile(file);
    }
  }

  const handleFilePreview = (fileText) => {
    setPreviewText(fileText);
    setShowFilePreview(true);
  } 

  const handleFileDownload = async (fileText) => {
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: fileText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Upload Document', action: () => fileInputRef.current?.click() },
    { icon: Globe, label: 'Change Languages', action: () => setShowSettings(true) },
    { icon: MessageSquare, label: 'Set API Key', action: () => setShowSettings(true) },
  ]

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      {/* ===== MAIN CHAT CONTAINER ===== */}
      <div className="flex flex-col w-full h-full bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl shadow-2xl shadow-slate-300/30 border border-slate-200">

        <header className="p-4 border-b bg-white border-slate-200 flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {/* Left: Compact logo as link */}
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-cyan-600 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                Toledo<span className="text-cyan-600">AI</span>
              </h1>
            </a>

            {/* Right: Language pills and settings */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1">
                <div className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                  {sourceLang}
                </div>
                <div className="px-2">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="px-3 py-1 bg-cyan-100 rounded-full text-sm font-medium text-cyan-700">
                  {targetLang}
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(true)} 
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                  <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        {/* ===== MESSAGES AREA ===== */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
              {/* Message List */}
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <div key={i} className="mb-4">
                    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                      {/* AI Avatar */}
                      {!isUser && (
                        <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                          AI
                        </div>
                      )}
                      
                      {/* Message Container */}
                      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                        {/* File attachment (shown above message for user, below for AI) */}
                        {m.file?.name && isUser && (
                          <div className="flex items-center text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-end">
                            <FileText className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="font-medium">{m.file.name}</span>
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`px-4 py-3 rounded-2xl text-base whitespace-pre-wrap ${
                          isUser 
                            ? 'bg-cyan-600 text-white shadow-sm rounded-tr-sm' 
                            : 'bg-white shadow-sm border border-slate-200 rounded-tl-sm'
                        }`}>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                        
                        {/* File attachment for AI messages (shown below) */}
                        {m.file?.name && !isUser && (
                          <div onClick={() => handleFilePreview(m.file.text)} className="flex items-center text-sm text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                            <FileText className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="font-medium">{m.file.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 mb-2">
                    {/* AI Avatar with Spinning Border */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {/* Spinning border */}
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin"></div>
                      {/* AI Avatar */}
                      <div className="w-full h-full rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                    </div>

                    {/* Typing Text */}
                    <div className="flex items-center">
                      <span className="text-sm text-slate-500">ToledoAI is typing</span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex gap-2 justify-center">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-2 px-3 py-2 bg-white/60 hover:bg-white border border-slate-200 rounded-full text-sm text-slate-700 transition-colors cursor-pointer"
              >
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== INPUT AREA ===== */}
        <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* File Upload Preview */}
            {uploadedFile && (
              <div className="mb-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-600" />
                  <div>
                    <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-1 hover:bg-cyan-100 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
            
            {/* Message Input Controls */}
            <div className="flex items-center gap-4">
              <textarea
                id="message-input"
                rows="1"
                className="w-full p-3 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                placeholder="Type your message or ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() && !uploadedFile}
                className="bg-cyan-600 text-white rounded-lg p-3 hover:bg-cyan-700 transition-colors flex-shrink-0 shadow-md disabled:cursor-not-allowed hover:shadow-lg cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ===== SETTINGS MODAL ===== */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* API Key Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">API Key</h3>
                <textarea
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your OpenAI API key here"
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl resize-none text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Language Settings Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Language</h3>
                
                <div className="space-y-4">
                  {/* Source Language */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Source Language
                    </label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {languages.source.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Target Language */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Target Language
                    </label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {languages.target.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)} // TODO: save key
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== FILE PREVIEW MODAL ===== */}
        {showFilePreview && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sticky top-0 z-10">
                <h2 className="text-xl font-semibold text-slate-900">File Preview</h2>
                <button
                  onClick={() => setShowFilePreview(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Message */}
              <div className="overflow-y-auto text-slate-700 mb-6 max-h-[70vh]">
                <ReactMarkdown>{previewText}</ReactMarkdown>
              </div>

              {/* Button */}
              <div className="flex justify-end sticky bottom-0 z-10">
                <button
                  onClick={() => handleFileDownload(previewText)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== API KEY ALERT MODAL ===== */}
        {showApiKeyAlert && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Missing API Key</h2>
                <button
                  onClick={() => setShowApiKeyAlert(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Message */}
              <p className="text-slate-700 mb-6">
                Please enter your OpenAI API key in the settings panel before proceeding.
              </p>

              {/* Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowApiKeyAlert(false)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== HIDDEN FILE INPUT ===== */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  );
}
