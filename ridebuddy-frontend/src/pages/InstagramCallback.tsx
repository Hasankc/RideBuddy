import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const InstagramCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_SUCCESS', code }, window.location.origin);
    } else if (error) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_FAILURE', error }, window.location.origin);
    }

    window.close();
  }, [location]);

  return <div>Processing Instagram authentication...</div>;
};

export default InstagramCallback;