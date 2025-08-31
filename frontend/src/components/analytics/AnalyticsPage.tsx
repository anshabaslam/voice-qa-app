import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon,
  ClockIcon,
  CubeIcon,
  CurrencyDollarIcon,
  MicrophoneIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DocsSidebar } from '../DocsSidebar';

// Activity Chart Component
const ActivityChart = () => {
  const chartConfig = {
    series: [
      {
        name: "Revenue",
        data: [44, 55, 57, 56, 61, 58, 63],
      },
      {
        name: "Profit",
        data: [76, 85, 101, 98, 87, 105, 91],
      },
      {
        name: "Expenses",
        data: [35, 41, 36, 26, 45, 48, 52],
      },
    ],
    options: {
      colors: ["#3B82F6", "#10B981", "#F59E0B"],
      chart: {
        parentHeightOffset: 0,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded" as const,
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#3B82F6", "#10B981", "#F59E0B"],
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        labels: {
          style: {
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: true,
          color: "#374151",
        },
        axisTicks: {
          show: true,
          color: "#374151",
        },
      },
      yaxis: {
        title: {
          text: "Amount ($)",
        },
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      fill: {
        type: "solid",
        opacity: 0.3,
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return "$" + val + "k";
          },
        },
      },
      legend: {
        position: "top" as const,
        horizontalAlign: "right" as const,
        offsetY: -10,
        fontSize: "12px",
      },
      grid: {
        show: true,
        strokeDashArray: 3,
        borderColor: "#374151",
      },
    },
  };

  return (
    <div className="ax-transparent-gridline2">
      <div className="flex h-8 min-w-0 items-center justify-between">
        <h2 className="truncate font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Financial Overview
        </h2>
      </div>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="bar"
        height="270"
      />
    </div>
  );
};

// Area Chart Component
const AreaChart = () => {
  const series = [
    {
      name: "Response Time",
      data: [20, 50, 30, 60, 25, 82],
    },
  ];

  const chartConfig = {
    colors: ["#DC2626"],
    chart: {
      stacked: false,
      parentHeightOffset: 0,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
        top: -20,
        bottom: -10,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.1,
        stops: [20, 100, 100, 100],
      },
    },
    stroke: {
      width: 2,
    },
    tooltip: {
      shared: true,
    },
    legend: {
      show: false,
    },
    yaxis: {
      show: false,
    },
    xaxis: {
      labels: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
  };

  return (
    <div className="row-span-2 flex flex-col">
      <h2 className="min-w-0 px-4 pt-3 font-medium tracking-wide text-gray-800 dark:text-dark-100 sm:px-5">
        Questions
      </h2>
      <p className="grow px-4 mt-1 text-xl font-semibold text-gray-800 dark:text-dark-100 sm:px-5">
        2.4k
      </p>
      <div className="ax-transparent-gridline">
        <Chart type="area" height={140} options={chartConfig} series={series} />
      </div>
    </div>
  );
};

// Stats Component
const Stats = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-2">
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            847
          </p>
          <MicrophoneIcon className="size-5 text-[#2b7fff]" />
        </div>
        <p className="mt-1 text-xs-plus">Questions</p>
      </div>
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            156
          </p>
          <CheckBadgeIcon className="size-5 text-[#00bc7d]" />
        </div>
        <p className="mt-1 text-xs-plus">Sessions</p>
      </div>
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            23
          </p>
          <ClockIcon className="size-5 text-[#ffa71a]" />
        </div>
        <p className="mt-1 text-xs-plus">URLs</p>
      </div>
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            94.2%
          </p>
          <CurrencyDollarIcon className="size-5 text-[#00a6f4]" />
        </div>
        <p className="mt-1 text-xs-plus">Success Rate</p>
      </div>
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            1.8s
          </p>
          <CubeIcon className="text-[#ff2ecf] size-5" />
        </div>
        <p className="mt-1 text-xs-plus">Avg Response</p>
      </div>
      <div className="p-3 lg:p-4 border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="flex justify-between gap-1">
          <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
            47
          </p>
          <UsersIcon className="size-5 text-[#ff4f1a]" />
        </div>
        <p className="mt-1 text-xs-plus">Users</p>
      </div>
    </div>
  );
};

