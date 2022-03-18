import ccxt
import config
import schedule
import pandas as pd
import numbers

pd.set_option('display.max_rows', None)

import warnings

warnings.filterwarnings('ignore')

from datetime import datetime
import time
from stockstats import StockDataFrame as Sdf

# how much quote currency example [DOGE] you want to spend on every trade
BALANCE = 0.5

# how percent you want to earn on every trade
PERCENT_OF_GAIN_IN_FIAT_CURRENCY = 10

# the crypto that yiou want to invest in
symbol = 'BNB/USDT'

# RSI parameters
RSI_OVERBOUGHT = 70
RSI_OVERSOLD = 30

# trade mode
TRADE = True

EXCHANGE = ccxt.binance({
    'options': {
        'adjustForTimeDifference': True,
    },
    'enableRateLimit': True,
    "apiKey": config.BINANCE_API_KEY,
    "secret": config.BINANCE_SECRET_KEY,

})
EXCHANGE.load_markets()


def create_stock(historical_data):
    stock = Sdf.retype(historical_data)
    return stock


def in_position(amount, price, limits, precision):
    global symbol
    condition = limits['amount']['min'] <= amount <= limits['amount']['max'] and limits['price'][
        'min'] <= price <= limits['price']['max'] and precision['price'] >= float(
        EXCHANGE.price_to_precision(symbol, price)) and (amount * price) >= limits['cost']['min'] and not isinstance(
        limits['cost']['max'], numbers.Number) or (
                        isinstance(limits['cost']['max'], numbers.Number) and (amount * price) <= limits['cost']['max'])
    return condition


def info(df):
    data = dict()
    online_balance = EXCHANGE.fetchBalance()
    data["quote"] = online_balance['total'][symbol.split("/")[0]]
    data["price"] = df['close'][len(df) - 1]

    limits = EXCHANGE.markets[symbol]['limits']

    precision = EXCHANGE.markets[symbol]['precision']
    data["sell_fees"] = EXCHANGE.markets[symbol]['taker']
    data["buy_fees"] = EXCHANGE.markets[symbol]['maker']

    data["fiat"] = float((online_balance['total'][symbol.split("/")[1]] / data["price"]) * (1 - data["buy_fees"]))
    if data["fiat"] >= BALANCE:
        data["fiat"] = BALANCE
    data["in_position_to_buy"] = in_position(data["fiat"], data["price"], limits, precision)
    data["in_position_to_sell"] = in_position(data["quote"], data["price"], limits, precision)

    return data


def sell(data):
    print(f"before sell {data}")
    # try to find open trades and sell them if the sell price is good and do not cost any charges
    try:
        trade_history = pd.read_csv("trades.csv")
    except:
        trade_history = pd.DataFrame(
            columns=["symbol", "amount", "buy", "sell", "buy_price", "sell_price", "state", "buy_date", "sell_date"])

    not_sold_trades = trade_history.loc[(trade_history['state'] == 0) & (trade_history['buy_price'] < data['price'])]
    if data["in_position_to_sell"] and len(not_sold_trades) > 0:
        for i in not_sold_trades.index:
            sell_price = not_sold_trades['amount'][i] * data["price"]
            buy_price = float(not_sold_trades['buy'][i])
            if sell_price >= buy_price * (1 + (PERCENT_OF_GAIN_IN_FIAT_CURRENCY / 100)):
                # if something going wrong we get a copy of our dataframe
                roll_back = trade_history.copy()
                trade_history['state'][i] = 1
                trade_history['sell'][i] = sell_price
                trade_history['sell_price'][i] = data["price"]
                trade_history['sell_date'][i] = datetime.now().isoformat()
                trade_history.to_csv("trades.csv", index=False, header=True)
                try:
                    if TRADE:
                        return EXCHANGE.create_limit_sell_order(symbol, trade_history['amount'][i], data["price"])
                except:
                    roll_back.to_csv("trades.csv", index=False, header=True)
                    file_put_contents("logs.txt", "exception in sell function check it")
                    return "not in position to sell"
    return "not in position to sell"


