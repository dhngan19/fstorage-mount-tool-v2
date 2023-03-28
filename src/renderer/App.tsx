import './App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import { RootPage, SetupPage, WelcomePage, MainPage } from './pages';
import i18n from '../i18n';

i18n.init();
export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<RootPage />}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/main" element={<MainPage />} />
          {/* <Route path='/main' element={<HomePage />} />
          <Route path='/connected' element={<ConnectedPage />} /> */}
        </Route>
        <Route path='*' element={<h1>404</h1>} />
      </Routes>
    </Router>
  );
}
