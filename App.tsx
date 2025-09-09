
import React, { useState, useCallback, ChangeEvent } from 'react';
import { Mode, CreateFunction, EditFunction, UploadedImage } from './types';
import * as geminiService from './services/geminiService';
import FunctionCard from './components/FunctionCard';
import * as Icons from './components/icons';

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>(Mode.Create);
    const [prompt, setPrompt] = useState('');
    const [activeCreateFunc, setActiveCreateFunc] = useState<CreateFunction>(CreateFunction.Free);
    const [activeEditFunc, setActiveEditFunc] = useState<EditFunction>(EditFunction.AddRemove);
    const [image1, setImage1] = useState<UploadedImage | null>(null);
    const [image2, setImage2] = useState<UploadedImage | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showTwoImages, setShowTwoImages] = useState(false);

    const handleImageUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>, imageSlot: 1 | 2 | null) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const uploaded = await geminiService.fileToBase64(e.target.files[0]);
                if (imageSlot === 1) setImage1(uploaded);
                else if (imageSlot === 2) setImage2(uploaded);
                else setImage1(uploaded); // Default to image1 for single upload
            } catch (err) {
                setError('Falha ao carregar a imagem.');
            }
        }
    }, []);

    const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        setGeneratedImageUrl(null);
        setError(null);
        setImage1(null);
        setImage2(null);
    };

    const handleEditFunctionClick = (func: EditFunction) => {
        setActiveEditFunc(func);
        if (func === EditFunction.Compose) {
            setShowTwoImages(true);
        } else {
            setShowTwoImages(false);
        }
    }
    
    const getSystemPrompt = () => {
        if (mode === Mode.Create) {
            switch(activeCreateFunc) {
                case CreateFunction.Sticker: return `sticker design, vector, vibrant colors, die-cut, white background. Prompt: ${prompt}`;
                case CreateFunction.Text: return `typography logo, clean, modern, vector, high contrast. Text: ${prompt}`;
                case CreateFunction.Comic: return `comic book style, dynamic, panel art, bold lines, vibrant colors. Scene: ${prompt}`;
                case CreateFunction.Free:
                default:
                    return prompt;
            }
        }
        return prompt;
    }

    const generateImage = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        
        const finalPrompt = getSystemPrompt();

        try {
            let imageUrl;
            if (mode === Mode.Create) {
                if (!prompt.trim()) {
                    setError("Por favor, insira uma ideia.");
                    setIsLoading(false);
                    return;
                }
                imageUrl = await geminiService.generateImage(finalPrompt);
            } else { // Edit mode
                if (!image1) {
                    setError("Por favor, envie uma imagem para editar.");
                    setIsLoading(false);
                    return;
                }
                // NOTE: Compose function is a concept; for this demo, we'll use the 'add/remove' logic with image1.
                // A real implementation would require a more complex model or logic.
                imageUrl = await geminiService.editImage(prompt, image1);
            }
            setGeneratedImageUrl(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const downloadImage = () => {
        if (!generatedImageUrl) return;
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const editCurrentImage = () => {
        if(!generatedImageUrl) return;
        // This is a conceptual function. A real implementation would convert the data URL back to a File/Blob.
        // For this demo, we'll just switch to edit mode.
        handleModeChange(Mode.Edit);
    };


    const renderUploadArea = (id: string, image: UploadedImage | null, slot: 1 | 2 | null, title: string, subtitle: string, dual: boolean) => (
        <div className={`relative border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-lime-400 transition-colors duration-200 ${dual ? 'p-4' : 'p-8'} flex flex-col items-center justify-center text-center text-gray-400`}
            onClick={() => document.getElementById(id)?.click()}>
            {!image ? (
                <>
                    <Icons.UploadIcon className="mb-2 w-8 h-8 text-gray-500" />
                    <p className="font-semibold text-gray-300">{title}</p>
                    <p className="text-xs upload-text">{subtitle}</p>
                </>
            ) : (
                <img src={image.base64} alt="Preview" className="image-preview absolute inset-0 w-full h-full object-cover rounded-lg" />
            )}
            <input type="file" id={id} accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, slot)} />
        </div>
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col lg:flex-row font-sans">
            {/* Left Panel */}
            <div className="left-panel lg:w-1/3 xl:w-1/4 p-6 bg-gray-800/50 border-r border-gray-700/50 flex flex-col space-y-6 overflow-y-auto">
                <header>
                    <h1 className="panel-title text-2xl font-bold text-lime-400">Mestres AI Studio</h1>
                    <p className="panel-subtitle text-sm text-gray-400">Gerador profissional de imagens</p>
                </header>

                <div className="prompt-section">
                    <div className="section-title text-sm font-semibold mb-2 text-gray-300">Qual a sua ideia:</div>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="prompt-input w-full h-24 p-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition resize-none text-gray-200 placeholder-gray-500"
                        placeholder="Ex: Um mestre da IA demitindo 30 empregados..."
                    />
                </div>

                <div className="mode-toggle grid grid-cols-2 gap-2 bg-gray-700/70 p-1 rounded-lg">
                    <button onClick={() => handleModeChange(Mode.Create)} className={`mode-btn py-2 px-4 rounded-md text-sm font-semibold uppercase transition ${mode === Mode.Create ? 'bg-lime-500 text-gray-900' : 'text-gray-300 hover:bg-gray-600/50'}`}>CRIAR</button>
                    <button onClick={() => handleModeChange(Mode.Edit)} className={`mode-btn py-2 px-4 rounded-md text-sm font-semibold uppercase transition ${mode === Mode.Edit ? 'bg-lime-500 text-gray-900' : 'text-gray-300 hover:bg-gray-600/50'}`}>EDITAR</button>
                </div>

                {mode === Mode.Create && (
                    <div id="createFunctions" className="functions-section">
                        <div className="functions-grid grid grid-cols-2 gap-3">
                            <FunctionCard name="Prompt" icon={<Icons.PromptIcon />} isActive={activeCreateFunc === CreateFunction.Free} onClick={() => setActiveCreateFunc(CreateFunction.Free)} />
                            <FunctionCard name="Figura" icon={<Icons.StickerIcon />} isActive={activeCreateFunc === CreateFunction.Sticker} onClick={() => setActiveCreateFunc(CreateFunction.Sticker)} />
                            <FunctionCard name="Logo" icon={<Icons.LogoIcon />} isActive={activeCreateFunc === CreateFunction.Text} onClick={() => setActiveCreateFunc(CreateFunction.Text)} />
                            <FunctionCard name="Desenho" icon={<Icons.ComicIcon />} isActive={activeCreateFunc === CreateFunction.Comic} onClick={() => setActiveCreateFunc(CreateFunction.Comic)} />
                        </div>
                    </div>
                )}
                
                {mode === Mode.Edit && (
                    <>
                        {!showTwoImages ? (
                             <div id="editFunctions" className="functions-section">
                                <div className="functions-grid grid grid-cols-2 gap-3">
                                    <FunctionCard name="Adicionar" icon={<Icons.AddRemoveIcon />} isActive={activeEditFunc === EditFunction.AddRemove} onClick={() => handleEditFunctionClick(EditFunction.AddRemove)} />
                                    <FunctionCard name="Retoque" icon={<Icons.RetouchIcon />} isActive={activeEditFunc === EditFunction.Retouch} onClick={() => handleEditFunctionClick(EditFunction.Retouch)} />
                                    <FunctionCard name="Estilo" icon={<Icons.StyleIcon />} isActive={activeEditFunc === EditFunction.Style} onClick={() => handleEditFunctionClick(EditFunction.Style)} />
                                    <FunctionCard name="Mesclar" icon={<Icons.ComposeIcon />} isActive={activeEditFunc === EditFunction.Compose} onClick={() => handleEditFunctionClick(EditFunction.Compose)} />
                                </div>
                                <div className="mt-4">
                                     {renderUploadArea('imageUpload', image1, null, 'Clique ou arraste uma imagem', 'PNG, JPG, WebP (máx. 10MB)', false)}
                                </div>
                            </div>
                        ) : (
                            <div id="twoImagesSection" className="functions-section space-y-4">
                                <div className="section-title text-sm font-semibold text-gray-300">Duas Imagens Necessárias</div>
                                <div className="grid grid-cols-2 gap-3 h-32">
                                  {renderUploadArea('imageUpload1', image1, 1, 'Primeira Imagem', 'Clique para selecionar', true)}
                                  {renderUploadArea('imageUpload2', image2, 2, 'Segunda Imagem', 'Clique para selecionar', true)}
                                </div>
                                <button className="back-btn text-lime-400 hover:text-lime-300 text-sm font-medium transition" onClick={() => setShowTwoImages(false)}>← Voltar para Edição</button>
                            </div>
                        )}
                    </>
                )}


                <div className="flex-grow"></div>

                <button id="generateBtn" onClick={generateImage} disabled={isLoading} className="generate-btn w-full bg-lime-500 hover:bg-lime-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200">
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="btn-text">Gerando...</span>
                        </>
                    ) : (
                        <span className="btn-text">Gerar Imagem</span>
                    )}
                </button>
                 {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
            </div>

            {/* Right Panel */}
            <div className="right-panel flex-grow p-6 flex items-center justify-center">
                <div className="w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center bg-gray-800/30 rounded-lg">
                    {isLoading ? (
                        <div id="loadingContainer" className="flex flex-col items-center text-gray-400">
                             <svg className="animate-spin h-10 w-10 text-lime-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="loading-text text-lg">Gerando sua imagem...</div>
                        </div>
                    ) : generatedImageUrl ? (
                        <div id="imageContainer" className="relative w-full h-full group">
                            <img id="generatedImage" src={generatedImageUrl} alt="Generated art" className="generated-image w-full h-full object-contain rounded-lg" />
                            <div className="image-actions absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={editCurrentImage} title="Editar" className="action-btn bg-black/50 hover:bg-lime-500/80 text-white p-2 rounded-full transition-colors"><Icons.EditIcon/></button>
                                <button onClick={downloadImage} title="Download" className="action-btn bg-black/50 hover:bg-lime-500/80 text-white p-2 rounded-full transition-colors"><Icons.DownloadIcon/></button>
                            </div>
                        </div>
                    ) : (
                        <div id="resultPlaceholder" className="text-center text-gray-500">
                            <Icons.PlaceholderIcon/>
                            <div className="mt-4 text-lg">Sua obra de arte aparecerá aqui</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
