import React, { createContext, useContext } from "react";
import { useColorScheme } from "nativewind";

type ThemeMode = "light" | "dark";

interface ThemeContextProps {
  mode: any;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  mode: "dark",
  toggleTheme: () => { },
});
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ mode: colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);