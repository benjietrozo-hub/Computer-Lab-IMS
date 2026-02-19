// Task 10: Frontend Trash View Component
// Main component for viewing and managing trash/recycle bin

import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Search, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import NavHeader from '@/components/NavHeader';
import NotificationProfile from '@/components/NotificationProfile';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import trashService, { TrashItem, TrashFilters } from '@/lib/trashService';

export default function TrashView() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'bulk'>('single');
  const [restoreTarget, setRestoreTarget] = useState<'single' | 'bulk'>('single');
  const [singleDeleteItem, setSingleDeleteItem] = useState<TrashItem | null>(null);
  const [singleRestoreItem, setSingleRestoreItem] = useState<TrashItem | null>(null);

  // Filters
  const [filters, setFilters] = useState<TrashFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // User and notifications
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  
  const { notifications, unreadCount, markAllAsRead, loadMoreNotifications, hasMoreNotifications, totalNotifications, removeNotification, clearAllNotifications } = useWebSocket(
    currentUser?.id || "",
    currentUser?.role || ""
  );

  useEffect(() => {
    loadTrashItems();
  }, [page, filters]);

  const loadTrashItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trashService.fetchTrashItems(page, 50, filters);
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load trash items');
      toast.error('Failed to load trash items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map(item => item.entity_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedIds(newSelected);
  };

  const handleRestore = (item: TrashItem) => {
    setSingleRestoreItem(item);
    setRestoreTarget('single');
    setShowRestoreDialog(true);
  };

  const handleRestoreBulk = () => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    setRestoreTarget('bulk');
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    try {
      if (restoreTarget === 'single' && singleRestoreItem) {
        const result = await trashService.restoreItem(
          singleRestoreItem.entity_type,
          singleRestoreItem.entity_id
        );
        
        if (result.success) {
          toast.success(`Restored to ${singleRestoreItem.original_module}`);
        } else {
          toast.error(result.error || 'Failed to restore item');
        }
      } else if (restoreTarget === 'bulk') {
        const itemsToRestore = items
          .filter(item => selectedIds.has(item.entity_id))
          .map(item => ({
            entity_type: item.entity_type,
            entity_id: item.entity_id,
          }));

        const result = await trashService.restoreBulk(itemsToRestore);

        if (result.succeeded.length > 0) {
          toast.success(`Restored ${result.succeeded.length} item(s)`);
        }

        if (result.failed.length > 0) {
          toast.error(`Failed to restore ${result.failed.length} item(s)`);
        }
      }

      loadTrashItems();
      setSelectedIds(new Set());
      setShowRestoreDialog(false);
      setSingleRestoreItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore items');
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    setSingleDeleteItem(item);
    setDeleteTarget('single');
    setShowDeleteDialog(true);
  };

  const handlePermanentDeleteBulk = () => {
    if (selectedIds.size === 0) {
      toast.error('No items selected');
      return;
    }

    setDeleteTarget('bulk');
    setShowDeleteDialog(true);
  };

  const confirmPermanentDelete = async () => {
    try {
      if (deleteTarget === 'single' && singleDeleteItem) {
        const result = await trashService.permanentDelete(
          singleDeleteItem.entity_type,
          singleDeleteItem.entity_id
        );

        if (result.success) {
          toast.success('Item permanently deleted');
        } else {
          toast.error(result.error || 'Failed to delete item');
        }
      } else if (deleteTarget === 'bulk') {
        const itemsToDelete = items
          .filter(item => selectedIds.has(item.entity_id))
          .map(item => ({
            entity_type: item.entity_type,
            entity_id: item.entity_id,
          }));

        const result = await trashService.permanentDeleteBulk(itemsToDelete);

        if (result.succeeded.length > 0) {
          toast.success(`Permanently deleted ${result.succeeded.length} item(s)`);
        }

        if (result.failed.length > 0) {
          toast.error(`Failed to delete ${result.failed.length} item(s)`);
        }
      }

      loadTrashItems();
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
      setSingleDeleteItem(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete items');
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery });
    setPage(1);
  };

  const handleFilterChange = (key: keyof TrashFilters, value: string) => {
    setFilters({ ...filters, [key]: value || undefined });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (items.length === 0) {
      toast.error('No items to download');
      return;
    }

    const headers = ['Type', 'Name', 'Original Module', 'Deleted By', 'Deleted At'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.entity_type,
        `"${item.entity_name}"`,
        item.original_module,
        item.deleted_by_user?.username || 'Unknown',
        formatDate(item.deleted_at)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trash-items-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEntityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      inventory: 'bg-blue-500',
      user: 'bg-green-500',
      reservation: 'bg-purple-500',
      borrow_request: 'bg-yellow-500',
      incident_report: 'bg-red-500',
      lost_found: 'bg-orange-500',
      visitor_log: 'bg-gray-500',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-500'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader 
        title="Trash / Recycle Bin" 
        subtitle="Manage deleted items - restore or permanently delete"
        showBackButton={true}
        showHomeButton={true}
      >
        <NotificationProfile 
          notifications={notifications}
          unreadCount={unreadCount}
          currentUser={currentUser}
          markAllAsRead={markAllAsRead}
          loadMoreNotifications={loadMoreNotifications}
          hasMoreNotifications={hasMoreNotifications}
          totalNotifications={totalNotifications}
          removeNotification={removeNotification}
          clearAllNotifications={clearAllNotifications}
        />
      </NavHeader>

      <div className="container mx-auto p-6">
        {/* Filters Section */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-type">Filter by Type</Label>
              <Select
                value={filters.entity_type || 'all'}
                onValueChange={(value) => handleFilterChange('entity_type', value === 'all' ? '' : value)}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="reservation">Reservations</SelectItem>
                  <SelectItem value="borrow_request">Borrow Requests</SelectItem>
                  <SelectItem value="borrow_item">Borrow Items</SelectItem>
                  <SelectItem value="repair_maintenance">Repair & Maintenance</SelectItem>
                  <SelectItem value="incident_report">Incident Reports</SelectItem>
                  <SelectItem value="lost_found">Lost & Found</SelectItem>
                  <SelectItem value="visitor_log">Visitor Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleSearch}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isLoading || items.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={isLoading || items.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
          <Button onClick={loadTrashItems} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">{/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex gap-2 mb-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedIds.size} item(s) selected
              </span>
              <Button onClick={handleRestoreBulk} size="sm" variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Restore Selected
              </Button>
              <Button
                onClick={handlePermanentDeleteBulk}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Permanently Delete Selected
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading trash items...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && (
            <div className="text-center py-8">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Trash is empty</p>
            </div>
          )}

          {/* Items Table */}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === items.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Original Module</TableHead>
                    <TableHead>Deleted By</TableHead>
                    <TableHead>Deleted At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.entity_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(item.entity_id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(item.entity_id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>{getEntityTypeBadge(item.entity_type)}</TableCell>
                      <TableCell className="font-medium">{item.entity_name}</TableCell>
                      <TableCell>{item.original_module}</TableCell>
                      <TableCell>
                        {item.deleted_by_user?.username || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatDate(item.deleted_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleRestore(item)}
                            size="sm"
                            variant="outline"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            onClick={() => handlePermanentDelete(item)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {items.length} of {total} items
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              Restore Items?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {restoreTarget === 'single' && singleRestoreItem ? (
                <>
                  Are you sure you want to restore <strong>{singleRestoreItem.entity_name}</strong>?
                  <br />
                  This item will be moved back to <strong>{singleRestoreItem.original_module}</strong>.
                </>
              ) : (
                <>
                  Are you sure you want to restore <strong>{selectedIds.size} item(s)</strong>?
                  <br />
                  These items will be moved back to their original modules.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRestore}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Permanently Delete Items?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {deleteTarget === 'single' ? 'this item' : `${selectedIds.size} item(s)`}{' '}
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPermanentDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
