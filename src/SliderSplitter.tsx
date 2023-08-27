import React, { useState } from "react";
import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";

interface SliderSplitterProps {
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
}

const SliderSplitter: React.FC<SliderSplitterProps> = ({ leftComponent, rightComponent }) => {
  const [splitRatio, setSplitRatio] = useState<number>(0.5);

  return (
    <>
    <Slider
        orientation="horizontal"
        min={0}
        max={1}
        step={0.01}
        value={splitRatio}
        onChange={(value) => setSplitRatio(value)}
        aria-label="Slider"
        mx={4}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      
    <Box display="flex" height="100%">
      <Box flex={splitRatio} overflow="auto">
        {leftComponent}
      </Box>
      
      <Box flex={1 - splitRatio} overflow="auto">
        {splitRatio < 1 && rightComponent}
      </Box>
    </Box>
    </>
  );
};

export default SliderSplitter;