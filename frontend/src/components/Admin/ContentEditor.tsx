import React, { useState } from 'react';
import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Typography,
  Button,
  alpha,
  Tooltip,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Code as CodeIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Title as TitleIcon,
} from '@mui/icons-material';
import type { ContentBlock, ContentType, ProgrammingLanguage } from '../../types';

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

interface ContentEditorProps {
  content: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  maxHeight?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  maxHeight = '500px'
}) => {
  const addBlock = (type: ContentType) => {
    const newBlock: ContentBlock = {
      type,
      data: type === 'code' ? { language: 'python', code: '' } : {},
      order: content.length,
    };
    onChange([...content, newBlock]);
  };

  const updateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newContent = [...content];
    const block = newContent[index];
    
    // Создаем глубокую копию блока
    const updatedBlock = JSON.parse(JSON.stringify(block));
    
    // Обновляем блок
    if (updates.data) {
      // Сохраняем существующие поля data и добавляем/обновляем новые
      updatedBlock.data = {
        ...(updatedBlock.data || {}),
        ...updates.data
      };
    }
    
    // Обновляем другие поля блока
    Object.keys(updates).forEach(key => {
      if (key !== 'data') {
        (updatedBlock as any)[key] = (updates as any)[key];
      }
    });
    
    newContent[index] = updatedBlock;
    onChange(newContent);
  };

  const removeBlock = (index: number) => {
    const newContent = content.filter((_, i) => i !== index);
    // Обновляем порядок
    newContent.forEach((block, i) => {
      block.order = i;
    });
    onChange(newContent);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newContent = [...content];
    const [movedBlock] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, movedBlock);
    // Обновляем порядок
    newContent.forEach((block, i) => {
      block.order = i;
    });
    onChange(newContent);
  };

  const getBlockIcon = (type: ContentType) => {
    switch (type) {
      case 'heading': return <TitleIcon />;
      case 'paragraph': return <TextIcon />;
      case 'code': return <CodeIcon />;
      case 'info': return <InfoIcon />;
      case 'warning': return <WarningIcon />;
      case 'image': return <ImageIcon />;
      default: return null;
    }
  };

  const getBlockColor = (type: ContentType) => {
    switch (type) {
      case 'heading': return NEUTRAL_COLORS.primary;
      case 'paragraph': return NEUTRAL_COLORS.secondary;
      case 'code': return '#DD4B39';
      case 'info': return NEUTRAL_COLORS.info;
      case 'warning': return NEUTRAL_COLORS.warning;
      case 'image': return '#9C27B0';
      default: return NEUTRAL_COLORS.textSecondary;
    }
  };

  const handleCodeLanguageChange = (index: number, language: ProgrammingLanguage) => {
    const block = content[index];
    updateBlock(index, {
      data: {
        ...(block.data || {}),
        language: language,
        // Сохраняем существующий код
        code: block.data?.code || ''
      }
    });
  };

  const handleCodeChange = (index: number, code: string) => {
    const block = content[index];
    updateBlock(index, {
      data: {
        ...(block.data || {}),
        code: code,
        // Сохраняем существующий язык
        language: block.data?.language || 'python'
      }
    });
  };

  const handleTextChange = (index: number, text: string, field: 'text' | 'content' = 'text') => {
    const block = content[index];
    updateBlock(index, {
      data: {
        ...(block.data || {}),
        [field]: text
      }
    });
  };

  const handleImageChange = (index: number, field: 'url' | 'alt', value: string) => {
    const block = content[index];
    updateBlock(index, {
      data: {
        ...(block.data || {}),
        [field]: value
      }
    });
  };

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    const commonProps = {
      fullWidth: true,
      size: 'small' as const,
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
          '&:hover fieldset': {
            borderColor: NEUTRAL_COLORS.accent,
          }
        }
      }
    };

    switch (block.type) {
      case 'heading':
        return (
          <TextField
            {...commonProps}
            label="Heading Text"
            value={block.data?.text || ''}
            onChange={(e) => handleTextChange(index, e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon sx={{ color: getBlockColor(block.type) }} />
                </InputAdornment>
              ),
            }}
          />
        );
      case 'paragraph':
        return (
          <TextField
            {...commonProps}
            label="Paragraph Text"
            value={block.data?.text || ''}
            onChange={(e) => handleTextChange(index, e.target.value)}
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TextIcon sx={{ color: getBlockColor(block.type) }} />
                </InputAdornment>
              ),
            }}
          />
        );
      case 'code':
        return (
          <Stack spacing={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Programming Language</InputLabel>
              <Select
                value={block.data?.language || 'python'}
                label="Programming Language"
                onChange={(e) => handleCodeLanguageChange(index, e.target.value as ProgrammingLanguage)}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }
                }}
              >
                <MenuItem value="python">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  Python
                </MenuItem>
                <MenuItem value="sql">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  SQL
                </MenuItem>
                <MenuItem value="bash">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  Bash
                </MenuItem>
                <MenuItem value="javascript">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  JavaScript
                </MenuItem>
                <MenuItem value="typescript">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  TypeScript
                </MenuItem>
                <MenuItem value="html">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  HTML
                </MenuItem>
                <MenuItem value="css">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  CSS
                </MenuItem>
                <MenuItem value="json">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  JSON
                </MenuItem>
                <MenuItem value="yaml">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  YAML
                </MenuItem>
                <MenuItem value="markdown">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  Markdown
                </MenuItem>
                <MenuItem value="text">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  Plain Text
                </MenuItem>
                <MenuItem value="other">
                  <CodeIcon sx={{ mr: 1, fontSize: 16 }} />
                  Other
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              {...commonProps}
              label="Code"
              value={block.data?.code || ''}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              multiline
              rows={6}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CodeIcon sx={{ color: getBlockColor(block.type) }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"Roboto Mono", "Courier New", monospace',
                  fontSize: '0.875rem',
                }
              }}
            />
            <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
              {block.data?.code?.split('\n').length || 0} lines
            </Typography>
          </Stack>
        );
      case 'info':
      case 'warning':
        return (
          <TextField
            {...commonProps}
            label={`${block.type.charAt(0).toUpperCase() + block.type.slice(1)} Content`}
            value={block.data?.text || ''}
            onChange={(e) => handleTextChange(index, e.target.value)}
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {block.type === 'info' ? (
                    <InfoIcon sx={{ color: getBlockColor(block.type) }} />
                  ) : (
                    <WarningIcon sx={{ color: getBlockColor(block.type) }} />
                  )}
                </InputAdornment>
              ),
            }}
          />
        );
      case 'image':
        return (
          <Stack spacing={1}>
            <TextField
              {...commonProps}
              label="Image URL"
              value={block.data?.url || ''}
              onChange={(e) => handleImageChange(index, 'url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon sx={{ color: getBlockColor(block.type) }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              {...commonProps}
              label="Alt Text (description)"
              value={block.data?.alt || ''}
              onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
              placeholder="Description of the image"
            />
            {block.data?.url && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <img
                  src={block.data.url}
                  alt={block.data.alt || 'Preview'}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 8,
                    border: `1px solid ${NEUTRAL_COLORS.border}`,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.textSecondary, mt: 0.5 }}>
                  Image preview
                </Typography>
              </Box>
            )}
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Кнопки добавления блоков */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 2, 
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          borderRadius: 2,
          backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, color: NEUTRAL_COLORS.textSecondary, fontWeight: 600 }}>
            Добавить блок содержимого
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Tooltip title="Heading (H1-H6)">
              <Button
                variant="outlined"
                startIcon={<TitleIcon />}
                onClick={() => addBlock('heading')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('heading'),
                    backgroundColor: alpha(getBlockColor('heading'), 0.04),
                  }
                }}
              >
                Heading
              </Button>
            </Tooltip>
            <Tooltip title="Text Paragraph">
              <Button
                variant="outlined"
                startIcon={<TextIcon />}
                onClick={() => addBlock('paragraph')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('paragraph'),
                    backgroundColor: alpha(getBlockColor('paragraph'), 0.04),
                  }
                }}
              >
                Text
              </Button>
            </Tooltip>
            <Tooltip title="Code Block">
              <Button
                variant="outlined"
                startIcon={<CodeIcon />}
                onClick={() => addBlock('code')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('code'),
                    backgroundColor: alpha(getBlockColor('code'), 0.04),
                  }
                }}
              >
                Code
              </Button>
            </Tooltip>
            <Tooltip title="Information Box">
              <Button
                variant="outlined"
                startIcon={<InfoIcon />}
                onClick={() => addBlock('info')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('info'),
                    backgroundColor: alpha(getBlockColor('info'), 0.04),
                  }
                }}
              >
                Info
              </Button>
            </Tooltip>
            <Tooltip title="Warning Box">
              <Button
                variant="outlined"
                startIcon={<WarningIcon />}
                onClick={() => addBlock('warning')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('warning'),
                    backgroundColor: alpha(getBlockColor('warning'), 0.04),
                  }
                }}
              >
                Warning
              </Button>
            </Tooltip>
            <Tooltip title="Image">
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => addBlock('image')}
                size="small"
                sx={{
                  borderColor: NEUTRAL_COLORS.border,
                  '&:hover': {
                    borderColor: getBlockColor('image'),
                    backgroundColor: alpha(getBlockColor('image'), 0.04),
                  }
                }}
              >
                Image
              </Button>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>

      {/* Список блоков */}
      <Box sx={{ maxHeight, overflow: 'auto', pr: 1 }}>
        {content.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            border: `2px dashed ${NEUTRAL_COLORS.border}`,
            borderRadius: 2,
            backgroundColor: alpha(NEUTRAL_COLORS.background, 0.3),
          }}>
            <Typography variant="body1" sx={{ color: NEUTRAL_COLORS.textSecondary, mb: 2 }}>
              Пока нет блоков контента
            </Typography>
            <Typography variant="body2" sx={{ color: NEUTRAL_COLORS.textSecondary }}>
              Используйте кнопки выше, чтобы добавить свой первый блок контента
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {content.map((block, index) => (
              <Card 
                key={index}
                elevation={0}
                sx={{ 
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  borderRadius: 2,
                  backgroundColor: NEUTRAL_COLORS.surface,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: getBlockColor(block.type),
                    boxShadow: `0 4px 12px ${alpha(getBlockColor(block.type), 0.1)}`,
                  }
                }}
              >
                <CardContent>
                  {/* Заголовок блока */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <DragIcon 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary, 
                        cursor: 'grab',
                        '&:active': {
                          cursor: 'grabbing',
                        }
                      }} 
                      className="drag-handle"
                    />
                    <Chip
                      icon={getBlockIcon(block.type)}
                      label={block.type}
                      size="small"
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        backgroundColor: alpha(getBlockColor(block.type), 0.1),
                        color: getBlockColor(block.type),
                        border: `1px solid ${alpha(getBlockColor(block.type), 0.3)}`,
                      }}
                    />
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        color: NEUTRAL_COLORS.textSecondary,
                      }}
                    />
                    {block.type === 'code' && block.data?.language && (
                      <Chip
                        label={block.data.language}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                          color: NEUTRAL_COLORS.accent,
                          textTransform: 'capitalize',
                        }}
                      />
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Stack direction="row" spacing={0.5}>
                      {index > 0 && (
                        <Tooltip title="Move up">
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, index - 1)}
                            sx={{
                              color: NEUTRAL_COLORS.textSecondary,
                              '&:hover': {
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                                color: NEUTRAL_COLORS.accent,
                              }
                            }}
                          >
                            ↑
                          </IconButton>
                        </Tooltip>
                      )}
                      {index < content.length - 1 && (
                        <Tooltip title="Move down">
                          <IconButton
                            size="small"
                            onClick={() => moveBlock(index, index + 1)}
                            sx={{
                              color: NEUTRAL_COLORS.textSecondary,
                              '&:hover': {
                                backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                                color: NEUTRAL_COLORS.accent,
                              }
                            }}
                          >
                            ↓
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Remove block">
                        <IconButton
                          size="small"
                          onClick={() => {
                              removeBlock(index);
                          }}
                          sx={{
                            color: NEUTRAL_COLORS.error,
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* Редактор блока */}
                  {renderBlockEditor(block, index)}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Статистика */}
      {content.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${NEUTRAL_COLORS.border}` }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="caption" sx={{ color: NEUTRAL_COLORS.surface }}>
              Всего блоков: <strong>{content.length}</strong>
            </Typography>
            <Stack direction="row" spacing={1}>
              {Array.from(new Set(content.map(b => b.type))).map(type => (
                <Chip
                  key={type}
                  label={`${type}: ${content.filter(b => b.type === type).length}`}
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    backgroundColor: alpha(getBlockColor(type), 0.1),
                    color: getBlockColor(type),
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};