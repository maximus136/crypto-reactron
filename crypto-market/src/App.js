import React, { Component } from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import CurrencyRate from './CurrencyRate';
import './App.css';

class App extends Component {
  state = {
    priceObjects: {
      XRP: {
        USD: 0,
        INR: 0
      },
      BTC: {
        USD: 0,
        INR: 0
      },
      ETH: {
        USD: 0,
        INR: 0
      }
    }
  };

  socket = null;

  FIELDS = {
    TYPE: 0x0, // hex for binary 0, it is a special case of fields that are always there
    MARKET: 0x0, // hex for binary 0, it is a special case of fields that are always there
    FROMSYMBOL: 0x0, // hex for binary 0, it is a special case of fields that are always there
    TOSYMBOL: 0x0, // hex for binary 0, it is a special case of fields that are always there
    FLAGS: 0x0, // hex for binary 0, it is a special case of fields that are always there
    PRICE: 0x1, // hex for binary 1
    BID: 0x2, // hex for binary 10
    OFFER: 0x4, // hex for binary 100
    LASTUPDATE: 0x8, // hex for binary 1000
    AVG: 0x10
  };

  /* FIELDS = {
    TYPE: 0x0, // hex for binary 0, it is a special case of fields that are always there
    MARKET: 0x0, // hex for binary 0, it is a special case of fields that are always there
    FROMSYMBOL: 0x0, // hex for binary 0, it is a special case of fields that are always there
    TOSYMBOL: 0x0, // hex for binary 0, it is a special case of fields that are always there
    FLAGS: 0x0, // hex for binary 0, it is a special case of fields that are always there
    PRICE: 0x1, // hex for binary 1
    BID: 0x2, // hex for binary 10
    OFFER: 0x4, // hex for binary 100
    LASTUPDATE: 0x8, // hex for binary 1000
    AVG: 0x10, // hex for binary 10000
    LASTVOLUME: 0x20, // hex for binary 100000
    LASTVOLUMETO: 0x40, // hex for binary 1000000
    LASTTRADEID: 0x80, // hex for binary 10000000
    VOLUMEHOUR: 0x100, // hex for binary 100000000
    VOLUMEHOURTO: 0x200, // hex for binary 1000000000
    VOLUME24HOUR: 0x400, // hex for binary 10000000000
    VOLUME24HOURTO: 0x800, // hex for binary 100000000000
    OPENHOUR: 0x1000, // hex for binary 1000000000000
    HIGHHOUR: 0x2000, // hex for binary 10000000000000
    LOWHOUR: 0x4000, // hex for binary 100000000000000
    OPEN24HOUR: 0x8000, // hex for binary 1000000000000000
    HIGH24HOUR: 0x10000, // hex for binary 10000000000000000
    LOW24HOUR: 0x20000, // hex for binary 100000000000000000
    LASTMARKET: 0x40000 // hex for binary 1000000000000000000, this is a special case and will only appear on CCCAGG messages
  }; */

  currencySymbols = {
    BTC: 'Ƀ',
    LTC: 'Ł',
    DAO: 'Ð',
    USD: '$',
    CNY: '¥',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    PLN: 'zł',
    RUB: '₽',
    ETH: 'Ξ',
    GOLD: 'Gold g',
    INR: '₹',
    BRL: 'R$'
  };

  componentDidMount() {
    let currentPrice = {};

    //Format: {SubscriptionId}~{ExchangeName}~{FromSymbol}~{ToSymbol}
    //Use SubscriptionId 0 for TRADE, 2 for CURRENT and 5 for CURRENTAGG
    //For aggregate quote updates use CCCAGG as market

    const subscription = [
      '2~Coinbase~BTC~USD',
      '2~Coinbase~ETH~USD',
      '2~EthexIndia~ETH~INR',
      '2~Quoine~BTC~INR',
      '2~BTCXIndia~XRP~INR',
      '2~Cryptsy~XRP~USD'
    ];

    this.socket = io.connect('https://streamer.cryptocompare.com/');

    this.socket.emit('SubAdd', { subs: subscription });
    this.socket.on('m', (message) => {
      const messageType = message.substring(0, message.indexOf('~'));

      let res = {};

      if (messageType === '2') {
        res = this.unpack(message);
        this.dataUnpack(res);
      }
    });
  }

  componentWillUnmount() {
    this.socket.removeAllListeners('m');
  }

  unpack = (tradeString) => {
    const valuesArray = tradeString.split('~');
    const valuesArrayLenght = valuesArray.length;
    const mask = valuesArray[valuesArrayLenght - 1];
    const maskInt = parseInt(mask, 16);

    let unpackedTrade = {};
    let currentField = 0;

    for (let property in this.FIELDS) {
      if (this.FIELDS[property] === 0) {
        unpackedTrade[property] = valuesArray[currentField];
        currentField++;
      } else if (maskInt & this.FIELDS[property]) {
        unpackedTrade[property] = valuesArray[currentField];
        currentField++;
      }
    }

    return unpackedTrade;
  };

  dataUnpack = (data) => {
    let currentPrice = {};

    const from = data['FROMSYMBOL'];
    const to = data['TOSYMBOL'];
    const pair = from + to;

    if (!currentPrice.hasOwnProperty(pair)) {
      currentPrice[pair] = {};
    }

    for (let key in data) {
      currentPrice[pair][key] = data[key];
    }

    this.setPriceObjectsInState(currentPrice);
  };

  setPriceObjectsInState(currentPrice) {
    let priceObj = {};
    let rateObj = {};
    let crypto = null;
    let currency = null;
    let price = null;

    for (let key in currentPrice) {
      priceObj = currentPrice[key];
    }

    crypto = priceObj.FROMSYMBOL;
    currency = priceObj.TOSYMBOL;

    price = priceObj.PRICE || this.state.priceObjects[currency];

    this.setState({
      priceObjects: {
        ...this.state.priceObjects,
        [crypto]: {
          ...this.state[crypto],
          [currency]: price
        }
      }
    });
  }

  render() {
    const { XRP, BTC, ETH } = this.state.priceObjects;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Crypto Market</h1>
        </header>
        <div className="container">
          <div className="rate rate_btc">
            <span className="crypto-name">
              BTC <span className="currency-symbol">{this.currencySymbols.BTC}</span>
            </span>
            <CurrencyRate priceObj={BTC} symbols={this.currencySymbols} />
          </div>
          <div className="rate rate_eth">
            <span className="crypto-name">
              ETH <span className="currency-symbol">{this.currencySymbols.ETH}</span>
            </span>
            <CurrencyRate priceObj={ETH} symbols={this.currencySymbols} />
          </div>
          <div className="rate rate_xrp">
            <span className="crypto-name">
              XRP <span className="currency-symbol">{this.currencySymbols.ETH}</span>
            </span>
            <CurrencyRate priceObj={XRP} symbols={this.currencySymbols} />
          </div>
          <span class="footer">Created on React and Electron. API from https://streamer.cryptocompare.com/.</span>
        </div>
      </div>
    );
  }
}

export default App;
