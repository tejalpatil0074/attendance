import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AttendanceApp() {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [message, setMessage] = useState("");

  const API_BASE = "http://localhost:8000/api";

  // CSV Upload
  const uploadCSV = async () => {
    if (!file) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/attendance/upload-csv`, formData);
      setMessage(res.data.message);
    } catch (err) {
      alert("Upload failed");
    }
  };

  // Fetch Daily Report
  const fetchDailyReport = async () => {
    if (!date) return alert("Select date");
    const res = await axios.get(`${API_BASE}/reports/daily?date=${date}`);
    setDailyData(res.data);
  };

  // Fetch Monthly Report
  const fetchMonthlyReport = async () => {
    if (!month) return alert("Select month");
    const res = await axios.get(`${API_BASE}/reports/monthly?month=${month}`);
    setMonthlyData(res.data);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Office Attendance Dashboard</h1>

      {/* CSV Upload */}
      <div className="border p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Upload Attendance CSV</h2>
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        <button className="ml-3 px-4 py-2 bg-black text-white rounded" onClick={uploadCSV}>
          Upload
        </button>
        {message && <p className="text-green-600 mt-2">{message}</p>}
      </div>

      {/* Daily Report */}
      <div className="border p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Daily Attendance</h2>
        <input type="date" onChange={(e) => setDate(e.target.value)} />
        <button className="ml-3 px-4 py-2 bg-blue-600 text-white rounded" onClick={fetchDailyReport}>
          Fetch
        </button>

        <table className="w-full mt-4 border">
          <thead className="bg-gray-100">
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Location</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dailyData.map((row, i) => (
              <tr key={i} className="text-center border-t">
                <td>{row.employeeName}</td>
                <td>{row.date}</td>
                <td>{row.officeLocation}</td>
                <td>{row.loginTime}</td>
                <td>{row.logoutTime}</td>
                <td>{row.workingHours}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly Report */}
      <div className="border p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Monthly Summary</h2>
        <input type="month" onChange={(e) => setMonth(e.target.value)} />
        <button className="ml-3 px-4 py-2 bg-green-600 text-white rounded" onClick={fetchMonthlyReport}>
          Fetch
        </button>

        <table className="w-full mt-4 border">
          <thead className="bg-gray-100">
            <tr>
              <th>Employee</th>
              <th>Office Days</th>
              <th>Remote Days</th>
              <th>Total Present</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((row, i) => (
              <tr key={i} className="text-center border-t">
                <td>{row.employeeName}</td>
                <td>{row.officeDays}</td>
                <td>{row.remoteDays}</td>
                <td>{row.totalDaysPresent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
