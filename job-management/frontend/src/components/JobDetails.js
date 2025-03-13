import React from "react";
import { useParams } from "react-router-dom";

const JobDetails = () => {
  const { id } = useParams();
  return <div>Job Details for Job ID: {id}</div>;
};

export default JobDetails;
