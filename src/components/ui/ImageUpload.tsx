import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    value?: string | null;
    onChange: (url: string | null) => void;
    bucketName: string;
    folderPath?: string;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    bucketName,
    folderPath = 'uploads',
    className = ''
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            onChange(publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
            // Reset input value to allow uploading same file again if needed
            e.target.value = '';
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {value ? (
                <div className="relative group">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="h-12 w-12 object-contain border rounded p-1 bg-white shadow-sm"
                    />
                    <button
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Remove image"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <div className="h-12 w-12 border border-dashed rounded flex items-center justify-center bg-gray-50 text-gray-400">
                    <ImageIcon className="h-5 w-5" />
                </div>
            )}

            <div className="flex-1">
                <label className="cursor-pointer">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                    >
                        {uploading ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Upload className="h-3 w-3 mr-2" />}
                        {value ? 'Change Icon' : 'Upload Icon'}
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
                {/* <p className="text-[10px] text-muted-foreground mt-1">Rec: 64x64 PNG/SVG</p> */}
            </div>
        </div>
    );
}
