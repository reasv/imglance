import SliderSplitter from "./SliderSplitter";
import FileTable from "./FileTable";
import { FileEntry } from "./App";
import ImageGrid from "./ImageGrid";
export interface ImageMasonryProps {
    entries: FileEntry[];
    path: string;
    onClick?: (entry: FileEntry) => void
  }
  

export const FilesView = ({ entries, path }: ImageMasonryProps) => {

    return (
        <SliderSplitter leftComponent={<FileTable files={entries} path={path}/>} rightComponent={<ImageGrid entries={entries}></ImageGrid>} />
    )
}

export default FilesView