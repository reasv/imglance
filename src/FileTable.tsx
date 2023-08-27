import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Icon,
  chakra,
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FileEntry } from './App';
import { Link } from 'react-router-dom';
import upath from 'upath'
import { getAPIURLFromPath } from './utils';

function shortenString(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }

  return input.slice(0, maxLength - 3) + '...';
}

const humanReadableFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(2) + ' KB';
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}

function getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return ''; // No extension found or the dot is the first character
    }
  
    const extension = fileName.substring(lastDotIndex + 1);
    return extension.toLowerCase(); // Return the extension in lowercase
}

function formatEpochToHumanReadable(epochMilliseconds: number) {
    if (epochMilliseconds === 0) {
        return ''
    }
    const date = new Date(epochMilliseconds);

    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
}
function FileListEntry({path, entry}: {path: string, entry: FileEntry}) {
    return (<>{
      entry.is_directory ? <Link to={`/?path=/${upath.join(path, entry.name)}/`}>{shortenString(entry.name, 20)}</Link> : <a href={getAPIURLFromPath(`/${upath.join(path, entry.name)}`, false)}>{shortenString(entry.name, 20)}</a>
    }</>)
  }
  
const FileTable = ({files, path}: {files: FileEntry[], path: string}) => {
  const [sortBy, setSortBy] = useState<keyof FileEntry | 'ext'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const sortedFiles: FileEntry[] = [...files].sort((a, b) => {
    if (sortBy === 'last_modified') {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
      return sortAsc ? new Date(aValue).getTime() - new Date(bValue).getTime() : new Date(bValue).getTime() - new Date(aValue).getTime();
    }
    if (sortBy === 'fsize') {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
      return sortAsc ? aValue - bValue : bValue - aValue;
    } else if (sortBy === 'name') {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else if (sortBy === 'ext') {
        const aValue = getFileExtension(a['name']);
        const bValue = getFileExtension(b['name']);
        return sortAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const cmp = (aValue === bValue ? 0 : aValue ? -1 : 1)
    return sortAsc ? cmp : cmp * -1 
  });

  const handleSort = (column: keyof FileEntry | 'ext') => {
    if (sortBy === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(column);
      setSortAsc(true);
    }
  };

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>
            Name{' '}
            <IconButton
              aria-label='Name'
              size="xs"
              icon={<Icon as={!sortAsc && sortBy === 'name' ? FiArrowDown : FiArrowUp } />}
              onClick={() => handleSort('name')}
            />
          </Th>
          <Th>
            File Extension{' '}
            <IconButton
              aria-label='File Extension'
              size="xs"
              icon={<Icon as={!sortAsc && sortBy === 'ext' ? FiArrowDown : FiArrowUp } />}
              onClick={() => handleSort('ext')}
            />
          </Th>
          <Th>
            Last Modified{' '}
            <IconButton
              aria-label='Last Modified'
              size="xs"
              icon={<Icon as={!sortAsc && sortBy === 'last_modified' ? FiArrowDown : FiArrowUp } />}
              onClick={() => handleSort('last_modified')}
            />
          </Th>
          <Th>
            fsize{' '}
            <IconButton
              aria-label='fsize'
              size="xs"
              icon={<Icon as={!sortAsc && sortBy === 'fsize' ? FiArrowDown : FiArrowUp } />}
              onClick={() => handleSort('fsize')}
            />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedFiles.map((file, index) => (
          <Tr key={index}>
            <Td>
              <Icon as={file.is_directory ? FiFolder : FiFile} mr={2} />
              <FileListEntry entry={file} path={path}></FileListEntry>
            </Td>
            <Td>{shortenString(getFileExtension(file.name), 7)}</Td>
            <Td>{formatEpochToHumanReadable(file.last_modified)}</Td>
            <Td>{humanReadableFileSize(file.fsize)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default FileTable;