import { setSingleCompany } from '@/redux/companySlice';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!companyId) return; // avoid calling when id is falsy

    const fetchSingleCompany = async () => {
      try {
        const res = await axios.get(
          `${COMPANY_API_END_POINT}/get/${companyId}`,
          { withCredentials: true }
        );

        console.log(res.data.company);

        if (res.data.success) {
          dispatch(setSingleCompany(res.data.company));
        }
      } catch (error) {
        console.error('Failed to fetch company by id:', error);
      }
    };

    fetchSingleCompany();
  }, [companyId, dispatch]);

  return null;
};
