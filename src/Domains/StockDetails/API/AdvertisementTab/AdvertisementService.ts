import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';
import type { ClassifiedAd } from '@/types';
import { link } from 'fs';
export interface ClassifiedItem {
  value: string;
  code: string;
  editable: boolean;
}

interface ClassifiedItemsResponce {
  classifides: ClassifiedItem[];
}

interface SaveRequest {
  classifides: SaveItem[];
}

interface SaveItem {
  code: string;
  link: string;
}

class AdvertisementService {
  private authenticatedRequest;
  
  constructor() {
      this.authenticatedRequest = useAuthenticatedRequest({
          baseURL: window.SERVICE_ENVS.API_URL
      });
  }

  async getClassifiedAds(dbClassifiedAds: ClassifiedAd[], uid: string): Promise<ClassifiedAd[]> {
    var classifidesList = await this.fetchClassifiedeItems();
    
    var classifiedAds: ClassifiedAd[] = classifidesList.map(_ => {
      var dbAd = dbClassifiedAds.find(ad => ad.classified.code === _.code)
      
      var item: ClassifiedAd = {
        uid: uid,
        classified: {
          code: dbAd ? dbAd.classified.code : _.code,
          value: dbAd ? dbAd.classified.value : _.value
        },
        link: dbAd ? dbAd.link : "",
        status: {},
        editable: _.editable
      };

      if (dbAd) {
        item.status = {
          code: dbAd.status?.code,
          value: dbAd.status?.value
        }
      }
      
      return item;
    });

    return classifiedAds;
  }

  async fetchClassifiedeItems(): Promise<ClassifiedItem[]>{
    try {
      const response = await this.authenticatedRequest.makeRequest<ClassifiedItemsResponce>(
        `v1/seized-property/classified-ads`,
        {
            method: 'GET'
        }
    );

    if (!response || !response.classifides) {
        return [];
    }

    return response.classifides;
    }  catch (error) {
      console.error("Ошибка при получении списка классифайдов:", error);
      throw error;
    }
  }

  async save(items: ClassifiedAd[], uid: string):Promise<any> {
    console.log('1 - save  items', items)
    var classifides = items
    .filter(_ => _.editable)
    .map(_ => {
      return {
        code: _.classified.code,
        link: _.link
      }
    });
    console.log('2 - save  classifides', classifides)

    const response = await this.authenticatedRequest.makeRequest<any>(
      `v1/seized-property-items/${uid}/classified-ads`,
      {
          method: 'PATCH',
          body: {classifides: classifides},
      }
  );
  }
}

export default new AdvertisementService();