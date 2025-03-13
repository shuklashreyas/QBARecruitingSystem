import React, { useState, useContext } from "react";
import api from "../apiService";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";

const NewJobForm = () => {
  const { updateJobs } = useContext(GlobalContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/jobs", {
        title,
        description,
        company,
      });
      // Optionally update state or redirect
      updateJobs((prevJobs) => [...prevJobs, response.data]);
      navigate("/");
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <button type="submit">Create Job</button>
    </form>
  );
};

export default NewJobForm;
