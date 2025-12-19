import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import EstateCard from '../components/EstateCard';
import Chat from '../components/Chat';
import { useUserContext } from '../contexts/UserContext';
import AxiosClient from '../AxiosClient';
import Notification from '../components/Notification';
import { usePostContext } from '../contexts/PostContext';
import { useLanguage } from '../contexts/LanguageContext';

function Profile() {
  const { user, setUser, setToken, message } = useUserContext();
  const { posts } = usePostContext();
  const { t } = useLanguage();
  const [userPosts, setUserPosts] = useState(null);
  const [userSavedPosts, setUserSavedPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  const onLogout = () => {
    AxiosClient.post('/logout').then(() => {
      setUser(null);
      setToken(null);
    });
  };

  useEffect(() => {
    AxiosClient.get(`/user-posts/${user.id}`).then((response) => {
      setUserPosts(response.data);
      AxiosClient.get(`/saved-posts/${user.id}`).then((response) => {
        setUserSavedPosts(response.data);
        setLoading(false);
      });
    });
  }, []);
  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)]"
    >
      {loading ? (
        <div className="text-3xl text-green-600 font-bold absolute right-1/2 top-1/2">
          {t('common.loading')}
        </div>
      ) : (
        <>
          {' '}
          <div className="left lg:w-3/5 lg:pr-10 flex flex-col gap-12 lg:overflow-y-scroll mb-3">
            <div className="title flex justify-between">
              <h3 className="text-3xl font-light">{t('profile.userInformation')}</h3>
              <Link
                className="bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md"
                to="/user/profile/update"
              >
                {t('profile.updateProfile')}
              </Link>
            </div>

            <div className="info flex flex-col gap-5">
              <div className="flex gap-5 items-center font-semibold">
                {t('profile.avatar')} :{' '}
                <img
                  src={user.avatar || '/avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>

              <div>
                {t('profile.username')} : <b>{user.name}</b>
              </div>
              <span>
                {t('profile.email')} : <b>{user.email}</b>
              </span>
              <button
                className="bg-green-600 text-white py-3 px-5 rounded-md w-fit"
                onClick={onLogout}
              >
                {t('profile.logout')}
              </button>
            </div>

            <div className="my-list">
              <div className="flex justify-between">
                <h3 className="text-3xl font-light">{t('profile.myList')}</h3>
                <Link
                  className="bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md"
                  to="/post/add"
                >
                  {t('profile.addNewPost')}
                </Link>
              </div>
              <div>
                <div className="flex flex-col gap-5 mt-5">
                  {userPosts.map((es) => {
                    return <EstateCard key={es.id} estate={es} />;
                  })}
                </div>
              </div>
            </div>

            <div className="saved-list">
              <div className="flex justify-between">
                <h3 className="text-3xl font-light">{t('profile.savedList')}</h3>
                <Link className="bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md">
                  {t('profile.addNewPost')}
                </Link>
              </div>
              <div>
                <div className="flex flex-col gap-5 mt-5">
                  {userSavedPosts.map((es) => {
                    return <EstateCard key={es.id} estate={es} />;
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="right flex-1 md:bg-[#fcf5f3] px-5 overflow-hidden">
            <Chat />
          </div>
        </>
      )}

      {message && <Notification message={message} />}
    </div>
  );
}

export default Profile;
