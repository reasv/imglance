import React from 'react';
import {
  SimpleGrid,
  Box,
  Image,
} from '@chakra-ui/react';
import { FileEntry } from './FileView';
import { useState } from 'react';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import { entryIsEqual } from './utils';

export interface ImageMasonryProps {
  entries: FileEntry[]
  highlighted?: FileEntry[]
  onClick?: (entry: FileEntry) => void
}

const ImageGrid: React.FC<ImageMasonryProps> = ({ entries, highlighted, onClick }) => {
  const [imageSize, setImageSize] = useState(500); // Initial image size in pixels

  const handleSliderChange = (value: number) => {
    setImageSize(value);
  };
  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${imageSize}px, 1fr))`,
    gap: '10px',
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center', // Center horizontally

  };
  const isHighlighted = (entry: FileEntry) => {
    if (highlighted === undefined || highlighted.length === 0) return false
    return highlighted.findIndex((e) => entryIsEqual(e, entry)) !== -1
  }
  return (
    <>{<Box alignContent={'center'} height={'calc(100vh - 8rem)'}>
      <Slider
        value={imageSize}
        onChange={handleSliderChange}
        min={50}
        max={4096}
        step={10}
        width="80%"
        mx="auto"
        mb={4} // Add margin bottom to create spacing
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Box
      overflowY={'auto'}
      flexGrow={1}
      style={containerStyle}
      >
        {entries.map((entry, index) => (
          <Image
          border={isHighlighted(entry) ? '4px' : undefined}
          borderColor={isHighlighted(entry) ? 'blue.500' : undefined}
          onClick={() => onClick ? onClick(entry) : null } key={index} src={`http://127.0.0.1:8080/file?path=${entry.absolute_path}${entry.name}`}  alt={entry.name} objectFit="contain" width={"100%"} />
        ))}
      </Box>
    </Box>}</>
  );
};

export default ImageGrid;