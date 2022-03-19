import websocket, json, pprint
import config
from binance.client import Client
from binance.enums import *

TRADE_SYMBOL = 'APEUSDT'

SOCKET = "wss://stream.binance.com:9443/ws/{}@kline_1m".format(TRADE_SYMBOL.lower())

TRADE_QUANTITY = 20 #how many tokens you want to buy
BUY_PRICE = 20 #price of buying
SELL_PRICE = 100 #price of selling
PERCENTAGE = 10 #selling when reach this percentage

in_position = True

client = Client(config.API_KEY, config.API_SECRET, tld='us')


def order(side, quantity, symbol, order_type=ORDER_TYPE_LIMIT):
    try:
        print("sending order")
        order = client.create_order(symbol=symbol, side=side, type=order_type, quantity=quantity)
        print(order)
    except Exception as e:
        print("an exception occured - {}".format(e))
        return False

    return True


def onOpen(ws):
    print('opened connection')


def onClose(ws):
    print('closed connection')


def onMessage(ws, message):
    global in_position

    print('received message')
    json_message = json.loads(message)
    # pprint.pprint(json_message)

    candle = json_message['k']
    close = float(candle['c'])
    print("candle closed at {}".format(close))

    if in_position and close <= BUY_PRICE:
        print("now it's time to BUY")
        # put binance sell logic here
        order_succeeded = order(SIDE_BUY, TRADE_QUANTITY, TRADE_SYMBOL)
        if order_succeeded:
            print("you're buying please wait for selling")
            in_position = False
    elif not in_position and (close == SELL_PRICE or ((close - BUY_PRICE) * 100 >= PERCENTAGE)):
        print("now it's time to SELL")
        # put binance buy order logic here
        order_succeeded = order(SIDE_SELL, TRADE_QUANTITY, TRADE_SYMBOL)
        if order_succeeded:
            print("you're selling your coins congrats")
            # in_position = True


ws = websocket.WebSocketApp(SOCKET, on_open=onOpen, on_close=onClose, on_message=onMessage)
ws.run_forever()
