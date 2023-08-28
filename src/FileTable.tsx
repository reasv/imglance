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
import { FileEntry, SortedEntries } from './FileView';
import { Link, useNavigate } from 'react-router-dom';
import { formatEpochToHumanReadable, getAPIURLFromPath, getFileExtension, getPinnedPaths, getQueryParamValue, humanReadableFileSize, shortenString } from './utils';


function FileListEntry({entry}: {entry: FileEntry}) {
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
  
const FileTable = ({path, sortedEntries}: {files: FileEntry[], path: string, sortedEntries: SortedEntries}) => {

  const {handleSort, sortAsc, sortBy, entries} = sortedEntries

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
        {entries.map((file, index) => (
          <Tr key={index}>
            <Td>
              {pinning && file.is_directory && <PinCheckbox pinnedPaths={pinnedPaths} entry={file} path={path} />}
             <Icon as={file.is_directory ? FiFolder : FiFile} mr={2} />
              <FileListEntry entry={file}></FileListEntry>
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