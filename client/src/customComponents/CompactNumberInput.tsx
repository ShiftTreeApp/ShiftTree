import * as React from "react";
import { styled } from "@mui/system";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { Typography } from "@mui/material";

interface CompactNumberInputProps {
  suggestedShifts: number | null;
  onChange: (newValue: number | null) => void;
}

const CompactNumberInput = React.forwardRef(function CompactNumberInput(
  { suggestedShifts, onChange, ...props }: CompactNumberInputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  const handleIncrement = () => {
    if (suggestedShifts !== null) {
      onChange(suggestedShifts + 1);
    }
  };

  const handleDecrement = () => {
    if (suggestedShifts !== null) {
      if (suggestedShifts > 0) {
        onChange(suggestedShifts - 1);
      } else {
        onChange(suggestedShifts);
      }
    }
  };

  const handleHiddenInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = Number(event.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else {
      onChange(null);
    }
  };

  return (
    <StyledInputRoot>
      <StyledStepperButton className="increment" onClick={handleIncrement}>
        <ArrowDropUpRoundedIcon />
      </StyledStepperButton>
      <StyledStepperButton className="decrement" onClick={handleDecrement}>
        <ArrowDropDownRoundedIcon />
      </StyledStepperButton>
      <HiddenInput
        {...props}
        ref={ref}
        value={suggestedShifts ?? ""}
        onChange={handleHiddenInputChange}
      />
    </StyledInputRoot>
  );
});

export default function UseNumberInputCompact({
  suggestedShifts,
  onChange,
}: CompactNumberInputProps) {
  return (
    <Layout>
      <Typography variant="caption">
        Recommended Shifts: {suggestedShifts ?? " "}
      </Typography>

      <CompactNumberInput
        aria-label="Compact Suggested Shifts"
        suggestedShifts={suggestedShifts}
        onChange={onChange}
      />
    </Layout>
  );
}

const blue = {
  100: "#DAECFF",
  200: "#80BFFF",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  700: "#0059B2",
};

const grey = {
  50: "#F3F6F9",
  100: "#E5EAF2",
  200: "#DAE2ED",
  300: "#C7D0DD",
  400: "#B0B8C4",
  500: "#9DA8B7",
  600: "#6B7A90",
  700: "#434D5B",
  800: "#303740",
  900: "#1C2025",
};

const StyledInputRoot = styled("div")(
  ({ theme }) => `
    display: grid;
    grid-template-columns: 1.2rem;
    grid-template-rows: 1.2rem 1.2rem;
    grid-template-areas:
      "increment"
      "decrement";
    row-gap: 0.5px;
    overflow: hidden;
    border-radius: 8px;
    border-style: solid;
    border-width: 1px;
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
    border-color: ${theme.palette.mode === "dark" ? grey[800] : grey[200]};
    box-shadow: 0px 2px 4px ${
      theme.palette.mode === "dark" ? "rgba(0,0,0, 0.5)" : "rgba(0,0,0, 0.05)"
    };
  `,
);

const HiddenInput = styled("input")`
  visibility: hidden;
  position: absolute;
`;

const StyledStepperButton = styled("button")(
  ({ theme }) => `
  display: flex;
  flex-flow: nowrap;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  box-sizing: border-box;
  border: 0;
  padding: 0;
  width: 1.2rem;
  height: 1.2rem;
  color: inherit;
  background: ${theme.palette.mode === "dark" ? grey[900] : grey[50]};

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === "dark" ? blue[700] : blue[500]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 3px ${theme.palette.mode === "dark" ? blue[700] : blue[200]};
  }

  &.increment {
    grid-area: increment;
  }

  &.decrement {
    grid-area: decrement;
  }
`,
);

const Layout = styled("div")`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  column-gap: 0.65rem;
`;
