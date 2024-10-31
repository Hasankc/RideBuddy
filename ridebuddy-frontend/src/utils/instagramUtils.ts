import api from './api';

const INSTAGRAM_APP_ID = import.meta.env.VITE_INSTAGRAM_APP_ID;
const REDIRECT_URI = `${window.location.origin}/auth/instagram/callback`;

export const connectToInstagram = async (): Promise<boolean> => {
  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`;

  const authWindow = window.open(instagramAuthUrl, '_blank', 'width=600,height=600');

  if (!authWindow) {
    console.error('Failed to open Instagram authorization window');
    return false;
  }

  return new Promise((resolve) => {
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        const { code } = event.data;
        try {
          const response = await api.post('/api/instagram/exchange-token', { code });
          resolve(true);
        } catch (error) {
          console.error('Error exchanging Instagram code for token:', error);
          resolve(false);
        }
      } else if (event.data.type === 'INSTAGRAM_AUTH_FAILURE') {
        console.error('Instagram authentication failed');
        resolve(false);
      }
    });
  });
};

export const getInstagramPhotos = async (): Promise<string[]> => {
  try {
    const response = await api.get('/api/instagram/photos');
    return response.data;
  } catch (error) {
    console.error('Error fetching Instagram photos:', error);
    return [];
  }
};