import React from 'react';
import Searchbar from '../components/Searchbar';
import { useLanguage } from '../contexts/LanguageContext';

function Home() {
  const { t } = useLanguage();
  return (
    <>
      <div className="content-container flex-1 gap-5 flex flex-col justify-center max-md:justify-start">
        <h1 className="max-w-xl text-6xl font-bold lg:pr-14 max-xl:text-5xl">
          {t('home.title')}
        </h1>
        <p className="text-sm lg:pr-24">
          {t('home.description')}
        </p>
        <Searchbar />
        <div className="boxes flex justify-between pr-24 max-md:hidden">
          <div>
            <h1 className="text-4xl font-bold">16+</h1>
            <h2 className="text-xl font-light">{t('home.yearsExperience')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold">200</h1>
            <h2 className="text-xl font-light">{t('home.yearsExperience')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold">2000+</h1>
            <h2 className="text-xl font-light">{t('home.yearsExperience')}</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
