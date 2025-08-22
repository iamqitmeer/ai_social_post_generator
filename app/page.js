'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link, Check, Copy, Loader, AlertTriangle, FileText, Send, Settings, Bot, Users, Megaphone, Hash, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';
import { scrapeAndGenerate } from './actions';

const options = {
  tone: [{ value: 'Engaging' }, { value: 'Professional' }, { value: 'Witty' }, { value: 'Casual' }, { value: 'Inspirational' }, { value: 'Urgent' }],
  platform: [{ value: 'X (Twitter)' }, { value: 'LinkedIn' }, { value: 'Instagram' }, { value: 'Threads' }, { value: 'Facebook' }],
  language: [{ value: 'English' }, { value: 'Spanish' }, { value: 'French' }, { value: 'German' }, { value: 'Portuguese' }],
  postVariations: [
    { id: 'hook', label: 'Intriguing Hook' },
    { id: 'summary', label: 'Key Summary' },
    { id: 'question', label: 'Engaging Question' },
    { id: 'takeaway', label: 'Actionable Takeaway' },
    { id: 'quote', label: 'Powerful Quote' },
    { id: 'poll', label: 'Interactive Poll' },
  ],
  hashtagStrategy: [{ value: 'Subtle (1-2)' }, { value: 'Balanced (3-5)' }, { value: 'Heavy (6+)' }],
};

const PostSkeleton = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full h-48 flex flex-col gap-3">
        <div className="w-1/3 h-4 rounded-md bg-zinc-800 shimmer-bg animate-shimmer" />
        <div className="w-full h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="w-full h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="w-5/6 h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="w-1/2 h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="mt-auto w-1/4 h-4 rounded-md bg-zinc-800 self-end shimmer-bg animate-shimmer" />
    </div>
);

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };
    return (
      <button onClick={handleCopy} className="p-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Copy post">
        <AnimatePresence mode="wait" initial={false}>
            {copied ? <motion.div key="check"><Check className="text-green-400" size={16} /></motion.div> : <motion.div key="copy"><Copy className="text-zinc-400" size={16} /></motion.div>}
        </AnimatePresence>
      </button>
    );
};

const EditablePostContent = ({ initialContent, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialContent);
    const handleSave = () => {
        onSave(content);
        setIsEditing(false);
    };
    if (isEditing) {
        return (
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSave}
                autoFocus
                className="w-full bg-zinc-950 text-zinc-200 text-sm p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                rows={Math.max(5, content.split('\n').length)}
            />
        );
    }
    return (
        <p onClick={() => setIsEditing(true)} className="text-zinc-200 whitespace-pre-wrap text-left text-sm leading-relaxed cursor-pointer p-2 -m-2 rounded-md hover:bg-zinc-800/50 transition-colors">
            {content}
        </p>
    );
};

const SettingsPanel = ({ settings, setSettings, disabled, onGenerate }) => (
    <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 sticky top-8">
            <div className="flex items-center gap-3 mb-4">
                <Settings className="text-brand-purple" />
                <h2 className="text-xl font-bold text-zinc-100">Customize Your Posts</h2>
            </div>
            <div className="flex flex-col gap-5">
                 <SettingsRadioGroup label="Tone" options={options.tone} selected={settings.tone} onChange={(v) => setSettings(p => ({...p, tone: v}))} disabled={disabled}/>
                 <SettingsRadioGroup label="Platform" options={options.platform} selected={settings.platform} onChange={(v) => setSettings(p => ({...p, platform: v}))} disabled={disabled}/>
                 <SettingsRadioGroup label="Language" options={options.language} selected={settings.language} onChange={(v) => setSettings(p => ({...p, language: v}))} disabled={disabled}/>
                 <SettingsRadioGroup label="Hashtag Strategy" options={options.hashtagStrategy} selected={settings.hashtagStrategy} onChange={(v) => setSettings(p => ({...p, hashtagStrategy: v}))} disabled={disabled}/>
                <SettingsInput label="Target Audience" icon={<Users size={16}/>} value={settings.audience} onChange={(e) => setSettings(p => ({...p, audience: e.target.value}))} placeholder="e.g., Developers, Marketers" disabled={disabled}/>
                <SettingsInput label="Call to Action (CTA)" icon={<Megaphone size={16}/>} value={settings.cta} onChange={(e) => setSettings(p => ({...p, cta: e.target.value}))} placeholder="e.g., 'Read the full article!'" disabled={disabled}/>
                <SettingsInput label="Custom Instructions" icon={<Bot size={16}/>} value={settings.customInstructions} onChange={(e) => setSettings(p => ({...p, customInstructions: e.target.value}))} placeholder="e.g., 'Mention our new feature'" isTextarea={true} disabled={disabled}/>
                 <SettingsCheckboxGroup label="Post Variations" options={options.postVariations} selected={settings.postVariations} onChange={(id) => setSettings(p => ({...p, postVariations: p.postVariations.includes(id) ? p.postVariations.filter(vId => vId !== id) : [...p.postVariations, id]}))} disabled={disabled} />
                 <SettingsSwitch label="Include AI Image Prompt" enabled={settings.includeImagePrompt} onChange={(v) => setSettings(p => ({...p, includeImagePrompt: v}))} disabled={disabled} />
                 <button type="button" onClick={onGenerate} disabled={disabled} className="mt-2 bg-gradient-to-br from-brand-indigo to-brand-purple text-zinc-100 px-6 py-3 rounded-lg font-semibold w-full focus:ring-2 focus:ring-brand-purple/80 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:from-brand-indigo/90 hover:to-brand-purple/90">
                    {disabled ? <><Loader className="animate-spin" size={20}/>Generating...</> : <><Sparkles size={20}/>Generate Posts</>}
                </button>
            </div>
        </div>
    </div>
);

