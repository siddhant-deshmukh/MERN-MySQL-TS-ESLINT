// src/routes/exchangeRoutes.ts
import { Router, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import ENV from '@src/common/constants/ENV';
import { authenticateToken } from '@src/middleware/authToken';
import logger from 'jet-logger';


const router = Router();

const EXCHANGE_RATE_API_KEY = ENV.ExchangeRateApiKey;
const TARGET_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']; // Currencies to compare against INR

interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  'error-type'?: string; // Optional error field in case of 'error' result
}


// GET /api/exchange-rates - Fetch current exchange rates against INR
router.get(
  '/',
  authenticateToken, // Protect this endpoint, so only authenticated users can access
  async (req: Request, res: Response) => {

    const { BASE_CURRENCY } = req.query as { BASE_CURRENCY?: string };
    const apiUrl = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY ?? 'INR'}`;

    const response: AxiosResponse<ExchangeRateApiResponse> = await axios.get(apiUrl);

    const exchangeRatesData = response.data;

    if (exchangeRatesData.result === 'success' && exchangeRatesData.conversion_rates) {
      const ratesForChart = TARGET_CURRENCIES.map(currencyCode => {
        const rate = exchangeRatesData.conversion_rates[currencyCode];
        if (typeof rate === 'number') {
          return {
            currency: currencyCode,
            rate: parseFloat(rate.toFixed(4)), // Format to 4 decimal places for consistency
          };
        }
        return null; // Handle cases where a target currency might be missing (though unlikely for common ones)
      }).filter(item => item !== null); // Remove any null entries

      res.status(200).json({
        baseCurrency: BASE_CURRENCY,
        date: exchangeRatesData.time_last_update_utc,
        rates: ratesForChart,
        msg: 'Currency exchange rates fetched successfully.',
      });
    } else {
      logger.err({ msg: 'ExchangeRate-API response error:', exchangeRatesData }, true);
      res.status(500).json({ msg: 'Failed to fetch exchange rates from external API.', apiError: exchangeRatesData.result });
    }
  },
);


export default router;