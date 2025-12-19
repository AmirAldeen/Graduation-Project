import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { RouterProvider } from 'react-router-dom';
import route from './Routes.jsx';
import UserContextProvider from './contexts/UserContext.jsx';
import PostContextProvider from './contexts/PostContext.jsx';
import LanguageProvider from './contexts/LanguageContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <UserContextProvider>
        <PostContextProvider>
          <RouterProvider router={route} />
        </PostContextProvider>
      </UserContextProvider>
    </LanguageProvider>
  </StrictMode>
);
