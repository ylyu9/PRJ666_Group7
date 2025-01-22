import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { withAuth } from '@/middleware/authMiddleware';
import { Switch } from '@headlessui/react';
import { BellIcon, GlobeAltIcon, ShieldCheckIcon, UserIcon, KeyIcon } from '@heroicons/react/24/outline';

function Settings() {
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState({
        // Notification Settings
        emailNotifications: true,
        pushNotifications: false,
        workoutReminders: true,
        progressUpdates: true,
        newsletterSubscription: false,

        // Appearance Settings
        darkMode: true,
        compactView: false,
        animationsEnabled: true,

        // Privacy Settings
        profileVisibility: 'public',
        shareProgress: true,
        shareWorkouts: false,

        // Regional Settings
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        measurementUnit: 'metric', // metric or imperial
        dateFormat: 'DD/MM/YYYY',

        // Workout Settings
        workoutDifficulty: 'intermediate',
        workoutRemindersTime: '08:00',
        restDayNotifications: true
    });

    useEffect(() => {
        // Load user data
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Load saved settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'nl', name: 'Dutch' },
        { code: 'pl', name: 'Polish' }
    ];

    const SettingsSection = ({ title, icon: Icon, children }) => (
        <div className="bg-[#13111C] rounded-2xl p-6 shadow-lg border border-purple-900/20">
            <div className="flex items-center gap-3 mb-6">
                <Icon className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {title}
                </h2>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );

    const ToggleOption = ({ title, description, value, onChange }) => (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-medium text-white">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <Switch
                checked={value}
                onChange={onChange}
                className={`${
                    value ? 'bg-purple-600' : 'bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
                <span className="sr-only">Enable {title}</span>
                <span
                    className={`${
                        value ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </Switch>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Notification Settings */}
                <SettingsSection title="Notifications" icon={BellIcon}>
                    <ToggleOption
                        title="Email Notifications"
                        description="Receive email updates about your progress"
                        value={settings.emailNotifications}
                        onChange={(value) => handleSettingChange('emailNotifications', value)}
                    />
                    <ToggleOption
                        title="Push Notifications"
                        description="Get push notifications for important updates"
                        value={settings.pushNotifications}
                        onChange={(value) => handleSettingChange('pushNotifications', value)}
                    />
                    <ToggleOption
                        title="Workout Reminders"
                        description="Get reminded about your scheduled workouts"
                        value={settings.workoutReminders}
                        onChange={(value) => handleSettingChange('workoutReminders', value)}
                    />
                    <ToggleOption
                        title="Progress Updates"
                        description="Receive weekly progress reports"
                        value={settings.progressUpdates}
                        onChange={(value) => handleSettingChange('progressUpdates', value)}
                    />
                </SettingsSection>

                {/* Regional Settings */}
                <SettingsSection title="Regional Settings" icon={GlobeAltIcon}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="language" className="block text-lg font-medium text-white">
                                Language
                            </label>
                            <select
                                id="language"
                                value={settings.language}
                                onChange={(e) => handleSettingChange('language', e.target.value)}
                                className="mt-1 block w-full rounded-md bg-[#1E1B29] border border-purple-900/20 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="measurementUnit" className="block text-lg font-medium text-white">
                                Measurement Unit
                            </label>
                            <select
                                id="measurementUnit"
                                value={settings.measurementUnit}
                                onChange={(e) => handleSettingChange('measurementUnit', e.target.value)}
                                className="mt-1 block w-full rounded-md bg-[#1E1B29] border border-purple-900/20 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="metric">Metric (kg, km)</option>
                                <option value="imperial">Imperial (lb, mi)</option>
                            </select>
                        </div>
                    </div>
                </SettingsSection>

                {/* Privacy Settings */}
                <SettingsSection title="Privacy & Security" icon={ShieldCheckIcon}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="profileVisibility" className="block text-lg font-medium text-white">
                                Profile Visibility
                            </label>
                            <select
                                id="profileVisibility"
                                value={settings.profileVisibility}
                                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                className="mt-1 block w-full rounded-md bg-[#1E1B29] border border-purple-900/20 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="public">Public</option>
                                <option value="friends">Friends Only</option>
                                <option value="private">Private</option>
                            </select>
                        </div>
                        <ToggleOption
                            title="Share Progress"
                            description="Allow others to see your fitness progress"
                            value={settings.shareProgress}
                            onChange={(value) => handleSettingChange('shareProgress', value)}
                        />
                    </div>
                </SettingsSection>

                {/* Account Settings */}
                <SettingsSection title="Account" icon={UserIcon}>
                    <div className="space-y-4">
                        <button
                            className="w-full px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200"
                            onClick={() => {
                                // Implement password change logic
                            }}
                        >
                            Change Password
                        </button>
                        <button
                            className="w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/10 rounded-xl transition-all duration-200"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                    // Add account deletion API call here
                                }
                            }}
                        >
                            Delete Account
                        </button>
                    </div>
                </SettingsSection>
            </div>
        </DashboardLayout>
    );
}

export default withAuth(Settings); 