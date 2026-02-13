
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Download, 
  Loader2, 
  Clapperboard, 
  Smartphone, 
  Monitor,
  Instagram,
  RotateCw,
  Search,
  Wind,
  User,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useGallery } from '../../context/GalleryContext';
import { apiService } from '../../services/api';

const VIDEO_STYLES = [
  { id: 'walking', name: 'Caminhada Natural', icon: User, desc: 'Modelo caminhando em direção à câmera', prompt: 'The model in the image starts walking naturally towards the camera with a confident expression. Cinematic camera movement.' },
  { id: '360', name: 'Giro de Visualização', icon: RotateCw, desc: 'Modelo faz um giro 360 lento', prompt: 'The model in the image performs a slow, elegant 360-degree turn to showcase the full garment. Smooth rotation.' },
  { id: 'parallax', name: 'Parallax Editorial', icon: Eye, desc: 'Câmera fluida em torno da modelo', prompt: 'Slow cinematic dolly zoom around the model in the image. High-end fashion editorial movement.' },
  { id: 'slow-mo', name: 'Fluidez do Tecido', icon: Wind, desc: 'Movimento de vento e leveza', prompt: 'Gentle wind blows through the model hair and garment, showing the fabric flow in slow motion. High textile fidelity.' },
  { id: 'macro', name: 'Foco na Textura', icon: Search, desc: 'Zoon dramático na textura', prompt: 'Slow macro zoom into the garment texture and stitching. Professional textile showcase.' }
];

const FORMATS = [
  { id: '9:16', name: 'Reels / Stories', icon: Smartphone, label: 'Vertical' },
  { id: '1:1', name: 'Post / Feed', icon: Instagram, label: 'Quadrado' },
  { id: '16:9', name: 'YouTube / TV', icon: Monitor, label: 'Horizontal' }
];

