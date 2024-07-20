import axios from "axios";

const apiRequest = axios.create({
  baseURL: "https://realestate-api-vtkz.onrender.com/api",
  withCredentials: true,
});

export default apiRequest;