/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#191970", // Midnight blue
        accent: "#880808", // Dark red
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              color: theme('colors.accent'),
              '&:hover': {
                color: theme('colors.accent/0.8'),
              },
            },
            h1: {
              color: theme('colors.primary'),
            },
            h2: {
              color: theme('colors.primary'),
            },
            h3: {
              color: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
