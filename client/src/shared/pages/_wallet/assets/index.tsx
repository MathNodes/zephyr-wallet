// Library Imports
import React, { Component } from "react";
import { connect } from "react-redux";
// Relative Imports
import Body from "../../../components/_layout/body";
import Header from "../../../components/_layout/header";
import Overview from "../../../components/_layout/overview";
import Cell from "../../../components/cell";
import CellDisabled from "../../../components/cell_disabled";

import { convertBalanceToMoney } from "utility/utility";
import { Ticker } from "shared/reducers/types";
import { DesktopAppState } from "platforms/desktop/reducers";
import { selectValueInOtherAsset, XBalances, XViewBalance } from "shared/reducers/xBalance";
import { WebAppState } from "platforms/web/reducers";
import { BlockHeaderRate, selectXRate } from "shared/reducers/blockHeaderExchangeRates";

interface AssetsProps {
  balances: XBalances;
  rates: BlockHeaderRate[];
  assetsInUSD: XViewBalance;
  showPrivateDetails: boolean;
}

interface AssetsState {}

class AssetsPage extends Component<AssetsProps, any> {
  state = {
    forexPriceFetched: false,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  renderBalance = (ticker: keyof XBalances) => {
    const numDecimals = 2;

    const unlockedBalance = convertBalanceToMoney(this.props.balances[ticker].unlockedBalance, numDecimals);

    const totalBalance = convertBalanceToMoney(this.props.balances[ticker].balance, numDecimals);

    const lockedBalance = convertBalanceToMoney(this.props.balances[ticker].lockedBalance, numDecimals);

    const name = ticker === Ticker.ZEPHRSV ? "Reserve" : "Stable";
    const toTicker = ticker === Ticker.ZEPHRSV ? Ticker.ZEPH : ticker;
    let value = selectValueInOtherAsset(this.props.balances[ticker], this.props.rates, ticker, toTicker); // this.props.assetsInUSD[xTicker]!.unlockedBalance;
    const xRate = selectXRate(this.props.rates, ticker, toTicker);

    if (ticker === Ticker.ZEPHRSV) {
      const spotPrice = selectXRate(this.props.rates, Ticker.ZEPH, Ticker.ZEPHUSD, true);
      value.balance *= spotPrice;
      value.unlockedBalance *= spotPrice;
      value.lockedBalance *= spotPrice;
    }

    return (
      <Cell
        fullwidth="fullwidth"
        key={ticker}
        tokenName={name}
        ticker={ticker}
        price={xRate}
        value={value}
        totalBalance={totalBalance}
        lockedBalance={lockedBalance}
        unlockedBalance={unlockedBalance}
        showPrivateDetails={this.props.showPrivateDetails}
      />
    );
  };

  render() {
    const unlockedBalance = convertBalanceToMoney(this.props.balances.ZEPH.unlockedBalance);

    const totalBalance = convertBalanceToMoney(this.props.balances.ZEPH.balance);

    const lockedBalance = convertBalanceToMoney(this.props.balances.ZEPH.lockedBalance);

    const zephInUSD = selectValueInOtherAsset(
      this.props.balances.ZEPH,
      this.props.rates,
      Ticker.ZEPH,
      Ticker.ZEPHUSD,
      true,
    );

    const xRate = selectXRate(this.props.rates, Ticker.ZEPH, Ticker.ZEPHUSD, true);
    return (
      <Body>
        <Overview />
        <Header title="All Balances" description="" />
        <Cell
          //@ts-ignore
          key={1}
          tokenName={"Zephyr"}
          ticker={"ZEPH"}
          price={xRate}
          value={zephInUSD}
          fullwidth="fullwidth"
          totalBalance={totalBalance.toFixed(2)}
          lockedBalance={lockedBalance}
          unlockedBalance={unlockedBalance}
          showPrivateDetails={this.props.showPrivateDetails}
        />
        {this.renderBalance(Ticker.ZEPHUSD)}
        {this.renderBalance(Ticker.ZEPHRSV)}
      </Body>
    );
  }
}

export const mapStateToProps = (state: DesktopAppState | WebAppState) => ({
  rates: state.blockHeaderExchangeRate,
  balances: state.xBalance,
  showPrivateDetails: state.walletSession.showPrivateDetails,
});

export const Assets = connect(mapStateToProps, {})(AssetsPage);
