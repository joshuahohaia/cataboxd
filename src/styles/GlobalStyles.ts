import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --spine-length: 380px;
    --book-thickness: 14px;
    --cover-width: 280px;
    --list-padding: 80px;
    --list-padding-left: 80px;
    --book-wrapper-height: 100px;
    --book-margin-bottom: -70px;

    @media (max-width: 768px) {
      --spine-length: 280px;
      --book-thickness: 10px;
      --cover-width: 200px;
      --list-padding: 20px;
      --list-padding-left: 20px;
      --book-wrapper-height: 80px;
      --book-margin-bottom: -55px;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;
