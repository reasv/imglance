import React, { useState } from 'react';
import { Input, IconButton, Flex, Checkbox } from '@chakra-ui/react';
import { ArrowForwardIcon, ViewIcon, CloseIcon } from '@chakra-ui/icons';
import { useLocation, useSearchParams } from 'react-router-dom';
import { getCurrentPath, getPinnedPaths } from './utils';

const PathBox: React.FC<{ onPinPath: (pinned: boolean) => void, onOpenImageView: () => void }> = ({ onPinPath, onOpenImageView }) => {
    const location = useLocation()
    const pathParam = getCurrentPath(location)
    const [query, setQuery] = useState(pathParam);

    React.useEffect(() => {
        setQuery(pathParam)    
    }, [pathParam])

    const handleSubmit = () => {
        onSearchPath(query);
    };
    

    const [searchParams, setSearchParams] = useSearchParams();

    function onSearchPath(spath: string) {
        if (!spath.endsWith('/')) {
          spath = spath + '/'
        }
        searchParams.set('path', spath)
        setSearchParams(searchParams)
    }

    const [isChecked, setIsChecked] = useState(false);
    const handleCheckboxChange = () => {
        onPinPath(!isChecked);
        setIsChecked(!isChecked);
    }

    function onDeletePins() {
        searchParams.delete('imgpath')
        setSearchParams(searchParams)
    }

    return (
        <Flex alignItems="center">
        <Input
            placeholder="Path..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            width="700px"
            mr={4}
        />
        <IconButton
            aria-label="Go"
            icon={<ArrowForwardIcon />}
            onClick={handleSubmit}
            colorScheme="blue"
        />
        <IconButton
            aria-label="Image view mode"
            icon={<ViewIcon />}
            onClick={onOpenImageView}
            colorScheme="blue"
            ml={4}
        />
        {getPinnedPaths().size > 0 && <IconButton
            aria-label="Delete pins"
            icon={<CloseIcon />}
            onClick={onDeletePins}
            colorScheme="blue"
            ml={4}
        />}
        {/* <Checkbox ml={4} isChecked={isChecked} onChange={handleCheckboxChange}>
            Enable path pinning
        </Checkbox> */}
        </Flex>
    );
};

export default PathBox;