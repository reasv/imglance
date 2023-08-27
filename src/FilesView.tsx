import ImageGrid, { ImageMasonryProps } from "./ImageGrid";
import SliderSplitter from "./SliderSplitter";
import FileTable from "./FileTable";

export const FilesView = ({ entries, path }: ImageMasonryProps) => {

    return (
        <SliderSplitter leftComponent={<FileTable files={entries} path={path}/>} rightComponent={<ImageGrid entries={entries} path={path}></ImageGrid>} />
    )
}

export default FilesView