import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeProvider from '../hooks/EmployeeProvider';
import { useEmployees } from '../hooks/useEmployees';
import { useSettings } from '../hooks/useSettings';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Toast from '../components/common/Toast';
import DeleteDialog from '../components/employee/DeleteDialog';
import EmployeeModal from '../components/employee/EmployeeModal';

function MainLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useSettings();
  const {
    searchQuery,
    setSearchQuery,
    toast,
    isAddModalOpen,
    setIsAddModalOpen,
    formData,
    formErrors,
    submitting,
    handleFormInputChange,
    handleAddSubmit,
    resetAddForm,
    employeeToDelete,
    deleting,
    handleCancelDelete,
    handleConfirmDelete,
  } = useEmployees();

  useEffect(() => {
    document.body.classList.toggle('compact-mode', Boolean(settings.compactMode));
  }, [settings.compactMode]);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    resetAddForm();
  };

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="main-content">
          <Outlet />
        </main>

        <Footer />
      </div>

      <Toast toast={toast} />

      <DeleteDialog
        employee={employeeToDelete}
        deleting={deleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        formData={formData}
        errors={formErrors}
        onChange={(e) => handleFormInputChange(e, false)}
        onSubmit={handleAddSubmit}
        submitting={submitting}
      />
    </>
  );
}

function MainLayout() {
  return (
    <EmployeeProvider>
      <MainLayoutContent />
    </EmployeeProvider>
  );
}

export default MainLayout;
