import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import Table, { type TableColumn } from '../components/ui/Table';
import DashboardLayout from '../components/DashboardLayout';
import CustomDropdown from '../components/ui/CustomDropdown';
import { type Admin as ApiAdmin, getAllAdmins } from '../api/admin';
import CreateAdminModal from '../components/CreateAdminModal';
import EditAdminModal from '../components/EditAdminModal';

// Use API Admin type
type Admin = ApiAdmin;

const roleOptions = ['All Roles', 'Admins'];

export default function AdminListDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilterDisplay, setRoleFilterDisplay] = useState('All Roles');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const response = await getAllAdmins();
    console.log("the admins are", response)

    if (response.success && response.data) {
      setAdmins(response.data.admins || []);
    } else {
      console.log(response.error)
      setError(response.error || 'Failed to fetch admins');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);
  
  console.log(admins)

  const handleAdminCreated = () => {
    fetchAdmins();
    setIsCreateModalOpen(false);
  };

  const handleAdminUpdated = () => {
    fetchAdmins();
    setIsEditModalOpen(false);
    setSelectedAdmin(null);
  };

  // Map display value to filter value
  const getRoleFilter = (display: string): 'all' | 'admin' | 'superadmin' => {
    if (display === 'Super Admins') return 'superadmin';
    if (display === 'Admins') return 'admin';
    return 'all';
  };

  const roleFilter = getRoleFilter(roleFilterDisplay);

  // Filter admins based on search and role filter
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone_number.includes(searchQuery);

    const matchesRole = roleFilter === 'all' || admin.role.toLowerCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const columns: TableColumn<Admin>[] = [
    {
      key: 'user_id' as keyof Admin,
      label: 'Name',
      sortable: true,
      render: (admin) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-pink-500" />
          </div>
          <span className="font-medium">{admin.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'phone_number',
      label: 'Phone',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (admin) => (
        <span
          className={`inline flex item-center justify-center p-1 rounded-full text-xs font-semibold ${
            admin.role.toLowerCase() === 'superadmin'
              ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
              : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
          }`}
        >
          {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (admin) => (
        <span className="text-[#CDCDE0]">{formatDate(admin.createdAt)}</span>
      ),
    },
  ];

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleDelete = (admin: Admin) => {
    console.log('Delete admin:', admin);
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Admin Management</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-pink-600 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Admin
            </button>
          </div>
          <p className="text-[#CDCDE0]">
            Manage system administrators and their roles
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#101010] rounded-lg p-6 shadow-lg border border-[#23232B]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-sm text-[#CDCDE0] font-medium">
                Total Admins
              </span>
            </div>
            <span className="text-3xl font-bold text-white">{admins.length}</span>
          </div>

          <div className="bg-[#101010] rounded-lg p-6 shadow-lg border border-[#23232B]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-[#CDCDE0] font-medium">Admins</span>
            </div>
            <span className="text-3xl font-bold text-white">
              {admins.filter((a) => a.role.toLowerCase() === 'admin').length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#101010] rounded-lg p-6 mb-6 shadow-lg border border-[#23232B]">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#CDCDE0]" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#23232B] text-white rounded-md pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder-gray-500"
                />
              </div>
            </div>

            {/* Role Filter with CustomDropdown */}
            <div className="md:w-64">
              <CustomDropdown
                options={roleOptions}
                value={roleFilterDisplay}
                onChange={(value) => setRoleFilterDisplay(value)}
                placeholder="Filter by role"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-[#23232B]">
            <p className="text-sm text-[#CDCDE0]">
              Showing <span className="text-white font-semibold">{filteredAdmins.length}</span>{' '}
              of <span className="text-white font-semibold">{admins.length}</span> admins
            </p>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredAdmins}
          isLoading={isLoading}
          emptyMessage="No admins found"
          actions={(admin) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(admin)}
                className="p-2 hover:bg-blue-600/20 rounded-lg transition-colors group"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-[#CDCDE0] group-hover:text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(admin)}
                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors group"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-[#CDCDE0] group-hover:text-red-400" />
              </button>
            </div>
          )}
        />
      </div>

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdminCreated={handleAdminCreated}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        onAdminUpdated={handleAdminUpdated}
        admin={selectedAdmin}
      />
    </DashboardLayout>
  );
}