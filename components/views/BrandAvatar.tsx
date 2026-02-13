
import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Loader2, 
  X, 
  ArrowRight, 
  ArrowLeft,
  UserSquare2,
  Sparkles,
  Camera,
  Eye,
  Baby,
  User as UserIcon
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { apiService } from '../../services/api';

const WIZARD_STEPS = [
  { id: 1, title: 'Base & Categoria', desc: 'Faixa etária e porte.' },
  { id: 2, title: 'Face & Pele', desc: 'Tom, textura e detalhes.' },
  { id: 3, title: 'Estilo Capilar', desc: 'Corte e textura dos fios.' },
  { id: 4, title: 'Atitude & Estilo', desc: 'Postura e mood.' },
  { id: 5, title: 'Review Final', desc: 'Batize seu novo ícone.' }
];

const ADULT_OPTIONS = {
  gender: ['Feminino', 'Masculino', 'Andrógino', 'Neutro'],
  bodyType: ['Slim', 'Médio', 'Curvy', 'Plus Size', 'Atlético'],
  height: ['Baixa', 'Média', 'Alta'],
  age: ['Jovem', 'Adulto', 'Maduro'],
  skinTexture: ['Lisa', 'Natural', 'Sardas Leves', 'Sardas Intensas', 'Poros Visíveis', 'Glow/Hidratada', 'Matte', 'Imperfeições Reais'],
  expression: ['Neutra', 'Confiante', 'Sorriso Leve', 'Séria', 'Misteriosa'],
  posture: ['Editorial', 'Casual', 'Walking', 'Lifestyle'],
};

const CHILD_OPTIONS = {
  gender: ['Menina', 'Menino', 'Neutro'],
  ageGroup: [
    { id: 'Baby', label: 'Baby (0-2 anos)', desc: 'Proporções de bebê' },
    { id: 'Kids', label: 'Kids (3-7 anos)', desc: 'Infantil lúdico' },
    { id: 'Tween', label: 'Tween (8-12 anos)', desc: 'Pré-adolescente' }
  ],
  bodyType: ['Padrão', 'Robusto', 'Esguio'], // Simplificado para crianças
  expression: ['Sorriso Aberto', 'Curioso', 'Tímido', 'Alegre', 'Neutro Suave'],
  posture: ['Brincando', 'Mãos no Bolso', 'Girando', 'Em Pé Neutro', 'Sentado'],
  hairStyles: ['Natural', 'Tranças', 'Maria-Chiquinha', 'Curto Moderno', 'Longo Ondulado', 'Afro Puff', 'Raspado']
};

const COMMON_OPTIONS = {
  skinUndertone: ['Quente', 'Neutro', 'Frio'],
  hairLength: ['Curto', 'Médio', 'Longo', 'Careca'],
  hairTexture: ['Liso', 'Ondulado', 'Cacheado', 'Crespo'],
  hairColor: ['Preto', 'Castanho', 'Loiro', 'Ruivo', 'Platinado', 'Mel'], // Removido Grisalho para crianças logicamente
  brandStyle: ['Clean', 'Streetwear', 'Luxo', 'Boho', 'Clássico'],
  beardStyle: ['Sem Barba', 'Por Fazer (Stubble)', 'Cheia/Lenhador', 'Com Falhas', 'Desenhada', 'Cavanhaque'],
  mustacheStyle: ['Sem Bigode', 'Natural', 'Fino (Lápis)', 'Cheio', 'Handlebar']
};

