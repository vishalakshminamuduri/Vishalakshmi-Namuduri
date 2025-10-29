
import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import { addNecklace, removeNecklace } from './services/geminiService';
import { fileToBase64, getMimeType } from './utils/fileUtils';

interface ImageData {
  file: File;
  base64: string;
  mimeType: string;
}

const PersonIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const NecklaceIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [necklaceImage, setNecklaceImage] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageSelect = async (file: File | null) => {
    if (file) {
      const base64 = await fileToBase64(file);
      const mimeType = getMimeType(file);
      setPersonImage({ file, base64, mimeType });
    } else {
      setPersonImage(null);
    }
    setGeneratedImage(null);
  };

  const handleNecklaceImageSelect = async (file: File | null) => {
    if (file) {
      const base64 = await fileToBase64(file);
      const mimeType = getMimeType(file);
      setNecklaceImage({ file, base64, mimeType });
    } else {
      setNecklaceImage(null);
    }
    setGeneratedImage(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!personImage || !necklaceImage) {
      setError('Please upload both a person and a necklace image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Step 1: Remove existing necklace
      setLoadingMessage('Removing existing necklace...');
      const personImageNoNecklaceBase64 = await removeNecklace({
        base64: personImage.base64,
        mimeType: personImage.mimeType,
      });

      // Step 2: Add new necklace
      setLoadingMessage('Adding the new necklace...');
      const finalImageBase64 = await addNecklace(
        { base64: personImageNoNecklaceBase64, mimeType: 'image/png' }, // Gemini often returns png
        { base64: necklaceImage.base64, mimeType: necklaceImage.mimeType }
      );

      setGeneratedImage(finalImageBase64);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [personImage, necklaceImage]);

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8">
      {isLoading && <Loader message={loadingMessage} />}
      <main className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Add Necklace
          </h1>
          <p className="mt-2 text-lg text-gray-300">
            Virtually try on necklaces with the power of AI.
          </p>
        </header>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!generatedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <ImageUploader id="person-uploader" title="1. Upload Person's Photo" onImageSelect={handlePersonImageSelect} icon={<PersonIcon />} />
                <ImageUploader id="necklace-uploader" title="2. Upload Necklace Photo" onImageSelect={handleNecklaceImageSelect} icon={<NecklaceIcon />} />
            </div>
        )}

        {generatedImage && (
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-purple-300 mb-4">Your Masterpiece!</h2>
                <div className="bg-gray-800 p-4 rounded-2xl shadow-lg inline-block">
                    <img 
                        src={`data:image/png;base64,${generatedImage}`} 
                        alt="Generated with necklace" 
                        className="rounded-xl max-w-full h-auto md:max-h-[60vh] object-contain"
                    />
                </div>
            </div>
        )}

        <div className="flex justify-center items-center space-x-4">
          {!generatedImage && (
            <button
              onClick={handleGenerate}
              disabled={!personImage || !necklaceImage || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              Add Necklace
            </button>
          )}

          {generatedImage && (
             <button
                onClick={handleReset}
                className="px-8 py-4 bg-gray-700 text-white font-bold text-lg rounded-full shadow-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300"
             >
                Start Over
             </button>
          )}
        </div>
      </main>
      <footer className="w-full max-w-6xl mx-auto text-center mt-12 text-gray-500 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
