import React from 'react';
import { Link } from 'react-router-dom';
import Chat from '../components/Chat';
import { useUserContext } from '../contexts/UserContext';
import AxiosClient from '../AxiosClient';
import Notification from '../components/Notification';
import { useLanguage } from '../contexts/LanguageContext';

function Profile() {
  const { user, setUser, setToken, message } = useUserContext();
  const { t, language } = useLanguage();

  const onLogout = () => {
    AxiosClient.post('/logout').then(() => {
      setUser(null);
      setToken(null);
    });
  };
  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)] dark:bg-gray-900"
    >
      <>
        {' '}
        <div className={`left lg:w-3/5 flex flex-col gap-12 lg:overflow-y-scroll mb-3 ${
          language === 'ar' ? 'lg:pl-10' : 'lg:pr-10'
        }`}>
            <div className="title flex justify-between">
              <h3 className="text-3xl font-light dark:text-white">{t('profile.userInformation')}</h3>
              <Link
                className="bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md"
                to="/user/profile/update"
              >
                {t('profile.updateProfile')}
              </Link>
            </div>

            <div className="info flex flex-col gap-5">
              <div className="flex gap-5 items-center font-semibold dark:text-gray-200">
                {t('profile.avatar')} :{' '}
                <img
                  src={user.avatar || '/avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>

              <div className="dark:text-gray-200">
                {t('profile.username')} : <b className="dark:text-white">{user.name}</b>
              </div>
              <span className="dark:text-gray-200">
                {t('profile.email')} : <b className="dark:text-white">{user.email}</b>
              </span>

              {/* Identity Verification Status */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold dark:text-white">Identity Verification Status</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.identity_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : user.identity_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : user.identity_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.identity_status === 'approved'
                      ? '✓ Approved'
                      : user.identity_status === 'pending'
                      ? '⏳ Pending'
                      : user.identity_status === 'rejected'
                      ? '✗ Rejected'
                      : 'Not Verified'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {user.identity_status === 'approved'
                    ? 'Your identity has been verified. You can create posts.'
                    : user.identity_status === 'pending'
                    ? 'Your verification is under review. Please wait for admin approval.'
                    : user.identity_status === 'rejected'
                    ? 'Your verification was rejected. Please resubmit your documents.'
                    : 'You need to verify your identity before creating posts.'}
                </p>
                <Link
                  to="/identity-verification"
                  className="bg-yellow-300 dark:bg-yellow-400 hover:bg-yellow-400 dark:hover:bg-yellow-500 text-[#444] dark:text-gray-900 font-semibold py-2 px-4 rounded-md transition duration-300 ease inline-block"
                >
                  {user.identity_status === 'approved'
                    ? 'View Verification'
                    : user.identity_status === 'pending'
                    ? 'View Status'
                    : 'Verify Identity'}
                </Link>
              </div>

              <button
                className="bg-green-600 dark:bg-green-700 text-white py-3 px-5 rounded-md w-fit"
                onClick={onLogout}
              >
                {t('profile.logout')}
              </button>
            </div>
          </div>
          <div className="right flex-1 md:bg-[#fcf5f3] dark:md:bg-gray-800 px-5 overflow-hidden">
            <Chat />
          </div>
        </>

      {message && <Notification message={message} />}
    </div>
  );
}

export default Profile;
