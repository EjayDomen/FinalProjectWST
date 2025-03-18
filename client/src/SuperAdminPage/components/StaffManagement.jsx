import React, { useState, useEffect } from 'react';
import '../styles/ManagePatient.css';
import { NavLink } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faPlus, faBoxArchive } from '@fortawesome/free-solid-svg-icons';
import { DataGrid } from '@mui/x-data-grid';
import profileImage from '../images/pookie.jpeg';
import axios from 'axios';
import {  AccountCircle} from '@mui/icons-material';

const StaffManagement = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [rows, setRows] = useState([]); // Staff data
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [archivedRows, setArchivedRows] = useState([]); // Archived staff data
  const [isEditModal, setIsEditModal] = useState(false); // To distinguish between create and edit modal
  const [isArchiveModal, setIsArchiveModal] = useState(false); // Archive modal state
  const [currentStaff, setCurrentStaff] = useState(null); // To store the staff being edited
  const [selectedStaff,setSelectedStaff] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    workposition: '',
    address: '',
    phone_number: '',
    marital_status: '',
    sex: '',
    birthday: '',
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
        workposition: staff.workposition,
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
      workposition: '',
      address: '',
      phone_number: '',
      marital_status: '',
      sex: '',
      birthday: '',
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
        username: staff.username,
        name: `${staff.first_name} ${staff.last_name}`,
        middleName: staff.middle_name,
        suffix: staff.suffix,
        workposition: staff.workposition,
        address: staff.address,
        phone_number: staff.phonenumber,
        marital_status: staff.maritalstatus,
        sex: staff.sex,
        birthday: staff.birthday,
        email: staff.email,
      }));
      setRows(staffData);
    } catch (error) {
      alert(error.response?.data?.error || 'Error fetching staff data.');
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); // Updated date format
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/me/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
          }
        });
        const secretary = response.data;
    
        // Safely construct the full name
        const firstName = secretary.first_name || "";
        const lastName = secretary.last_name || "";
        
        setUserName(`${firstName} ${lastName}`.trim()); // Use trim() to remove any extra spaces
      } catch (error) {
        console.error('Error fetching profile:', error);
        // navigate('/');
      }
    };

    updateDateTime();
    fetchProfile();
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
          username: formData.username,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          suffix: formData.suffix,
          workposition: formData.workposition,
          address: formData.address,
          phone_number: formData.phone_number,
          marital_status: formData.marital_status,
          sex: formData.sex,
          birthday: formData.birthday,
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
          workposition: formData.workposition,
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
      username: row.username,
      firstName: row.name.split(' ')[0],
      lastName: row.name.split(' ')[1],
      middleName: row.middleName,
      suffix: row.suffix,
      workposition: row.workposition,
      address: row.address,
      phone_number: row.phone_number,
      marital_status: row.marital_status,
      sex: row.sex,
      birthday : row.birthday,
      email: row.email,
    });
    openModal();
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.stopPropagation();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/superadmin/update_staff/${selectedStaff}/`,
        {
          username: formData.username,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          suffix: formData.suffix,
          workposition: formData.workposition,
          address: formData.address,
          phone_number: formData.phone_number,
          marital_status: formData.marital_status,
          sex: formData.sex,
          birthday: formData.birthday,
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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter rows based on search query
  const filteredRows = rows.filter(
    (row) =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.workposition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // Columns configuration for DataGrid
  const columns = [
    { field: 'id', headerName: 'No', width: 100 },
    { field: 'staffId', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Staff Name', width: 350 },
    { field: 'workposition', headerName: 'Work Position', width: 250 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <div>
          <button className="iconButton" onClick={() => handleEdit(params.row)}
            style={{
              backgroundColor: 'rgb(255, 193, 7)'
            }}>
            <EditIcon /> Edit
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
            <DeleteIcon />
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
    { field: 'workposition', headerName: 'Work Position', width: 250 },
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
        {/* Header Section */}
        <div className="patient-header">
          <div className="header-left">
            <p className="current-time">{currentTime}</p>
            <p className="current-date">{currentDate}</p>
          </div>
          <div className="header-right">
            <div className="profile-icon-container">
              <NavLink to="/superadmin/userprofile" className="profile-nav">
                <AccountCircle style={{ fontSize: '60px', padding: '10px', cursor: 'pointer', color: 'gray' }} />
                <div className="user-avatar">{userName}</div>
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
                <input type="text" 
                  placeholder="Search Appointment" 
                  className="search-appointment-input2" 
                  value={searchQuery}
                  onChange={handleSearch}/>
              </div>
              <button className="staff-button" onClick={openModal}
              style={{
                backgroundColor: '#198754',
                padding: '4px'
               }}>
                <FontAwesomeIcon icon={faPlus} /> Add Staff
              </button>
              <button className="staff-button" onClick={openArchiveModal}
              style={{
               backgroundColor: '#ffc107',
               padding: '4px'
              }}>
                <FontAwesomeIcon icon={faBoxArchive} /> Archive
              </button>
            </div>

            {/* DataGrid */}
            <div className="queue-table" style={{ height: 500, width: '100%' }}>
              <DataGrid rows={filteredRows} columns={columns} pageSize={5} />
            </div>
          </div>
        </div>

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
              <label>Username:</label>
              <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
              <label>First Name:</label>
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
              <label>Middle Name:</label>
              <input type="text" name="middleName" placeholder="Middle Name" onChange={handleChange} />
              <label>Last Name:</label>
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
              <label>Suffix:</label>
              <select name="suffix" onChange={handleChange}>
              <option value="" disabled selected>Suffix</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
            </select>

              <label>Work Position: </label>
              <input type="text" name="workposition" placeholder="Work Position" onChange={handleChange} required />
              <label>Address: </label>
              <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
              <label>Marital Status: </label>
              <select name="marital_status" onChange={handleChange} required>
                <option value="" disabled selected>Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="divorced">Divorced</option>
                <option value="separated">Separated</option>
              </select>
              <label>Sex: </label>
              <select name="sex" onChange={handleChange} required>
              <option value="" disabled selected>Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>

              <label>Birthday:</label>
              <input type="date" name="birthday" placeholder="Birthday " onChange={handleChange} required />
              <label>Phone Number: </label>
              <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
              <label>Email:</label>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
              <button type="submit" style={{backgroundColor: 'rgb(25, 135, 84)', color: 'white'}}>Create</button>
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
              <label>Username:</label>
              <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
              <label>First Name: </label>
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              <label>Middle Name:</label>
              <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} />
              <label>Last Name: </label>
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
              <label>Suffix:</label>
              <select name="suffix" value={formData.suffix} onChange={handleChange}>
              <option value="" disabled selected>Suffix</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
            </select>

              <label>Work Position:</label>
              <input type="text" name="workposition" placeholder="Work Position" value={formData.workposition} onChange={handleChange} required />
              <label>Address: </label>
              <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
              <label>Marital Status: </label>
              <select name="marital_status" value={formData.marital_status} onChange={handleChange} required>
                <option value="" disabled selected>Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widowed">Widowed</option>
                <option value="divorced">Divorced</option>
                <option value="separated">Separated</option>
              </select>
              <label>Sex: </label>
              <select name="sex" value={formData.sex} onChange={handleChange} required>
              <option value="" disabled selected>Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>

              <label>Birthday: </label>
              <input type="date" name="birthday" placeholder="Birthday" value={formData.birthday} onChange={handleChange} required />
              <label>Phone Number: </label>
              <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number}  onChange={handleChange} required />
              <label>Email: </label>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <button type="submit" style={{backgroundColor: 'rgb(25, 135, 84)', color: 'white'}}>Update</button>
              <button type="button" onClick={closeModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
