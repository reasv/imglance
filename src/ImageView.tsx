import ImageGrid, { ImageMasonryProps } from "./ImageGrid";
import SliderSplitter from "./SliderSplitter";
import { useState } from "react";
import { FileEntry } from "./App";

export interface ImageViewProps {
    entries: FileEntry[];
    path: string;
    firstEntry?: FileEntry
    onClick?: (entry: FileEntry) => void
}

export const ImageView = ({ entries, path, firstEntry }: ImageViewProps) => {
    const [selection, setSelection] = useState<FileEntry[]>(firstEntry ? [firstEntry] : [])

    const onImageClick = (entry: FileEntry) => {
        setSelection(s => [...s, entry])
    }

    const onImageRemove = (entry: FileEntry) => {
        setSelection(s => s.filter(e => e.name !== entry.name))
    }

    return (<SliderSplitter leftComponent={<ImageGrid entries={entries} path={path} onClick={onImageClick} />} rightComponent={<ImageGrid entries={selection} path={path} onClick={onImageRemove}></ImageGrid>} />)
}

export default ImageView