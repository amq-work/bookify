import React from 'react';
import { Business } from '../../types';
import { EmbedTab } from './EmbedTab';

interface IntegrationsTabProps {
  business: Business;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ business }) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Integrations Header */}
      <div>
        <h2 className="text-xl font-medium text-[#274c77] font-heading tracking-tight">
          Website Embed & Integration
        </h2>
        <p className="text-xs text-[#6096ba] mt-0.5">
          Embed your Bookify booking experience seamlessly into WordPress, Webflow, Squarespace, or custom web apps.
        </p>
      </div>

      {/* Primary Integration: Website Embed */}
      <EmbedTab business={business} />
    </div>
  );
};
