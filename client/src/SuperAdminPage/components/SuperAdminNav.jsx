import { NavLink } from "react-router-dom";
import { Home, Person, Groups2, Queue, Logout } from '@mui/icons-material';
import logoImage from '../../LoginPage/images/logo.png';
import '../styles/Nav.css';

export const SuperAdminNav = () => {
    return(
        <aside className="superadmin-sidebar">
            <img src={logoImage} alt="logo" className="logo-image" />
            <div className="logo">Queue Care</div>
            <nav>
                <NavLink 
                    to="/superadmin/dashboard" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <Home /> <span>Dashboard</span> 
                </NavLink>
                <NavLink 
                    to="/superadmin/queuemanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <Queue /> <span>Queue</span>
                </NavLink>
                <NavLink 
                    to="/superadmin/patientmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                   <Groups2 /> <span>Patients</span>
                </NavLink>
                <NavLink 
                    to="/superadmin/staffmanage" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <Person /> <span>Staffs</span> 
                </NavLink>
                <NavLink 
                    to="/" 
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    end
                >
                    <Logout />  <span>Log Out</span>
                </NavLink>
            </nav>
        </aside>
    );
}
