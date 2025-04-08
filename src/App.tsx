import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Web3Provider } from './context/Web3Context';
import { RainbowKitConfig } from './context/RainbowKitConfig';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Profile from './pages/Profile';

import BlogGenerator from './pages/AIAnalysis';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <RainbowKitConfig>
          <Web3Provider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="create" element={<CreateCampaign />} />
                <Route path="campaign/edit/:id" element={<EditCampaign />} />
                <Route path="campaign/:id" element={<CampaignDetails />} />
                <Route path="profile" element={<Profile />} />
                <Route path="ai" element={<BlogGenerator />} />
              </Route>
            </Routes>
          </Web3Provider>
        </RainbowKitConfig>
      </ThemeProvider>
    </BrowserRouter>
  );
}