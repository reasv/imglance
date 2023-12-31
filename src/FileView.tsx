import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import {
  VStack,
} from "@chakra-ui/react"
import { useLocation, useSearchParams } from 'react-router-dom'

import { dedupeEntries, entryIsEqual, getCurrentPath, getFileList, getQueryParamValue, isImageFile } from "./utils"

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
  parent_path: string,
  is_directory: boolean,
  last_modified: number,
  fsize: number
}

export function FileView() {
  const location = useLocation()
  const pathParam = getCurrentPath(location)
  const imageView = getQueryParamValue('imageview') === 'true'
  const [data, setData] = React.useState<Array<FileEntry>>([])
  const [searchParams, setSearchParams] = useSearchParams();
  const [path, setPath] = React.useState<string>(pathParam)

  useEffect(() => {
    async function fetchData() {
      try {
        const folderData = await getFileList(pathParam)
        console.log(`Path query: ${pathParam}, Path: ${folderData.absolute_path}`)
        if (pathParam !== folderData.absolute_path) {
          console.log(`Path query: ${pathParam} !== Path: ${folderData.absolute_path}`)

          searchParams.set('path', folderData.absolute_path)
          setSearchParams(searchParams)
          setPath(folderData.absolute_path)
        } else {
          setPath(pathParam)
        }
        if (folderData.parent_path !== null) {
          folderData.entries.unshift({
            name: ".",
            is_directory: true,
            last_modified: 0,
            fsize: 0,
            absolute_path: folderData.absolute_path,
            parent_path: '' // Unknown
          })
          folderData.entries.unshift({
            name: "..",
            is_directory: true,
            last_modified: 0,
            fsize: 0,
            absolute_path: folderData.parent_path,
            parent_path: '' // Unknown
          })
        }
        setData(folderData.entries)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [pathParam])

  function openImageView() {
    if (imageView) {
      searchParams.delete("imageview")
    } else {
      searchParams.set("imageview", 'true')
    }
    setSearchParams(searchParams)
  }

  const [pinnedImages, setPinnedImages] = React.useState<FileEntry[]>([])
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

  const [pinData, setPinData] = React.useState<FileEntry[][]>([])
  const [fetchedPaths, setFetchedPaths] = React.useState<Set<string>>(new Set<string>())

  useEffect(() => {
    const pinnedPaths = searchParams.getAll('imgpath')
    const pathSet = new Set(pinnedPaths)
    async function fetchPinnedData() {
      for (let pinnedPath of Array.from(pinnedPaths)) {
        if (fetchedPaths.has(pinnedPath)) {
          continue
        }
        const folderData = await getFileList(pinnedPath)
        const folderEntries = folderData.entries.filter(entry => isImageFile(entry))
        if (folderEntries.length > 0) {
          setPinData(pinData => [folderEntries, ...pinData])
        }
        setFetchedPaths(fetchedPaths => fetchedPaths.add(pinnedPath))
      }
      setPinData(pinData => pinData.filter(pd => pathSet.has(pd[0].parent_path)))
      const fetchedPathsArray = Array.from(fetchedPaths.values()).filter(fp => pathSet.has(fp))
      if (fetchedPathsArray.length !== fetchedPaths.size) {
        setFetchedPaths(new Set(fetchedPathsArray))
      }
    }
    if (pinnedPaths.length > 0) {
      fetchPinnedData()
    } else {
      if (pinData.length > 0) {
        setPinData([])
      }
      if (fetchedPaths.size > 0) {
        setFetchedPaths(new Set<string>())
      }
    }
  }, [searchParams, fetchedPaths])

  const [sortBy, setSortBy] = useState<keyof FileEntry | 'ext'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const [globalSorting, setGlobalSorting] = useState(false)

  const sortedLocalEntries: SortedEntries = useMemo(() => {
    const handleSort = (column: keyof FileEntry | 'ext') => {
      if (sortBy === column) {
        setSortAsc(!sortAsc);
      } else {
        setSortBy(column);
        setSortAsc(true);
      }
    };
    return { handleSort, sortBy, sortAsc, entries: [...data].sort(getFileCompare(sortBy, sortAsc)) }
  }, [data, sortBy, sortAsc])

  const sortedPinnedEntries = useMemo(() => {
    let filesFromPinned: FileEntry[] = []
    // Flatten
    for (const folderPins of pinData) {
      // Sort each folder individually and preserve folder order
      if (!globalSorting) folderPins.sort(getFileCompare(sortBy, sortAsc, true))
      filesFromPinned = [...filesFromPinned, ...folderPins]
    }
    return filesFromPinned
  }, [pinData, sortAsc, sortBy, globalSorting])

  const imageEntries = useMemo(() => {
    const entries = dedupeEntries([...sortedPinnedEntries, ...sortedLocalEntries.entries.filter(entry => isImageFile(entry))]);
    return entries
  }, [sortedLocalEntries.entries, sortedPinnedEntries])

  const imageViewEntries = useMemo(() => {
    if (pinnedImages.find((e) => e.parent_path === path)) {
      return [...pinnedImages, ...sortedPinnedEntries]
    }
    return [...pinnedImages, ...imageEntries]
  }, [pinnedImages, imageEntries, sortedPinnedEntries, path])

  const onGlobalSort = (enabled: boolean) => {
    setGlobalSorting(enabled)
  }

  return (<VStack spacing={3}>
    <PathBox onEnableGlobalSorting={onGlobalSort} onOpenImageView={openImageView}></PathBox>
    {imageView ?
      <ImageView entries={imageViewEntries}></ImageView> :
      <SliderSplitter leftComponent={<FileTable sortedEntries={sortedLocalEntries} files={data} />} rightComponent={<ImageGrid highlighted={pinnedImages} entries={imageEntries} onClick={selectImage}></ImageGrid>} />}
  </VStack>)
}