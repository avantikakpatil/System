import React from 'react';
import Map from './Map/Map';

const DeliveryRoutes = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        <Map />
      </div>
    </div>
  );
};

export default DeliveryRoutes;