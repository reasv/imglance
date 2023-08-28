import React, { useState } from 'react';
import { Input, IconButton, Flex, Checkbox } from '@chakra-ui/react';
import { ArrowForwardIcon, SearchIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import { getCurrentPath } from './utils';

const PathBox: React.FC<{ onSearch: (query: string) => void, onPinPath: (pinned: boolean) => void }> = ({ onSearch, onPinPath }) => {
    const location = useLocation()
    const pathParam = getCurrentPath(location)
    const [query, setQuery] = useState(pathParam);

    React.useEffect(() => {
        setQuery(pathParam)    
    }, [pathParam])

    const handleSubmit = () => {
        onSearch(query);
    };
    const [isChecked, setIsChecked] = useState(false);
    const handleCheckboxChange = () => {
        onPinPath(!isChecked);
        setIsChecked(!isChecked);
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
        <Checkbox ml={4} isChecked={isChecked} onChange={handleCheckboxChange}>
            Pin current path
        </Checkbox>
        </Flex>
    );
};

export default PathBox;