// Welcome Banner Component
const WelcomeBanner = () => {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="relative flex flex-col overflow-hidden rounded-lg bg-gradient-to-br from-info to-info-darker p-3.5">
        <p className="text-xs uppercase text-sky-100">Total Questions</p>
        <div className="flex items-end justify-between space-x-2">
          <p className="mt-4 text-2xl font-medium text-white">2,456</p>
          <a
            href="#"
            className="truncate border-b border-dotted border-current pb-0.5 text-xs font-medium text-sky-100 outline-hidden transition-colors duration-300 hover:text-white focus:text-white"
          >
            View Details
          </a>
        </div>
        <div className="mask is-reuleaux-triangle absolute right-0 top-0 -m-3 size-16 bg-white/20"></div>
      </div>
      <div className="relative flex flex-col overflow-hidden rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 p-3.5">
        <p className="text-xs uppercase text-amber-50">Active Sessions</p>
        <div className="flex items-end justify-between space-x-2">
          <p className="mt-4 text-2xl font-medium text-white">847</p>
          <a
            href="#"
            className="truncate border-b border-dotted border-current pb-0.5 text-xs font-medium text-amber-50 outline-hidden transition-colors duration-300 hover:text-white focus:text-white"
          >
            View Details
          </a>
        </div>
        <div className="mask is-diamond absolute right-0 top-0 -m-3 size-16 bg-white/20"></div>
      </div>
      <div className="relative flex flex-col overflow-hidden rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 p-3.5">
        <p className="text-xs uppercase text-pink-100">Success Rate</p>
        <div className="flex items-end justify-between space-x-2">
          <p className="mt-4 text-2xl font-medium text-white">94.2%</p>
          <a
            href="#"
            className="truncate border-b border-dotted border-current pb-0.5 text-xs font-medium text-pink-100 outline-hidden transition-colors duration-300 hover:text-white focus:text-white"
          >
            View Details
          </a>
        </div>
        <div className="mask is-hexagon-2 absolute right-0 top-0 -m-3 size-16 bg-white/20"></div>
      </div>
    </div>
  );
};

// Current Rating Component
const CurrentRating = () => {
  const chartConfig = {
    series: [85],
    options: {
      colors: ["#10B981"],
      chart: {
        type: "radialBar" as const,
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: false,
        },
      },
      plotOptions: {
        radialBar: {
          startAngle: 0,
          endAngle: 360,
          track: {
            background: "#22C55E40",
            strokeWidth: "100%",
            margin: 0,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "14px",
              fontWeight: "bold",
              color: "#FFFFFF",
              offsetY: 0,
              formatter: function (val: number) {
                return val + "%";
              },
            },
          },
          hollow: {
            size: "70%",
            background: "transparent",
          },
        },
      },
      stroke: {
        lineCap: "round" as const,
      },
    },
  };

  return (
    <div className="border border-gray-300 dark:border-dark-700 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 relative">
          <Chart
            options={chartConfig.options}
            series={chartConfig.series}
            type="radialBar"
            height="80"
            width="80"
          />
        </div>
        <div>
          <div className="text-gray-900 dark:text-white text-sm">Current</div>
          <div className="text-gray-900 dark:text-white text-sm">Rating</div>
        </div>
      </div>
    </div>
  );
};

