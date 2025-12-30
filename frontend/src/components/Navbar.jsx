import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import AxiosClient from '../AxiosClient';

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAdmin, setUser, setToken } = useUserContext();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    AxiosClient.post('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
        navigate('/');
        setProfileDropdown(false);
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        // Still clear local storage even if API call fails
        setUser(null);
        setToken(null);
        navigate('/');
        setProfileDropdown(false);
      });
  };

  // useEffect(() => {
  //   AxiosClient.get('/user').then(({ data }) => {
  //     console.log(data);
  //     setUser(data);
  //   });
  // }, []);

  return (
    <div className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]">
      <nav className="flex justify-between items-center h-[100px] relative">
        <div className="left flex-1 flex items-center gap-12 max-md:gap-10">
          <Link
            className="logo flex items-center font-bold text-xl max-lg:text-lg gap-2.5 hover:scale-105 transition duration-300 eas"
            to="/"
          >
            <img src="/public/logo.png" alt="" className="w-7" />
            <span className="max-lg:hidden max-md:block">LamaEstate</span>
          </Link>
          <Link
            href="#"
            className="hover:scale-105 transition duration-300 ease rounded-md max-md:hidden"
            to="/"
          >
            {t('navbar.home')}
          </Link>
          <Link
            href="#"
            className="hover:scale-105 transition duration-300 ease rounded-md max-md:hidden"
            to="/about"
          >
            {t('navbar.about')}
          </Link>
          <Link
            href="#"
            className="hover:scale-105 transition duration-300 ease rounded-md max-md:hidden"
          >
            {t('navbar.contact')}
          </Link>
          <Link
            href="#"
            className="hover:scale-105 transition duration-300 ease rounded-md max-md:hidden"
          >
            {t('navbar.agents')}
          </Link>
          {user && isAdmin() && (
            <Link
              to="/admin/dashboard"
              className="bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md max-md:hidden font-bold"
            >
              Admin
            </Link>
          )}
        </div>
        <div
          className={`right md:w-2/5 flex items-center md:justify-end lg:bg-[#fcf5f3] h-full relative
          ${user ? '' : 'gap-12'}`}
        >
          {user ? (
            <div className="relative z-[9999]" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-3 hover:scale-105 transition duration-300 ease"
              >
                <img
                  src={user.avatar || '/avatar.png'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-yellow-300"
                />
                <span className="font-bold max-md:hidden">{user.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${profileDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {profileDropdown && (
                <div className={`absolute top-full mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-[10000] ${
                  language === 'ar' ? 'left-0' : 'right-0'
                }`}>
                  <div className="py-1">
                    <Link
                      to="/user/profile"
                      onClick={() => setProfileDropdown(false)}
                      className={`block px-4 py-2 text-sm text-[#444] hover:bg-yellow-300 transition duration-300 ease ${
                        language === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('navbar.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-300 ease ${
                        language === 'ar' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {t('navbar.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="#"
                className="hover:scale-105 transition duration-300 ease rounded-md max-md:hidden"
                to="/login"
              >
                {t('navbar.login')}
              </Link>
              <Link
                href="#"
                className={`bg-yellow-300 px-4 py-2 hover:scale-105 transition duration-300 ease rounded-md max-md:hidden ${
                  language === 'ar' ? 'ml-2' : 'mr-2'
                }`}
                to="/signup"
              >
                {t('navbar.signup')}
              </Link>
            </>
          )}

          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`bg-yellow-300 hover:scale-105 px-4 py-2 rounded-md font-bold transition duration-300 ease text-[#444] ${
              language === 'ar' ? 'max-md:ml-2' : 'max-md:mr-2'
            }`}
            title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            {language === 'en' ? 'عربي' : 'English'}
          </button>

          <a href="#">
            <img
              src="/public/menu.png"
              alt=""
              className={`w-9 md:hidden relative z-50 ${
                language === 'ar' ? 'mr-4' : 'ml-4'
              }`}
              onClick={() => {
                setSidebar((pre) => !pre);
              }}
            />
          </a>
        </div>
        <div
          className={`menu bg-black flex flex-col justify-center items-center 
            absolute top-0 bottom-0 gap-6 transition-all duration-1000 md:hidden
            ${language === 'ar' ? 'left-0' : 'right-0'}
            ${sidebar ? 'max-md:w-1/2' : 'w-0 overflow-hidden'}`}
        >
          {/* <a
            href="#"
            className="absolute right-3 top-3 text-3xl text-white font-bold"
            onClick={() => setSidebar(false)}
          >
            X
          </a> */}
          <a href="" className="text-white">
            {t('navbar.home')}
          </a>
          <a href="" className="text-white">
            {t('navbar.about')}
          </a>
          <a href="" className="text-white">
            {t('navbar.contact')}
          </a>
          <a href="" className="text-white">
            {t('navbar.agents')}
          </a>
          <a href="" className="text-white">
            {t('navbar.signIn')}
          </a>
          <a href="" className="text-white">
            {t('navbar.signup')}
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
