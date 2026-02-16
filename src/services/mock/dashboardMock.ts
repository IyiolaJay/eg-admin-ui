export interface MetricData {
  total: number;
  change: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface DashboardMetrics {
  disputes: MetricData;
  failedOperations: MetricData;
  errandsCreatedToday: MetricData;
  errandsInProgress: MetricData;
  errandsCancelled: MetricData;
  signupsToday: MetricData;
}

const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomChange = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

const randomDirection = (): 'up' | 'down' | 'neutral' => {
  const rand = Math.random();
  if (rand > 0.6) return 'up';
  if (rand > 0.3) return 'down';
  return 'neutral';
};

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    disputes: {
      total: randomBetween(50, 200),
      change: {
        value: randomChange(-15, 15),
        direction: randomDirection(),
      },
    },
    failedOperations: {
      total: randomBetween(10, 80),
      change: {
        value: randomChange(-10, 10),
        direction: randomDirection(),
      },
    },
    errandsCreatedToday: {
      total: randomBetween(100, 500),
      change: {
        value: randomChange(-5, 30),
        direction: 'up',
      },
    },
    errandsInProgress: {
      total: randomBetween(50, 300),
      change: {
        value: randomChange(-10, 15),
        direction: randomDirection(),
      },
    },
    errandsCancelled: {
      total: randomBetween(5, 50),
      change: {
        value: randomChange(-5, 15),
        direction: randomDirection(),
      },
    },
    signupsToday: {
      total: randomBetween(20, 150),
      change: {
        value: randomChange(-5, 25),
        direction: 'up',
      },
    },
  };
}