const VideoStudio: React.FC = () => {
  const { gallery } = useGallery();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('9:16');
  const [selectedStyleId, setSelectedStyleId] = useState<string>(VIDEO_STYLES[0].id);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = gallery.find(i => i.id === selectedImageId);

  useEffect(() => {
    if (isGenerating) {
      const msgs = [
        "Extraindo DNA visual da imagem...",
        "Identity Lock: Fixando face e proporções...",
        "Calculando física do tecido...",
        "Renderizando 1080p High-Fidelity...",
        "Finalizando comercial cinematográfico..."
      ];
      let idx = 0;
      const interval = setInterval(() => { 
        idx = (idx + 1) % msgs.length; 
        setLoadingMessage(msgs[idx]); 
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!selectedImageId || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const galleryItem = gallery.find(d => d.id === selectedImageId);
      if (!galleryItem) throw new Error("Imagem não encontrada.");

      const imageData = await apiService.urlToBase64(galleryItem.imageUrl);
      const style = VIDEO_STYLES.find(s => s.id === selectedStyleId);

      const masterPrompt = `
        IDENTITY LOCK ANIMATION: Animate the person and garment exactly as seen in the provided image.
        DO NOT change the model's face, hair, or clothes. 
        SCENE: ${style?.prompt}
        STYLE: Photorealistic fashion commercial, 1080p, cinematic lighting.
      `;

      const response = await apiService.generateVideo({
        prompt: masterPrompt,
        image: imageData,
        aspectRatio: selectedFormat
      });

      if (response.videoBase64) {
        setVideoUrl(response.videoBase64);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na renderização de vídeo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 animate-in fade-in">
      <aside className="w-full lg:w-96 space-y-6 shrink-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 overflow-y-auto max-h-[calc(100vh-12rem)] scrollbar-hide">
        <div className="flex items-center gap-3">
          <Clapperboard className="text-indigo-600" size={20} />
          <h2 className="font-black text-xs uppercase tracking-widest">Controle de Produção</h2>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <label className="text-[10px] font-black uppercase text-slate-400">1. Selecionar da Galeria</label>
             <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{gallery.length}</span>
          </div>
          
          {gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1 scrollbar-hide">
              {gallery.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => { setSelectedImageId(item.id); setVideoUrl(null); }} 
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${selectedImageId === item.id ? 'border-indigo-600 scale-105 shadow-xl' : 'border-slate-50 opacity-60 hover:opacity-100'}`}
                >
                  <img src={item.imageUrl} className="w-full h-full object-cover" />
                  {selectedImageId === item.id && <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center"><CheckCircle2 className="text-indigo-600 bg-white rounded-full" size={16} /></div>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
              <ImageIcon className="mx-auto text-slate-200 mb-2" size={32} />
              <p className="text-[10px] font-black uppercase text-slate-400">Galeria Vazia</p>
              <p className="text-[8px] text-slate-300 mt-1">Gere imagens no Estúdio primeiro.</p>
            </div>
          )}

          {selectedItem && (
             <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[9px] space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wide">
                   <Clock size={10} /> 
                   <span>{new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedItem.metadata.productIds.length > 0 && (
                   <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-wide">
                      <Layers size={10} />
                      <span>{selectedItem.metadata.productIds.length} Peça(s) no look</span>
                   </div>
                )}
             </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 px-1">2. Formato do Vídeo</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMATS.map(f => (
              <button 
                key={f.id} 
                onClick={() => setSelectedFormat(f.id)} 
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedFormat === f.id ? 'bg-black border-black text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:border-slate-200'}`}
              >
                <f.icon size={18} className="mb-1" />
                <span className="text-[8px] font-black uppercase leading-tight">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 px-1">3. Roteiro de Movimento</label>
          <div className="grid grid-cols-1 gap-2">
            {VIDEO_STYLES.map(style => (
              <button 
                key={style.id} 
                onClick={() => setSelectedStyleId(style.id)} 
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedStyleId === style.id ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}
              >
                <div className={`p-2 rounded-xl ${selectedStyleId === style.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}>
                  <style.icon size={18} />
                </div>
                <div>
                  <p className={`text-[9px] font-black uppercase ${selectedStyleId === style.id ? 'text-indigo-900' : 'text-slate-600'}`}>{style.name}</p>
                  <p className="text-[7px] opacity-60 leading-tight">{style.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[9px] font-black uppercase flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button 
          onClick={handleGenerate} 
          disabled={!selectedImageId || isGenerating} 
          className="w-full py-6 bg-black text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-800 disabled:opacity-20"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Play size={18} />} 
          {isGenerating ? 'Identity Lock Ativo...' : 'Renderizar Vídeo'}
        </button>
      </aside>

      <main className="flex-1 bg-black rounded-[3.5rem] overflow-hidden flex items-center justify-center min-h-[750px] border-8 border-white shadow-2xl relative">
        {isGenerating ? (
          <div className="text-center space-y-8 animate-in fade-in text-white px-10">
            <Loader2 className="animate-spin mx-auto text-indigo-400" size={48} />
            <div className="space-y-2">
              <h3 className="font-black text-3xl uppercase italic tracking-tighter">{loadingMessage}</h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Este processo pode levar até 2 minutos</p>
            </div>
          </div>
        ) : videoUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black p-4 relative group">
            <video 
              src={videoUrl} 
              className={`max-h-full rounded-[2.5rem] shadow-2xl ${selectedFormat === '9:16' ? 'aspect-[9/16]' : selectedFormat === '1:1' ? 'aspect-square' : 'aspect-video'}`} 
              controls 
              autoPlay 
              loop 
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={videoUrl} 
                download="lumiere_identity_locked.mp4" 
                className="bg-white text-black px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
              >
                <Download size={18} /> Exportar Vídeo 1080p
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <Video size={100} strokeWidth={0.5} className="text-white opacity-20 mx-auto" />
              {selectedImageId && <CheckCircle2 className="absolute -bottom-2 -right-2 text-indigo-500 bg-white rounded-full" size={24} />}
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black uppercase tracking-[0.4em] text-white opacity-20 italic">Video Lock</p>
              <p className="text-white/10 text-[10px] font-black uppercase tracking-widest">
                {selectedImageId ? 'Imagem selecionada pronta para animação' : 'Selecione uma imagem da Galeria para começar'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoStudio;
