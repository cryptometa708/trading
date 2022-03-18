<?php


class Command
{
    private $db;
    private static $instance = null;

    private function __construct()
    {
        $this->db = Database::getInstance(Connection::getConnection("database"));
    }

    private function __clone()
    {

    }

    public static function getInstance()
    {
        if (self::$instance == null) {
            self::$instance = new Command();
        }
        return self::$instance;
    }

    public function save_user($array)
    {
        return $this->db->save(new User($array));

    }

    public function exchanges()
    {
        return json_encode(\ccxt\Exchange::$exchanges);
    }


    public function save_exchange($array)
    {
        return $this->db->save(new Exchange($array));

    }

    public function delete_user($id)
    {
        return $this->db->save(new User(array("id" => $id, "enabled" => 0)));
    }

    public function delete_exchange($id)
    {
        return $this->db->delete(new Exchange(array("id" => $id)));
    }

    public function save_trade($array)
    {
        return $this->db->save(new Trade($array));
    }

    public function cancel_trade($id)
    {
        return $this->db->save(new Trade(array("id" => $id, "state" => -1)));
    }


    private function buy_market($trade)
    {
        return $this->exchange($trade)->create_market_buy_order($trade->getTicker(), $trade->getAmount());
    }

    private function sell_market($trade)
    {
        return $this->exchange($trade)->create_market_buy_order($trade->getTicker(), $trade->getAmount());
    }

    private function buy_limit($trade)
    {
        return $this->exchange($trade)->create_limit_buy_order($trade->getTicker(), $trade->getAmount(), $trade->getPrice());
    }

    private function sell_limit($trade)
    {
        return $this->exchange($trade)->create_limit_sell_order($trade->getTicker(), $trade->getAmount(), $trade->getPrice());
    }

    public function execute_trade($id, $state = 1, $pnl = NULL)
    {
        $trade = $this->db->get(new Trade(array("id" => $id)));
        if ($pnl != NULL) {
            $pnl = $trade->getAmount() * ($this->ticker($trade)["close"] - $trade->getPrice());
            $trade->setPnl($pnl);
        }
        $trade->setState($state);

        $trade->setExecutionDate(date("d/m/Y H:i:s"));
        $this->db->save($trade);
        return '{"code":200}';//call_user_func(array($this, $trade->getCommand()), $trade);
    }

    public function exchange_class($exchangeName, $apiKey, $apiSecret)
    {
        $exchange_class = "\\ccxt\\$exchangeName";
        try {
            $exchange=new $exchange_class (array(
                'apiKey' => $apiKey,
                'secret' => $apiSecret,
                'enableRateLimit' => true,
            ));
            $exchange->fetchBalance();
            return $exchange;
        } catch (Error | Exception $e) {
            return null;
        }
    }

    private function exchange($trade)
    {
        $exchangeId = $trade->getExchangeId();
        $userId = $trade->getUserId();
        $exchange = $this->db->get(new Exchange(array("id" => $exchangeId, "userId" => $userId)));
        $exchangeName = $exchange->getExchange();
        $apiKey = $exchange->getApiKey();
        $apiSecret = $exchange->getApiSecret();
        return $this->exchange_class($exchangeName, $apiKey, $apiSecret);

    }

    public function ticker($trade)
    {
        return $this->exchange($trade)->fetch_ticker($trade->getTicker());
    }

    public function tickers($userId, $exchangeId, $symbols)
    {
        if ($userId == NULL || $exchangeId == NULL)
            return NULL;
        $trade = new Trade(array("exchangeId" => $exchangeId, "userId" => $userId));
        return array_map('Command::helper', $this->exchange($trade)->fetch_tickers($symbols));
    }

    private static function helper($object)
    {
        return $object['close'];

    }

    public function trades($userId = NULL, $exchangeId = NULL, $opened = false)
    {
        $trade = new Trade();
        if ($userId != NULL)
            $trade->setUserId($userId);
        if ($exchangeId != NULL)
            $trade->setExchangeId($exchangeId);
        if ($opened)
            $trade->setState('0');
        return $this->db->getAll($trade);
    }

    public function getUserById($id)
    {
        return $this->db->get(new User(array("id" => $id)));
    }

    public function balance($userId, $exchangeId)
    {
        return $this->exchange(new Trade(array("exchangeId" => $exchangeId, "userId" => $userId)))->fetch_free_balance();
    }

    public function symbols($userId, $exchangeId)
    {
        $exchange = $this->exchange(new Trade(array("exchangeId" => $exchangeId, "userId" => $userId)));
        $exchange->load_markets();
        return $exchange->symbols;
    }


    public function userExchanges($userId)
    {
        return $this->db->getAll(new Exchange(array("userId" => $userId)));
    }


    public function login($username, $password)
    {
        return $this->db->get(new User(array("username" => $username, "password" => $password, "enabled" => 1)));
    }

    public function register($array)
    {
        $this->save_user($array);
    }

}