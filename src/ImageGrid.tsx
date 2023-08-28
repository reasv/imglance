import React from 'react';
import {
  SimpleGrid,
  Box,
  Image,
} from '@chakra-ui/react';
import { FileEntry } from './App';
import { useState } from 'react';
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';

export interface ImageMasonryProps {
  entries: FileEntry[];
  path: string;
  onClick?: (entry: FileEntry) => void
}

const ImageGrid: React.FC<ImageMasonryProps> = ({ entries, path, onClick }) => {

  const imageEntries = entries.filter(entry => {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = entry.name.split('.').pop()?.toLowerCase() || '';
    return entry.is_directory === false && extensions.includes(`.${fileExtension}`);
  });
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
  return (
    <>{<Box  alignContent={'center'} height={'calc(100vh - 8rem)'}>
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
        {imageEntries.map((entry, index) => (
          <Image onClick={() => onClick ? onClick(entry) : null } key={index} src={`http://127.0.0.1:8080/file?path=${path}${entry.name}`}  alt={entry.name} objectFit="contain" width={"100%"} />
        ))}
      </Box>
    </Box>}</>
  );
};

export default ImageGrid;