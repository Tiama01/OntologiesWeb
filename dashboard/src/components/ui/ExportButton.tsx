import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, FileImage, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: 'ethnies' | 'langues' | 'regions' | 'patronymes' | 'dialectes';
  title: string;
  className?: string;
}

export default function ExportButton({ data, filename, type, title, className = '' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!data || data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    setIsExporting(true);
    setIsOpen(false);

    try {
      const formattedData = formatDataForExport(data, type);
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}_${timestamp}`;

      switch (format) {
        case 'csv':
          exportToCSV(formattedData, fullFilename);
          break;
        case 'excel':
          exportToExcel(formattedData, fullFilename, title);
          break;
        case 'pdf':
          exportToPDF(formattedData, fullFilename, title);
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      format: 'csv' as const,
      label: 'CSV',
      icon: <FileText className="h-4 w-4" />,
      description: 'Format tableur standard'
    },
    {
      format: 'excel' as const,
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      description: 'Classeur Microsoft Excel'
    },
    {
      format: 'pdf' as const,
      label: 'PDF',
      icon: <FileImage className="h-4 w-4" />,
      description: 'Document portable'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting || !data?.length}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          isExporting 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <Download className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">
          {isExporting ? 'Export...' : 'Exporter'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                Format d'export
              </div>
              {exportOptions.map(option => (
                <motion.button
                  key={option.format}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => handleExport(option.format)}
                  className="w-full flex items-center space-x-3 px-3 py-2 mt-1 text-left rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <div className="text-blue-600 dark:text-blue-400">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
              {data?.length || 0} éléments à exporter
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
