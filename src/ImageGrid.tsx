import React from 'react';
import {
  SimpleGrid,
  Box,
  Image,
} from '@chakra-ui/react';
import { FileEntry } from './App';

interface ImageMasonryProps {
  entries: FileEntry[];
  path: string;
}

const ImageGrid: React.FC<ImageMasonryProps> = ({ entries, path }) => {
  const imageEntries = entries.filter(entry => {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = entry.name.split('.').pop()?.toLowerCase() || '';
    return entry.is_directory === false && extensions.includes(`.${fileExtension}`);
  });

  return (
    <SimpleGrid columns={5} spacing={4}>
      {imageEntries.map((entry, index) => (
        <Box key={index}>
          <Image
            src={`http://127.0.0.1:8080/file?path=${path}${entry.name}`}
            alt={entry.name}
            boxSize="200px"
            objectFit="contain"
          />
        </Box>
      ))}
    </SimpleGrid>
  );
};

export default ImageGrid;