import homeFeedData from '../../../../mock/data/home-feed.json'; 

export interface FeedItem {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

const simulateNetworkDelay = () => new Promise(resolve => {
  const delay = Math.floor(Math.random() * 1000) + 500;
  setTimeout(resolve, delay);
});

export const HomeService = {
  /**
   * Simula a obtenção do feed da Home.
   * Contrato: GET /mock/home-feed
   */
  async fetchHomeFeed(): Promise<{ items: FeedItem[] }> {
    await simulateNetworkDelay(); // Simula o atraso da rede

    if (Math.random() < 0.1) {
        const error = new Error('Simulação de falha de rede ao buscar feed.');
        (error as any).statusCode = 500;
        throw error;
    }

    return homeFeedData;
  },
};