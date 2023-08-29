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



import { FileView } from "./FileView"

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