const SettingsRadioGroup = ({ label, options, selected, onChange, disabled }) => (
    <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
        <label className="text-sm font-medium text-zinc-400 pl-1">{label}</label>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-1 flex flex-wrap gap-1">
            {options.map(option => (
                <button key={option.value} type="button" onClick={() => onChange(option.value)} disabled={disabled} className={`relative flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple disabled:opacity-50 ${selected === option.value ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}>
                    {selected === option.value && <motion.div layoutId={`${label}-selector`} className="absolute inset-0 bg-zinc-700/50 rounded-md" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                    <span className="relative z-10">{option.value}</span>
                </button>
            ))}
        </div>
    </div>
);

const SettingsCheckboxGroup = ({ label, options, selected, onChange, disabled }) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400 pl-1">{label}</label>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 grid grid-cols-2 gap-2">
        {options.map(option => (
          <button key={option.id} type="button" onClick={() => onChange(option.id)} disabled={disabled} className={`flex items-center gap-2 p-2 rounded-md text-left transition-colors duration-200 disabled:opacity-50 ${selected.includes(option.id) ? 'bg-indigo-600/20 text-indigo-300' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selected.includes(option.id) ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-600'}`}>
              {selected.includes(option.id) && <Check size={12} className="text-white" />}
            </div>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
);

const SettingsInput = ({ label, icon, value, onChange, placeholder, disabled, isTextarea = false }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400 pl-1 flex items-center gap-2">{icon}{label}</label>
        <div className="relative flex items-center">
            {isTextarea ? (
                <textarea value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} rows="3" className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-purple focus:outline-none transition duration-200 text-xs disabled:opacity-50" />
            ) : (
                <input type="text" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-purple focus:outline-none transition duration-200 text-xs disabled:opacity-50" />
            )}
        </div>
    </div>
);

const SettingsSwitch = ({ label, enabled, onChange, disabled }) => (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg p-3">
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2"><ImageIcon size={16}/>{label}</label>
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? 'bg-brand-indigo' : 'bg-zinc-700'}`}
        >
            <motion.span
                animate={{ x: enabled ? '1.25rem' : '0.25rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="inline-block h-4 w-4 transform rounded-full bg-white"
            />
        </button>
    </div>
);


export default function AIPostGeneratorPage() {
    const [url, setUrl] = useState('');
    const [posts, setPosts] = useState([]);
    const [scrapedInfo, setScrapedInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({
      tone: 'Engaging',
      platform: 'X (Twitter)',
      language: 'English',
      postVariations: ['hook', 'summary', 'question'],
      audience: '',
      cta: '',
      customInstructions: '',
      hashtagStrategy: 'Balanced (3-5)',
      includeImagePrompt: true
    });

    const handleAction = async () => {
        if (!url) { setError('Please enter a valid website URL.'); return; }
        if (settings.postVariations.length === 0) { setError('Please select at least one post variation.'); return; }
        setIsLoading(true);
        setError('');
        try {
            const result = await scrapeAndGenerate(url, posts, settings);
            if (result.error) {
              setError(result.error);
            } else {
              setScrapedInfo(result.result.scrapedInfo);
              setPosts(prevPosts => [...result.result.posts, ...prevPosts]);
            }
        } catch (e) {
            setError("An unexpected client-side error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegeneratePost = async (postIdToRegen) => {
        const postToRegen = posts.find(p => p.id === postIdToRegen);
        if(!postToRegen) return;
        const singlePostSettings = { ...settings, postVariations: [postToRegen.variation.toLowerCase().replace(' ', '')] };
        try {
            const result = await scrapeAndGenerate(url, posts.filter(p => p.id !== postIdToRegen), singlePostSettings);
            if (!result.error && result.result.posts.length > 0) {
                setPosts(prev => prev.map(p => p.id === postIdToRegen ? result.result.posts[0] : p));
            }
        } catch (e) {}
    };
    
    const handleUpdatePostContent = (postId, newContent) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, content: newContent } : post));
    };

    const exportToCSV = () => {
        const headers = ["ID", "Variation", "Platform", "Content", "Image Prompt"];
        const rows = posts.map(p => [p.id, p.variation, settings.platform, `"${p.content.replace(/"/g, '""')}"`, `"${p.imagePrompt?.replace(/"/g, '""') || ''}"`]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "ai_generated_posts.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFormSubmit = (e) => { e.preventDefault(); handleAction(); };
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <main className="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-grid-zinc-800/20">
            <div className="w-full max-w-7xl mx-auto">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent">AI Post Generator</h1>
                    <p className="mt-3 text-md text-zinc-400 max-w-2xl">Enter a URL, customize your settings, and watch the magic happen.</p>
                </div>
                <div className="w-full mt-10">
                    <form onSubmit={handleFormSubmit} className="relative flex items-center">
                        <Link className="absolute left-4 w-5 h-5 text-zinc-500"/>
                        <input type="url" name="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-awesome-article.com" required className="bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg pl-11 pr-32 py-4 w-full focus:ring-2 focus:ring-brand-purple focus:outline-none transition duration-200" />
                        <button type="submit" disabled={isLoading || !url} className="absolute right-2 text-sm bg-zinc-800 text-zinc-100 px-4 py-2 rounded-md font-semibold focus:ring-2 focus:ring-brand-purple/80 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700">
                           <Send size={16} />
                        </button>
                    </form>
                </div>
                <AnimatePresence>
                {error && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-4 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center w-full flex items-center justify-center gap-3"><AlertTriangle size={20}/> <p><strong>Error:</strong> {error}</p></motion.div>)}
                </AnimatePresence>
                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    <SettingsPanel settings={settings} setSettings={setSettings} disabled={isLoading} onGenerate={handleAction}/>
                    <div className="w-full lg:w-2/3 xl:w-3/4">
                        {isLoading && posts.length === 0 && (
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(settings.postVariations.length || 2)].map((_, i) => <motion.div key={i} variants={itemVariants}><PostSkeleton/></motion.div>)}
                            </motion.div>
                        )}
                        <AnimatePresence>
                            {(posts.length > 0 || scrapedInfo) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                {scrapedInfo && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                    <div className="flex items-center gap-3 text-zinc-400 mb-2">
                                        <FileText size={16}/>
                                        <h2 className="font-semibold text-zinc-300">Source Content Summary</h2>
                                    </div>
                                    <h3 className="font-semibold text-brand-purple/80">{scrapedInfo.title}</h3>
                                    <p className="text-sm text-zinc-400 mt-1">{scrapedInfo.description}</p>
                                </div>
                                )}
                                {posts.length > 0 && (
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold text-zinc-200">Generated Posts ({posts.length})</h2>
                                        <button onClick={exportToCSV} className="flex items-center gap-2 text-sm bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                                            <Download size={16}/> Export CSV
                                        </button>
                                    </div>
                                )}
                                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {posts.map(post => (
                                        <motion.div key={post.id} variants={itemVariants} layout className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-semibold text-brand-indigo/80 text-sm">{post.variation}</h4>
                                                <div className="flex items-center gap-2">
                                                  <button onClick={() => handleRegeneratePost(post.id)} className="p-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Regenerate post">
                                                      <RefreshCw className="text-zinc-400" size={16} />
                                                  </button>
                                                  <CopyButton textToCopy={post.content} />
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <EditablePostContent initialContent={post.content} onSave={(newContent) => handleUpdatePostContent(post.id, newContent)} />
                                            </div>
                                            {post.imagePrompt && (
                                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                                    <p className="text-xs text-zinc-500 font-semibold mb-1 flex items-center gap-2"><ImageIcon size={14}/>AI IMAGE PROMPT:</p>
                                                    <p className="text-xs text-zinc-400 italic">"{post.imagePrompt}"</p>
                                                </div>
                                            )}
                                            <div className="mt-3 text-right">
                                                <div className="inline-block bg-zinc-800/50 text-teal-300 text-xs font-bold px-2 py-1 rounded-full">
                                                    Engagement Score: {post.engagementScore || 'N/A'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}