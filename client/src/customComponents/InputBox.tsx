import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const InputBox = ({ children, ...props }: React.PropsWithChildren<any>) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 6,
        padding: 4,
        boxShadow: `0px 4px 15px ${theme.palette.primary.light}`,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default InputBox;
