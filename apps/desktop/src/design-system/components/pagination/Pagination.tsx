import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button } from '@/design-system/components/button';

const Pagination = ({ setPagination, pagination, pageSize }: PaginationProps) => {

  return <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  }}>
    <Button
      icon={<ChevronLeftIcon />}
      tooltip="Página anterior"
      onClick={() => setPagination(prev => ({
        ...prev,
        currentPage: Math.max(1, prev.currentPage - 1)
      }))}
      disabled={pagination.currentPage === 1} />
    <span>
      {pagination.currentPage}/{Math.ceil(pagination.totalRecords / pageSize)}
    </span>
    <Button
      icon={<ChevronRightIcon />}
      tooltip="Próxima página"
      onClick={() => setPagination(prev => ({
        ...prev,
        currentPage: Math.min(prev.currentPage + 1, Math.ceil(prev.totalRecords / pageSize))
      }))}
      disabled={pagination.currentPage >= Math.ceil(pagination.totalRecords / pageSize)} />
  </div>;
}

type PaginationProps = {
  setPagination: React.Dispatch<React.SetStateAction<{
    currentPage: number;
    totalRecords: number;
  }>>;
  pagination: {
    currentPage: number;
    totalRecords: number;
  };
  pageSize: number;
};

export default Pagination;