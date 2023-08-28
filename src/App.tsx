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
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { BrowserRouter as Router, Route, useLocation, Routes, useNavigate } from 'react-router-dom'


import upath from 'upath'
import { getAPIURLFromPath, getCurrentPath, getQueryParamValue } from "./utils"

import PathBox from "./PathBox"
import FilesView from "./FilesView"
import ImageView from "./ImageView"
import SliderSplitter from "./SliderSplitter"
import FileTable from "./FileTable"
import ImageGrid from "./ImageGrid"

export interface FileEntry {
    name: string,
    is_directory: boolean,
    last_modified: number,
    fsize: number
}
interface FolderData {
  entries: FileEntry[],
  absolute_path: string
}

function FileList() {
    const [data, setData] = React.useState<Array<FileEntry>>([])
    const location = useLocation()
    const pathParam = getCurrentPath(location)
    const [path, setPath] = React.useState<string>(pathParam)
    const imageView = getQueryParamValue('imageview')
    const navigate = useNavigate()

    React.useEffect(() => {
      async function fetchData() {
        try {
          const response = await fetch(getAPIURLFromPath(pathParam, true))
          if (!response.ok) throw new Error(`HTTP error ${response.status}`)
          const json: FolderData = await response.json()
          const parsedPath = upath.parse(json.absolute_path)
          const fullPath = `${parsedPath.dir}/${parsedPath.base}/`
          console.log(`Pathparam: ${pathParam}, Path: ${fullPath}, Raw: ${json.absolute_path}`)
          if (pathParam !== fullPath) {
            console.log(`Pathparam: ${pathParam} !== Path: ${fullPath}`)
            navigate(`/?path=${fullPath}`)
            setPath(fullPath)
          } else {
            setPath(pathParam)
          }
          json.entries.unshift({
            name: "..",
            is_directory: true,
            last_modified: 0,
            fsize: 0
          })
          setData(json.entries)
        } catch (error) {
          console.log(error)
        }
      }
      fetchData()
    }, [navigate, pathParam])

    const [selected, setSelection] = React.useState<FileEntry | undefined>()
    function openImageView(entry: FileEntry) {
      navigate(`/?path=${path}&imageview=true`)
      setSelection(entry)
    }

    return (<VStack spacing={3}>
      <PathBox onSearch={(p) => navigate(`/?path=${p}`)}></PathBox>
      {imageView ? 
      <ImageView firstEntry={selected} entries={data} path={path}></ImageView> : 
      <SliderSplitter leftComponent={<FileTable files={data} path={path}/>} rightComponent={<ImageGrid entries={data} path={path} onClick={openImageView}></ImageGrid>} />}
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
