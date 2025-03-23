import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Modal, Typography, TextField, Paper, Grid } from "@mui/material";
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
    { field: "generalremarks", headerName: "General Remarks", width: 300 },
    { field: "medicineused", headerName: "Medicine Used", width: 250 },
    { field: "timetreatment", headerName: "Time Treatment", width: 180 },
    { field: "attendingstaff", headerName: "Attending Staff", width: 200 },
    { field: "date", headerName: "Date", width: 150 }
  ];

  return (
    <Box sx={{ height: 700, width: "80%", mx: "auto", mt: 5, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>📁 Medical Records</Typography>
      
      <TextField
        label="🔍 Search Records"
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
        sx={{ backgroundColor: "white", borderRadius: 2, boxShadow: 2 }}
      />

      <Modal open={open} onClose={handleClose}>
        <Paper sx={{
          p: 4,
          maxWidth: 500,
          mx: "auto",
          mt: 8,
          borderRadius: 2,
          boxShadow: 5,
          textAlign: "left",
          maxHeight: "80vh",
          overflowY: "auto"
        }}>
          <Typography variant="h5" sx={{ mb: 2 }}>🩺 Medical Record Details</Typography>
          {selectedRecord && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="📝 Diagnosis" fullWidth variant="filled" value={selectedRecord.generalremarks} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="👨‍⚕️ Physician" fullWidth variant="filled" value={selectedRecord.attendingstaff} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📅 Record Date" fullWidth variant="filled" value={selectedRecord.date} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📌 Time Treatment" fullWidth variant="filled" value={selectedRecord.timetreatment} InputProps={{ readOnly: true }} />
              </Grid>

              {/* New Fields for Vitals and Measurements */}
              <Grid item xs={6}>
                <TextField label="📊 BP Before" fullWidth variant="filled" value={selectedRecord.bpbefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📊 BP After" fullWidth variant="filled" value={selectedRecord.bpafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="⚖️ Weight Before" fullWidth variant="filled" value={selectedRecord.weightbefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="⚖️ Weight After" fullWidth variant="filled" value={selectedRecord.weightafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="🌡️ Temperature" fullWidth variant="filled" value={selectedRecord.temperature || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="❤️ Pulse Before" fullWidth variant="filled" value={selectedRecord.pulsebefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="❤️ Pulse After" fullWidth variant="filled" value={selectedRecord.pulseafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={12}>
                <TextField label="📜 Medical History" fullWidth multiline variant="filled" value={selectedRecord.medical_history || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="💊 Prescription" fullWidth multiline variant="filled" value={selectedRecord.prescription || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="📝 Doctor's Notes" fullWidth multiline variant="filled" value={selectedRecord.doctor_notes || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          )}
          <Button onClick={handleClose} variant="contained" sx={{ mt: 2, width: "100%" }}>Close</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default MedicalRecords;
