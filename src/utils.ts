import { Location } from 'react-router-dom';
import upath from 'upath'

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