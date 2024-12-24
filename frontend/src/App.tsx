import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { theme } from './theme';
import { store } from './store';

// Layout
import Layout from './components/Layout';

// Pages
import MailPage from './pages/Mail';
import CalendarPage from './pages/Calendar';
import ContactsPage from './pages/Contacts';
import LoginPage from './pages/Login';

// Auth
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<MailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="contacts" element={<ContactsPage />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
