import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../api/userApi";
import { getAllReports } from "../api/reportsApi";
import { getAllHelpRequests } from "../api/helpRequestsApi";
import MapComponent from "../components/MapView";
import { useAuth } from "../context/AuthContext"; 

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getAllUsers();
        const reportsData = await getAllReports();
        const helpRequestsData = await getAllHelpRequests();
        setUsers(usersData);
        setReports(reportsData);
        setHelpRequests(helpRequestsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout(); // <-- Call logout from AuthContext
    navigate("/logout-confirm"); // <-- Redirect after logout
  };


  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#121212",
    color: "#ffffff",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
  };

  const headerStyle = {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "24px",
  };

  const summaryRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    marginBottom: "30px",
  };

  const navRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    marginBottom: "30px",
  };

  const summaryCardStyle = {
    backgroundColor: "#1f1f1f",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    width: "250px",
    textAlign: "center",
    transition: "background 0.3s",
  };

  const navCardStyle = {
    backgroundColor: "#1f1f1f",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    width: "calc(30% - 20px)",
    textAlign: "center",
    cursor: "pointer",
    transition: "background 0.3s",
  };

  const mapContainerStyle = {
    backgroundColor: "#1f1f1f",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  };

  const hoverHandlers = {
    onMouseOver: (e) => (e.currentTarget.style.backgroundColor = "#2b2b2b"),
    onMouseOut: (e) => (e.currentTarget.style.backgroundColor = "#1f1f1f"),
  };

  
  const logoutButtonStyle = {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "#e53935",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s",
  };
  return (

    <div style={containerStyle}>
         <button
        style={logoutButtonStyle}
        onClick={handleLogout}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#d32f2f")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#e53935")}
      >
        Logout
      </button>
      <h1 style={headerStyle}>Admin Dashboard</h1>

      {/* Summary Cards */}
      <div style={summaryRowStyle}>
        <div
          style={summaryCardStyle}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Total Users</h2>
          <p style={{ fontSize: "2rem" }}>{users.length}</p>
        </div>
        <div
          style={summaryCardStyle}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Total Reports</h2>
          <p style={{ fontSize: "2rem" }}>{reports.length}</p>
        </div>
        <div
          style={summaryCardStyle}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Resource Requests</h2>
          <p style={{ fontSize: "2rem" }}>{helpRequests.length}</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div style={navRowStyle}>
        <div
          style={navCardStyle}
          onClick={() => navigate("/admin/users")}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.5rem" }}>Users</h2>
        </div>
        <div
          style={navCardStyle}
          onClick={() => navigate("/admin/reports")}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.5rem" }}>Reports</h2>
        </div>
        <div
          style={navCardStyle}
          onClick={() => navigate("/admin/requests")}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.5rem" }}>Resource Requests</h2>
        </div>
        <div
          style={navCardStyle}
          onClick={() => navigate("/admin/assign-tasks")}
          {...hoverHandlers}
        >
          <h2 style={{ fontSize: "1.5rem" }}>Assigned Tasks</h2>
        </div>
      </div>

      {/* Map Section */}
      <div style={mapContainerStyle}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>
          Reports & Resource Requests Map
        </h2>
        <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>
          <MapComponent reports={reports} helpRequests={helpRequests} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