const BrandAvatar: React.FC = () => {
  const { avatars, addAvatar, deleteAvatar, setDefaultAvatar } = useSettings();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [avatarForm, setAvatarForm] = useState({
    name: '',
    is_default: false,
    config: {
      modelCategory: 'adult' as 'adult' | 'child',
      gender: 'Feminino',
      bodyType: 'Médio',
      height: 'Média',
      age: 'Adulto', // Usado para Adultos ou Faixa Etária Infantil
      skinTone: '50',
      skinUndertone: 'Neutro',
      skinTexture: 'Natural',
      expression: 'Confiante',
      hairLength: 'Longo',
      hairTexture: 'Ondulado',
      hairColor: 'Castanho',
      posture: 'Editorial',
      bodyLanguage: 'Minimalista',
      brandStyle: 'Editorial',
      beardStyle: 'Sem Barba',
      mustacheStyle: 'Sem Bigode',
      childHairStyle: 'Natural'
    }
  });

  const handleUpdateConfig = (key: string, value: string) => {
    setAvatarForm(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      const isChild = avatarForm.config.modelCategory === 'child';
      
      let prompt = '';

      if (isChild) {
        prompt = `Full body high-quality fashion editorial of a ${avatarForm.config.age} child model (${avatarForm.config.gender}).
        SAFETY: Child-safe fashion editorial, age-appropriate styling, modest, innocent look.
        BODY: ${avatarForm.config.bodyType} build.
        FACE: Skin tone ${avatarForm.config.skinTone}/100, ${avatarForm.config.skinUndertone} undertone. Expression: ${avatarForm.config.expression}.
        HAIR: ${avatarForm.config.childHairStyle} style, ${avatarForm.config.hairTexture} texture, color ${avatarForm.config.hairColor}.
        STYLE: ${avatarForm.config.posture} pose, ${avatarForm.config.brandStyle} fashion mood.
        TECHNICAL: Hyper-realistic, 8K, cinematic soft lighting, neutral studio background.`;
      } else {
        const facialHairPrompt = avatarForm.config.gender === 'Masculino' 
          ? `FACIAL HAIR: Beard style: ${avatarForm.config.beardStyle}, Mustache style: ${avatarForm.config.mustacheStyle}.` 
          : 'FACIAL HAIR: None/Clean shaven.';

        prompt = `Full body high-fashion editorial portrait of a single ${avatarForm.config.age} ${avatarForm.config.gender} model.
        BODY: ${avatarForm.config.bodyType} type, ${avatarForm.config.height} height.
        FACE: Skin tone ${avatarForm.config.skinTone}/100, ${avatarForm.config.skinUndertone} undertone, ${avatarForm.config.skinTexture} texture. Expression: ${avatarForm.config.expression}.
        ${facialHairPrompt}
        HAIR: ${avatarForm.config.hairLength}, ${avatarForm.config.hairTexture}, color ${avatarForm.config.hairColor}.
        STYLE: ${avatarForm.config.posture} posture, ${avatarForm.config.brandStyle} mood.
        TECHNICAL: Hyper-realistic, 8K, cinematic lighting, neutral luxury background, professional photography.`;
      }

      const response = await apiService.generateImage({
        prompt,
        aspectRatio: "3:4"
      });

      if (response.image) {
        setPreviewImage(response.image);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar preview do avatar.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!avatarForm.name || !previewImage) return;
    await addAvatar({
      name: avatarForm.name,
      is_default: avatars.length === 0 ? true : avatarForm.is_default,
      config: avatarForm.config,
      image_url: previewImage
    });
    setIsWizardOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPreviewImage(null);
    setAvatarForm({
      name: '',
      is_default: false,
      config: {
        modelCategory: 'adult',
        gender: 'Feminino',
        bodyType: 'Médio',
        height: 'Média',
        age: 'Adulto',
        skinTone: '50',
        skinUndertone: 'Neutro',
        skinTexture: 'Natural',
        expression: 'Confiante',
        hairLength: 'Longo',
        hairTexture: 'Ondulado',
        hairColor: 'Castanho',
        posture: 'Editorial',
        bodyLanguage: 'Minimalista',
        brandStyle: 'Editorial',
        beardStyle: 'Sem Barba',
        mustacheStyle: 'Sem Bigode',
        childHairStyle: 'Natural'
      }
    });
  };

  const isChild = avatarForm.config.modelCategory === 'child';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Avatares da Marca</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Modelos exclusivos treinados para a identidade da sua grife.</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> Novo Avatar
        </button>
      </div>

      {avatars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
           <UserSquare2 className="text-slate-100 mb-6" size={80} />
           <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Sua grife ainda não possui um rosto.</h3>
           <p className="text-slate-300 text-sm italic mt-2">Crie seu primeiro avatar para manter consistência em seus editoriais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {avatars.map((a) => {
            const isChildAvatar = a.config.modelCategory === 'child';
            return (
              <div key={a.id} className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={a.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {a.is_default && (
                      <div className="px-3 py-1.5 bg-black text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl">
                        <Star size={8} className="fill-amber-400 text-amber-400" /> Principal
                      </div>
                    )}
                    {isChildAvatar && (
                      <div className="px-3 py-1.5 bg-indigo-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-xl">
                        <Baby size={10} /> Kids
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                     {!a.is_default && (
                       <button 
                        onClick={() => setDefaultAvatar(a.id)}
                        className="w-40 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                       >
                         <Star size={14} /> Tornar Principal
                       </button>
                     )}
                     <button 
                      onClick={() => deleteAvatar(a.id)}
                      className="w-40 py-3 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                     >
                       <Trash2 size={14} /> Arquivar
                     </button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight truncate">{a.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{a.config.gender} • {a.config.age}</p>
                    <p className="text-[8px] text-slate-300 font-black uppercase tracking-tighter">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl animate-in fade-in" onClick={() => !isGenerating && setIsWizardOpen(false)} />
          
          <div className="relative w-full max-w-6xl bg-white rounded-[3.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row h-[85vh] animate-in zoom-in-95 overflow-hidden">
            
            {/* Sidebar Wizard Navigation */}
            <aside className="w-full lg:w-72 bg-slate-50 p-8 flex flex-col border-r border-slate-100">
               <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><Sparkles className="text-white" size={20} /></div>
                 <h2 className="font-black uppercase tracking-widest text-[10px] text-slate-900">Configurador de Avatar</h2>
               </div>
               
               <div className="space-y-6 flex-1">
                 {WIZARD_STEPS.map((step) => (
                   <div key={step.id} className={`flex items-start gap-4 transition-all ${currentStep === step.id ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${currentStep === step.id ? 'bg-black text-white shadow-xl' : 'bg-slate-200 text-slate-500'}`}>{step.id}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">{step.title}</p>
                        <p className="text-[8px] text-slate-400 mt-1 font-bold">{step.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>

               <div className="mt-auto pt-6 border-t border-slate-200">
                  <p className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Tecnologia Provadoria Visual Engine</p>
               </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-8 lg:p-16 flex flex-col overflow-y-auto scrollbar-hide">
               <button onClick={() => setIsWizardOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={24} /></button>

               <div className="flex-1 space-y-12">
                  {/* Step 1: Base */}
                  {currentStep === 1 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-2">
                         <h3 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Anatomia Base</h3>
                         <p className="text-slate-400 text-sm">Defina a estrutura física fundamental do seu avatar.</p>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* CATEGORY SELECTOR */}
                          <div className="col-span-1 md:col-span-2 space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Categoria de Modelo</label>
                             <div className="flex gap-4">
                                <button 
                                  onClick={() => handleUpdateConfig('modelCategory', 'adult')}
                                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all ${avatarForm.config.modelCategory === 'adult' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                  <UserIcon size={18} />
                                  <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest">Adulto</p>
                                  </div>
                                </button>
                                <button 
                                  onClick={() => {
                                    handleUpdateConfig('modelCategory', 'child');
                                    handleUpdateConfig('age', 'Kids'); // Set default child age
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl border-2 transition-all ${avatarForm.config.modelCategory === 'child' ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                >
                                  <Baby size={18} />
                                  <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-widest">Infantil</p>
                                  </div>
                                </button>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Gênero</label>
                             <div className="grid grid-cols-2 gap-2">
                                {(isChild ? CHILD_OPTIONS.gender : ADULT_OPTIONS.gender).map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('gender', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.gender === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{o}</button>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{isChild ? 'Faixa Etária' : 'Idade Aparente'}</label>
                             <div className={`grid ${isChild ? 'grid-cols-1' : 'grid-cols-3'} gap-2`}>
                                {isChild ? (
                                  CHILD_OPTIONS.ageGroup.map(o => (
                                    <button 
                                      key={o.id} 
                                      onClick={() => handleUpdateConfig('age', o.id)} 
                                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all text-left ${avatarForm.config.age === o.id ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                    >
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${avatarForm.config.age === o.id ? 'bg-white text-black' : 'bg-slate-100 text-slate-500'}`}>
                                        {o.id.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black uppercase">{o.label}</p>
                                        <p className="text-[8px] opacity-70">{o.desc}</p>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  ADULT_OPTIONS.age.map(o => (
                                    <button key={o} onClick={() => handleUpdateConfig('age', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.age === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{o}</button>
                                  ))
                                )}
                             </div>
                          </div>

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Biotipo</label>
                             <div className="grid grid-cols-2 gap-2">
                                {(isChild ? CHILD_OPTIONS.bodyType : ADULT_OPTIONS.bodyType).map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('bodyType', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.bodyType === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{o}</button>
                                ))}
                             </div>
                          </div>

                          {!isChild && (
                            <div className="space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estatura</label>
                               <div className="grid grid-cols-3 gap-2">
                                  {ADULT_OPTIONS.height.map(o => (
                                    <button key={o} onClick={() => handleUpdateConfig('height', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.height === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>{o}</button>
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                  )}

                  {/* Step 2: Face & Skin */}
                  {currentStep === 2 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-2">
                         <h3 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Derme & Expressão</h3>
                         <p className="text-slate-400 text-sm">Texturas realistas e traços faciais profundos.</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <div className="flex justify-between">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tom de Pele</label>
                                  <span className="text-[10px] font-black text-black">{avatarForm.config.skinTone}%</span>
                                </div>
                                <input 
                                  type="range" min="0" max="100" 
                                  value={avatarForm.config.skinTone} 
                                  onChange={(e) => handleUpdateConfig('skinTone', e.target.value)}
                                  className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-black"
                                />
                                <div className="flex justify-between text-[8px] font-black uppercase text-slate-300">
                                   <span>Pálido</span>
                                   <span>Médio</span>
                                   <span>Ebony</span>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subtom</label>
                                <div className="flex gap-2">
                                   {COMMON_OPTIONS.skinUndertone.map(o => (
                                      <button key={o} onClick={() => handleUpdateConfig('skinUndertone', o)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.skinUndertone === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                   ))}
                                </div>
                             </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Expressão Facial</label>
                                <div className="grid grid-cols-2 gap-2">
                                   {(isChild ? CHILD_OPTIONS.expression : ADULT_OPTIONS.expression).map(o => (
                                      <button key={o} onClick={() => handleUpdateConfig('expression', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.expression === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Textura Dérmica</label>
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-hide pr-1">
                                   {ADULT_OPTIONS.skinTexture.map(o => (
                                      <button key={o} onClick={() => handleUpdateConfig('skinTexture', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.skinTexture === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Seção Condicional para Homens Adultos - Pelos Faciais */}
                       {!isChild && avatarForm.config.gender === 'Masculino' && (
                         <div className="pt-8 border-t border-slate-100 animate-in fade-in">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Pelos Faciais (Masculino)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estilo da Barba</label>
                                  <div className="grid grid-cols-2 gap-2">
                                     {COMMON_OPTIONS.beardStyle.map(o => (
                                        <button key={o} onClick={() => handleUpdateConfig('beardStyle', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.beardStyle === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estilo do Bigode</label>
                                  <div className="grid grid-cols-2 gap-2">
                                     {COMMON_OPTIONS.mustacheStyle.map(o => (
                                        <button key={o} onClick={() => handleUpdateConfig('mustacheStyle', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${avatarForm.config.mustacheStyle === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  )}

                  {/* Step 3: Hair */}
                  {currentStep === 3 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-2">
                         <h3 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Estética Capilar</h3>
                         <p className="text-slate-400 text-sm">Caimento e textura do cabelo para fidelidade visual.</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          {/* Se for criança, mostrar estilos prontos primeiro */}
                          {isChild && (
                            <div className="col-span-1 md:col-span-2 space-y-4">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estilo Infantil</label>
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {CHILD_OPTIONS.hairStyles.map(o => (
                                    <button key={o} onClick={() => handleUpdateConfig('childHairStyle', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.childHairStyle === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                  ))}
                               </div>
                            </div>
                          )}

                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Comprimento</label>
                             <div className="grid grid-cols-2 gap-2">
                                {COMMON_OPTIONS.hairLength.map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('hairLength', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.hairLength === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Textura do Fio</label>
                             <div className="grid grid-cols-2 gap-2">
                                {COMMON_OPTIONS.hairTexture.map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('hairTexture', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.hairTexture === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                ))}
                             </div>
                          </div>
                          <div className="col-span-1 md:col-span-2 space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Colorimetria</label>
                             <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {COMMON_OPTIONS.hairColor.map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('hairColor', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.hairColor === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Step 4: Attitude & Style */}
                  {currentStep === 4 && (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                       <div className="space-y-2">
                         <h3 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Mood & Branding</h3>
                         <p className="text-slate-400 text-sm">Como seu avatar interage com as câmeras.</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Postura Padrão</label>
                             <div className="grid grid-cols-2 gap-2">
                                {(isChild ? CHILD_OPTIONS.posture : ADULT_OPTIONS.posture).map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('posture', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.posture === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Estilo Editorial</label>
                             <div className="grid grid-cols-2 gap-2">
                                {COMMON_OPTIONS.brandStyle.map(o => (
                                  <button key={o} onClick={() => handleUpdateConfig('brandStyle', o)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border-2 ${avatarForm.config.brandStyle === o ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>{o}</button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Step 5: Review */}
                  {currentStep === 5 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in slide-in-from-bottom-4">
                       <div className="space-y-8">
                          <div className="space-y-2">
                            <h3 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Review & Batismo</h3>
                            <p className="text-slate-400 text-sm">Finalize sua identidade digital única.</p>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nome do Avatar</label>
                                <input 
                                  type="text" 
                                  value={avatarForm.name} 
                                  onChange={(e) => setAvatarForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-lg font-black tracking-tight focus:ring-4 focus:ring-black/5 outline-none"
                                  placeholder="Ex: Maya - Editorial Luxo"
                                />
                             </div>
                             
                             <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem]">
                                <div className="flex-1">
                                   <p className="text-sm font-black text-slate-900">Definir como Principal</p>
                                   <p className="text-xs text-slate-400">Este avatar será o modelo padrão em novas sessões.</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={avatarForm.is_default}
                                    onChange={(e) => setAvatarForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                  />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                </div>
                             </div>
                          </div>

                          <button 
                            onClick={handleSave}
                            disabled={!avatarForm.name || !previewImage}
                            className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-slate-800 disabled:opacity-20 active:scale-95 transition-all"
                          >
                            <CheckCircle2 size={20} /> Ativar Avatar na Marca
                          </button>
                       </div>

                       <div className="aspect-[3/4] bg-slate-100 rounded-[3rem] overflow-hidden relative border-8 border-white shadow-2xl group">
                          {isGenerating && (
                            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                               <Loader2 className="animate-spin text-black" size={48} />
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Esculpindo Visão IA...</p>
                            </div>
                          )}
                          {previewImage ? (
                            <img src={previewImage} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700" alt="Preview" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                               <Camera size={64} strokeWidth={1} />
                               <p className="mt-4 text-xs font-black uppercase tracking-widest leading-relaxed">Pressione o botão abaixo para <br /> renderizar a prévia do avatar.</p>
                            </div>
                          )}
                          <button 
                            onClick={generatePreview}
                            disabled={isGenerating}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/90 backdrop-blur text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
                          >
                             {previewImage ? <Eye size={16} /> : <Sparkles size={16} />} 
                             {previewImage ? 'Gerar Novo Preview' : 'Gerar Preview 8K'}
                          </button>
                       </div>
                    </div>
                  )}
               </div>

               {/* Footer Navigation */}
               <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all disabled:opacity-0"
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>

                  <div className="flex gap-2">
                    {WIZARD_STEPS.map(s => (
                      <div key={s.id} className={`h-1.5 rounded-full transition-all ${currentStep === s.id ? 'w-12 bg-black' : 'w-2 bg-slate-200'}`} />
                    ))}
                  </div>

                  {currentStep < 5 ? (
                    <button 
                      onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:translate-x-1 transition-all"
                    >
                      Continuar <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="w-20" /> /* Spacer */
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandAvatar;
