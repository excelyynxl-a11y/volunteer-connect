import React from 'react'  
import './Badge.css'       
                            
const Badge = ({ 
    icon, 
    name, 
    subtitle 
}) => {     
    return (                 
        <div className="badge">
            <div className="badge-mark">
                {icon}
            </div>        
            <div>                
                <p className="badge-name">
                    {name}
                </p>          
                <span className="badge-subtitle">
                    {subtitle}
                </span>          
            </div>               
        </div>                 
    );                    
}

export default Badge;