import * as React from "react"
import { useState, useMemo, useEffect } from "react"
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
import { getAPIURLFromPath, getCurrentPath, getFileList, getPinnedPaths, getQueryParamValue, isImageFile } from "./utils"

import PathBox from "./PathBox"
import ImageView from "./ImageView"
import SliderSplitter from "./SliderSplitter"
import FileTable from "./FileTable"
import ImageGrid from "./ImageGrid"
import { getFileCompare } from "./filesorter"
import { FileView } from "./FileView"
import { ColorModeSwitcher } from "./ColorModeSwitcher"

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" p={3}>
        <VStack spacing={8}>
          <Router>
            <Routes>
              <Route path="/" element={<FileView />} />
            </Routes>
          </Router>
        </VStack>
      </Grid>
    </Box>
  </ChakraProvider>
)
