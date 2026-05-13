import React from 'react';
import Badge from './Badge';

const OrganisationSidebar = ({
    icon,
    orgName
}) => {

    // TODO: create OrganisationSidebar for OrgDashboard
  return (
    <div>
        <div>
            <Badge
                icon={icon}
                name={orgName}
                subtitle="ORGANISATION"
            />
        </div>

        <div>
            Opportunities
        </div>

        <div>
            Applications 
        </div>

        <div>
            Logout button
        </div>
    </div>
  )
}

export default OrganisationSidebar