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
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Link, BrowserRouter as Router, Route, useLocation, Routes, useNavigate } from 'react-router-dom'


import upath from 'upath'
import { getAPIURLFromPath, getCurrentPath, setCurrentPath } from "./utils"

interface FileEntry {
    name: string,
    is_directory: boolean,
    last_modified: number,
    fsize: number
}
interface FolderData {
  entries: FileEntry[],
  absolute_path: string
}

function FileListEntry({path, entry}: {path: string, entry: FileEntry}) {
  return (<>{
    entry.is_directory ? <Link to={`/?path=/${upath.join(path, entry.name)}/`}>{entry.name}</Link> : <a href={getAPIURLFromPath(`/${upath.join(path, entry.name)}`, false)}>{entry.name}</a>
  }</>)
}

function FileList() {
    const [data, setData] = React.useState<Array<FileEntry>>([])
    const location = useLocation()
    const pathParam = getCurrentPath(location)
    const [path, setPath] = React.useState<string>(pathParam)

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

    return (<VStack spacing={8}>
      {data.map((file) => <FileListEntry key={file.name} path={path} entry={file}></FileListEntry>)}
    </VStack>)
}

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
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
