import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  Link as CLink,
  VStack,
} from "@chakra-ui/react"
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom'


import upath from 'upath'
import { dedupeEntries, entryIsEqual, getCurrentPath, getFileList, getPinnedPaths, getQueryParamValue, isImageFile } from "./utils"

import PathBox from "./PathBox"
import ImageView from "./ImageView"
import SliderSplitter from "./SliderSplitter"
import FileTable from "./FileTable"
import ImageGrid from "./ImageGrid"
import { getFileCompare } from "./filesorter"

export interface SortedEntries {
  sortBy: keyof FileEntry | "ext";
  sortAsc: boolean;
  entries: FileEntry[];
  handleSort: (column: keyof FileEntry | 'ext') => void
}
export interface FileEntry {
    name: string,
    absolute_path: string,
    is_directory: boolean,
    last_modified: number,
    fsize: number
}

export function FileView() {
    const [data, setData] = React.useState<Array<FileEntry>>([])
    const location = useLocation()
    const pathParam = getCurrentPath(location)
    const [path, setPath] = React.useState<string>(pathParam)
    const imageView = getQueryParamValue('imageview') === 'true'
    const navigate = useNavigate()

    React.useEffect(() => {
      async function fetchData() {
        try {
          const folderData = await getFileList(pathParam)
          const parsedPath = upath.parse(folderData.absolute_path)
          const fullPath = `${parsedPath.dir}/${parsedPath.base}/`
          console.log(`Pathparam: ${pathParam}, Path: ${fullPath}, Raw: ${folderData.absolute_path}`)
          if (pathParam !== fullPath) {
            console.log(`Pathparam: ${pathParam} !== Path: ${fullPath}`)
            navigate(`/?path=${fullPath}`)
            setPath(fullPath)
          } else {
            setPath(pathParam)
          }
          folderData.entries.unshift({
            name: "..",
            is_directory: true,
            last_modified: 0,
            fsize: 0,
            absolute_path: `${parsedPath.dir}/`
          })
          console.log(folderData.entries)
          setData(folderData.entries)
        } catch (error) {
          console.log(error)
        }
      }
      fetchData()
    }, [navigate, pathParam])
    const pathPinned = getQueryParamValue('pinned') === 'true'

    const pinnedPaths = getPinnedPaths()
    const [pinnedImages, setPinnedImages] = React.useState<FileEntry[]>([])

    function openImageView() {
      navigate(`/?path=${path}&imageview=true&pinned=${pathPinned}&imgpath=${getQueryParamValue('imgpath')}`)
    }

    function selectImage(entry: FileEntry) {
      console.log("Select Image")
      const i = pinnedImages.findIndex((e) => entryIsEqual(e, entry))
      if (i === -1) {
        setPinnedImages(s => [entry, ...s])
      } else {
        setPinnedImages(s => {
          const newValue = [...s]
          newValue.splice(i, 1)
          return newValue
        })
      }
    }

    const [pinData, setPinData] = React.useState<Array<FileEntry>>([])
    const [fetchedPaths, setFetchedPaths] = React.useState<Set<string>>(new Set<string>())

    React.useEffect(() => {
      async function fetchPinnedData() {
        for (let pinnedPath of Array.from(pinnedPaths)) {
          if (fetchedPaths.has(pinnedPath)) {
            continue
          }
          const folderData = await getFileList(pinnedPath)
          setPinData(pinData => [...folderData.entries, ...pinData])
          setFetchedPaths(fetchedPaths => fetchedPaths.add(pinnedPath))
        }
      }
      if (pathPinned && pinnedPaths.size > 0) {
        fetchPinnedData()
      } else {
        setPinData([])
        setFetchedPaths(new Set<string>())
      }
    }, [pathPinned, pinnedPaths, fetchedPaths])

    const onPathPinned = (pinned: boolean) => {
      if (pinned) {
        navigate(`/?path=${path}&imageview=${imageView}&pinned=true`)
      } else {
        navigate(`/?path=${path}&imageview=${imageView}`)
      }
    }

  const [sortBy, setSortBy] = useState<keyof FileEntry | 'ext'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  
  const sortedEntries: SortedEntries = useMemo(() => {
    const handleSort = (column: keyof FileEntry | 'ext') => {
      if (sortBy === column) {
        setSortAsc(!sortAsc);
      } else {
        setSortBy(column);
        setSortAsc(true);
      }
    };
    return {handleSort, sortBy, sortAsc, entries: [...data].sort(getFileCompare(sortBy, sortAsc))}
  }, [data, sortBy, sortAsc])

    const imageEntries = React.useMemo(() => {
      const entries = dedupeEntries([...pinData.filter(entry => isImageFile(entry)), ...sortedEntries.entries.filter(entry => isImageFile(entry))]);
      return entries.sort(getFileCompare(sortBy, sortAsc, true))
    }, [sortedEntries.entries, pinData, sortBy, sortAsc])

    const imageViewEntries = useMemo(() => {
      if (pinnedImages.find((e) => e.absolute_path === path)) {
        const pinnedFolderContent = dedupeEntries(pinData.filter(entry => isImageFile(entry)))
        pinnedFolderContent.sort(getFileCompare(sortBy, sortAsc, true))
        return [...pinnedImages, ...pinnedFolderContent]
      }
      return [...pinnedImages, ...imageEntries]
    }, [pinnedImages, imageEntries, path, pinData, sortBy, sortAsc])

    return (<VStack spacing={3}>
      <PathBox onSearch={(p) => navigate(`/?path=${p}`)} onPinPath={onPathPinned} onOpenImageView={openImageView}></PathBox>
      {imageView ? 
      <ImageView entries={imageViewEntries}></ImageView> : 
      <SliderSplitter leftComponent={<FileTable sortedEntries={sortedEntries} files={data} path={path}/>} rightComponent={<ImageGrid highlighted={pinnedImages} entries={imageEntries} onClick={selectImage}></ImageGrid>} />}
    </VStack>)
}