import { Box, styled, Typography, useMediaQuery } from '@mui/material';
import styles from './index.module.scss';

const StyledBoxWrapper = styled(Box)`
  position: absolute;
  bottom: 40px;
  right: 76px;
  width: max-content;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 12px;

  @media (max-width: 480px) {
    right: 1rem;
    left: 1rem;
    width: calc(100% - 2rem);
    padding: 0.5rem 1rem;
  }
`;

const StyledList = styled('ul')`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;

  @media (max-width: 480px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const StyledListItem = styled('li')`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;

  @media (max-width: 480px) {
    width: 32%;
  }
`;

const HeadingTypography = styled(Typography)`
  color: #fff;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 120%;
  margin-bottom: 1rem;
`;

const ListItemTypography = styled(Typography)`
  color: #fff;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 120%;

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const legendsList = [
  { color: `rgba(255, 255, 255)`, text: 'Available complete acres' },
  { color: `rgba(140, 207, 255)`, text: 'Available partial acres' },
  { color: `rgba(17, 216, 0)`, text: 'Preserved acres' },
];

export default function Legend() {
  const isMobile = useMediaQuery('(max-width:480px)');
  return (
    <StyledBoxWrapper>
      {!isMobile && <HeadingTypography variant="body2">Legend</HeadingTypography>}
      <StyledList>
        {legendsList.map((legend, idx) => {
          const color = legend.color;
          const bgcolor = `${color?.split(')')[0]}, 0.3)`;
          const borderColor = `${color?.split(')')[0]}, 0.5)`;
          return (
            <StyledListItem key={idx}>
              <Box
                sx={{
                  width: isMobile ? 12 : 21,
                  height: isMobile ? 12 : 21,
                  marginRight: isMobile ? '9px' : '12px',
                  backgroundColor: bgcolor,
                  border: '1px solid',
                  borderColor,
                }}
              ></Box>
              <ListItemTypography variant="body2">{legend.text}</ListItemTypography>
            </StyledListItem>
          );
        })}
      </StyledList>
    </StyledBoxWrapper>
  );
}
