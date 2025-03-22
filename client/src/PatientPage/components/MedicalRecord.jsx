import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Modal, Typography, TextField } from "@mui/material";
import axios from "axios";
import "../styles/medicalrecords.css";

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/medical_records`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRecords(response.data.medical_records || []);
      setFilteredRecords(response.data.medical_records || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = records.filter(record =>
      record.generalremarks.toLowerCase().includes(query) ||
      record.medicineused.toLowerCase().includes(query) ||
      record.attendingstaff.toLowerCase().includes(query) ||
      record.date.includes(query)
    );
    setFilteredRecords(filtered);
  };

  const handleRowClick = (params) => {
    setSelectedRecord(params.row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRecord(null);
  };

  const columns = [
    { field: "id", headerName: "Record ID", width: 100 },
    { field: "generalremarks", headerName: "General Remarks", width: 400 },
    { field: "medicineused", headerName: "Medicine Used", width: 250 },
    { field: "timetreatment", headerName: "Time Treatment", width: 200 },
    { field: "attendingstaff", headerName: "Attending Staff", width: 200 },
    { field: "date", headerName: "Date", width: 150 }
  ];

  return (
    <Box sx={{ height: 700, width: "70%", display: "flex", flexDirection: "column", alignItems: "center", mx: "auto", mt: 5 }}>
      <Typography variant="h4" gutterBottom>Medical Records</Typography>
      <Box sx={{ width: "100%" }}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          sx={{ mb: 2 }}
        />
        <DataGrid
          rows={filteredRecords}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          pageSize={5}
        />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ p: 4, bgcolor: "background.paper", borderRadius: 2, mx: "auto", mt: 5, width: 400 }}>
          <Typography variant="h6">Medical Record Details</Typography>
          {selectedRecord && (
            <Box>
              <Typography><strong>Patient:</strong> {selectedRecord.patient_name}</Typography>
              <Typography><strong>Diagnosis:</strong> {selectedRecord.medical_reason}</Typography>
              <Typography><strong>Physician:</strong> {selectedRecord.attending_physician}</Typography>
              <Typography><strong>Status:</strong> {selectedRecord.record_status}</Typography>
              <Typography><strong>Record Date:</strong> {selectedRecord.record_date}</Typography>
              <Typography><strong>Medical History:</strong> {selectedRecord.medical_history || "N/A"}</Typography>
              <Typography><strong>Prescription:</strong> {selectedRecord.prescription || "N/A"}</Typography>
              <Typography><strong>Doctor's Notes:</strong> {selectedRecord.doctor_notes || "N/A"}</Typography>
            </Box>
          )}
          <Button onClick={handleClose} variant="contained" sx={{ mt: 2 }}>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default MedicalRecords;
