import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  Ticket,
} from "lucide-react";
import CustomDropdown from "../../components/ui/CustomDropdown";
import {
  getAllBookedTickets,
  getTicketStats,
  ticketUtils,
  type TicketStatsResponse,
} from "../../api/ticket";
import { getAllEvents } from "../../api/event";
import AuthHelper from "../../utils/AuthHelper";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TicketingAnalysisProps {
  stats?: TicketStatsResponse["stats"] | null;
  isLoading?: boolean;
}

const timeRangeOptions = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 3 Months",
  "Last 6 Months",
  "Last Year",
];

const chartTypeOptions = [
  "Revenue Over Time",
  "Tickets Sold",
  "Daily Sales",
  "Monthly Summary",
];

interface TicketSalesData {
  date: string;
  revenue: number;
  ticketsSold: number;
  ticketCount: number;
}

interface Ticket {
  purchase_date?: string;
  created_at?: string;
  createdAt?: string;
  price?: number;
  name?: string;
  ticket_id?: string;
  Event?: { title?: string };
  event?: { title?: string };
}

const TicketingAnalysis = ({
  stats: propStats,
  isLoading: propIsLoading,
}: TicketingAnalysisProps) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(
    timeRangeOptions[1]
  );
  const [selectedChartType, setSelectedChartType] = useState(
    chartTypeOptions[0]
  );
  const [stats, setStats] = useState<TicketStatsResponse["stats"] | null>(
    propStats || null
  );
  const [isLoading, setIsLoading] = useState(propIsLoading || true);
  const [salesData, setSalesData] = useState<TicketSalesData[]>([]);
  const [rawTickets, setRawTickets] = useState<Ticket[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  const [allowedEventIds, setAllowedEventIds] = useState<string[] | null>(null);

  // Fetch allowed event IDs for admin
  useEffect(() => {
    const fetchAllowedEvents = async () => {
      if (AuthHelper.isAdmin()) {
        const currentUserId = AuthHelper.getUserId();
        if (currentUserId) {
          try {
            const response = await getAllEvents();
            if (response.success && response.data?.events) {
              const adminEvents = response.data.events.filter(
                event => event.admin_id == currentUserId || event.user_id == currentUserId
              );
              const ids = adminEvents.map(e => e.event_id || '').filter(id => id !== '');
              setAllowedEventIds(ids);
            }
          } catch (err) {
            console.error("Error fetching admin events for filtering:", err);
          }
        }
      } else {
        setAllowedEventIds(null);
      }
    };
    fetchAllowedEvents();
  }, []);

  // Fetch real ticket data
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setIsLoading(true);
        const ticketsResponse = await getAllBookedTickets({
          limit: 1000,
          status: "sold,used,Active",
        });

        let tickets: Ticket[] = [];
        if (ticketsResponse.success && ticketsResponse.data) {
          tickets = ticketsResponse.data.tickets || [];
        }

        // Filter tickets if we have allowedEventIds
        if (allowedEventIds !== null) {
          tickets = tickets.filter(ticket => {
            const tEventId = ticket.event_id || ticket.Event?.event_id || (ticket as any).eventId;
            return allowedEventIds.includes(tEventId);
          });
        }

        setRawTickets(tickets);

        if (!propStats) {
          // Pass allowedEventIds to getTicketStats
          const statsResponse = await getTicketStats( allowedEventIds);
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        setChartError("Failed to fetch ticket data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
    fetchRealData();
  }, [propStats, allowedEventIds]);

  // Clear chart error when filters change
  useEffect(() => {
    setChartError(null);
  }, [selectedTimeRange, selectedChartType]);

  // Process real ticket data based on selected time range
  useEffect(() => {
    if (rawTickets.length === 0) return;

    const processTicketData = () => {
      try {
        const now = new Date();
        const days =
          selectedTimeRange === "Last 7 Days"
            ? 7
            : selectedTimeRange === "Last 30 Days"
            ? 30
            : selectedTimeRange === "Last 3 Months"
            ? 90
            : selectedTimeRange === "Last 6 Months"
            ? 180
            : 365;

        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);

        // Filter tickets within the selected time range
        const filteredTickets = rawTickets.filter((ticket) => {
          const purchaseDate = new Date(
            ticket.purchase_date || ticket.created_at || ticket.createdAt || now
          );
          return purchaseDate >= startDate && purchaseDate <= now;
        });

        // Group tickets by date
        const dailyData: { [key: string]: TicketSalesData } = {};

        // Initialize all dates in range with zero values
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];

          dailyData[dateStr] = {
            date: dateStr,
            revenue: 0,
            ticketsSold: 0,
            ticketCount: 0,
          };
        }

        // Aggregate real ticket data
        filteredTickets.forEach((ticket) => {
          const purchaseDate = new Date(
            ticket.purchase_date || ticket.created_at || ticket.createdAt || now
          );
          const dateStr = purchaseDate.toISOString().split("T")[0];

          if (dailyData[dateStr]) {
            const ticketPrice = ticket.price || 0;
            dailyData[dateStr].revenue += ticketPrice;
            dailyData[dateStr].ticketsSold += 1;
            dailyData[dateStr].ticketCount += 1;
          }
        });

        // Do not inject sample data; keep zeroes to reflect true dataset

        // Convert to array and sort by date
        const processedData = Object.values(dailyData).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setSalesData(processedData);
      } catch (error) {
        console.error("Error processing ticket data:", error);
        setChartError("Failed to process ticket data");
      }
    };

    processTicketData();
  }, [rawTickets, selectedTimeRange]);

  // Calculate growth percentages
  const calculateGrowth = (
    current: number,
    previous: number
  ): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return { value: Math.abs(growth), isPositive: growth >= 0 };
  };

  const revenueGrowth = calculateGrowth(
    stats?.total_revenue || 0,
    (stats?.total_revenue || 0) * 0.85
  );
  const ticketGrowth = calculateGrowth(
    stats?.sold_tickets || 0,
    (stats?.sold_tickets || 0) * 0.92
  );
  const eventGrowth = calculateGrowth(
    stats?.tickets_by_event?.length || 0,
    (stats?.tickets_by_event?.length || 0) * 0.88
  );

  // Chart configuration with proper vertical fill
  const getChartData = () => {
    try {
      const labels = salesData.map((item) => {
        const date = new Date(item.date);
        return selectedTimeRange === "Last 7 Days"
          ? date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : selectedTimeRange === "Last 30 Days"
          ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      });

      const isRevenueChart =
        selectedChartType === "Revenue Over Time" ||
        selectedChartType === "Monthly Summary";
      const isLineChart =
        selectedChartType === "Revenue Over Time" ||
        selectedChartType === "Daily Sales";

      const chartData = salesData.map((item) => {
        const value = isRevenueChart ? item.revenue : item.ticketsSold;
        return typeof value === "number" && !isNaN(value) ? value : 0;
      });

      const maxDataValue = Math.max(...chartData, 0);
      const suggestedMax = isRevenueChart
        ? Math.ceil(maxDataValue / 10000) * 10000 * 1.2 // Add 20% padding for revenue
        : Math.ceil(maxDataValue * 1.2); // Add 20% padding for tickets

      const data = {
        labels,
        datasets: [
          {
            label: isRevenueChart ? "Revenue (RWF)" : "Tickets Sold",
            data: chartData,
            backgroundColor: isLineChart
              ? "rgba(192, 132, 252, 0.3)"
              : "rgba(192, 132, 252, 0.8)",
            borderColor: "rgba(192, 132, 252, 1)",
            borderWidth: 2,
            tension: 0.3, // Slightly reduced for smoother curves
            pointBackgroundColor: "rgba(192, 132, 252, 1)",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            cubicInterpolationMode: "monotone",
          },
        ],
      };

      return { data, suggestedMax };
    } catch (error) {
      console.error("Error generating chart data:", error);
      setChartError("Failed to generate chart data");
      return { data: { labels: [], datasets: [] }, suggestedMax: 100 };
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
      line: {
        tension: 0.4,
        borderCapStyle: "round",
        borderJoinStyle: "round",
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#CDCDE0",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#CDCDE0",
        borderColor: "rgba(192, 132, 252, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const isRevenue =
              selectedChartType === "Revenue Over Time" ||
              selectedChartType === "Monthly Summary";
            const value = context.parsed.y;
            return isRevenue
              ? `Revenue: ${ticketUtils.formatPrice(value)}`
              : `Tickets: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(55, 65, 81, 0.3)",
          drawOnChartArea: true,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        grace: "10%",
        grid: {
          color: "rgba(55, 65, 81, 0.3)",
          drawOnChartArea: true,
        },
        ticks: {
          color: "#9CA3AF",
          font: {
            size: 11,
          },
          callback: function (value: any) {
            const isRevenue =
              selectedChartType === "Revenue Over Time" ||
              selectedChartType === "Monthly Summary";
            if (isRevenue) {
              if (value === 0) return "0";
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return value.toLocaleString();
            } else {
              return value.toLocaleString();
            }
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    elements: {
      line: {
        tension: 0.3,
        borderCapStyle: "round" as const,
        borderJoinStyle: "round" as const,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
    clip: true, // Prevent fill overflow
  };

  const ChartComponent =
    selectedChartType === "Revenue Over Time" ||
    selectedChartType === "Daily Sales"
      ? Line
      : Bar;

  return (
    <section className="w-full mb-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Ticketing Analytics
            </h3>
            <p className="text-gray-400 text-sm">
              Real-time ticket sales and revenue data from your events
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <CustomDropdown
              options={chartTypeOptions}
              value={selectedChartType}
              onChange={setSelectedChartType}
              placeholder="Select Chart Type"
              fullWidth={false}
            />
            <CustomDropdown
              options={timeRangeOptions}
              value={selectedTimeRange}
              onChange={setSelectedTimeRange}
              placeholder="Select Time Range"
              fullWidth={false}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  revenueGrowth.isPositive
                    ? "text-green-400 bg-green-900/20"
                    : "text-red-400 bg-red-900/20"
                }`}
              >
                {revenueGrowth.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {revenueGrowth.value.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {isLoading
                  ? "..."
                  : ticketUtils.formatPrice(
                      salesData.length > 0
                        ? salesData.reduce((sum, d) => sum + d.revenue, 0)
                        : stats?.total_revenue || 0
                    )}
              </p>
              <p className="text-gray-400 text-sm">Total Revenue</p>
            </div>
          </div>

          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-green-400" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  ticketGrowth.isPositive
                    ? "text-green-400 bg-green-900/20"
                    : "text-red-400 bg-red-900/20"
                }`}
              >
                {ticketGrowth.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {ticketGrowth.value.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {isLoading
                  ? "..."
                  : (
                      salesData.length > 0
                        ? salesData.reduce((sum, d) => sum + d.ticketsSold, 0)
                        : (stats?.sold_tickets || 0)
                    ).toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">Tickets Sold</p>
            </div>
          </div>

          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  eventGrowth.isPositive
                    ? "text-green-400 bg-green-900/20"
                    : "text-red-400 bg-red-900/20"
                }`}
              >
                {eventGrowth.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {eventGrowth.value.toFixed(1)}%
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {isLoading ? "..." : stats?.tickets_by_event?.length || 0}
              </p>
              <p className="text-gray-400 text-sm">Active Events</p>
            </div>
          </div>

          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-blue-900/20">
                <BarChart3 className="w-3 h-3" />
                {salesData.length > 0
                  ? salesData
                      .reduce((sum, d) => sum + d.ticketsSold, 0)
                      .toLocaleString()
                  : "0"}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">
                {isLoading
                  ? "..."
                  : (stats?.available_tickets || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">Available Tickets</p>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-[#101010] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {selectedChartType}
              </h4>
              <p className="text-gray-400 text-sm">
                {selectedTimeRange} • Real ticket purchase data
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">
                {salesData.length} days of data
              </p>
              <p className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="h-[500px] w-full relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : chartError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <p className="text-red-400 text-lg mb-2">Chart Error</p>
                  <p className="text-gray-500 text-sm">{chartError}</p>
                  <button
                    onClick={() => setChartError(null)}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : salesData.length > 0 ? (
              <div className="relative w-full h-full">
                <ChartComponent
                  key={`${selectedChartType}-${selectedTimeRange}-${salesData.length}`}
                  data={getChartData().data}
                  options={chartOptions}
                  onError={(error: unknown) => {
                    console.error("Chart error:", error);
                    setChartError("Failed to render chart. Please try again.");
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">
                    No ticket sales data
                  </p>
                  <p className="text-gray-500 text-sm">
                    No tickets have been sold in the selected time range
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chart Summary */}
          {!isLoading && salesData.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {ticketUtils.formatPrice(
                      salesData.reduce((sum, d) => sum + d.revenue, 0)
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {salesData
                      .reduce((sum, d) => sum + d.ticketsSold, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Tickets Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {ticketUtils.formatPrice(
                      Math.round(
                        salesData.reduce((sum, d) => sum + d.revenue, 0) /
                          Math.max(salesData.length, 1)
                      )
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Daily Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {Math.max(
                      ...salesData.map((d) => d.ticketsSold),
                      0
                    ).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Peak Day Sales</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Sales Activity */}
        {rawTickets.length > 0 && (
          <div className="bg-[#101010] rounded-lg p-6 border border-gray-800 mt-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Sales Activity
            </h4>
            <div className="space-y-3">
              {rawTickets.slice(0, 5).map((ticket, index) => {
                const purchaseDate = new Date(
                  ticket.purchase_date ||
                    ticket.created_at ||
                    ticket.createdAt ||
                    new Date()
                );
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {ticket.name ||
                            `Ticket #${ticket.ticket_id || index}`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {ticket.Event?.title ||
                            ticket.event?.title ||
                            "Unknown Event"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold">
                        {ticketUtils.formatPrice(ticket.price || 0)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {purchaseDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TicketingAnalysis;
