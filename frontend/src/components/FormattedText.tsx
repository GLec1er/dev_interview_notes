import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';

interface FormattedTextProps {
  text: string;
  variant?: 'body1' | 'body2' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  component?: React.ElementType;
  sx?: any;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  variant = 'body1',
  component = 'span',
  sx = {}
}) => {
  // Функция для парсинга и форматирования текста
  const formatText = (input: string) => {
    if (!input) return input;

    // Экранированные символы временно заменяем на плейсхолдеры
    const escaped: Record<string, string> = {};
    let escapedCount = 0;
    
    // Заменяем экранированные символы на временные маркеры
    let processedInput = input.replace(/\\([*_`\-])/g, (match, char) => {
      const placeholder = `__ESCAPED_${escapedCount++}__`;
      escaped[placeholder] = char;
      return placeholder;
    });

    // Функция для восстановления экранированных символов
    const unescape = (str: string) => {
      return str.replace(/__ESCAPED_(\d+)__/g, (match, index) => {
        return escaped[match] || match;
      });
    };

    // Функция для проверки, является ли подчеркивание частью слова
    const isPartOfWord = (text: string, position: number): boolean => {
      const before = position > 0 ? text[position - 1] : '';
      const after = position < text.length - 1 ? text[position + 1] : '';
      
      const isBeforeLetter = /[a-zA-Z0-9_]/.test(before);
      const isAfterLetter = /[a-zA-Z0-9_]/.test(after);
      
      return isBeforeLetter && isAfterLetter;
    };

    // Функция для парсинга маркированного списка
    const parseList = (text: string): React.ReactNode => {
      const lines = text.split('\n');
      const elements: React.ReactNode[] = [];
      let currentList: string[] = [];
      let inList = false;

      lines.forEach((line, lineIndex) => {
        // Проверяем, является ли строка элементом списка
        const listMatch = line.match(/^[\s]*[-*+][\s]+(.*)$/);
        
        if (listMatch) {
          if (!inList) {
            inList = true;
          }
          currentList.push(listMatch[1]);
        } else {
          if (inList) {
            // Завершаем текущий список
            elements.push(
              <List key={`list-${lineIndex}`} sx={{ listStyleType: 'disc', pl: 4, mb: 2 }}>
                {currentList.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
                    <ListItemText primary={parseInlineFormatting(item)} />
                  </ListItem>
                ))}
              </List>
            );
            currentList = [];
            inList = false;
          }
          
          // Обрабатываем обычную строку (может содержать переносы)
          if (line.trim() !== '') {
            elements.push(
              <Box key={`line-${lineIndex}`} sx={{ mb: 1 }}>
                {parseInlineFormatting(line)}
              </Box>
            );
          } else {
            // Пустая строка - добавляем отступ
            elements.push(<Box key={`empty-${lineIndex}`} sx={{ height: '1em' }} />);
          }
        }
      });

      // Если список был в конце
      if (inList && currentList.length > 0) {
        elements.push(
          <List key="list-end" sx={{ listStyleType: 'disc', pl: 4, mb: 2 }}>
            {currentList.map((item, itemIndex) => (
              <ListItem key={itemIndex} sx={{ display: 'list-item', pl: 0, py: 0.5 }}>
                <ListItemText primary={parseInlineFormatting(item)} />
              </ListItem>
            ))}
          </List>
        );
      }

      return elements.length === 1 ? elements[0] : <>{elements}</>;
    };

    // Функция для парсинга инлайн-форматирования (жирный, курсив, код)
    const parseInlineFormatting = (text: string): React.ReactNode => {
      const elements: React.ReactNode[] = [];
      let remaining = text;
      let index = 0;

      while (remaining.length > 0) {
        // Пропускаем HTML-сущности
        if (remaining.startsWith('&') && remaining.includes(';')) {
          const entityEnd = remaining.indexOf(';') + 1;
          elements.push(
            <span key={`entity-${index++}`}>
              {remaining.substring(0, entityEnd)}
            </span>
          );
          remaining = remaining.substring(entityEnd);
          continue;
        }

        // Инлайн-код имеет наивысший приоритет
        if (remaining.startsWith('`')) {
          const codeMatch = remaining.match(/^`([^`]+)`/);
          if (codeMatch) {
            elements.push(
              <Box
                key={`code-${index++}`}
                component="code"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontFamily: '"Fira Code", "Cascadia Code", monospace',
                  fontSize: '0.9em',
                  color: '#d14',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                {unescape(codeMatch[1])}
              </Box>
            );
            remaining = remaining.substring(codeMatch[0].length);
            continue;
          }
        }
        
        // Жирный текст (**text**)
        if (remaining.startsWith('**')) {
          if (remaining.length > 2) {
            const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
            if (boldMatch) {
              elements.push(
                <strong key={`bold-${index++}`}>
                  {parseInlineFormatting(unescape(boldMatch[1]))}
                </strong>
              );
              remaining = remaining.substring(boldMatch[0].length);
              continue;
            }
          }
        }
        
        // Курсив (*text*)
        if (remaining.startsWith('*') && !remaining.startsWith('**')) {
          if (!isPartOfWord(remaining, 0)) {
            const italicMatch = remaining.match(/^\*([^*]+)\*/);
            if (italicMatch) {
              elements.push(
                <em key={`italic-${index++}`}>
                  {parseInlineFormatting(unescape(italicMatch[1]))}
                </em>
              );
              remaining = remaining.substring(italicMatch[0].length);
              continue;
            }
          }
        }
        
        // Курсив (_text_)
        if (remaining.startsWith('_') && !remaining.startsWith('__')) {
          if (!isPartOfWord(remaining, 0)) {
            const italicMatch2 = remaining.match(/^_([^_]+)_/);
            if (italicMatch2) {
              elements.push(
                <em key={`italic2-${index++}`}>
                  {parseInlineFormatting(unescape(italicMatch2[1]))}
                </em>
              );
              remaining = remaining.substring(italicMatch2[0].length);
              continue;
            }
          }
        }
        
        // Жирный текст (__text__)
        if (remaining.startsWith('__')) {
          if (!isPartOfWord(remaining, 0) && !isPartOfWord(remaining, 1)) {
            const boldMatch2 = remaining.match(/^__([^_]+)__/);
            if (boldMatch2) {
              elements.push(
                <strong key={`bold2-${index++}`}>
                  {parseInlineFormatting(unescape(boldMatch2[1]))}
                </strong>
              );
              remaining = remaining.substring(boldMatch2[0].length);
              continue;
            }
          }
        }

        // Если ни одно форматирование не подошло, добавляем обычный текст
        const nextMarker = remaining.search(/[*_`]/);
        
        if (nextMarker === 0) {
          elements.push(
            <span key={`char-${index++}`}>
              {remaining[0]}
            </span>
          );
          remaining = remaining.substring(1);
        } else if (nextMarker > 0) {
          elements.push(
            <span key={`text-${index++}`}>
              {unescape(remaining.substring(0, nextMarker))}
            </span>
          );
          remaining = remaining.substring(nextMarker);
        } else {
          if (remaining) {
            elements.push(
              <span key={`text-end-${index++}`}>
                {unescape(remaining)}
              </span>
            );
          }
          remaining = '';
        }
      }

      return elements.length === 1 ? elements[0] : <>{elements}</>;
    };

    // Основной парсинг - сначала разбиваем на список и обычный текст
    return parseList(processedInput);
  };

  return (
    <Typography variant={variant} component={component} sx={{ whiteSpace: 'pre-wrap', ...sx }}>
      {formatText(text)}
    </Typography>
  );
};