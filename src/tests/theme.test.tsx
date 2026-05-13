import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, CssBaseline, ThemeProvider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { C, theme } from "../theme";

function ThemeProbe() {
  const muiTheme = useTheme();
  return (
    <>
      <CssBaseline />
      <Button color="secondary" variant="contained">Ação Plus</Button>
      <span data-testid="primary">{muiTheme.palette.primary.main}</span>
      <span data-testid="secondary">{muiTheme.palette.secondary.main}</span>
      <span data-testid="font">{muiTheme.typography.fontFamily}</span>
    </>
  );
}

describe("tema MUI Plus", () => {
  it("renderiza componentes MUI com a paleta e tipografia customizadas", () => {
    render(
      <ThemeProvider theme={theme}>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByRole("button", { name: /ação plus/i })).toBeInTheDocument();
    expect(screen.getByTestId("primary")).toHaveTextContent(C.navy);
    expect(screen.getByTestId("secondary")).toHaveTextContent(C.green);
    expect(screen.getByTestId("font")).toHaveTextContent("Inter");
  });
});