// Recent Activities Table
const RecentActivitiesTable = () => {
  const [selectedActivity, setSelectedActivity] = useState("");

  // Sample data matching the sales diary structure
  const activitiesData = [
    {
      id: 1,
      user: "John Doe",
      userId: "USR001",
      activity: "Question answered about React hooks",
      details: "Provided detailed explanation about useState and useEffect",
      date: "2025-08-30T10:30:00Z",
      category: "Q&A",
      status: "success",
      avatar: "JD",
      avatarColor: "bg-blue-500",
      responseTime: "2.3s",
      sessionId: "SES001",
      amount: 1,
    },
    {
      id: 2,
      user: "Jane Smith",
      userId: "USR002",
      activity: "New URLs processed from tech blog",
      details: "Added 5 new URLs from TechCrunch to knowledge base",
      date: "2025-08-30T10:15:00Z",
      category: "URL Processing",
      status: "success",
      avatar: "JS",
      avatarColor: "bg-green-500",
      responseTime: "1.8s",
      sessionId: "SES002",
      amount: 5,
    },
    {
      id: 3,
      user: "Mike Johnson",
      userId: "USR003",
      activity: "Voice settings updated to ElevenLabs",
      details: "Changed voice model to Rachel for better pronunciation",
      date: "2025-08-30T09:30:00Z",
      category: "Configuration",
      status: "pending",
      avatar: "MJ",
      avatarColor: "bg-orange-500",
      responseTime: "0.5s",
      sessionId: "SES003",
      amount: 1,
    },
    {
      id: 4,
      user: "Sarah Wilson",
      userId: "USR004",
      activity: "Session started with 5 URLs",
      details: "Initiated new knowledge extraction session",
      date: "2025-08-30T06:30:00Z",
      category: "Session",
      status: "success",
      avatar: "SW",
      avatarColor: "bg-purple-500",
      responseTime: "3.2s",
      sessionId: "SES004",
      amount: 5,
    },
    {
      id: 5,
      user: "Tom Brown",
      userId: "USR005",
      activity: "Analytics report generated",
      details: "Monthly analytics report with performance metrics",
      date: "2025-08-30T00:00:00Z",
      category: "Analytics",
      status: "success",
      avatar: "TB",
      avatarColor: "bg-indigo-500",
      responseTime: "12.4s",
      sessionId: "SES005",
      amount: 1,
    },
  ];

  // Filter data based on selected activity type
  const filteredData =
    selectedActivity === "ALL" || selectedActivity === ""
      ? activitiesData
      : activitiesData.filter((activity) => activity.category === selectedActivity);

  // Column definitions
  const columns = [
    // User column with avatar
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }:any) => {
        const activity = row.original;
        return (
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div
              className={`w-8 h-8 ${activity.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white font-medium text-xs">
                {activity.avatar}
              </span>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-medium text-sm truncate">
                {activity.user}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{activity.userId}</div>
            </div>
          </div>
        );
      },
      size: 200,
    },

    // Date column
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }:any) => {
        const date = new Date(getValue());
        return (
          <div className="flex items-center gap-2">
            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {date.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        );
      },
      size: 140,
    },

    // Activity column
    {
      accessorKey: "activity",
      header: "Activity",
      cell: ({ row }:any) => {
        const activity = row.original;
        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                {activity.activity}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">{activity.category}</div>
            </div>
          </div>
        );
      },
      size: 280,
    },

    // Status column
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }:any) => {
        const activity = row.original;
        const getStatusColor = (status:any) => {
          switch (status) {
            case "success":
              return "text-green-400 bg-green-500/10";
            case "pending":
              return "text-yellow-400 bg-yellow-500/10";
            case "error":
              return "text-red-400 bg-red-500/10";
            default:
              return "text-gray-400 bg-gray-500/10";
          }
        };

        return (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-md text-sm font-medium ${getStatusColor(
                activity.status
              )}`}
            >
              {activity.status}
            </span>
          </div>
        );
      },
      size: 120,
    },

    // Amount column
    {
      accessorKey: "amount",
      header: "Items",
      cell: ({ getValue }:any) => (
        <span className="text-gray-500 dark:text-gray-400 text-sm">{getValue()}</span>
      ),
      size: 80,
    },
  ];

  // Custom expanded content
  const expandedContent = (row:any) => {
    const activity = row.original;
    return (
      <div className="px-4 py-4 bg-gray-900/30 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Details */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-3 text-sm flex items-center gap-2">
              <MicrophoneIcon className="w-4 h-4" />
              Activity Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Session ID:</span>
                <span className="text-gray-900 dark:text-white font-mono">
                  {activity.sessionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                <span className="text-gray-900 dark:text-white">
                  {activity.responseTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-gray-900 dark:text-white">{activity.category}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-3 text-sm flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              User Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                <span className="text-gray-900 dark:text-white">{activity.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Full Name:</span>
                <span className="text-gray-900 dark:text-white">{activity.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Items Processed:</span>
                <span className="text-gray-900 dark:text-white">{activity.amount}</span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-medium mb-3 text-sm flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4" />
              Details & Description
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <div className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                  Activity Description
                </div>
                <div className="text-xs text-gray-800 dark:text-gray-300">
                  {activity.details}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Performed on {new Date(activity.date).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Action handlers
  const handleRowClick = (activity:any) => {
    console.log("Row clicked:", activity);
  };

  const handleRowSelect = (selectedActivities:any) => {
    console.log("Selected activities:", selectedActivities);
  };

  const handleSearch = (searchTerm:any) => {
    console.log("Search term:", searchTerm);
  };

  const moreOptions = [
    {
      id: "export",
      label: "Export Activities",
    },
    {
      id: "refresh",
      label: "Refresh Data",
    },
    {
      id: "filter",
      label: "Advanced Filter",
    },
  ];

  const handleMoreOptionClick = (option:any) => {
    console.log("More option clicked:", option);
  };

  return (
    <div className="space-y-6">
      {/* DataTable Component */}
      <div className="border border-gray-300 dark:border-dark-700 rounded-2xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400 dark:divide-gray-500">
              {filteredData.map((activity) => (
                <React.Fragment key={activity.id}>
                  <tr 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border-b border-gray-400 dark:border-gray-500"
                    onClick={() => handleRowClick(activity)}
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                        {column.cell ? 
                          column.cell({ 
                            row: { 
                              original: activity,
                              getIsExpanded: () => false,
                              toggleExpanded: () => {}
                            },
                            getValue: () => activity[column.accessorKey as keyof typeof activity]
                          }) 
                          : activity[column.accessorKey as keyof typeof activity  ]
                        }
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main Analytics Page Component
export function AnalyticsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7)); // August 2025
  const [isDocsSidebarOpen, setIsDocsSidebarOpen] = useState(false);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break;
    }

    return days;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long" });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white">
      {/* Floating Documentation Button */}
      <button
        onClick={() => setIsDocsSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        title="Open Documentation"
      >
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Section - Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Welcome Section */}
          <WelcomeBanner />

          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
            <ActivityChart />
            <Stats />
          </div>

          {/* Recent Activities */}
          <RecentActivitiesTable />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Performance Chart */}
          <div className="border border-gray-300 dark:border-dark-700 rounded-2xl">
            <AreaChart />
          </div>

          <CurrentRating />

          <div className="border border-gray-300 dark:border-dark-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {formatMonth(currentDate)} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendar().map((date, index) => {
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    className={`p-2 text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
                      !isCurrentMonth
                        ? "text-gray-400 dark:text-gray-600"
                        : "text-gray-700 dark:text-gray-300"
                    } ${
                      isToday ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Sidebar */}
      <DocsSidebar 
        isOpen={isDocsSidebarOpen} 
        onClose={() => setIsDocsSidebarOpen(false)} 
      />
    </div>
  );
}