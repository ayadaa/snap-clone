/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        snapYellow: '#FFFC00',
        snapBlue: '#0FADFF',
        chatBubbleSender: '#0084FF',
        chatBubbleReceiver: '#F0F0F0',
        primaryDark: '#1A1A1A',
        surfaceDark: '#2D2D2D',
        textLight: '#FFFFFF',
        textDark: '#000000',
      },
      spacing: {
        'safe-top': '44px', // iOS safe area
        'safe-bottom': '34px',
        'camera-button': '80px',
      },
      borderRadius: {
        'bubble': '20px',
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 