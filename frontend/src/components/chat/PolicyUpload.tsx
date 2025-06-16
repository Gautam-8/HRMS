'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { chatService } from '@/services/chat.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function PolicyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: 'Error',
        description: 'Only PDF files are allowed',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const response = await chatService.uploadPolicy(file);

      toast({
        title: 'Success',
        description: response.message || 'Policy document uploaded successfully'
      });

      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={isUploading}
        className="max-w-[200px]"
      />
      <Button
        onClick={handleUpload}
        disabled={!file || isUploading}
        size="sm"
        variant="secondary"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 