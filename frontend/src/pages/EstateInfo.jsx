import Slider from '../components/Slider';
import Map from '../components/Map';
import AxiosClient from '../AxiosClient';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useUserContext } from '../contexts/UserContext';
import { useEffect, useState } from 'react';
import Notification from '../components/Notification';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../contexts/PopupContext';

function EstateInfo() {
  const postDetails = useLoaderData();
  const { token, user, setMessage, message, setMessageStatus, messageStatus } =
    useUserContext();
  const [isSaved, setIsSaved] = useState(false);
  const [bookingRequested, setBookingRequested] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { language, t } = useLanguage();
  const { showToast, showConfirm } = usePopup();

  useEffect(() => {
    if (token) {
      setLoading(true);
      AxiosClient.get('/is-post-saved', {
        params: {
          user_id: user.id,
          post_id: postDetails.post.id,
        },
      }).then((response) => {
        setIsSaved(response.data.saved);
        setLoading(false);
      });
    }
  }, []);

  const handleSave = () => {
    if (!token) navigate('/login');

    const payload = {
      user_id: user.id,
      post_id: postDetails.post.id,
    };

    if (isSaved) {
      AxiosClient.delete('/saved-posts', {
        params: {
          user_id: user.id,
          post_id: postDetails.post.id,
        },
      }).then(() => {
        setIsSaved(false);
      });
    } else {
      AxiosClient.post('/saved-posts', payload)
        .then(() => {
          setIsSaved(true);
        })
        .catch((error) => {
          if (error.response.status == 403) {
            setMessageStatus(false);
            setMessage(error.response.data.message);
          }
        });
    }
  };

  const handleRequestBooking = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user owns the apartment
    if (user.id === postDetails.post.user_id) {
      showToast(t('booking.cannotBookOwn') || "You can't book your own apartment", 'error');
      return;
    }

    const confirmed = await showConfirm({
      title: t('booking.requestBooking') || 'Request Booking',
      message: t('booking.confirmRequest') || `Are you sure you want to request booking for ${postDetails.post.Title}?`,
      confirmText: t('booking.request') || 'Request',
      cancelText: t('admin.cancel') || 'Cancel',
    });

    if (confirmed) {
      setLoading(true);
      AxiosClient.post('/booking-requests', {
        post_id: postDetails.post.id,
        message: '',
      })
        .then(() => {
          showToast(t('booking.requestSubmitted') || 'Booking request submitted successfully', 'success');
          setBookingRequested(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error submitting booking request:', error);
          showToast(error.response?.data?.message || t('booking.errorSubmitting') || 'Error submitting request', 'error');
          setLoading(false);
        });
    }
  };
  return (
    <div
      className="relative px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px] overflow-hidden
     lg:flex lg:justify-between h-[calc(100vh-100px)] max-lg:overflow-y-scroll"
    >
      {loading ? (
        <div className={`text-3xl text-green-600 font-bold absolute top-1/2 ${
          language === 'ar' 
            ? 'left-1/2 -translate-x-1/2' 
            : 'right-1/2 translate-x-1/2'
        }`}>
          Loading...
        </div>
      ) : (
        <>
          <div className={`lg:w-3/5 max-lg:mb-5 ${
            language === 'ar' ? 'lg:pl-14' : 'lg:pr-14'
          }`}>
            <Slider images={postDetails.post.images} />
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-3xl">{postDetails.post.Title}</h2>
                <span className="flex text-sm items-center gap-1 text-[#444]">
                  <img src="/public/pin.png" alt="" className="w-4" />
                  {postDetails.post.Address}
                </span>
                <span className="bg-yellow-100 p-1 text-xl w-fit rounded-md font-light">
                  $ {postDetails.post.Price}
                </span>
              </div>
              <div
                className="user-info py-3 px-8 bg-yellow-100 flex flex-col gap-3
          justify-center items-center rounded-md"
              >
                <img
                  src={postDetails.user.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{postDetails.user.name}</span>
              </div>
            </div>
            <p className="mt-5 leading-5 text-sm">
              {postDetails.post.Description}
            </p>
          </div>
          <div className="flex-1 bg-[#fcf5f3] px-5 max-md:mb-5 max-md:py-5">
            <div className="flex flex-col gap-4">
              <h2 className="font-bold">General</h2>
              <div className="bg-white rounded-md px-3 py-2 flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <img src="/public/utility.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Utilities</p>
                    <span className="text-sm">
                      {postDetails.post.utilities_policy} is responsible
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/pet.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Pet Policy</p>
                    <span className="text-sm">
                      {postDetails.post.pet_policy ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/fee.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Property Fees</p>
                    <span className="text-sm">
                      Must have jx the rent in totoal house hold income
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="font-bold">Room Sizes</h2>
              <div className="flex justify-between">
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/size.png" alt="" className="w-6" />
                  <span>{postDetails.post.total_size}</span>
                </div>
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/bed.png" alt="" className="w-6" />
                  <span>{postDetails.post.Bedrooms} bed</span>
                </div>
                <div className="bg-white p-2 rounded-sm flex gap-2">
                  <img src="/public/bath.png" alt="" className="w-6" />
                  <span>{postDetails.post.Bathrooms} bathroom</span>
                </div>
              </div>

              <h2 className="font-bold">Nearby Places</h2>
              <div className="bg-white rounded-md px-3 py-2 flex justify-between">
                <div className="flex gap-2 items-center">
                  <img src="/public/school.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">School</p>
                    <span className="text-sm">{postDetails.post.school}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/bus.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">But Stop</p>
                    <span className="text-sm">{postDetails.post.bus}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <img src="/public/restaurant.png" alt="" className="w-6" />
                  <div>
                    <p className="font-bold -mb-1">Resturant</p>
                    <span className="text-sm">
                      {postDetails.post.resturant}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="font-bold">Location</h2>
              <div className="w-full h-44">
                <Map data={[postDetails.post]} />
              </div>

              <div className="buttons flex flex-col gap-3">
                {user && user.id !== postDetails.post.user_id && postDetails.post.status !== 'rented' && (
                  <button
                    onClick={handleRequestBooking}
                    disabled={loading || bookingRequested}
                    className={`w-full p-4 flex gap-2 items-center justify-center cursor-pointer rounded-md transition ${
                      bookingRequested 
                        ? 'bg-green-500 text-white' 
                        : 'bg-yellow-300 hover:bg-yellow-400 text-[#444]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="font-semibold text-sm">
                      {bookingRequested 
                        ? (t('booking.requested') || 'Request Submitted') 
                        : (t('booking.requestBooking') || 'Request Booking')}
                    </span>
                  </button>
                )}
                <div className="flex justify-between items-center gap-3">
                  <div className="border p-4 flex gap-2 bg-white items-center cursor-pointer border-[#fece51] rounded-md">
                    <img src="/public/chat.png" alt="" className="w-4" />
                    <span className="font-semibold text-sm">Send a Message</span>
                  </div>
                  <div
                    className={`border p-4 flex gap-2 ${
                      isSaved ? 'bg-green-500 text-white' : 'bg-white'
                    }  items-center cursor-pointer border-[#fece51] rounded-md`}
                    onClick={handleSave}
                  >
                    <img src="/public/save.png" alt="" className="w-4" />
                    <span className="font-semibold text-sm">
                      {isSaved ? 'Saved' : 'Save the Place'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {message && <Notification message={message} status={messageStatus} />}
    </div>
  );
}

export default EstateInfo;
