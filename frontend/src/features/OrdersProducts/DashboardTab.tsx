import { get } from "@/lib/api";
import type { IExchangeRates, IRate } from "@/types";
import { useEffect, useState, type JSX } from "react";
import { MdAttachMoney, MdCurrencyPound, MdCurrencyYen, MdEuro, MdOutlineCurrencyRupee } from "react-icons/md";

// Dashboard Component for Exchange Rates
const DashboardTab: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<IExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: IExchangeRates = await get('/exc?BASE_CURRENCY=INR');
      setExchangeRates(data);
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      // setError(err.response?.data?.message || 'Failed to load exchange rates.');
    } finally {
      setLoading(false);
    }
  };

  const currencyIcons: { [key: string]: JSX.Element } = {
    INR: <MdOutlineCurrencyRupee className="text-blue-500" />,
    USD: <MdAttachMoney className="text-green-500" />,
    EUR: <MdEuro className="text-yellow-500" />,
    GBP: <MdCurrencyPound className="text-purple-500" />,
    JPY: <MdCurrencyYen className="text-red-500" />,
    AUD: <MdAttachMoney className="text-orange-500" />, // Using MdAttachMoney for AUD
    CAD: <MdAttachMoney className="text-teal-500" />,   // Using MdAttachMoney for CAD
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading exchange rates...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!exchangeRates || !exchangeRates.rates || exchangeRates.rates.length === 0) {
    return <div className="text-center p-8">No exchange rates data available.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-xl font-semibold">Exchange Rates (Base: {'INR'})</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Date: {new Date(exchangeRates.date).toLocaleDateString()}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {exchangeRates.rates.map((rate: IRate) => (
          <div key={rate.currency} className="p-4 border rounded-md shadow-sm bg-white dark:bg-gray-800 flex items-center space-x-4">
            {/* Simple placeholder icon - replace with react-icons if installed */}
            <div className="text-2xl text-blue-500">
              {currencyIcons[rate.currency] || <MdAttachMoney className="text-gray-500" />} 
            </div>
            <div>
              <p className="font-bold text-lg">{rate.currency}</p>
              <p className="text-gray-700 dark:text-gray-300">Rate: {rate.rate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardTab;