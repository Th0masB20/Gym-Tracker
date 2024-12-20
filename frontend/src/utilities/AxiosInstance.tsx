import axios from "axios";

const axios_instance = axios.create({ withCredentials: true });

axios_instance.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    //used to create new entry, retry. originally false, then set to true
    const original_request = error.config;
    if (error.response.data.error == "Token expired or not provided") {
      try {
        const ticket_response = await axios.get(
          "http://localhost:3000/refresh",
          { withCredentials: true }
        );
        if (ticket_response.status == 200) {
          return axios(original_request);
        }
      } catch (final_error) {
        return final_error;
      }
    }

    return error;
  }
);

export default axios_instance;
