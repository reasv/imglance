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
  Checkbox,
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FileEntry } from './App';
import { Link, useNavigate } from 'react-router-dom';
import { formatEpochToHumanReadable, getAPIURLFromPath, getFileExtension, getPinnedPaths, getQueryParamValue, humanReadableFileSize, shortenString } from './utils';


function FileListEntry({path, entry}: {path: string, entry: FileEntry}) {
  const directoryUrl = (() => {
    const pathPinned = getQueryParamValue('pinned') === 'true'
    const directoryPath = entry.name === ".." ? entry.absolute_path : `${entry.absolute_path}${entry.name}/`
    if (!pathPinned) {
      return `/?path=${directoryPath}`
    }
    const imgpath = getQueryParamValue('imgpath')
    return `/?path=${directoryPath}&pinned=true&imgpath=${imgpath}`
  })()
  

    return (<>{
      entry.is_directory ? 
        <Link to={directoryUrl}>{shortenString(entry.name, 20)}</Link> 
        :
        <a target='_blank' rel="noreferrer" href={getAPIURLFromPath(`${entry.absolute_path}${entry.name}`, false)}>{shortenString(entry.name, 20)}</a>
    }</>)
  }


const PinCheckbox = ({path, entry, pinnedPaths}: {path: string, entry: FileEntry, pinnedPaths: Set<string>}) => {
  const directoryPath = entry.name === ".." ? entry.absolute_path : `${entry.absolute_path}${entry.name}/`
  let pathPinned = pinnedPaths.has(directoryPath)

  const navigate = useNavigate()

  const handleCheckboxChange = () => {
    if (pathPinned) {
      pinnedPaths.delete(directoryPath)
    } else {
      pinnedPaths.add(directoryPath)
    }
    if (pinnedPaths.size === 0) {
      navigate(`/?path=${path}&pinned=true`)
      return 
    }
    if (pinnedPaths.size === 1) {
      navigate(`/?path=${path}&pinned=true&imgpath=${Array.from(pinnedPaths)[0]}`)
      return
    }
    navigate(`/?path=${path}&pinned=true&imgpath=${Array.from(pinnedPaths).join(',')}`)
  }
  return (<Checkbox mr={4} isChecked={pathPinned} onChange={handleCheckboxChange}/>)
}
  
const FileTable = ({files, path}: {files: FileEntry[], path: string}) => {
  const [sortBy, setSortBy] = useState<keyof FileEntry | 'ext'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const sortedFiles: FileEntry[] = [...files].sort((a, b) => {
    if (a.name === "..") {
      return -1
    }
    if (b.name === "..") {
      return 1
    }
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

  const pinning = getQueryParamValue('pinned') === 'true'
  const pinnedPaths = getPinnedPaths()
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
              {pinning && file.is_directory && <PinCheckbox pinnedPaths={pinnedPaths} entry={file} path={path} />}
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