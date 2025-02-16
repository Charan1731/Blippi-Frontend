import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Web3Provider } from './context/Web3Context';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Profile from './pages/Profile';
import AIAnalysis from './pages/AIAnalysis';
import BlogGenerator from './pages/AIAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Web3Provider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="create" element={<CreateCampaign />} />
              <Route path="campaign/:id" element={<CampaignDetails />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai" element={<BlogGenerator />} />
            </Route>
          </Routes>
        </Web3Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}