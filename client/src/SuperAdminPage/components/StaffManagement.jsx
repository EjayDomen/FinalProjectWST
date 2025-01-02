import React, { useState, useEffect } from 'react';
import '../styles/ManagePatient.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter, faPlus, faBoxArchive } from '@fortawesome/free-solid-svg-icons';
import { DataGrid } from '@mui/x-data-grid';
import profileImage from '../images/pookie.jpeg';
import axios from 'axios';

const StaffManagement = () => {
  const [rows, setRows] = useState([]); // Staff data
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [archivedRows, setArchivedRows] = useState([]); // Archived staff data
  const [isEditModal, setIsEditModal] = useState(false); // To distinguish between create and edit modal
  const [isArchiveModal, setIsArchiveModal] = useState(false); // Archive modal state
  const [currentStaff, setCurrentStaff] = useState(null); // To store the staff being edited
  const [selectedStaff,setSelectedStaff] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    specialization: '',
    email: '',
  });

  const openArchiveModal = async () => {
    await fetchArchivedStaff(); // Wait for data to be fetched first
    setIsArchiveModal(true); // Open the modal after data is loaded
  };
  

  // Fetch archived (soft deleted) staff
  const fetchArchivedStaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/get_archived_staff/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const archivedData = response.data.staff.map((staff, index) => ({
        id: index + 1,
        staffId: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        specialty: staff.specialization,
        email: staff.email,
      }));
      setArchivedRows(archivedData);
    } catch (error) {
      alert(error.response?.data?.error || 'Error fetching archived staff.');
    }
  };

// Handle restore of soft-deleted staff
const handleRestore = async (staffId) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/admin/restore_staff/${staffId}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    alert(response.data.message || 'Staff restored successfully.');
    fetchStaff();
    closeModal();
  } catch (error) {
    alert(error.response?.data?.error || 'Error restoring staff.');
  }
};

  // Open and close modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModal(false);
    setIsArchiveModal(false);
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      specialization: '',
      email: '',
    });
    setSelectedStaff("");
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/show-allstaff/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      const staffData = response.data.staff.map((staff, index) => ({
        id: index + 1,
        staffId: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        specialty: staff.specialization,
        email: staff.email,
      }));
      setRows(staffData);
    } catch (error) {
      alert(error.response?.data?.error || 'Error fetching staff data.');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []); // Empty dependency array, fetches on mount

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const predefinedPassword = `${formData.lastName}123`;

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/createStaff/`,
        {
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          suffix: formData.suffix,
          specialization: formData.specialization,
          email: formData.email,
          password: predefinedPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert(response.data.message);
      closeModal();

      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1,
          staffId: response.data.staff_id,
          name: `${formData.firstName} ${formData.lastName}`,
          specialty: formData.specialization,
          email: formData.email,
        },
      ]);
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating staff.');
    }
  };

  // Handle edit
  const handleEdit = (row) => {
    setIsEditModal(true);
    setCurrentStaff(row);
    setSelectedStaff(row.id);
    setFormData({
      firstName: row.name.split(' ')[0],
      lastName: row.name.split(' ')[1],
      middleName: '', // Assuming no middle name is available
      suffix: '',
      specialization: row.specialty,
      email: row.email,
    });
    openModal();
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.stopPropagation();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/editStaff/${selectedStaff}/`,
        {
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          suffix: formData.suffix,
          specialization: formData.specialization,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert(response.data.message);
      closeModal();
      
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating staff.');
    }
  };

  // Columns configuration for DataGrid
  const columns = [
    { field: 'id', headerName: 'No', width: 100 },
    { field: 'staffId', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Staff Name', width: 350 },
    { field: 'specialty', headerName: 'Specialty', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <div>
          <button className="iconButton" onClick={() => handleEdit(params.row)}>
            Edit
          </button>
          <button
            className="iconButton"
            onClick={() => handleDelete(params.row.staffId)}
            style={{
              marginLeft: '10px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const archivedColumns = [
    { field: 'id', headerName: 'No', width: 100 },
    { field: 'staffId', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Staff Name', width: 350 },
    { field: 'specialty', headerName: 'Specialty', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <div>
          <button
            className="restore-button"
            onClick={() => handleRestore(params.row.staffId)}
            style={{
              backgroundColor: 'green',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Restore
          </button>
        </div>
      ),
    },  
  ];

  const handleDelete = async (staffId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this staff member?');
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/deleteStaff/${staffId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        alert(response.data.message || 'Staff deleted successfully.');
        setRows((prevRows) => prevRows.filter((row) => row.staffId !== staffId));
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting staff.');
      }
    }
  };

  return (
    <div className="patient">
      <main className="patient-content">
        {/* Header Section */}
        <div className="patient-header">
          <div className="header-left">
            <p className="current-time">10:00 AM</p>
            <p className="current-date">August 30, 2024</p>
          </div>
          <div className="header-right">
            <div className="search-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="profile-icon-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              <NavLink to="/superadmin/userprofile" className="profile-nav">
                <img src={profileImage} alt="Profile" className="profile-image" />
                <div className="user-avatar">Nick Gerblack</div>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Staff List Section */}
        <div className="queue-section">
          <h1 className="queue-title">Staff List</h1>
          <p className="queue-subtitle">This is the list of staff and their status & queue. Check now.</p>
          <div className="queue-content">
            <div className="queue-search">
              <div className="queue-search-container">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
                <input type="text" placeholder="Search Appointment" className="search-appointment-input2" />
              </div>
              <button className="filter-button">
                <FontAwesomeIcon icon={faFilter} />
              </button>
              <button className="staff-button" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} /> Add Staff
              </button>
              <button className="staff-button" onClick={openArchiveModal}>
                <FontAwesomeIcon icon={faBoxArchive} /> Archive
              </button>
            </div>

            {/* DataGrid */}
            <div className="queue-table" style={{ height: 500, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSize={5} />
            </div>
          </div>
        </div>
      </main>

      {/* Archive Modal */}
      {isArchiveModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Archived Staff</h2>
            <DataGrid rows={archivedRows} columns={archivedColumns} pageSize={5} />
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {(isModalOpen && !isEditModal) && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create Staff</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
              <input type="text" name="middleName" placeholder="Middle Name" onChange={handleChange} />
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
              <input type="text" name="suffix" placeholder="Suffix" onChange={handleChange} />
              <input type="text" name="specialization" placeholder="Specialization" onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              <button type="submit">Create</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {(isModalOpen && isEditModal) && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Staff</h2>
            <form onSubmit={handleUpdate}>
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
              <input type="text" name="suffix" placeholder="Suffix" value={formData.suffix} onChange={handleChange} />
              <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <button type="submit">Update</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
