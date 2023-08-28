import ImageGrid from "./ImageGrid";
import SliderSplitter from "./SliderSplitter";
import { useState } from "react";
import { FileEntry } from "./FileView";

export interface ImageViewProps {
    entries: FileEntry[];
    onClick?: (entry: FileEntry) => void
}

export const ImageView = ({ entries }: ImageViewProps) => {
    const [selection, setSelection] = useState<FileEntry[]>([])

    const onImageClick = (entry: FileEntry) => {
        setSelection(s => [entry, ...s])
    }

    const onImageRemove = (entry: FileEntry) => {
        setSelection(s => s.filter(e => e.name !== entry.name))
    }

    return (<SliderSplitter leftComponent={<ImageGrid entries={entries} onClick={onImageClick} />} rightComponent={<ImageGrid entries={selection} onClick={onImageRemove}></ImageGrid>} />)
}

export default ImageView