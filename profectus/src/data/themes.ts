/** A object of all CSS variables determined by the current theme. */
export interface ThemeVars {
    "--foreground": string;
    "--background": string;
    "--feature-foreground": string;
    "--tooltip-background": string;
    "--raised-background": string;
    "--points": string;
    "--locked": string;
    "--highlighted": string;
    "--bought": string;
    "--danger": string;
    "--link": string;
    "--outline": string;
    "--accent1": string;
    "--accent2": string;
    "--accent3": string;
    "--border-radius": string;
    "--modal-border": string;
    "--feature-margin": string;
    "--color": string;
}

/** An object representing a theme the player can use to change the look of the game. */
export interface Theme {
    /** The values of the theme's CSS variables. */
    variables: ThemeVars;
    /** Whether or not tabs should "float" in the center of their container. */
    floatingTabs: boolean;
    /** Whether or not adjacent features should merge together - removing the margin between them, and only applying the border radius to the first and last elements in the row or column. */
    mergeAdjacent: boolean;
    /** Whether or not to show a pin icon on pinned tooltips. */
    showPin: boolean;
}

declare module "@vue/runtime-dom" {
    /** Make CSS properties accept any CSS variables usually controlled by a theme. */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface CSSProperties extends Partial<ThemeVars> {}

    interface HTMLAttributes {
        style?: StyleValue;
    }
}

const defaultTheme: Theme = {
    variables: {
        "--foreground": "#dfdfdf",
        "--background": "#0f0f0f",
        "--feature-foreground": "#0f0f0f",
        "--tooltip-background": "rgba(0, 0, 0, 0.75)",
        "--raised-background": "#0f0f0f",
        "--points": "#ffffff",
        "--locked": "#bf8f8f",
        "--highlighted": "#333",
        "--bought": "#77bf5f",
        "--danger": "rgb(220, 53, 69)",
        "--link": "#02f2f2",
        "--outline": "#dfdfdf",
        "--accent1": "#627a82",
        "--accent2": "#658262",
        "--accent3": "#7c6282",

        "--border-radius": "15px",
        "--modal-border": "solid 2px var(--color)",
        "--feature-margin": "0px",
        "--color": "#000000"
    },
    floatingTabs: true,
    mergeAdjacent: true,
    showPin: true
};

/** An enum of all available themes and their internal IDs. The keys are their display names. */
export enum Themes {
    GamerFlo = "gamerFlo",
    Nordic = "nordic",
    Terminal = "console"
}

/** A dictionary of all available themes. */
export default {
    gamerFlo: {
        ...defaultTheme,
        variables: {
            ...defaultTheme.variables,
            "--background": "rgba(52, 0, 129, 0.5)",
            "--feature-foreground": "#000",
            "--raised-background": "#232c5a",
            "--locked": "#5000a0",
            "--bought": "#6000ff",
            "--outline": "#333c4a",
            "--border-radius": "4px",
            "--modal-border": "",
            "--feature-margin": "5px",
            "--color": "#ffffff",
        },
        floatingTabs: false
    } as Theme,
    // Based on https://www.nordtheme.com
    nordic: {
        ...defaultTheme,
        variables: {
            ...defaultTheme.variables,
            "--foreground": "#D8DEE9",
            "--background": "#2E3440",
            "--feature-foreground": "#000",
            "--raised-background": "#3B4252",
            "--points": "#E5E9F0",
            "--locked": "#4c566a",
            "--highlighted": "#434c5e",
            "--bought": "#8FBCBB",
            "--danger": "#D08770",
            "--link": "#88C0D0",
            "--outline": "#3B4252",
            "--accent1": "#B48EAD",
            "--accent2": "#A3BE8C",
            "--accent3": "#EBCB8B",
            "--border-radius": "4px",
            "--modal-border": "solid 2px #3B4252",
            "--feature-margin": "5px"
        },
        floatingTabs: true,
        mergeAdjacent: true
    } as Theme,
    console: {
        ...defaultTheme,
        variables: {
            ...defaultTheme.variables,
            "--foreground": "#F2F2F2",
            "--background": "#000000",
            "--feature-foreground": "#F2F2F2",
            "--raised-background": "#272727",
            "--points": "#F2F2F2",
            "--locked": "#272727",
            "--danger": "#C50F1F",
            "--link": "#3A96DD",
            "--outline": "#13A10E",
            "--accent1": "#10570D",
            "--border-radius": "4px",
            "--modal-border": "solid 2px #13A10E",
            "--feature-margin": "5px"
        }
    }
} as Record<Themes, Theme>;

/*
,
    aqua: {
        ...defaultTheme,
        variables: {
            ...defaultTheme.variables,
            "--feature-foreground": "#000",
            "--highlighted": "#434c5e",
            "--bought": "#8FBCBB",
            "--danger": "#D08770",
            "--link": "#88C0D0",
            "--accent1": "#B48EAD",
            "--accent2": "#A3BE8C",
            "--accent3": "#EBCB8B",
            "--border-radius": "4px",
            "--modal-border": "solid 2px #3B4252",
            "--feature-margin": "5px",
            "--foreground": "#bfdfff",
            "--background": "#001f3f",
            "--tooltip-background": "rgba(0, 15, 31, 0.75)",
            "--raised-background": "#001f3f",
            "--points": "#dfefff",
            "--locked": "#4c566a",
            "--outline": "#bfdfff"
        }
    } as Theme
*/