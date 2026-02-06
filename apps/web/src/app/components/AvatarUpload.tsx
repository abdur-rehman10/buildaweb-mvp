import { useState, useRef } from 'react';
import { Button } from './Button';
import { User, Upload, X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

export function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onRemove,
  size = 'lg',
  editable = true
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
    xl: 'h-48 w-48',
  };

  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call upload handler
    if (onUpload) {
      onUpload(file);
      toast.success('Avatar uploaded successfully');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onRemove) {
      onRemove();
      toast.success('Avatar removed');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Circle */}
      <div
        className={`${sizeClasses[size]} rounded-full relative group overflow-hidden ${
          isDragging ? 'ring-4 ring-primary' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Avatar" 
              className="h-full w-full object-cover"
            />
            {editable && (
              <div 
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={handleClick}
              >
                <Camera className="h-8 w-8 text-white" />
              </div>
            )}
          </>
        ) : (
          <div 
            className={`h-full w-full bg-muted flex items-center justify-center ${
              editable ? 'cursor-pointer hover:bg-accent' : ''
            } transition-colors`}
            onClick={editable ? handleClick : undefined}
          >
            <User className={`${iconSizeClasses[size]} text-muted-foreground`} />
          </div>
        )}
      </div>

      {/* Actions */}
      {editable && (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            aria-label="Upload avatar"
          />
          
          {!preview ? (
            <Button size="sm" onClick={handleClick}>
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleClick}>
                <Upload className="h-4 w-4" />
                Change
              </Button>
              <Button variant="outline" size="sm" onClick={handleRemove}>
                <X className="h-4 w-4" />
                Remove
              </Button>
            </>
          )}
        </div>
      )}

      {/* Helper Text */}
      {editable && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Drop an image here or click to upload. Max size: 5MB. Recommended: 400x400px
        </p>
      )}
    </div>
  );
}
