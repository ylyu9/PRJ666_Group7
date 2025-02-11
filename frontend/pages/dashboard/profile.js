import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { withAuth } from "../../middleware/authMiddleware";
import Image from "next/image";

function Profile() {
  const [user, setUser] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    height: "",
    weight: "",
    contactNumber: "",
    location: "",
    trainingExperience: "",
    allergies: [],
    proteinPreference: [],
  });
  const [newAllergy, setNewAllergy] = useState("");
  const [newProtein, setNewProtein] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    height: "",
    weight: "",
    contactNumber: "",
    location: "",
    trainingExperience: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/profile/getUserProfile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await response.json();

        if (response.ok) {
          console.log("User data received:", data.user);
          setUser(data.user);
          setFormData({
            fullName: data.user.fullName || "",
            height: data.user.height || "",
            weight: data.user.weight || "",
            contactNumber: data.user.contactNumber || "",
            location: data.user.location || "",
            trainingExperience: data.user.trainingExperience || "",
            allergies: data.user.allergies || [],
            proteinPreference: data.user.proteinPreference || [],
          });
          if (data.user.profileImage) {
            setImagePreview(data.user.profileImage);
          }

          // Check profile completion status
          const completionResponse = await fetch(
            "http://localhost:4000/api/profile/checkProfileCompletion",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          const completionData = await completionResponse.json();
          setProfileComplete(completionData.profileComplete);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    setNewProfileImage(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileImage = async () => {
    if (newProfileImage) {
      const formData = new FormData();
      formData.append("profileImage", newProfileImage);

      try {
        const response = await fetch(
          "http://localhost:4000/api/profile/uploadProfileImage",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await response.json();
        if (response.ok) {
          // Update both user state and localStorage with the new profile image
          const updatedUser = { ...user, profileImage: data.profileImage };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setImagePreview(data.profileImage);
          setIsModalOpen(false);
          setUploadSuccess(true);

          // Show success notification
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
      }
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setNewAllergy("");
    setNewProtein("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    // Convert height and weight to numbers
    if (name === "height" || name === "weight") {
      setFormData({ ...formData, [name]: value ? Number(value) : "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy("");
    }
  };

  const handleAddProtein = () => {
    if (newProtein.trim()) {
      setFormData({
        ...formData,
        proteinPreference: [...formData.proteinPreference, newProtein.trim()],
      });
      setNewProtein("");
    }
  };

  const handleRemoveAllergy = (indexToRemove) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(
        (_, index) => index !== indexToRemove,
      ),
    });
  };

  const handleRemoveProtein = (indexToRemove) => {
    setFormData({
      ...formData,
      proteinPreference: formData.proteinPreference.filter(
        (_, index) => index !== indexToRemove,
      ),
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Validate height
    if (!formData.height) {
      newErrors.height = "Height is required";
      isValid = false;
    } else if (isNaN(formData.height) || formData.height <= 0) {
      newErrors.height = "Please enter a valid height";
      isValid = false;
    }

    // Validate weight
    if (!formData.weight) {
      newErrors.weight = "Weight is required";
      isValid = false;
    } else if (isNaN(formData.weight) || formData.weight <= 0) {
      newErrors.weight = "Please enter a valid weight";
      isValid = false;
    }

    // Validate contactNumber
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      isValid = false;
    }

    // Validate location
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    // Validate trainingExperience
    if (!formData.trainingExperience.trim()) {
      newErrors.trainingExperience = "Training experience is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveProfileInfo = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/profile/updatePersonalInfo",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Fetch fresh profile data after update
      const profileResponse = await fetch(
        "http://localhost:4000/api/profile/getUserProfile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const profileData = await profileResponse.json();

      if (profileResponse.ok) {
        // Update both user state and localStorage with fresh data
        setUser(profileData.user);
        localStorage.setItem("user", JSON.stringify(profileData.user));
        setEditMode(false);
        setUploadSuccess(true);

        // Show success notification
        setShowSuccess(true);
        // Hide success notification after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      // You can implement a custom error notification here if needed
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanBadgeStyle = (plan) => {
    switch (plan?.toLowerCase()) {
      case "premium":
        return "bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 text-yellow-400 border border-yellow-400/20";
      case "pro":
        return "bg-gradient-to-r from-purple-400/10 to-violet-600/10 text-purple-400 border border-purple-400/20";
      default:
        return "bg-gradient-to-r from-gray-400/10 to-gray-600/10 text-gray-400 border border-gray-400/20";
    }
  };

  const ProfileSkeleton = () => (
    <div className="animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative mx-4 mt-4">
        <div className="relative bg-[#1E1B29] rounded-2xl shadow-xl border border-purple-900/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-[#1E1B29] to-[#1E1B29]"></div>
          <div className="relative py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Image Skeleton */}
                <div className="w-40 h-40 rounded-full bg-purple-500/10"></div>
                {/* User Info Skeleton */}
                <div className="md:ml-8">
                  <div className="h-8 w-48 bg-purple-500/10 rounded-lg mb-2"></div>
                  <div className="h-4 w-32 bg-purple-500/10 rounded-lg mb-2"></div>
                  <div className="h-6 w-28 bg-purple-500/10 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card Skeleton */}
          <div className="bg-[#1E1B29] p-8 rounded-xl shadow-xl border border-purple-900/20">
            <div className="h-8 w-48 bg-purple-500/10 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-purple-500/10 rounded-lg"></div>
                  <div className="h-6 w-full bg-purple-500/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences Card Skeleton */}
          <div className="bg-[#1E1B29] p-8 rounded-xl shadow-xl border border-purple-900/20">
            <div className="h-8 w-48 bg-purple-500/10 rounded-lg mb-6"></div>
            {/* Allergies Section */}
            <div className="mb-8">
              <div className="h-6 w-32 bg-purple-500/10 rounded-lg mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-purple-500/10 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
            {/* Protein Preferences Section */}
            <div>
              <div className="h-6 w-32 bg-purple-500/10 rounded-lg mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-purple-500/10 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <>
          {/* Hero Section with Gradient */}
          <div className="relative mx-4 mt-4">
            {/* Hero Content */}
            <div className="relative bg-[#1E1B29] rounded-2xl shadow-xl border border-purple-900/20 hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-[#1E1B29] to-[#1E1B29]"></div>
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
              <div className="relative py-16">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Profile Image Section */}
                    <div className="group relative">
                      <div
                        className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500/30 cursor-pointer 
                                                         hover:border-purple-500 transition-all duration-300 shadow-xl"
                        onClick={() =>
                          document.getElementById("profileImageInput").click()
                        }
                      >
                        <Image
                          src={imagePreview || "/avatar-placeholder.png"}
                          alt="Profile"
                          width={160}
                          height={160}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            Change Photo
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        id="profileImageInput"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    {/* User Info */}
                    <div className="md:ml-8">
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {formData.fullName || "Your Profile"}
                      </h1>
                      <p className="text-purple-200/80">{user?.email}</p>
                      {/* Add Subscription Plan Badge */}
                      <div className="mt-2 mb-4">
                        <span
                          className={`
                                                    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                                    ${getPlanBadgeStyle(user?.plan)}
                                                `}
                        >
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {`${user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : "Basic"} Plan`}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={handleEditToggle}
                          className={`px-6 py-2 rounded-lg text-white transition-all duration-300 ${
                            editMode
                              ? "bg-gray-600 hover:bg-gray-700"
                              : "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                          } shadow-lg hover:shadow-purple-500/25`}
                        >
                          {editMode ? "Cancel" : "Edit Profile"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Status */}
          <div className="max-w-7xl mx-auto px-4 mb-8">
            <div
              className={`rounded-xl p-4 flex items-center gap-4 ${
                profileComplete
                  ? "bg-green-400/10 border border-green-400/20"
                  : "bg-yellow-400/10 border border-yellow-400/20"
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${
                  profileComplete
                    ? "bg-gradient-to-br from-green-400/10 to-green-600/10 border-green-400/20"
                    : "bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400/20"
                }`}
              >
                {profileComplete ? (
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-medium ${
                    profileComplete ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {profileComplete ? "Profile Complete" : "Profile Incomplete"}
                </h3>
                <p className="text-gray-300 mt-1">
                  {profileComplete
                    ? "Your profile is complete and up to date."
                    : "Please fill in all required information to complete your profile."}
                </p>
              </div>
              {!profileComplete && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 rounded-lg text-white font-medium
                                             bg-gradient-to-r from-yellow-500 to-yellow-600 
                                             hover:from-yellow-600 hover:to-yellow-700 
                                             transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                >
                  Complete Now
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Card */}
              <div className="bg-[#1E1B29] p-8 rounded-xl shadow-xl border border-purple-900/20 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text">
                    Personal Information
                  </h2>
                </div>
                {editMode ? (
                  <>
                    <div className="grid gap-6">
                      {[
                        {
                          label: "Full Name",
                          name: "fullName",
                          placeholder: "Enter your full name",
                          type: "text",
                        },
                        {
                          label: "Height (cm)",
                          name: "height",
                          placeholder: "Enter your height",
                          type: "number",
                        },
                        {
                          label: "Weight (kg)",
                          name: "weight",
                          placeholder: "Enter your weight",
                          type: "number",
                        },
                        {
                          label: "Contact Number",
                          name: "contactNumber",
                          placeholder: "Enter your contact number",
                          type: "tel",
                        },
                        {
                          label: "Location",
                          name: "location",
                          placeholder: "Enter your location",
                          type: "text",
                        },
                        {
                          label: "Experience",
                          name: "trainingExperience",
                          placeholder: "Enter your training experience",
                          type: "text",
                        },
                      ].map(({ label, name, placeholder, type }) => (
                        <div key={name} className="relative">
                          <label className="block text-sm font-medium text-gray-300 mb-1.5">
                            {label}
                          </label>
                          <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleInputChange}
                            placeholder={placeholder}
                            className={`
                                                            w-full bg-[#2A2635] text-white px-4 py-3 rounded-lg
                                                            border ${errors[name] ? "border-red-500" : "border-purple-500/30"}
                                                            focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50
                                                            placeholder-gray-500 transition-all duration-200
                                                        `}
                          />
                          {errors[name] && (
                            <div className="absolute -bottom-5 left-0">
                              <p className="text-red-400 text-xs mt-1 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {errors[name]}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={handleSaveProfileInfo}
                        disabled={isSaving}
                        className={`
                                                    w-full py-3 rounded-lg text-white font-medium
                                                    transition-all duration-300 transform hover:scale-[1.02]
                                                    ${
                                                      isSaving
                                                        ? "bg-gray-600 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                                    }
                                                    shadow-lg hover:shadow-green-500/25
                                                    flex items-center justify-center space-x-2
                                                `}
                      >
                        {isSaving ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: "Full Name", value: formData.fullName },
                      {
                        label: "Height",
                        value: formData.height ? `${formData.height} cm` : "-",
                      },
                      {
                        label: "Weight",
                        value: formData.weight ? `${formData.weight} kg` : "-",
                      },
                      {
                        label: "Contact",
                        value: formData.contactNumber || "-",
                      },
                      { label: "Location", value: formData.location || "-" },
                      {
                        label: "Experience",
                        value: formData.trainingExperience || "-",
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-400">{label}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferences Card */}
              <div className="bg-[#1E1B29] p-8 rounded-xl shadow-xl border border-purple-900/20 hover:border-purple-500/30 transition-all duration-300">
                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text mb-6">
                  Diet & Preferences
                </h2>

                {/* Allergies Section */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Allergies
                    </h3>
                    {editMode && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          placeholder="Add allergy"
                          className="bg-[#2A2635] text-white px-3 py-1 rounded-lg border border-purple-500/30 
                                                             focus:border-purple-500 focus:outline-none text-sm"
                        />
                        <button
                          onClick={handleAddAllergy}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg 
                                                             transition-colors duration-200 text-sm flex items-center"
                        >
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between bg-[#2A2635] px-4 py-3 rounded-lg border border-purple-500/10 
                                                  hover:border-purple-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-400 group-hover:bg-red-500 transition-colors"></div>
                          <span className="ml-3 text-gray-300 text-sm">
                            {allergy}
                          </span>
                        </div>
                        {editMode && (
                          <button
                            onClick={() => handleRemoveAllergy(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.allergies.length === 0 && (
                      <div className="col-span-2">
                        <p className="text-gray-500 italic text-sm">
                          No allergies listed
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Protein Preferences Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Protein Preferences
                    </h3>
                    {editMode && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newProtein}
                          onChange={(e) => setNewProtein(e.target.value)}
                          placeholder="Add protein"
                          className="bg-[#2A2635] text-white px-3 py-1 rounded-lg border border-purple-500/30 
                                                             focus:border-purple-500 focus:outline-none text-sm"
                        />
                        <button
                          onClick={handleAddProtein}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg 
                                                             transition-colors duration-200 text-sm flex items-center"
                        >
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {formData.proteinPreference.map((protein, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between bg-[#2A2635] px-4 py-3 rounded-lg border border-purple-500/10 
                                                  hover:border-purple-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-400 group-hover:bg-green-500 transition-colors"></div>
                          <span className="ml-3 text-gray-300 text-sm">
                            {protein}
                          </span>
                        </div>
                        {editMode && (
                          <button
                            onClick={() => handleRemoveProtein(index)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.proteinPreference.length === 0 && (
                      <div className="col-span-2">
                        <p className="text-gray-500 italic text-sm">
                          No protein preferences listed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed bottom-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-up">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Image Upload Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#1E1B29] p-8 rounded-xl shadow-2xl border border-purple-500/20 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-white mb-4">
                  Update Profile Picture
                </h3>
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover rounded-full border-4 border-purple-500/30"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfileImage}
                    className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-violet-500 
                                                 hover:from-purple-600 hover:to-violet-600 transition-all duration-300 
                                                 shadow-lg hover:shadow-purple-500/25"
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default withAuth(Profile);
