const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

export interface NpCity {
  ref: string;
  deliveryCityRef: string;
  name: string;
  area: string;
}

export interface NpWarehouse {
  ref: string;
  number: string;
  description: string;
  shortAddress: string;
}

interface NpAddressItem {
  Ref: string;
  DeliveryCity: string;
  Present: string;
  Area: string;
}

interface NpWarehouseItem {
  Ref: string;
  Number: string;
  Description: string;
  ShortAddress: string;
}

async function callNovaPoshta<T>(modelName: string, calledMethod: string, methodProperties: Record<string, string>): Promise<T[]> {
  const response = await fetch(NP_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey: '', modelName, calledMethod, methodProperties }),
  });
  const json = await response.json();
  if (!json.success) return [];
  return json.data as T[];
}

export const novaPoshtaApi = {
  searchCities: async (query: string): Promise<NpCity[]> => {
    if (!query || query.trim().length < 2) return [];
    const results = await callNovaPoshta<{ Addresses: NpAddressItem[] }>('Address', 'searchSettlements', {
      CityName: query.trim(),
      Limit: '10',
    });
    const addresses = results[0]?.Addresses ?? [];
    return addresses.map(a => ({
      ref: a.Ref,
      deliveryCityRef: a.DeliveryCity,
      name: a.Present,
      area: a.Area,
    }));
  },

  getWarehouses: async (cityRef: string, query?: string): Promise<NpWarehouse[]> => {
    if (!cityRef) return [];
    const props: Record<string, string> = { CityRef: cityRef, Limit: '200', Language: 'UA' };
    if (query && query.trim()) props.FindByString = query.trim();
    const results = await callNovaPoshta<NpWarehouseItem>('AddressGeneral', 'getWarehouses', props);
    return results.map(w => ({
      ref: w.Ref,
      number: w.Number,
      description: w.Description,
      shortAddress: w.ShortAddress,
    }));
  },
};
