import React, { useEffect, useState } from "react";
import AxiosClient from "../AxiosClient";
import { useUserContext } from "../contexts/UserContext";
import UploadWidget from "../components/UploadWidget";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

function AddPost() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(null);
  const { user } = useUserContext();
  const [lat, setLat] = useState("");
  const [len, setLen] = useState("");
  const [avatarURL, setAvatarURL] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Check identity status before allowing post creation
    if (user && user.identity_status !== "approved") {
      navigate("/identity-verification");
      return;
    }

    AxiosClient.get("/property").then((response) => {
      setProperties(response.data);
      setLoading(false);
    });
  }, [user, navigate]);
  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);
    const payload = {
      user_id: user.id,
      title: inputs["title"],
      price: parseInt(inputs["price"]),
      address: inputs.address,
      description: inputs["des"],
      city: inputs["city"],
      bedrooms: parseInt(inputs["bed-num"]),
      bathrooms: parseInt(inputs["bath-num"]),
      latitude: lat,
      longitude: len,
      type: inputs["type"],
      porperty_id: parseInt(inputs["prop"]),
      utilities_policy: inputs["utl-policy"],
      pet_policy: inputs["pet-policy"] == "true",
      income_policy: inputs["income-policy"],
      total_size: parseInt(inputs["total-size"]),
      bus: parseInt(inputs["bus"]),
      resturant: parseInt(inputs["resturant"]),
      school: parseInt(inputs["school"]),
      images: avatarURL,
    };
    setErrors(null);
    AxiosClient.post("/post", payload)
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message?.includes("Identity verification")
        ) {
          // Identity verification required
          navigate("/identity-verification");
          return;
        }
        setErrors(
          error.response?.data?.errors || {
            general: [error.response?.data?.message || "Failed to create post"],
          }
        );
      });
  };
  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLen(position.coords.longitude);

        // console.log('Latitude:', latitude);
        // console.log('Longitude:', longitude);
      },
      (error) => {
        console.error("Error getting location:", error.message);
      }
    );
  };

  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)] overflow-hidden"
    >
      <div className="inputs lg:w-3/5 lg:pr-10 flex flex-col gap-12 mb-3 overflow-y-scroll relative">
        <h2 className="font-bold text-3xl">{t("addPost.title")}</h2>
        {errors && (
          <div className="bg-red-500 text-white p-3 rounded-md">
            {Object.keys(errors).map((e, i) => {
              return <p key={i}>{errors[e][0]}</p>;
            })}
          </div>
        )}
        {loading ? (
          <div className="absolute top-1/2 right-1/2 font-bold text-3xl text-green-600">
            {t("common.loading")}
          </div>
        ) : (
          <form
            className="items flex gap-y-5 gap-x-2 justify-between flex-wrap items-center"
            onSubmit={onSubmit}
          >
            <div className="title-item flex flex-col">
              <label htmlFor="title" className="font-semibold text-sm">
                {t("addPost.titleLabel")}
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="price-item flex flex-col">
              <label htmlFor="price" className="font-semibold text-sm">
                {t("addPost.price")}
              </label>
              <input
                type="number"
                name="price"
                id="price"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="address-item flex flex-col">
              <label htmlFor="address" className="font-semibold text-sm">
                {t("addPost.address")}
              </label>
              <input
                type="text"
                name="address"
                id="address"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="des-item flex flex-col w-full outline-none">
              <label htmlFor="des" className="font-semibold text-sm">
                {t("addPost.description")}
              </label>
              <textarea
                name="des"
                id="des"
                className="h-[200px] w-full border border-black rounded-md resize-none py-5 px-3 outline-none"
              ></textarea>
            </div>
            <div className="city-item flex flex-col">
              <label htmlFor="city" className="font-semibold text-sm">
                {t("addPost.city")}
              </label>
              <input
                type="text"
                name="city"
                id="city"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="bed-item flex flex-col">
              <label htmlFor="bed-num" className="font-semibold text-sm">
                {t("addPost.bedroomNumber")}
              </label>
              <input
                type="number"
                name="bed-num"
                id="bed-num"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="bath-item flex flex-col">
              <label htmlFor="bath-num" className="font-semibold text-sm">
                {t("addPost.bathroomNumber")}
              </label>
              <input
                type="number"
                name="bath-num"
                id="bath-num"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="lat-item flex flex-col">
              <label htmlFor="lat" className="font-semibold text-sm">
                {t("addPost.latitude")}
              </label>
              <input
                type="text"
                name="lat"
                id="lat"
                value={lat}
                onChange={(e) => {
                  setLat(e.currentTarget.value);
                }}
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="len-item flex flex-col">
              <label htmlFor="len" className="font-semibold text-sm">
                {t("addPost.longitude")}
              </label>
              <input
                type="text"
                name="len"
                id="len"
                value={len}
                onChange={(e) => {
                  setLen(e.currentTarget.value);
                }}
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="type-item flex flex-col">
              <label htmlFor="type" className="font-semibold text-sm">
                {t("addPost.type")}
              </label>
              <select
                type="text"
                name="type"
                id="type"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              >
                <option value="rent">{t("search.rent")}</option>
                <option value="buy">{t("search.buy")}</option>
              </select>
            </div>
            <div className="property-item flex flex-col">
              <label htmlFor="prop" className="font-semibold text-sm">
                {t("addPost.property")}
              </label>
              <select
                type="text"
                name="prop"
                id="prop"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              >
                {properties.map((e) => {
                  return (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="utilities-item flex flex-col">
              <label htmlFor="utl-policy" className="font-semibold text-sm">
                {t("addPost.utilitiesPolicy")}
              </label>
              <select
                type="text"
                name="utl-policy"
                id="utl-policy"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              >
                <option value="owner">{t("addPost.ownerResponsible")}</option>
                <option value="tenant">{t("addPost.tenantResponsible")}</option>
                <option value="share">{t("addPost.shared")}</option>
              </select>
            </div>
            <div className="pet-item flex flex-col">
              <label htmlFor="pet-policy" className="font-semibold text-sm">
                {t("addPost.petPolicy")}
              </label>
              <select
                type="text"
                name="pet-policy"
                id="pet-policy"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              >
                <option value="true">{t("addPost.allowed")}</option>
                <option value="false">{t("addPost.notAllowed")}</option>
              </select>
            </div>
            <div className="income-item flex flex-col">
              <label htmlFor="income-policy" className="font-semibold text-sm">
                {t("addPost.incomePolicy")}
              </label>
              <input
                type="number"
                name="income-policy"
                id="income-policy"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="total-size-item flex flex-col">
              <label htmlFor="total-size" className="font-semibold text-sm">
                {t("addPost.totalSize")}
              </label>
              <input
                type="number"
                name="total-size"
                id="total-size"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="school-item flex flex-col">
              <label htmlFor="school" className="font-semibold text-sm">
                {t("addPost.school")}
              </label>
              <input
                type="number"
                name="school"
                id="school"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="resturant-item flex flex-col">
              <label htmlFor="resturant" className="font-semibold text-sm">
                {t("addPost.restaurant")}
              </label>
              <input
                type="number"
                name="resturant"
                id="resturant"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <div className="bus-item flex flex-col">
              <label htmlFor="bus" className="font-semibold text-sm">
                {t("addPost.bus")}
              </label>
              <input
                type="number"
                name="bus"
                id="bus"
                className="border border-black outline-none py-5 px-3 rounded-md w-[230px]"
              />
            </div>
            <button className="bg-green-600 h-[86px] text-white font-semibold rounded-md w-[230px] hover:bg-green-800 transition">
              {t("addPost.create")}
            </button>
            <div
              className="bg-green-600 h-[86px] text-white font-semibold rounded-md 
              w-[230px] flex justify-center items-center cursor-pointer transition hover:bg-green-800"
              onClick={handleLocation}
            >
              {t("addPost.currentLocation")}
            </div>
          </form>
        )}
      </div>
      <div className="right flex-1 md:bg-[#fcf5f3] overflow-y-scroll h-auto px-2 flex justify-center items-center">
        <UploadWidget setAvatarURL={setAvatarURL} />
      </div>
    </div>
  );
}

export default AddPost;
