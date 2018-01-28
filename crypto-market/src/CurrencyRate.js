import React from 'react';
import RateCard from './RateCard';
import './CurrencyRate.css';

const CurrencyRate = ({ priceObj, symbols }) => {
  return (
    <div className="currency-rate">
      <div className="rate-card rate-card-first">
        <RateCard currencyName="INR" currencyValue={priceObj.INR} currencySymbol={symbols.INR} />
      </div>
      <div className="rate-card rate-card-second">
        <RateCard currencyName="USD" currencyValue={priceObj.USD} currencySymbol={symbols.USD} />
      </div>
    </div>
  );
};

export default CurrencyRate;
