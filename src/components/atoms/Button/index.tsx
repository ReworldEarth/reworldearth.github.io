import { Button, ButtonProps, styled } from "@mui/material";
import theme from "../../../theme";
import { makeShouldForwardProp } from "../../../theme/utils";

interface Props extends ButtonProps {
  squared?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  border?: string;
  textColor?: string;
  padding?: string;
  boxShadow?: string;
  fontSize?: string;
  textTransform?: string;
  borderRadius?: string;
}

const StyledButton = styled(Button, {
  shouldForwardProp: makeShouldForwardProp([
    "squared",
    "backgroundColor",
    "textColor",
    "borderColor",
    "border",
    "padding",
    "boxShadow",
    "fontSize",
    "textTransform",
    "borderRadius",
  ]),
})<Props>`
  padding: ${({ padding = "16px 32px" }) => padding};
  letter-spacing: 3px;
  font-size: 10px;

  ${({ squared }) => (squared ? "border-radius: 0;" : "")}
  ${({ backgroundColor }) =>
    backgroundColor ? `background-color: ${backgroundColor};` : ""}
  ${({ boxShadow }) => (boxShadow ? `box-shadow: ${boxShadow};` : "")}
  ${({ borderColor }) => (borderColor ? `border-color: ${borderColor};` : "")}
  ${({ border }) => (border ? `border: ${border};` : "")}
  ${({ textColor = theme.palette.text.primary }) => `color: ${textColor};`}
  ${({ fontSize }) => (fontSize ? `font-size: ${fontSize};` : "")}
  ${({ textTransform }) =>
    textTransform ? `text-transform: ${textTransform};` : ""}
  ${({ borderRadius }) =>
    borderRadius ? `border-radius: ${borderRadius};` : ""}

  &:hover {
    ${({ backgroundColor }) =>
      backgroundColor ? `background-color: ${backgroundColor};` : ""}
    ${({ borderColor }) => (borderColor ? `border-color: ${borderColor};` : "")}
  }
`;

export default StyledButton;
