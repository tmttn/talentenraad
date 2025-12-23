'use client';

import {useState, useEffect} from 'react';
import {
  Database,
  Download,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileJson,
  Newspaper,
  Calendar,
  Megaphone,
  Users,
  Mail,
  History,
  Bell,
  Send,
  Building2,
} from 'lucide-react';
import {toast} from 'sonner';
import {
  type ContentType, type ImportValidationResult, type ImportResult, contentTypeInfo,
} from '@lib/data-export';

type ContentTypeCount = {
  type: ContentType;
  count: number;
  loading: boolean;
};

const iconMap: Record<ContentType, React.ReactNode> = {
  nieuws: <Newspaper className='w-5 h-5' />,
  activiteit: <Calendar className='w-5 h-5' />,
  aankondiging: <Megaphone className='w-5 h-5' />,
  sponsor: <Building2 className='w-5 h-5' />,
  users: <Users className='w-5 h-5' />,
  submissions: <Mail className='w-5 h-5' />,
  auditLogs: <History className='w-5 h-5' />,
  pushSubscriptions: <Bell className='w-5 h-5' />,
  notificationHistory: <Send className='w-5 h-5' />,
};

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedTypes, setSelectedTypes] = useState<Set<ContentType>>(new Set());
  const [includeArchived, setIncludeArchived] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [counts, setCounts] = useState<ContentTypeCount[]>([]);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<unknown>(null);
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'overwrite'>('skip');

  // Fetch item counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      const initialCounts: ContentTypeCount[] = contentTypeInfo.map(info => ({
        type: info.key,
        count: 0,
        loading: true,
      }));
      setCounts(initialCounts);

      // Fetch Builder.io content counts
      const builderTypes: ContentType[] = ['nieuws', 'activiteit', 'aankondiging'];
      for (const type of builderTypes) {
        try {
          const response = await fetch(`/api/admin/content/${type}`, {credentials: 'include'});
          if (response.ok) {
            const data = await response.json() as {items: unknown[]};
            setCounts(previous => previous.map(c =>
              c.type === type ? {...c, count: data.items?.length ?? 0, loading: false} : c));
          }
        } catch {
          setCounts(previous => previous.map(c =>
            c.type === type ? {...c, loading: false} : c));
        }
      }

      // Fetch database content counts (simplified - would need dedicated endpoints)
      // For now, we'll just mark them as loaded
      const databaseTypes: ContentType[] = ['users', 'submissions', 'auditLogs', 'pushSubscriptions', 'notificationHistory'];
      for (const type of databaseTypes) {
        setCounts(previous => previous.map(c =>
          c.type === type ? {...c, count: -1, loading: false} : c, // -1 indicates "unknown"
        ));
      }
    };

    void fetchCounts();
  }, []);

  const toggleType = (type: ContentType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }

    setSelectedTypes(newSelected);
  };

  const selectAll = () => {
    setSelectedTypes(new Set(contentTypeInfo.map(info => info.key)));
  };

  const selectNone = () => {
    setSelectedTypes(new Set());
  };

  const handleExport = async () => {
    if (selectedTypes.size === 0) {
      toast.error('Selecteer minimaal één type om te exporteren');
      return;
    }

    setExporting(true);
    try {
      const types = [...selectedTypes].join(',');
      const url = `/api/admin/data/export?types=${types}&includeArchived=${includeArchived}`;

      const response = await fetch(url, {credentials: 'include'});

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] ?? 'export.json';

      // Download the file
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success('Export succesvol gedownload');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export mislukt');
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportFile(file);
    setImportValidation(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setImportData(data);

      // Validate the import
      const response = await fetch('/api/admin/data/import', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data, preview: true}),
      });

      if (response.ok) {
        const validation = await response.json() as ImportValidationResult;
        setImportValidation(validation);
      } else {
        const error = await response.json() as {error: string};
        toast.error(error.error ?? 'Validatie mislukt');
      }
    } catch (error) {
      console.error('Failed to parse file:', error);
      toast.error('Ongeldig JSON bestand');
      setImportFile(null);
      setImportData(null);
    }
  };

  const handleImport = async () => {
    if (!importData) {
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/admin/data/import', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data: importData, conflictStrategy}),
      });

      const result = await response.json() as ImportResult;

      if (result.success) {
        toast.success(`${result.imported} items geïmporteerd${result.skipped > 0 ? `, ${result.skipped} overgeslagen` : ''}`);
        // Reset import state
        setImportFile(null);
        setImportData(null);
        setImportValidation(null);
      } else {
        toast.error(`Import mislukt: ${result.errors.length} fouten`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Import mislukt');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportData(null);
    setImportValidation(null);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-800 flex items-center gap-2'>
          <Database className='w-8 h-8 text-primary' />
          Data Beheer
        </h1>
        <p className='text-gray-500 mt-1'>
          Exporteer en importeer content via JSON bestanden
        </p>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-card shadow-base'>
        <div className='border-b border-gray-200'>
          <div className='flex'>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Download className='w-4 h-4' />
              Exporteren
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className='w-4 h-4' />
              Importeren
            </button>
          </div>
        </div>

        <div className='p-6'>
          {activeTab === 'export' ? (
            <div className='space-y-6'>
              {/* Selection controls */}
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  Selecteer de content types die je wilt exporteren:
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={selectAll}
                    className='text-sm text-primary hover:underline'
                  >
                    Alles selecteren
                  </button>
                  <span className='text-gray-300'>|</span>
                  <button
                    onClick={selectNone}
                    className='text-sm text-primary hover:underline'
                  >
                    Niets selecteren
                  </button>
                </div>
              </div>

              {/* Content type grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {contentTypeInfo.map(info => {
                  const countData = counts.find(c => c.type === info.key);
                  const isSelected = selectedTypes.has(info.key);

                  return (
                    <button
                      key={info.key}
                      onClick={() => toggleType(info.key)}
                      className={`p-4 rounded-card border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className={`p-2 rounded-button ${isSelected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                          {iconMap[info.key]}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className='w-4 h-4 text-white' />}
                        </div>
                      </div>
                      <p className='font-medium text-gray-800 mt-3'>{info.labelPlural}</p>
                      <p className='text-sm text-gray-500'>
                        {countData?.loading
                          ? (
                            <span className='inline-flex items-center gap-1'>
                              <Loader2 className='w-3 h-3 animate-spin' />
                              Laden...
                            </span>
                          )
                          : (countData?.count === -1
                            ? (
                              <span className='text-gray-400'>Beschikbaar</span>
                            )
                            : (
                              `${countData?.count ?? 0} items`
                            ))}
                      </p>
                      {!info.canImport && (
                        <span className='inline-block mt-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded'>
                          Alleen export
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Options */}
              <div className='border-t border-gray-100 pt-4'>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={includeArchived}
                    onChange={event => setIncludeArchived(event.target.checked)}
                    className='w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'
                  />
                  <span className='text-sm text-gray-700'>Inclusief gearchiveerde berichten</span>
                </label>
              </div>

              {/* Export button */}
              <div className='flex justify-end'>
                <button
                  onClick={() => void handleExport()}
                  disabled={selectedTypes.size === 0 || exporting}
                  className='flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {exporting
                    ? (
                      <>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Exporteren...
                      </>
                    )
                    : (
                      <>
                        <Download className='w-4 h-4' />
                        Exporteren ({selectedTypes.size} types)
                      </>
                    )}
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {importFile ? (
              /* Import preview */
                <div className='space-y-4'>
                  {/* File info */}
                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-card'>
                    <div className='flex items-center gap-3'>
                      <FileJson className='w-8 h-8 text-primary' />
                      <div>
                        <p className='font-medium text-gray-800'>{importFile.name}</p>
                        <p className='text-sm text-gray-500'>
                          {(importFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetImport}
                      className='text-sm text-gray-500 hover:text-gray-700'
                    >
                      Ander bestand kiezen
                    </button>
                  </div>

                  {/* Validation results */}
                  {importValidation && (
                    <div className={`p-4 rounded-card ${
                      importValidation.valid
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className='flex items-start gap-3'>
                        {importValidation.valid
                          ? (
                            <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
                          )
                          : (
                            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0' />
                          )}
                        <div className='flex-1'>
                          <p className={`font-medium ${importValidation.valid ? 'text-green-800' : 'text-red-800'}`}>
                            {importValidation.valid ? 'Bestand is geldig' : 'Validatie fouten gevonden'}
                          </p>

                          {importValidation.errors.length > 0 && (
                            <ul className='mt-2 text-sm text-red-700 list-disc list-inside'>
                              {importValidation.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          )}

                          <div className='mt-3 grid grid-cols-3 gap-4 text-sm'>
                            <div>
                              <p className='text-gray-500'>Totaal</p>
                              <p className='font-semibold text-gray-800'>{importValidation.summary.total}</p>
                            </div>
                            <div>
                              <p className='text-gray-500'>Nieuw</p>
                              <p className='font-semibold text-green-600'>{importValidation.summary.new}</p>
                            </div>
                            <div>
                              <p className='text-gray-500'>Bestaand</p>
                              <p className='font-semibold text-yellow-600'>{importValidation.summary.existing}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Conflict strategy */}
                  {importValidation && importValidation.summary.existing > 0 && (
                    <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-card'>
                      <p className='font-medium text-yellow-800 mb-3'>
                        {importValidation.summary.existing} bestaande items gevonden
                      </p>
                      <div className='space-y-2'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            name='conflictStrategy'
                            checked={conflictStrategy === 'skip'}
                            onChange={() => setConflictStrategy('skip')}
                            className='text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-gray-700'>
                            Overslaan - Bestaande items behouden
                          </span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='radio'
                            name='conflictStrategy'
                            checked={conflictStrategy === 'overwrite'}
                            onChange={() => setConflictStrategy('overwrite')}
                            className='text-primary focus:ring-primary'
                          />
                          <span className='text-sm text-gray-700'>
                            Overschrijven - Bestaande items vervangen
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Import button */}
                  <div className='flex justify-end gap-3'>
                    <button
                      onClick={resetImport}
                      disabled={importing}
                      className='px-4 py-2 text-gray-700 font-medium rounded-button border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50'
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={() => void handleImport()}
                      disabled={!importValidation?.valid || importing}
                      className='flex items-center gap-2 px-6 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {importing
                        ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Importeren...
                          </>
                        )
                        : (
                          <>
                            <Upload className='w-4 h-4' />
                            Importeren
                          </>
                        )}
                    </button>
                  </div>
                </div>
              ) : (
              /* File upload area */
                <div className='border-2 border-dashed border-gray-300 rounded-card p-12 text-center'>
                  <FileJson className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-600 mb-4'>
                    Sleep een JSON bestand hierheen of klik om te selecteren
                  </p>
                  <label className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors cursor-pointer'>
                    <Upload className='w-4 h-4' />
                    Kies bestand
                    <input
                      type='file'
                      accept='.json,application/json'
                      onChange={event => void handleFileSelect(event)}
                      className='hidden'
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className='bg-blue-50 border border-blue-200 rounded-card p-4'>
        <h3 className='font-medium text-blue-800 mb-2'>Over export/import</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Exports worden opgeslagen als JSON bestanden</li>
          <li>• Audit logs en notificatie historie kunnen alleen worden geexporteerd, niet geimporteerd</li>
          <li>• Bij het importeren van gebruikers worden geen wachtwoorden of Auth0 gegevens overgenomen</li>
          <li>• Alle import acties worden vastgelegd in de audit log</li>
        </ul>
      </div>
    </div>
  );
}
