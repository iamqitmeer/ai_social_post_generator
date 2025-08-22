'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link, Check, Copy, Loader, AlertTriangle, FileText, Send } from 'lucide-react';
import { scrapeAndGenerate } from './actions';

const options = {
  tone: [{ value: 'Engaging' }, { value: 'Professional' }, { value: 'Witty' }, { value: 'Casual' }],
  platform: [{ value: 'X (Twitter)' }, { value: 'LinkedIn' }, { value: 'Instagram' }, { value: 'Threads' }],
  language: [{ value: 'English' }, { value: 'Spanish' }, { value: 'French' }, { value: 'German' }],
  postVariations: [
    { id: 'hook', label: 'Intriguing Hook' },
    { id: 'summary', label: 'Key Summary' },
    { id: 'question', label: 'Engaging Question' },
    { id: 'takeaway', label: 'Actionable Takeaway' },
  ],
};

const PostSkeleton = () => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full h-40 flex flex-col gap-3">
        <div className="w-1/4 h-4 rounded-md bg-zinc-800" />
        <div className="w-3/4 h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="w-full h-3 rounded-md shimmer-bg animate-shimmer" />
        <div className="w-5/6 h-3 rounded-md shimmer-bg animate-shimmer" />
    </div>
);

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };
    return (
      <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Copy post">
        <AnimatePresence mode="wait" initial={false}>
            {copied ? <motion.div key="check"><Check className="text-green-400" size={16} /></motion.div> : <motion.div key="copy"><Copy className="text-zinc-400" size={16} /></motion.div>}
        </AnimatePresence>
      </button>
    );
};

const SettingsRadioGroup = ({ label, options, selected, onChange, disabled }) => (
    <div className="flex flex-col gap-2 flex-1 min-w-[120px]">
        <label className="text-sm font-medium text-zinc-400 pl-1">{label}</label>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-1 flex flex-wrap gap-1">
            {options.map(option => (
                <button key={option.value} type="button" onClick={() => onChange(option.value)} disabled={disabled} className={`relative flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple disabled:opacity-50 ${selected === option.value ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}>
                    {selected === option.value && <motion.div layoutId={`${label}-selector`} className="absolute inset-0 bg-zinc-700/50 rounded-md" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                    <span className="relative z-10">{option.label}</span>
                </button>
            ))}
        </div>
    </div>
);

const SettingsCheckboxGroup = ({ label, options, selected, onChange, disabled }) => (
    <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
      <label className="text-sm font-medium text-zinc-400 pl-1">{label}</label>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 grid grid-cols-2 gap-2">
        {options.map(option => (
          <button key={option.id} type="button" onClick={() => onChange(option.id)} disabled={disabled} className={`flex items-center gap-2 p-2 rounded-md text-left transition-colors duration-200 ${selected.includes(option.id) ? 'bg-indigo-600/20 text-indigo-300' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selected.includes(option.id) ? 'border-indigo-400 bg-indigo-500' : 'border-zinc-600'}`}>
              {selected.includes(option.id) && <Check size={12} className="text-white" />}
            </div>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
);

export default function AIPostGeneratorPage() {
    const [url, setUrl] = useState('');
    const [posts, setPosts] = useState([]);
    const [scrapedInfo, setScrapedInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState('');

    const [tone, setTone] = useState('Engaging');
    const [platform, setPlatform] = useState('X (Twitter)');
    const [language, setLanguage] = useState('English');
    const [postVariations, setPostVariations] = useState(['hook', 'summary', 'question']);

    const handleVariationChange = (id) => {
      setPostVariations(prev => prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]);
    };
    
    const handleAction = async () => {
        if (!url) { setError('Please enter a valid website URL.'); return; }
        if (postVariations.length === 0) { setError('Please select at least one post variation.'); return; }

        setIsLoading(true);
        setError('');
        setPosts([]);
        setScrapedInfo(null);

        const settings = { tone, platform, language, postVariations };

        try {
            setLoadingStep('Scraping content...');
            const result = await scrapeAndGenerate(url, [], settings);
            
            if (result.error) {
              setError(result.error);
            } else {
              setLoadingStep('Analyzing & Generating...');
              setScrapedInfo(result.result.scrapedInfo);
              setPosts(result.result.posts);
            }
        } catch (e) {
            setError("An unexpected client-side error occurred.");
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    const handleFormSubmit = (e) => { e.preventDefault(); handleAction(); };
    
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <main className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-12 sm:mt-16">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent">AI Social Post Generator</h1>
                    <p className="mt-4 text-md text-zinc-400 max-w-2xl">Turn any link into a suite of high-quality, platform-ready social media posts in seconds.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="w-full max-w-3xl mt-10 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
                    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                        <div className="relative flex items-center">
                            <Link className="absolute left-4 w-5 h-5 text-zinc-500"/>
                            <input type="url" name="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-awesome-article.com" required className="bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg pl-11 pr-4 py-3 w-full focus:ring-2 focus:ring-brand-purple focus:outline-none transition duration-200" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SettingsRadioGroup label="Tone" options={options.tone} selected={tone} onChange={setTone} disabled={isLoading}/>
                            <SettingsRadioGroup label="Platform" options={options.platform} selected={platform} onChange={setPlatform} disabled={isLoading}/>
                            <SettingsRadioGroup label="Language" options={options.language} selected={language} onChange={setLanguage} disabled={isLoading}/>
                            <SettingsCheckboxGroup label="Post Variations" options={options.postVariations} selected={postVariations} onChange={handleVariationChange} disabled={isLoading} />
                        </div>
                        <button type="submit" disabled={isLoading} className="mt-2 bg-gradient-to-br from-brand-indigo to-brand-purple text-zinc-100 px-6 py-3 rounded-lg font-semibold w-full focus:ring-2 focus:ring-brand-purple/80 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:from-brand-indigo/90 hover:to-brand-purple/90">
                            {isLoading ? <><Loader className="animate-spin" size={20}/>{loadingStep || 'Generating...'}</> : <><Sparkles size={20}/>Generate Posts</>}
                        </button>
                    </form>
                </motion.div>
                <AnimatePresence>
                {error && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-6 bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center w-full max-w-3xl flex items-center justify-center gap-3"><AlertTriangle size={20}/> <p><strong>Error:</strong> {error}</p></motion.div>)}
                </AnimatePresence>

                <div className="w-full max-w-6xl mt-12 text-left">
                  {isLoading && postVariations.length > 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {postVariations.map((_, i) => <motion.div key={i} variants={itemVariants}><PostSkeleton/></motion.div>)}
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {(posts.length > 0 || scrapedInfo) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        {scrapedInfo && (
                          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <div className="flex items-center gap-3 text-zinc-400 mb-2">
                              <FileText size={16}/>
                              <h2 className="font-semibold text-zinc-300">Scraped Content Summary</h2>
                            </div>
                            <h3 className="font-semibold text-brand-purple/80">{scrapedInfo.title}</h3>
                            <p className="text-sm text-zinc-400 mt-1">{scrapedInfo.description}</p>
                          </div>
                        )}
                        
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posts.map(post => (
                                <motion.div key={post.id} variants={itemVariants} layout className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-zinc-700">
                                    <CopyButton textToCopy={post.content} />
                                    <h4 className="font-semibold text-brand-indigo/80 text-sm mb-2">{post.variation}</h4>
                                    <p className="text-zinc-200 whitespace-pre-wrap text-left text-sm leading-relaxed">{post.content}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </div>
        </main>
    );
}