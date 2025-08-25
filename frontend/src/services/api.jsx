import axios from 'axios';

// Create an Axios instance with the base URL from your environment variables.
const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });
/*
  This is a 'request interceptor'. It will attach the user's JWT token 
  to the headers of every request if the user is logged in. 
  This is crucial for protected routes.
*/
API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`;
  }
  return req;
});


// --- Admin Endpoints ---
export const getAllUsers = () => API.get('/api/user/admin/users');
export const deleteUserByAdmin = (id) => API.delete(`/api/user/admin/users/${id}`);
export const updateUserRoleByAdmin = (id, role) => API.put(`/api/user/admin/users/${id}`, role);
export const getAdminStats = () => API.get('/api/user/admin/stats'); // Add this line


// --- Authentication Endpoints ---
export const registerUser = (formData) => API.post('/api/user/register', formData);
export const loginUser = (formData) => API.post('/api/user/login', formData);
export const forgotUser = (formData) => API.post('/api/user/forgot-password', formData);
export const verifyUser = (formData) => API.post('/api/user/verify-reset-otp', formData);
export const resetUser = (formData) => API.post('/api/user/reset-password', formData);
export const updateUserPassword = (passwordData) => API.put('/api/user/password', passwordData);
export const googleLoginUser = (tokenData) => API.post('/api/user/google-login', tokenData);

// --- Chat Endpoints ---
export const fetchChats = () => API.get('/api/chat');
export const accessChat = (userId) => API.post('/api/chat', { userId });
export const createGroupChat = (chatData) => API.post('/api/chat/group', chatData);
// --- Group Chat Management Endpoints ---
export const renameGroup = (chatId, chatName) => API.put('/api/chat/rename', { chatId, chatName });
export const addUserToGroup = (chatId, userId) => API.put('/api/chat/groupadd', { chatId, userId });
export const removeUserFromGroup = (chatId, userId) => API.put('/api/chat/groupremove', { chatId, userId });

// --- User Search Endpoint ---
export const searchUsers = (searchQuery) => API.get(`/api/user?search=${searchQuery}`);

// --- User Profile Endpoint ---
export const updateUser = (userId, userData) => API.put(`/api/user/profile`, userData);

// --- Message Endpoints (NEWLY ADDED) ---

/**
 * Fetches all messages for a specific chat.
 * @param {string} chatId - The ID of the chat.
 * @returns {Promise} Axios promise with the messages.
 */
export const fetchMessages = (chatId) => API.get(`/api/message/${chatId}`);

/**
 * Sends a new message.
 * @param {object} messageData - The message data, containing content and chatId.
 * @returns {Promise} Axios promise with the newly created message.
 */
export const sendMessage = (messageData) => API.post('/api/message', messageData);

/**
 * Deletes a message.
 * @param {string} messageId - The ID of the message to delete.
 * @returns {Promise} Axios promise with the deletion result.
 */
export const deleteMessage = (messageId) => API.delete(`/api/message/${messageId}`);

/**
 * Updates a message.
 * @param {string} messageId - The ID of the message to update.
 * @param {object} messageData - The updated message data.
 * @returns {Promise} Axios promise with the updated message.
 */
export const updateMessage = (messageId, messageData) => API.put(`/api/message/${messageId}`, messageData);

/**
 * Reacts to a message.
 * @param {string} messageId - The ID of the message to react to.
 * @param {string} emoji - The emoji to react with.
 * @returns {Promise} Axios promise with the reaction result.
 */
export const reactToMessage = (messageId, emoji) => API.put(`/api/message/${messageId}/react`, { emoji });

/**
 * Stars a message.
 * @param {string} messageId - The ID of the message to star.
 * @returns {Promise} Axios promise with the star result.
 */
export const starMessage = (messageId) => API.put(`/api/message/${messageId}/star`);

/**
 * Pins a message to a chat.
 * @param {string} chatId - The ID of the chat.
 * @param {string} messageId - The ID of the message to pin.
 * @returns {Promise} Axios promise with the pin result.
 */
export const pinMessage = (chatId, messageId) => API.put('/api/chat/pin', { chatId, messageId });

// --- Chat Endpoints (You will add these later) ---
// export const fetchChats = () => API.get('/api/chat');
// export const searchUsers = (searchQuery) => API.get(`/api/user?search=${searchQuery}`);


export default API;