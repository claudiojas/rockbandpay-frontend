import { createContext, useContext, useState, ReactNode } from 'react';
import { useTables } from '@/hooks/useTables';
import type { ITable } from '@/types';

interface TableContextType {
  tables: ITable[] | undefined;
  isLoadingTables: boolean;
  tableId: string;
  setTableId: (id: string) => void;
  selectedTable: ITable | undefined;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: ReactNode }) {
  const { data: tables, isLoading: isLoadingTables } = useTables();
  const [tableId, setTableId] = useState('');

  const selectedTable = tables?.find(t => t.id === tableId);

  const value = {
    tables,
    isLoadingTables,
    tableId,
    setTableId,
    selectedTable,
  };

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTableContext() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
}
