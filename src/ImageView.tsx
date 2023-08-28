import ImageGrid from "./ImageGrid";
import SliderSplitter from "./SliderSplitter";
import { useState } from "react";
import { FileEntry } from "./App";

export interface ImageViewProps {
    entries: FileEntry[];
    firstEntry?: FileEntry
    onClick?: (entry: FileEntry) => void
}

export const ImageView = ({ entries, firstEntry }: ImageViewProps) => {
    const [selection, setSelection] = useState<FileEntry[]>(firstEntry ? [firstEntry] : [])

    const onImageClick = (entry: FileEntry) => {
        setSelection(s => [entry, ...s])
    }

    const onImageRemove = (entry: FileEntry) => {
        setSelection(s => s.filter(e => e.name !== entry.name))
    }

    return (<SliderSplitter leftComponent={<ImageGrid entries={entries} onClick={onImageClick} />} rightComponent={<ImageGrid entries={selection} onClick={onImageRemove}></ImageGrid>} />)
}

export default ImageView