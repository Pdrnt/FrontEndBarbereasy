import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface ImageUploadProps {
  barbeariaId: number;
  type: 'logo' | 'banner';
  currentImageUrl?: string;
  onUploadSuccess?: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  barbeariaId,
  type,
  currentImageUrl,
  onUploadSuccess
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLogo = type === 'logo';
  const title = isLogo ? 'Logo da Barbearia' : 'Banner da Barbearia';
  const dimensions = isLogo ? '1080x1080px (quadrada)' : '1920x600px (banner)';
  const maxSize = 5; // MB

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      return 'Apenas arquivos de imagem são permitidos';
    }

    // Verificar extensão
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Apenas arquivos JPEG, PNG e WebP são permitidos';
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `O arquivo deve ter no máximo ${maxSize}MB`;
    }

    return null;
  };

  // Redimensionar imagem
  const resizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1080;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Primeiro, pinte um fundo branco
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Calcule as dimensões para manter a proporção
            const scale = Math.min(1080 / img.width, 1080 / img.height);
            const x = (1080 - img.width * scale) / 2;
            const y = (1080 - img.height * scale) / 2;

            // Desenhe a imagem centralizada
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              }
            }, 'image/jpeg', 0.95);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Processar arquivo selecionado
  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload automático
    handleUpload(file);
  }, []);

  // Upload do arquivo
  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      let result;
      if (isLogo) {
        result = await apiService.uploadLogo(barbeariaId, file);
      } else {
        result = await apiService.uploadBanner(barbeariaId, file);
      }

      setSuccess(`${title} enviada com sucesso!`);
      onUploadSuccess?.(result.logoUrl || result.bannerUrl);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(`Erro ao enviar ${title.toLowerCase()}: ` + error.message);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handlers para drag & drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  // Handler para seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Abrir seletor de arquivo
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Limpar preview
  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // URL da imagem atual
  const currentImage = preview || (currentImageUrl ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${currentImageUrl}?t=${Date.now()}` : null);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <ImageIcon className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Dimensões recomendadas: <strong>{dimensions}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Formatos aceitos: JPEG, PNG, WebP (máximo {maxSize}MB)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Preview da imagem atual */}
      {currentImage && (
        <div className="mb-4">
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt={title}
              className={`rounded-lg shadow-md ${isLogo
                ? 'w-32 h-32 object-cover'
                : 'w-full max-w-md h-32 object-cover'
                }`}
              onError={(e) => {
                // Se a imagem falhar ao carregar, esconder
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {preview && (
              <button
                onClick={clearPreview}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isUploading && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              <span className="text-sm text-gray-600">Enviando...</span>
            </div>
          )}
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className={`h-12 w-12 ${isDragging ? 'text-yellow-500' : 'text-gray-400'}`} />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragging ? 'Solte a imagem aqui' : `Enviar ${title}`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Arraste e solte uma imagem ou{' '}
              <button
                onClick={openFileSelector}
                className="text-yellow-600 hover:text-yellow-700 font-medium"
              >
                clique para selecionar
              </button>
            </p>
          </div>
        </div>
      </div>

      {!currentImage && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {isLogo ? (
              <>
                <strong>Dica para Logo:</strong> Use uma imagem quadrada com boa resolução.
                A logo aparecerá no cabeçalho do seu dashboard e na página pública da barbearia.
              </>
            ) : (
              <>
                <strong>Dica para Banner:</strong> Use uma imagem em formato paisagem (mais larga que alta).
                O banner aparecerá como destaque na página pública da sua barbearia.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

