
import { v4 as uuidv4 } from 'uuid';

export const handleFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // In a real application, you would upload this to a server
    // For this example, we'll create a temporary URL
    
    // Generate a UUID for the file name
    const fileName = `${uuidv4()}-${file.name}`;
    
    // In a real application with backend:
    // Upload the file to the server and get back the URL
    
    // Determine path prefix based on file type
    const pathPrefix = file.type.startsWith('image/') 
      ? '/lovable-uploads/'
      : file.type === 'application/pdf'
        ? '/lovable-pdfs/'
        : '/lovable-files/';
    
    const filePath = `${pathPrefix}${fileName}`;
    
    // Simulate upload delay
    setTimeout(() => {
      resolve(filePath);
    }, 500);
  });
};

export const getFileTypeFromPath = (path: string): string => {
  if (path.includes('/lovable-uploads/')) {
    return 'image';
  } else if (path.includes('/lovable-pdfs/')) {
    return 'pdf';
  } else {
    return 'file';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
