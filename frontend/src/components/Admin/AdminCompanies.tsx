import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
  alpha,
  Pagination,
  InputAdornment,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { companyService } from '../../services/companyService';
import type { Company, CompanyCreate, CompanyUpdate, Question } from '../../types';

const NEUTRAL_COLORS = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#3182CE',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  success: '#38A169',
  warning: '#DD6B20',
  error: '#E53E3E',
  info: '#3182CE',
};

const ITEMS_PER_PAGE = 10;

const StyledButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  startIcon,
  onClick,
  size = 'medium',
  disabled = false,
}: any) => (
  <Button
    variant={variant}
    color={color}
    startIcon={startIcon}
    onClick={onClick}
    size={size}
    disabled={disabled}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      px: variant === 'contained' ? 3 : 2,
      transition: 'all 0.2s ease',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(
          NEUTRAL_COLORS.accent,
          0.9
        )} 100%)`,
        boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(49, 130, 206, 0.3)',
          transform: 'translateY(-1px)',
        },
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: NEUTRAL_COLORS.border,
        color: NEUTRAL_COLORS.textPrimary,
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        },
      }),
    }}
  >
    {children}
  </Button>
);

export const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCompanyQuestions, setSelectedCompanyQuestions] = useState<Question[]>([]);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await companyService.getCompaniesWithQuestions(page, ITEMS_PER_PAGE);
      setCompanies(data.items);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const loadCompanyQuestions = useCallback(async (companyId: string) => {
    try {
      setQuestionsLoading(true);
      const data = await companyService.getCompanyQuestions(companyId);
      setSelectedCompanyQuestions(data.items);
    } catch (err) {
      console.error('Failed to load company questions:', err);
      setError('Failed to load company questions.');
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        slug: company.slug,
        description: company.description || '',
        logo_url: company.logo_url || '',
        is_active: company.is_active,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo_url: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      setError(null);
      if (editingCompany) {
        const updateData: CompanyUpdate = {};
        if (formData.name !== editingCompany.name) updateData.name = formData.name;
        if (formData.slug !== editingCompany.slug) updateData.slug = formData.slug;
        if (formData.description !== editingCompany.description)
          updateData.description = formData.description;
        if (formData.logo_url !== editingCompany.logo_url)
          updateData.logo_url = formData.logo_url;
        if (formData.is_active !== editingCompany.is_active)
          updateData.is_active = formData.is_active;

        await companyService.updateCompany(editingCompany.id, updateData);
        setSuccess('Company updated successfully');
      } else {
        const createData: CompanyCreate = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          logo_url: formData.logo_url || undefined,
        };
        await companyService.createCompany(createData);
        setSuccess('Company created successfully');
      }

      handleCloseDialog();
      loadCompanies();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save company');
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      setError(null);
      await companyService.deleteCompany(companyId);
      setSuccess('Company deleted successfully');
      loadCompanies();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete company');
    }
  };

  const handleShowQuestions = (company: Company) => {
    setSelectedCompany(company);
    setShowQuestionsDialog(true);
    loadCompanyQuestions(company.id);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Search companies..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: NEUTRAL_COLORS.textSecondary }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        <StyledButton startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Company
        </StyledButton>
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.05) }}>
              <TableCell sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary }}>
                Slug
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary }}>
                Questions
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: NEUTRAL_COLORS.textPrimary }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow
                key={company.id}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
                  },
                }}
              >
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.slug}</TableCell>
                <TableCell>
                  <Chip
                    label={company.questions_count || 0}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={company.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={company.is_active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Questions">
                      <IconButton
                        size="small"
                        onClick={() => handleShowQuestions(company)}
                        sx={{
                          color: NEUTRAL_COLORS.info,
                          '&:hover': {
                            backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                          },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(company)}
                        sx={{
                          color: NEUTRAL_COLORS.accent,
                          '&:hover': {
                            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(company.id)}
                        sx={{
                          color: NEUTRAL_COLORS.error,
                          '&:hover': {
                            backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {total > ITEMS_PER_PAGE && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(total / ITEMS_PER_PAGE)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Create New Company'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Company Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g., Google"
            />
            <TextField
              fullWidth
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleFormChange}
              placeholder="e.g., google"
              helperText="Alphanumeric with dashes/underscores only"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Company description"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Logo URL"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleFormChange}
              placeholder="https://example.com/logo.png"
            />
            <Box sx={{ 
              p: 2,
              borderRadius: 2,
              border: `1px solid ${NEUTRAL_COLORS.border}`,
              backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="success"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ 
                      fontWeight: 600,
                      color: formData.is_active ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.textSecondary
                    }}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                  </Stack>
                }
              />
              <Typography variant="caption" sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                ml: 7,
                display: 'block',
                mt: 0.5
              }}>
                {formData.is_active 
                  ? 'This company is visible to users' 
                  : 'This company is hidden from users'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <StyledButton onClick={handleSave}>
            {editingCompany ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog open={showQuestionsDialog} onClose={() => setShowQuestionsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Questions for {selectedCompany?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {questionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedCompanyQuestions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.05) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Published</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCompanyQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={question.difficulty}
                          size="small"
                          color={
                            question.difficulty === 'easy'
                              ? 'success'
                              : question.difficulty === 'medium'
                                ? 'warning'
                                : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={question.is_published ? 'Yes' : 'No'}
                          size="small"
                          color={question.is_published ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="textSecondary" sx={{ py: 2 }}>
              No questions for this company yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
