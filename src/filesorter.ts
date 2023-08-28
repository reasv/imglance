import { FileEntry } from "./FileView";
import { getFileExtension } from "./utils";

export function getFileCompare(sortBy: keyof FileEntry | 'ext', sortAsc: boolean, useFullPath: boolean = false) {
    return (a: FileEntry, b: FileEntry) => {
        // .. always on top
        if (a.name === "..") {
            return -1
        }
        if (b.name === "..") {
            return 1
        }
        if (sortBy === 'last_modified') {  
            return sortAsc ? new Date(a.last_modified).getTime() - new Date(b.last_modified).getTime() : new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime();
        }
        if (sortBy === 'fsize') {
            return sortAsc ? a.fsize - b.fsize : b.fsize - a.fsize;
        } else if (sortBy === 'name') {
            const aName = useFullPath ? `${a.absolute_path}${a.name}` : a.name
            const bName = useFullPath ? `${b.absolute_path}${b.name}` : b.name
            return sortAsc ? aName.localeCompare(bName) : bName.localeCompare(aName);
        } else if (sortBy === 'ext') {
            const aValue = getFileExtension(a['name']);
            const bValue = getFileExtension(b['name']);
            return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        const cmp = (aValue === bValue ? 0 : aValue ? -1 : 1)
        return sortAsc ? cmp : cmp * -1 
  }
}