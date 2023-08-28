import { Location } from 'react-router-dom';
import upath from 'upath'
import { FileEntry } from './App';

export function getQueryParamValue(queryParam: string) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(queryParam);
}

export function setQueryParamValue(queryParam: string, value: string) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(queryParam, value);
  
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

export function getCurrentPath(location: Location) {
    const searchParams = new URLSearchParams(location.search);
    const pathQueryParam = searchParams.get('path');
    return pathQueryParam || '.'
}

export function setCurrentPath(path: upath.ParsedPath | string) {
    if (typeof path === "string") {
        console.log(path)
        setCurrentPath(upath.parse(path))
    } else {
        console.log(path)
        setQueryParamValue('path', path.dir)
    }
}

export function getAPIURLFromPath(path: string, is_directory: boolean) {
    return "http://127.0.0.1:8080/" + (is_directory ? "folder?path=" : "file?path=") + path
}

export function getPinnedPaths(): Set<string> {
    const pinnedPaths = getQueryParamValue('imgpath')
    if (pinnedPaths && pinnedPaths.length > 0) {
        return new Set(pinnedPaths.split(','))
    } else {
        return new Set()
    }
}

export function shortenString(input: string, maxLength: number): string {
    if (input.length <= maxLength) {
      return input;
    }
  
    return input.slice(0, maxLength - 3) + '...';
  }
  
  export const humanReadableFileSize = (sizeInBytes: number): string => {
      if (sizeInBytes < 1024) {
        return sizeInBytes + ' B';
      } else if (sizeInBytes < 1024 * 1024) {
        return (sizeInBytes / 1024).toFixed(2) + ' KB';
      } else if (sizeInBytes < 1024 * 1024 * 1024) {
        return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
      } else {
          return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      }
  }
  
export function getFileExtension(fileName: string): string {
      const lastDotIndex = fileName.lastIndexOf('.');
      
      if (lastDotIndex === -1 || lastDotIndex === 0) {
        return ''; // No extension found or the dot is the first character
      }
    
      const extension = fileName.substring(lastDotIndex + 1);
      return extension.toLowerCase(); // Return the extension in lowercase
  }
  
export function formatEpochToHumanReadable(epochMilliseconds: number) {
      if (epochMilliseconds === 0) {
          return ''
      }
      const date = new Date(epochMilliseconds);
  
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
  
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
      return formattedDate;
  }

export function isImageFile(file: FileEntry): boolean {
    const extension = getFileExtension(file.name);
    return file.is_directory === false && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)
}