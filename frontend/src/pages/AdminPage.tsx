import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AdminQuestions } from '../components/Admin/AdminQuestions';
import { AdminCategories } from '../components/Admin/AdminCategories';
import { AdminAnswers } from '../components/Admin/AdminAnswers';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  if (!user?.is_admin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">You do not have permission to access this page</Alert>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Panel
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
        >
          <Tab label="Questions" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
          <Tab label="Answers" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
          <Tab label="Categories" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <AdminQuestions />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <AdminAnswers />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <AdminCategories />
      </TabPanel>
    </Container>
  );
};
