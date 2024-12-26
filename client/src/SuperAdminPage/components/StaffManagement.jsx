import React, { useState, useEffect } from 'react';
import '../css/managePatient.module.css';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter, faPlus } from '@fortawesome/free-solid-svg-icons';
import { DataGrid } from '@mui/x-data-grid';
import profileImage from '../images/pookie.jpeg';
import axios from 'axios';

const StaffManagement = () => {
  const [rows, setRows] = useState([]); // Staff data
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    specialization: '',
    email: '',
    password: '',
  });

  // Fetch all staff members
  useEffect(() => {
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
        }));
        setRows(staffData);
      } catch (error) {
        alert(error.response?.data?.error || 'Error fetching staff data.');
      }
    };

    fetchStaff();
  }, []);

  // Open and close modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/createStaff/`,
        {
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          suffix: formData.suffix,
          specialization: formData.specialization,
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      // Success handling
      alert(response.data.message);
      closeModal();

      // Add new staff to rows
      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1,
          staffId: response.data.staff_id,
          name: `${formData.firstName} ${formData.lastName}`,
          specialty: formData.specialization,
        },
      ]);
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating staff.');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'No', width: 100 },
    { field: 'staffId', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Staff Name', width: 350 },
    { field: 'specialty', headerName: 'Specialty', width: 250 },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => (
        <button className="view-button" onClick={() => handleView(params.row)}>View</button>
      ),
    },
  ];

  const handleView = (row) => {
    alert(`Viewing details for ${row.name}`);
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
              <NavLink to="/dashboard/userprofile" className="profile-nav">
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
                <input
                  type="text"
                  placeholder="Search Appointment"
                  className="search-appointment-input2"
                />
              </div>
              <button className="filter-button">
                <FontAwesomeIcon icon={faFilter} />
              </button>
              <button className="staff-button" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} /> Add Staff
              </button>
            </div>

            {/* DataGrid */}
            <div className="queue-table" style={{ height: 400, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSize={5} />
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
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
              <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
              <button type="submit">Create</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
