import { motion } from "framer-motion";
import { User, Mail, Calendar, Book, Award, Target } from "lucide-react";

const ProfilePage = () => {
  const stats = [
    { label: "Books Read", value: "24", icon: Book },
    { label: "Reading Streak", value: "12 days", icon: Target },
    { label: "Achievements", value: "8", icon: Award },
  ];

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center shadow-md">
              <User className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">John Doe</h2>
              <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  john.doe@example.com
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Calendar className="h-4 w-4" />
                  Member since Jan 2024
                </div>
              </div>
            </div>
            <button className="px-6 py-2 rounded-lg bg-purple-400 hover:bg-purple-500 text-white font-medium transition-all shadow">
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:scale-105 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <stat.icon className="h-6 w-6 text-purple-500 dark:text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Settings Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Reading Preferences */}
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reading Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Default Font Size</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Adjust reading comfort</div>
                </div>
                <select className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>Small</option>
                  <option selected>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Auto-Night Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Enable dark mode at night</div>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 accent-purple-500" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">New Releases</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Get notified about new books</div>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 accent-purple-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Reading Reminders</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">Daily reading reminders</div>
                </div>
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 accent-purple-500" defaultChecked />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Security</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <div className="font-medium text-gray-900 dark:text-white">Change Password</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Update your password</div>
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">Add extra security</div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
