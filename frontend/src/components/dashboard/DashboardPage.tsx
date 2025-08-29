import { ChartBarIcon, MicrophoneIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export function DashboardPage() {
  const stats = [
    {
      name: 'Questions Asked',
      value: '47',
      icon: MicrophoneIcon,
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: 'Sessions Today',
      value: '8',
      icon: ClockIcon,
      change: '+3',
      changeType: 'increase',
    },
    {
      name: 'URLs Processed',
      value: '23',
      icon: DocumentTextIcon,
      change: '+5',
      changeType: 'increase',
    },
    {
      name: 'Avg Response Time',
      value: '2.4s',
      icon: ChartBarIcon,
      change: '-0.3s',
      changeType: 'decrease',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your Voice Q&A assistant today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', action: 'Question answered about React hooks' },
              { time: '15 minutes ago', action: 'New URLs processed from tech blog' },
              { time: '1 hour ago', action: 'Voice settings updated to ElevenLabs' },
              { time: '3 hours ago', action: 'Session started with 5 URLs' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}