def buy(data):
    print(f"before buy {data}")
    try:
        trade_history = pd.read_csv("trades.csv")
    except:
        trade_history = pd.DataFrame(
            columns=["symbol", "amount", "buy", "sell", "buy_price", "sell_price", "state", "buy_date", "sell_date"])

    buy_price = data["fiat"] * (1 + 2 * data['buy_fees']) * data["price"]
    sold_trades = trade_history.loc[trade_history['state'] == 1]
    bought_trades = trade_history.loc[trade_history['state'] == 0]
    average_sell_price = sold_trades["sell_price"].tail(20).mean()
    average_buy_price = bought_trades["buy_price"].tail(20).mean()
    formula = average_sell_price * (1 - (PERCENT_OF_GAIN_IN_FIAT_CURRENCY / (3 * 100)))
    if trade_history.empty or (data["in_position_to_buy"] and ((sold_trades.size > 0 and formula >= data['price']) or (
            sold_trades.size == 0 and average_buy_price >= data['price']))):
        roll_back = trade_history.copy()
        trade_history = trade_history.append(
            {
                "symbol": symbol,
                "amount": data["fiat"],
                "buy": buy_price,
                "sell": 0.0,
                "sell_price": 0.0,
                "buy_price": data['price'],
                "state": 0,
                "buy_date": datetime.now().isoformat(),
                "sell_date": 0
            },
            ignore_index=True)
        trade_history.to_csv("trades.csv", index=False, header=True)
        try:
            if TRADE:
                return EXCHANGE.create_limit_buy_order(symbol, data["fiat"], data["price"])
        except Exception as error:
            roll_back.to_csv("trades.csv", index=False, header=True)
            file_put_contents("logs.txt", f"exception in buy function check it {error} {data}")
            return None


def tr(data):
    data['previous_close'] = data['close'].shift(1)
    data['high-low'] = abs(data['high'] - data['low'])
    data['high-pc'] = abs(data['high'] - data['previous_close'])
    data['low-pc'] = abs(data['low'] - data['previous_close'])

    return data[['high-low', 'high-pc', 'low-pc']].max(axis=1)


def atr(data, period):
    data['tr'] = tr(data)
    return data['tr'].rolling(period).mean()


def supertrend(df, period=7, atr_multiplier=1.5):
    hl2 = (df['high'] + df['low']) / 2
    df['atr'] = atr(df, period)
    df['upperband'] = hl2 + (atr_multiplier * df['atr'])
    df['lowerband'] = hl2 - (atr_multiplier * df['atr'])
    df['in_uptrend'] = True

    for current in range(1, len(df.index)):
        previous = current - 1
        if df['close'][current] > df['upperband'][previous]:
            df['in_uptrend'][current] = True
        elif df['close'][current] < df['lowerband'][previous]:
            df['in_uptrend'][current] = False
        else:
            df['in_uptrend'][current] = df['in_uptrend'][previous]

            if df['in_uptrend'][current] and df['lowerband'][current] < df['lowerband'][previous]:
                df['lowerband'][current] = df['lowerband'][previous]

            if not df['in_uptrend'][current] and df['upperband'][current] > df['upperband'][previous]:
                df['upperband'][current] = df['upperband'][previous]

    return df


def check_buy_sell_signals(df, rsi):
    print("checking for buy and sell signals")
    last_row_index = len(df.index) - 1
    previous_row_index = last_row_index - 1
    data = info(df)
    print(data)
    if (not df['in_uptrend'][previous_row_index] and df['in_uptrend'][last_row_index]) or rsi < RSI_OVERSOLD:
        print("changed to uptrend, buy")
        order = buy(data)
        print(f"buy signal received {order}")

    if (df['in_uptrend'][previous_row_index] and not df['in_uptrend'][last_row_index]) or rsi > RSI_OVERBOUGHT:
        print("changed to downtrend, sell")
        order = sell(data)
        print(f"sell signal received {order}")


def file_put_contents(file, data):
    with open(file, "a") as file:
        file.write(f"{data},{datetime.now().isoformat()}\n")


def run_bot():
    # print(f"Fetching new bars for {datetime.now().isoformat()}")
    bars = EXCHANGE.fetch_ohlcv(symbol, timeframe='1m', limit=100)
    df = pd.DataFrame(bars[:-1], columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    supertrend_data = supertrend(df)
    stock_data = Sdf.retype(df)
    rsi = stock_data['rsi_14'].iloc[-1]
    # print(f"RSI - {rsi} ---- {datetime.now().isoformat()}")

    check_buy_sell_signals(supertrend_data, rsi)


def earning(trade_history):
    sold_trades = trade_history.loc[trade_history['state'] == 1]
    return sold_trades["sell"].sum() - sold_trades["buy"].sum()


def action():
    schedule.every(10).seconds.do(run_bot)
    while True:
        schedule.run_pending()
        time.sleep(1)


action()
