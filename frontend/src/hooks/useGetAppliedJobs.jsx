import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetAppliedJobs = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/get`,
          { withCredentials: true }
        );

        console.log(res.data);

        if (res.data.success) {
          // ✅ check if backend sends applications or application
          dispatch(setAllAppliedJobs(res.data.applications));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchAppliedJobs();
  }, [dispatch]);
};
