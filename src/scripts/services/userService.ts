import api from "../config/axios";
import schedule from 'node-schedule';

interface UserLogin {
  username: string
  password: string
}


// === GET routes === //

export const getUser = async (): Promise<User | null> => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };
    const res = await api.get('/api/account', config);
    return res.data;
  } catch (error) {
    console.error(`Unrelated Error: ${error}`);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const res = await api.get(`/api/account/id/${id}`);
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get('/api/account/all');
    return res.data;
  } catch (error) {
    console.error(`Unrelated Error: ${error}`);
    return [];
  }
};

const checkSession = async () => {
  try {
    await api.get('/api/account/session-check');
  } catch (error) {
    console.error(error);
    location.reload();
  }
};
schedule.scheduleJob('0 6 * * *', () => checkSession());

// === POST routes === //

export const loginUser = async (user: UserLogin) => {
  try {
    const config = {
      headers: { 'Content-Type': 'application/json' }
    };
    await api.post('/api/account/authenticate', user, config);
  } catch (error: any) {
    console.error(error);
    return error?.response.data.message;
  }
};

// === DELETE routes === //

export const logout = async () => {
  try {
    await api.delete('/api/account/logout');
    location.reload();
  } catch (error) {
    console.error(error);
  }
};
