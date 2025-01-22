import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/middleware/authMiddleware';

function Profile() {
    const [user, setUser] = useState(null);
    const [newProfileImage, setNewProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        // Fetch user data from localStorage or API
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Set profile image for Google users or empty for email sign-in
            if (parsedUser.profileImage) {
                setImagePreview(parsedUser.profileImage);
            } else {
                setImagePreview('/avatar-placeholder.png'); // Placeholder image
            }
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadSuccess(false);
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadSuccess(false);
            return;
        }

        if (file) {
            setNewProfileImage(file);

            // Preview the uploaded image
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result); // Update the main profile image preview
                setIsModalOpen(true); // Open confirmation modal
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (newProfileImage) {
            const formData = new FormData();
            formData.append('profileImage', newProfileImage);

            try {
                const response = await fetch('http://localhost:4000/api/profile/uploadProfileImage', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setUser({ ...user, profileImage: data.profileImage });
                    localStorage.setItem(
                        'user',
                        JSON.stringify({ ...user, profileImage: data.profileImage })
                    );
                    setImagePreview(data.profileImage);
                    setIsModalOpen(false); // Close modal after successful upload
                    setUploadSuccess(true); // Indicate success
                } else {
                    setUploadSuccess(false);
                }
            } catch (error) {
                console.error('Error uploading profile image:', error);
                setUploadSuccess(false);
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="bg-[#13111C] rounded-2xl p-6 shadow-lg border border-purple-900/20">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Profile
                </h1>
                {user ? (
                    <div className="mt-6">
                        <div className="flex items-center gap-8">
                            {/* Main Profile Image */}
                            <div
                                className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer"
                                onClick={() => document.getElementById('profileImageInput').click()}
                            >
                                <img
                                    src={imagePreview || '/avatar-placeholder.png'} // Show placeholder if no image
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="ml-6">
                                <h2 className="text-lg font-bold text-white">
                                    {user.name}
                                </h2>
                                <p className="text-gray-400">{user.email}</p>
                            </div>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            id="profileImageInput"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <p className="text-gray-400 mt-6">Loading user data...</p>
                )}
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1E1B29] rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">Confirm Changes</h3>
                        <p className="text-gray-400">Do you want to update your profile image?</p>
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={handleSaveProfile}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {uploadSuccess && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg">
                    Profile image updated successfully!
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(Profile);
