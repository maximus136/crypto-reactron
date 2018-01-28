import React, { Component } from 'react';
import './RateCard.css';

class RateCard extends Component {
  shouldComponentUpdate(nextProps) {
    if (
      nextProps.currencyValue === this.props.currencyValue ||
      nextProps.currencyValue === undefined ||
      nextProps.currencyValue === null
    ) {
      return false;
    }

    return true;
  }

  render() {
    const { currencyName, currencyValue, currencySymbol } = this.props;

    return (
      <div className="currency">
        <span className="currency--name">
          {currencyName} <span className="currency-symbol">{currencySymbol}</span>
        </span>
        <span className="currency--value">{currencyValue}</span>
      </div>
    );
  }
}

export default RateCard;
