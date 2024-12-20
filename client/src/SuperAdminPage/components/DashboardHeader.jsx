import React from 'react';
import '../css/Dashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faUsers, faUser, faPeopleRoof } from '@fortawesome/free-solid-svg-icons';
import logoImage from '../../LoginPage/images/logo.png';
import { Doughnut, Line } from 'react-chartjs-2';

const Dashboard = () => {
  // Data for Line Chart
  const lineData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'This week',
        data: [20, 40, 35, 50, 45, 60, 70, 65, 80],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for Doughnut Chart
  const doughnutData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ['#2563EB', '#E5E7EB'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <img src={logoImage} alt="logo" className="logo-image" />
        <div className="logo">Queue Care</div>
        <ul>
          <li><FontAwesomeIcon icon={faGauge} style={{ width: '20px'}} /> Dashboard</li>
          <li><FontAwesomeIcon icon={faUsers} style={{ width: '20px'}} /> Queue Management</li>
          <li><FontAwesomeIcon icon={faUser} style={{ width: '20px'}} /> Patient Management</li>
          <li><FontAwesomeIcon icon={faPeopleRoof} style={{ width: '20px'}} /> Staff Management</li>
        </ul>
      </aside>

      <main className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          
        
          {/* Stats */}
           <div className="stats-container">
             <div className="stats-card" id="stat1" style={{color: 'white'}}>
               <h3>Students</h3>
               <h1>21</h1>
             </div>
             <div className="stats-card" id="stat2" style={{color: 'white'}}>
               <h3>Employees</h3>
               <h1>22</h1>
             </div>
             <div className="stats-card" id="stat3">
               <h3>Employees</h3>
               <h1>23</h1>
             </div>
             <div className="stats-card" id="stat4">
               <h3>Employees</h3>
               <h1>24</h1>
             </div>
           </div>

           {/* Charts */}
           <div className="charts-container">
            <div className="chart-card">
              <Line data={lineData} />
            </div>
            <div className="chart-card">
              <Doughnut data={doughnutData} />
            </div>
          </div>
        

        
      </main>
    </div>
  );
};

export default Dashboard;
