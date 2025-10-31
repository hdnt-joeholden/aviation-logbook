import { useState } from 'react';

export function useModalState() {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);

  const [editingEntry, setEditingEntry] = useState(null);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingEmployment, setEditingEmployment] = useState(null);

  const openEntryModal = (entry = null) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const closeEntryModal = () => {
    setShowEntryModal(false);
    setEditingEntry(null);
  };

  const openSupervisorModal = (supervisor = null) => {
    setEditingSupervisor(supervisor);
    setShowSupervisorModal(true);
  };

  const closeSupervisorModal = () => {
    setShowSupervisorModal(false);
    setEditingSupervisor(null);
  };

  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const openEmploymentModal = (employment = null) => {
    setEditingEmployment(employment);
    setShowEmploymentModal(true);
  };

  const closeEmploymentModal = () => {
    setShowEmploymentModal(false);
    setEditingEmployment(null);
  };

  return {
    showEntryModal,
    showSupervisorModal,
    showAddressModal,
    showEmploymentModal,
    editingEntry,
    editingSupervisor,
    editingAddress,
    editingEmployment,
    openEntryModal,
    closeEntryModal,
    openSupervisorModal,
    closeSupervisorModal,
    openAddressModal,
    closeAddressModal,
    openEmploymentModal,
    closeEmploymentModal
  };
}
