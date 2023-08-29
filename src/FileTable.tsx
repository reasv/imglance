import React, { useState, useMemo, useEffect } from 'react';
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
import { Link, useLocation, useMatch, useSearchParams } from 'react-router-dom';
import { formatEpochToHumanReadable, getAPIURLFromPath, getFileExtension, getPinnedPaths, getQueryParamValue, humanReadableFileSize, shortenString } from './utils';


function FileListEntry({entry}: {entry: FileEntry}) {
  const [searchParams] = useSearchParams()
  const directoryUrl = (() => {
    const directoryPath = entry.name === ".." ? entry.absolute_path : `${entry.absolute_path}${entry.name}/`
    searchParams.set('path', directoryPath)
    return `/?${searchParams.toString()}`
  })()
    return (<>{
      entry.is_directory ? 
        <Link to={directoryUrl}>{shortenString(entry.name, 20)}</Link> 
        :
        <a target='_blank' rel="noreferrer" href={getAPIURLFromPath(`${entry.absolute_path}${entry.name}`, false)}>{shortenString(entry.name, 20)}</a>
    }</>)
  }


const PinCheckbox = ({entry}: {entry: FileEntry}) => {
  const directoryPath = entry.name === ".." ? entry.absolute_path : `${entry.absolute_path}${entry.name}/`

  const location = useLocation()
  const pinnedPaths = useMemo(() => {
      return getPinnedPaths(new URLSearchParams(location.search))
  }, [location.search])

  let pathPinned = pinnedPaths.has(directoryPath)

  const [searchParams, setSearchParams] = useSearchParams()

  const handleCheckboxChange = () => {
    if (pathPinned) {
      pinnedPaths.delete(directoryPath)

    } else {
      pinnedPaths.add(directoryPath)
    }
    if (pinnedPaths.size === 0) {
      searchParams.delete('imgpath')
    }
    if (pinnedPaths.size === 1) {
      searchParams.delete('imgpath')
      searchParams.append('imgpath', Array.from(pinnedPaths)[0])
    } else {
      searchParams.delete('imgpath')
      for (let path of Array.from(pinnedPaths)) {
        searchParams.append('imgpath', path)
      }
    }
    setSearchParams(searchParams)
  }
  return (<Checkbox mr={4} isChecked={pathPinned} onChange={handleCheckboxChange}/>)
}
  
const FileTable = ({sortedEntries}: {files: FileEntry[], sortedEntries: SortedEntries}) => {

  const {handleSort, sortAsc, sortBy, entries} = sortedEntries
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
              {file.is_directory && <PinCheckbox entry={file} />}
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