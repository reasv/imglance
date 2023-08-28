import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link as CLink,
  VStack,
  Code,
  Grid,
  theme,
  HStack,
} from "@chakra-ui/react"
import { BrowserRouter as Router, Route, useLocation, Routes, useNavigate } from 'react-router-dom'


import upath from 'upath'
import { getAPIURLFromPath, getCurrentPath, getFileExtension, getPinnedPaths, getQueryParamValue, isImageFile } from "./utils"

import PathBox from "./PathBox"
import ImageView from "./ImageView"
import SliderSplitter from "./SliderSplitter"
import FileTable from "./FileTable"
import ImageGrid from "./ImageGrid"

export interface FileEntry {
    name: string,
    absolute_path: string,
    is_directory: boolean,
    last_modified: number,
    fsize: number
}
interface FolderData {
  entries: FileEntry[],
  absolute_path: string
}

async function getFileList(path: string): Promise<FolderData> {
  const response = await fetch(getAPIURLFromPath(path, true))
  if (!response.ok) throw new Error(`HTTP error ${response.status}`)
  const json: FolderData = await response.json()
  const parsedPath = upath.parse(json.absolute_path)
  const fullPath = `${parsedPath.dir}/${parsedPath.base}/`
  for (let entry of json.entries) {
    entry.absolute_path = fullPath
  }
  return json
}

function FileList() {
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
    const [selected, setSelection] = React.useState<FileEntry | undefined>()
    function openImageView(entry: FileEntry) {
      navigate(`/?path=${path}&imageview=true&pinned=${pathPinned}&imgpath=${getQueryParamValue('imgpath')}`)
      setSelection(entry)
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

    const imageEntries = React.useMemo(() => {
      return [...pinData.filter(entry => isImageFile(entry)), ...data.filter(entry => isImageFile(entry))];
    }, [data, pinData])

    return (<VStack spacing={3}>
      <PathBox onSearch={(p) => navigate(`/?path=${p}`)} onPinPath={onPathPinned}></PathBox>
      {imageView ? 
      <ImageView firstEntry={selected} entries={imageEntries}></ImageView> : 
      <SliderSplitter leftComponent={<FileTable files={data} path={path}/>} rightComponent={<ImageGrid entries={imageEntries} onClick={openImageView}></ImageGrid>} />}
    </VStack>)
}

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        {/* <ColorModeSwitcher justifySelf="flex-end" /> */}
        <VStack spacing={8}>
          <Router>
            <Routes>
              <Route path="/" element={<FileList/>} />
            </Routes>
          </Router>
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
)
