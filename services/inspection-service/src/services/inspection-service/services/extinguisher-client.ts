import { env } from '../../../config/env';
import { requestJson } from '../../../shared/service-http';

interface ExtinguisherSnapshot {
  id: string;
  serialNumber: string;
  location: string;
}

export async function getExtinguisherSnapshot(id: string) {
  return requestJson<ExtinguisherSnapshot>(
    `${env.serviceUrls.extinguishers}/internal/extinguishers/${id}`
  );
}
