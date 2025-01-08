import React from 'react';
const staticText = {
  connectVehicle: "Connecte ta jeep.",
  connectButton: "Connect"
}

const Connect = ({ onClick }) => (
  <div className='container connect'>
    <p className='cta'>{staticText.connectVehicle}</p>
    <button className='connect' onClick={onClick}>{staticText.connectButton}</button>
  </div>
);

export default Connect;
