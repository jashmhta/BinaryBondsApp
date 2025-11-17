/**
 * Portfolio Service
 */
import { apiService } from './api';

export interface Bond {
  _id: string;
  isin: string;
  name: string;
  bond_type: string;
  issuer: string;
  face_value: number;
  coupon_rate: number;
  maturity_date: string;
  ratings: {
    crisil?: string;
    icra?: string;
    care?: string;
    india_ratings?: string;
  };
  interest_frequency: string;
  is_secured: boolean;
  category: string;
  yield_to_maturity: number;
  description: string;
}

export interface UserBond {
  _id: string;
  bond: Bond;
  quantity: number;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  invested_amount: number;
  next_payout_date?: string;
  profit_loss: number;
  profit_loss_percentage: number;
}

export interface DashboardSummary {
  total_invested: number;
  current_value: number;
  total_interest_earned: number;
  profit_loss: number;
  profit_loss_percentage: number;
  total_bonds: number;
  maturity_upcoming_30days: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

class PortfolioService {
  async getPortfolio(): Promise<UserBond[]> {
    return apiService.get<UserBond[]>('/api/portfolio/list');
  }

  async getBondDetail(bondId: string): Promise<{ bond: Bond; user_bond: any }> {
    return apiService.get(`/api/portfolio/bond/${bondId}`);
  }

  async getAllBonds(): Promise<Bond[]> {
    return apiService.get<Bond[]>('/api/portfolio/all-bonds');
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiService.get<DashboardSummary>('/api/dashboard/summary');
  }

  async getChartData(): Promise<ChartDataPoint[]> {
    return apiService.get<ChartDataPoint[]>('/api/dashboard/chart');
  }

  async getMaturityCalendar(): Promise<any[]> {
    return apiService.get('/api/reports/maturity-calendar');
  }
}

export const portfolioService = new PortfolioService();
