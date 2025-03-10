import React from "react";
import AppRouter from "./Components/AppRouter";

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Hide horizontal scrollbar but allow vertical scrolling */
  body {
    overflow-y: scroll;
    overflow-x: hidden;
  }
  body::-webkit-scrollbar {
  width: 0;
}
`;

function App() {
  return (
    <div className="App">
     <GlobalStyle />
    
      <AppRouter />
    </div>
  );
}

export default App;
