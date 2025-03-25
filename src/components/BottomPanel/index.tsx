import { Box, Slide } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { ReactNode } from 'react';

type BottomPanelProps = {
  isOpen: boolean;
  children: ReactNode;
};

export default function BottomPanel({ isOpen, children }: BottomPanelProps) {
  const isMobile = useMediaQuery('(max-width:480px)');

  return (
    <Box
      position={isMobile ? 'fixed' : 'absolute'}
      sx={{
        width: isMobile ? '100%' : '664px',
        bottom: isMobile ? '-2px' : '35px',
        left: isMobile ? '0' : '30%',
        zIndex: '900',
        minHeight: '88px',
      }}
    >
      <Slide direction="up" in={isOpen}>
        <Box
          sx={{
            boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
            borderRadius: isMobile ? '10px 10px 0 0' : '10px',
            backgroundColor: '#FFF',
          }}
          width="100%"
          height="100%"
          paddingTop={1.75}
          paddingBottom={2}
          paddingLeft="22px"
          paddingRight="20px"
        >
          {children}
        </Box>
      </Slide>
    </Box>
  );
}
